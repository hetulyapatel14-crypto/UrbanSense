from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

from .models import (
    TransportAgency, Stop, Route, Vehicle, VehiclePosition,
    ServiceAlert, DataSource, PlaceLandmark
)
from .serializers import (
    StopSerializer, RouteSerializer, VehicleSerializer,
    VehiclePositionSerializer, ServiceAlertSerializer,
    DataSourceSerializer, PlaceLandmarkSerializer
)
from .services.routing_engine import MultimodalRoutingEngine
from .services.geocoding_service import GeocodingService
from .services.eta_engine import ETAEngine
from .services.fare_engine import FareEngine
from .services.ai_assistant_service import AiJourneyAssistantService
from .providers.realtime_provider import RealtimeProvider


class JourneyPlanView(APIView):
    permission_classes = [permissions.AllowAny]
    """
    Multimodal Journey Planning API for Ahmedabad, Gandhinagar & GIFT City.
    Combines Metro, BRTS, AMTS, Regional Rail, and Gandhinagar/GIFT Buses.
    Returns Fastest, Cheapest, Least Walking, Fewest Transfers, Most Reliable, and Minimum Wait options.
    """
    @extend_schema(
        parameters=[
            OpenApiParameter(name='from', description='Origin landmark/address/station name', required=True, type=OpenApiTypes.STR),
            OpenApiParameter(name='to', description='Destination landmark/address/station name', required=True, type=OpenApiTypes.STR),
            OpenApiParameter(name='from_lat', description='Origin latitude', required=False, type=OpenApiTypes.FLOAT),
            OpenApiParameter(name='from_lng', description='Origin longitude', required=False, type=OpenApiTypes.FLOAT),
            OpenApiParameter(name='to_lat', description='Destination latitude', required=False, type=OpenApiTypes.FLOAT),
            OpenApiParameter(name='to_lng', description='Destination longitude', required=False, type=OpenApiTypes.FLOAT),
            OpenApiParameter(name='departure', description='Departure time string (e.g. now, 15:30)', required=False, type=OpenApiTypes.STR),
            OpenApiParameter(name='arrive_by', description='Target arrival time string (e.g. 17:00)', required=False, type=OpenApiTypes.STR),
            OpenApiParameter(name='preference', description='fastest, cheapest, least_walking, fewest_transfers, most_reliable, minimum_wait, accessible', required=False, type=OpenApiTypes.STR),
            OpenApiParameter(name='modes', description='Comma-separated allowed modes: METRO,BRTS,AMTS,RAIL,BUS,WALK', required=False, type=OpenApiTypes.STR),
            OpenApiParameter(name='wheelchair', description='Filter accessible routes only (true/false)', required=False, type=OpenApiTypes.BOOL),
        ],
        responses={200: OpenApiTypes.OBJECT}
    )
    def get(self, request):
        from_loc = request.query_params.get('from', '').strip()
        to_loc = request.query_params.get('to', '').strip()

        if not from_loc or not to_loc:
            from_loc = from_loc or 'Sabarmati Railway Station'
            to_loc = to_loc or 'GIFT City'

        from_lat = request.query_params.get('from_lat')
        from_lng = request.query_params.get('from_lng')
        to_lat = request.query_params.get('to_lat')
        to_lng = request.query_params.get('to_lng')

        from_lat_f = float(from_lat) if from_lat else None
        from_lng_f = float(from_lng) if from_lng else None
        to_lat_f = float(to_lat) if to_lat else None
        to_lng_f = float(to_lng) if to_lng else None

        dep_str = request.query_params.get('departure', 'now')
        arrive_by_str = request.query_params.get('arrive_by')
        preference = request.query_params.get('preference', 'fastest')
        modes_param = request.query_params.get('modes')
        modes = [m.strip().upper() for m in modes_param.split(',')] if modes_param else ['METRO', 'BRTS', 'AMTS', 'RAIL', 'BUS', 'WALK']
        wheelchair = request.query_params.get('wheelchair', 'false').lower() in ['true', '1', 'yes']

        journey_result = MultimodalRoutingEngine.plan_journey(
            from_name=from_loc,
            to_name=to_loc,
            from_lat=from_lat_f,
            from_lng=from_lng_f,
            to_lat=to_lat_f,
            to_lng=to_lng_f,
            departure_time_str=dep_str,
            arrive_by_str=arrive_by_str,
            preference=preference,
            modes=modes,
            wheelchair_accessible=wheelchair,
        )

        return Response(journey_result, status=status.HTTP_200_OK)


class AiJourneyAssistView(APIView):
    permission_classes = [permissions.AllowAny]
    """
    AI Passenger Assistant: Parses conversational natural language transit queries
    and automatically executes multimodal journey planning.
    """
    def post(self, request):
        query = request.data.get('query', '').strip()
        if not query:
            return Response({'error': 'Query string is required'}, status=status.HTTP_400_BAD_REQUEST)

        result = AiJourneyAssistantService.parse_and_plan(query)
        return Response(result, status=status.HTTP_200_OK)


class RouteComparisonView(APIView):
    permission_classes = [permissions.AllowAny]
    """
    Side-by-side metric comparison table for all candidate route options.
    """
    def _handle_compare(self, from_loc, to_loc):
        journey_result = MultimodalRoutingEngine.plan_journey(
            from_name=from_loc or 'Sabarmati Railway Station',
            to_name=to_loc or 'GIFT City',
            preference='fastest'
        )

        routes = journey_result.get('routes', [])
        comparison_matrix = []
        for r in routes:
            comparison_matrix.append({
                'route_key': r.get('route_key'),
                'summary_title': r.get('summary_title'),
                'category_badge': r.get('category_badge'),
                'tag_label': r.get('tag_label'),
                'badge_color': r.get('badge_color'),
                'duration_minutes': r.get('duration_minutes'),
                'waiting_minutes': r.get('waiting_minutes'),
                'walking_minutes': r.get('walking_minutes'),
                'transfers': r.get('transfers'),
                'fare': r.get('fare'),
                'reliability_score': r.get('reliability_score'),
                'delay_minutes': r.get('delay_minutes', 0),
                'status': 'DELAYED' if r.get('delay_minutes', 0) > 0 else 'ON_TIME',
                'modes': r.get('modes', []),
                'co2_saved_kg': r.get('co2_saved_kg', 1.2),
                'why_recommended': r.get('why_recommended', []),
            })

        return {
            'origin': journey_result.get('origin'),
            'destination': journey_result.get('destination'),
            'total_options': len(comparison_matrix),
            'comparison_matrix': comparison_matrix,
        }

    def get(self, request):
        from_loc = request.query_params.get('from', 'Sabarmati Railway Station').strip()
        to_loc = request.query_params.get('to', 'GIFT City').strip()
        return Response(self._handle_compare(from_loc, to_loc), status=status.HTTP_200_OK)

    def post(self, request):
        from_loc = request.data.get('from_place') or request.data.get('from') or 'Sabarmati Railway Station'
        to_loc = request.data.get('to_place') or request.data.get('to') or 'GIFT City'
        return Response(self._handle_compare(from_loc, to_loc), status=status.HTTP_200_OK)


class AdminNetworkMonitorView(APIView):
    permission_classes = [permissions.AllowAny]
    """
    Admin & Ops Transport Network Monitor for Ahmedabad, Gandhinagar & GIFT City.
    """
    def get(self, request):
        now = timezone.now()
        sources = DataSource.objects.all()

        regions_status = [
            {'region': 'Ahmedabad Urban', 'status': 'OPERATIONAL', 'health_pct': 99, 'transit_modes': ['Metro', 'BRTS', 'AMTS', 'Rail']},
            {'region': 'Gandhinagar Capital', 'status': 'OPERATIONAL', 'health_pct': 98, 'transit_modes': ['Metro Phase 2', 'City Bus', 'GSRTC', 'Rail']},
            {'region': 'GIFT City FinTech Zone', 'status': 'OPERATIONAL', 'health_pct': 100, 'transit_modes': ['Metro Branch', 'GIFT EV Shuttle', 'Express Bus']},
        ]

        agencies = []
        for ag in TransportAgency.objects.filter(is_active=True):
            stops_c = Stop.objects.filter(agency=ag).count()
            routes_c = Route.objects.filter(agency=ag).count()
            vehicles_c = Vehicle.objects.filter(agency=ag).count()
            agencies.append({
                'code': ag.code,
                'name': ag.name,
                'full_name': ag.full_name,
                'stops_count': stops_c,
                'routes_count': routes_c,
                'active_vehicles': vehicles_c,
                'status': 'OPERATIONAL',
            })

        return Response({
            'network_status': 'OPERATIONAL',
            'server_time': now.isoformat(),
            'regions': regions_status,
            'agencies': agencies,
            'total_stops': Stop.objects.count(),
            'total_routes': Route.objects.count(),
            'active_vehicles': Vehicle.objects.filter(is_active=True).count(),
            'active_alerts': ServiceAlert.objects.filter(status='ACTIVE').count(),
            'live_vehicles': RealtimeProvider.get_vehicle_positions(),
            'sources': DataSourceSerializer(sources, many=True).data,
        }, status=status.HTTP_200_OK)


class NearbyStopsView(APIView):
    permission_classes = [permissions.AllowAny]
    """Finds nearest transit stops from user's current GPS location."""
    @extend_schema(
        parameters=[
            OpenApiParameter(name='lat', description='Latitude', required=True, type=OpenApiTypes.FLOAT),
            OpenApiParameter(name='lng', description='Longitude', required=True, type=OpenApiTypes.FLOAT),
            OpenApiParameter(name='radius', description='Search radius in km (default 2.5)', required=False, type=OpenApiTypes.FLOAT),
            OpenApiParameter(name='mode', description='Filter mode: METRO, BRTS, AMTS, RAIL, BUS', required=False, type=OpenApiTypes.STR),
        ]
    )
    def get(self, request):
        lat = float(request.query_params.get('lat', 23.0300))
        lng = float(request.query_params.get('lng', 72.5800))
        radius = float(request.query_params.get('radius', 2.5))
        mode = request.query_params.get('mode')

        stops = GeocodingService.find_nearby_stops(lat, lng, radius_km=radius, mode=mode, limit=15)
        return Response({
            'count': len(stops),
            'radius_km': radius,
            'origin': {'latitude': lat, 'longitude': lng},
            'stops': stops,
            'nearby_stops': stops
        })


class StationDeparturesView(APIView):
    permission_classes = [permissions.AllowAny]
    """Live station departure board with real-time ETA countdowns."""
    def get(self, request, stop_id=None):
        sid = stop_id or request.query_params.get('stop_id') or 'METRO-INT-01'
        limit = int(request.query_params.get('limit', 8))
        departures = ETAEngine.get_stop_departures(sid, limit=limit)
        return Response(departures)


class LiveVehiclesView(APIView):
    permission_classes = [permissions.AllowAny]
    """Live telemetry stream for all active vehicles."""
    def get(self, request):
        mode = request.query_params.get('mode')
        positions = RealtimeProvider.get_vehicle_positions(mode=mode)
        return Response({
            'count': len(positions),
            'generated_at': timezone.now().isoformat(),
            'vehicles': positions
        })


class LiveVehicleDetailView(APIView):
    permission_classes = [permissions.AllowAny]
    """Track a specific vehicle by vehicle_id ("Where is my bus?")."""
    def get(self, request, vehicle_id):
        v = RealtimeProvider.get_vehicle_by_id(vehicle_id)
        if not v:
            return Response({'error': f'Vehicle {vehicle_id} not found or inactive'}, status=status.HTTP_404_NOT_FOUND)
        return Response(v)


class TransitAlertsView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    """Live service alerts, disruptions, and transit maintenance notices."""
    serializer_class = ServiceAlertSerializer
    queryset = ServiceAlert.objects.filter(status='ACTIVE').select_related('agency', 'route', 'affected_stop')


class LocationSearchView(APIView):
    permission_classes = [permissions.AllowAny]
    """Intelligent search autocomplete for Ahmedabad, Gandhinagar & GIFT City landmarks."""
    def get(self, request):
        q = request.query_params.get('q', '')
        limit = int(request.query_params.get('limit', 15))
        results = GeocodingService.search_locations(q, limit=limit)
        return Response({
            'query': q,
            'count': len(results),
            'results': results
        })


class TransitStatusView(APIView):
    permission_classes = [permissions.AllowAny]
    """Data source sync monitoring, provider health, and telemetry status."""
    def get(self, request):
        sources = DataSource.objects.all()
        now = timezone.now()
        source_data = []

        for ds in sources:
            diff_secs = int((now - ds.last_sync).total_seconds())
            source_data.append({
                'source_name': ds.source_name,
                'provider_type': ds.provider_type,
                'status': ds.status,
                'records_count': ds.records_count,
                'is_live_telemetry': ds.is_live_telemetry,
                'freshness_seconds': diff_secs,
                'freshness_label': f"Updated {max(1, diff_secs // 60)}m ago" if diff_secs >= 60 else f"Updated {max(1, diff_secs)}s ago",
                'last_sync': ds.last_sync.isoformat(),
            })

        return Response({
            'system_status': 'OPERATIONAL',
            'city': 'Ahmedabad ↔ Gandhinagar ↔ GIFT City',
            'agencies': ['GMRC (Ahmedabad & Gandhinagar Metro)', 'Janmarg BRTS', 'AMTS City Bus', 'Western Railway Intercity', 'Gandhinagar Transit & GIFT Shuttle'],
            'total_stops': Stop.objects.count(),
            'total_routes': Route.objects.count(),
            'active_vehicles': Vehicle.objects.filter(is_active=True).count(),
            'active_alerts': ServiceAlert.objects.filter(status='ACTIVE').count(),
            'sources': source_data,
            'server_time': now.isoformat(),
        })


class FareCalculatorView(APIView):
    permission_classes = [permissions.AllowAny]
    """Direct fare calculation API."""
    def get(self, request):
        mode = request.query_params.get('mode', 'METRO').upper()
        distance_km = float(request.query_params.get('distance_km', 5.0))
        fare = FareEngine.calculate_leg_fare(mode, distance_km)
        return Response({
            'mode': mode,
            'distance_km': distance_km,
            'fare': int(fare),
            'currency': '₹'
        })
