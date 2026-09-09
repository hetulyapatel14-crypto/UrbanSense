import math
import random
from datetime import datetime
from django.utils import timezone
from typing import Dict, Any, List, Optional
from ..models import Vehicle, VehiclePosition, Stop, ServiceAlert

class RealtimeProvider:
    """
    Realtime telemetry orchestrator for Ahmedabad Transit.
    Enforces data transparency: clearly labels whether data is from official live telemetry
    or demo simulation, with accurate freshness timestamps.
    """

    @classmethod
    def get_vehicle_positions(cls, mode: Optional[str] = None) -> List[Dict[str, Any]]:
        query = VehiclePosition.objects.select_related('vehicle', 'next_stop', 'vehicle__current_route', 'vehicle__agency')
        if mode:
            query = query.filter(vehicle__mode=mode)

        results = []
        now = timezone.now()
        for vp in query:
            route = vp.vehicle.current_route
            agency = vp.vehicle.agency
            seconds_ago = int((now - vp.last_updated).total_seconds())

            results.append({
                'vehicle_id': vp.vehicle.vehicle_id,
                'registration': vp.vehicle.registration,
                'mode': vp.vehicle.mode,
                'agency_code': agency.code,
                'agency_name': agency.name,
                'route_id': route.route_id if route else None,
                'route_number': route.route_number if route else 'Special',
                'route_name': route.route_name if route else 'Express',
                'route_color': route.color if route else '#2563EB',
                'latitude': vp.latitude,
                'longitude': vp.longitude,
                'speed_kmh': vp.speed_kmh,
                'heading': vp.heading,
                'current_location_name': vp.current_location_name,
                'next_stop_id': vp.next_stop.stop_id if vp.next_stop else None,
                'next_stop_name': vp.next_stop.name if vp.next_stop else None,
                'eta_next_stop_seconds': vp.eta_next_stop_seconds,
                'eta_next_stop_mins': max(1, math.ceil(vp.eta_next_stop_seconds / 60)),
                'delay_minutes': vp.delay_minutes,
                'status': vp.status,
                'is_live': vp.is_live,
                'data_source': vp.data_source, # 'OFFICIAL_GMRC_FEED', 'JANMARG_GPS', 'DEMO_SIMULATION'
                'last_updated': vp.last_updated.isoformat(),
                'freshness_seconds': max(0, seconds_ago),
                'freshness_label': f"Updated {max(1, seconds_ago)}s ago" if seconds_ago < 60 else f"Updated {seconds_ago // 60}m ago",
            })
        return results

    @classmethod
    def get_vehicle_by_id(cls, vehicle_id: str) -> Optional[Dict[str, Any]]:
        try:
            vp = VehiclePosition.objects.select_related('vehicle', 'next_stop', 'vehicle__current_route', 'vehicle__agency').get(vehicle__vehicle_id=vehicle_id)
            now = timezone.now()
            seconds_ago = int((now - vp.last_updated).total_seconds())
            route = vp.vehicle.current_route
            return {
                'vehicle_id': vp.vehicle.vehicle_id,
                'registration': vp.vehicle.registration,
                'mode': vp.vehicle.mode,
                'agency_code': vp.vehicle.agency.code,
                'agency_name': vp.vehicle.agency.name,
                'route_id': route.route_id if route else None,
                'route_number': route.route_number if route else None,
                'route_name': route.route_name if route else None,
                'route_color': route.color if route else '#2563EB',
                'latitude': vp.latitude,
                'longitude': vp.longitude,
                'speed_kmh': vp.speed_kmh,
                'heading': vp.heading,
                'current_location_name': vp.current_location_name,
                'next_stop_id': vp.next_stop.stop_id if vp.next_stop else None,
                'next_stop_name': vp.next_stop.name if vp.next_stop else None,
                'eta_next_stop_seconds': vp.eta_next_stop_seconds,
                'delay_minutes': vp.delay_minutes,
                'status': vp.status,
                'is_live': vp.is_live,
                'data_source': vp.data_source,
                'last_updated': vp.last_updated.isoformat(),
                'freshness_seconds': seconds_ago,
            }
        except VehiclePosition.DoesNotExist:
            return None
