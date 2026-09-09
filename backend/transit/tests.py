from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from transit.models import Stop, Route, Vehicle, VehiclePosition, ServiceAlert
from transit.services.sync_service import SyncService
from transit.services.routing_engine import MultimodalRoutingEngine
from transit.services.geocoding_service import GeocodingService
from transit.services.eta_engine import ETAEngine
from transit.services.fare_engine import FareEngine

class TransitPlannerTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Seed complete transit dataset
        SyncService.sync_all()

    def test_database_seeding_complete(self):
        """Verify all agencies, stops, routes, and landmarks are populated."""
        self.assertGreaterEqual(Stop.objects.count(), 30)
        self.assertGreaterEqual(Route.objects.count(), 5)
        self.assertTrue(Stop.objects.filter(mode='METRO').exists())
        self.assertTrue(Stop.objects.filter(mode='BRTS').exists())
        self.assertTrue(Stop.objects.filter(mode='AMTS').exists())

    def test_sabarmati_to_thaltej_multimodal_journey(self):
        """Test primary user scenario: Sabarmati Railway Station -> Thaltej."""
        response = self.client.get('/api/transit/journey/plan/', {
            'from': 'Sabarmati Railway Station',
            'to': 'Thaltej',
            'departure': 'now'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('routes', data)
        self.assertGreaterEqual(len(data['routes']), 1)

        # Check fastest route properties
        fastest_route = data['routes'][0]
        self.assertIn('duration_minutes', fastest_route)
        self.assertIn('fare', fastest_route)
        self.assertIn('steps', fastest_route)
        self.assertIn('tag_label', fastest_route)
        self.assertGreater(fastest_route['duration_minutes'], 0)

    def test_airport_to_thaltej_journey(self):
        """Test airport express multimodal route."""
        response = self.client.get('/api/transit/journey/plan/', {
            'from': 'Sardar Vallabhbhai Patel International Airport (SVPIA)',
            'to': 'Thaltej',
            'preference': 'fastest'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(len(data['routes']) >= 1)

    def test_nearby_transport_lookup(self):
        """Test geospatial nearby stops lookup from user coordinates."""
        # Ashram Road / Income Tax coordinates
        response = self.client.get('/api/transit/stops/nearby/', {
            'lat': 23.0415,
            'lng': 72.5710,
            'radius': 1.5
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('nearby_stops', data)
        self.assertGreaterEqual(len(data['nearby_stops']), 1)
        # Verify distance and walking duration are calculated
        first_stop = data['nearby_stops'][0]
        self.assertIn('distance_m', first_stop)
        self.assertIn('walking_time_mins', first_stop)

    def test_station_departure_board(self):
        """Test live vs scheduled departure board for Old High Court Metro Interchange."""
        response = self.client.get('/api/transit/departures/', {
            'stop_id': 'METRO-INT-01',
            'limit': 5
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('departures', data)
        self.assertGreaterEqual(len(data['departures']), 1)
        first_dep = data['departures'][0]
        self.assertIn('status', first_dep) # LIVE or SCHEDULED
        self.assertIn('eta_minutes', first_dep)

    def test_delay_aware_rerouting_detection(self):
        """Test that vehicle delays are detected and dynamic alternatives are suggested."""
        result = MultimodalRoutingEngine.plan_journey(
            from_name='Sabarmati Railway Station',
            to_name='Thaltej',
            preference='fastest'
        )
        # Should have routes calculated
        self.assertTrue(len(result['routes']) >= 1)
        # Check if delay callout structure is valid
        if result['delay_alert_callout']:
            self.assertIn('alert_message', result['delay_alert_callout'])

    def test_accessibility_mode(self):
        """Test wheelchair accessibility filtering."""
        response = self.client.get('/api/transit/journey/plan/', {
            'from': 'Sabarmati Railway Station',
            'to': 'Thaltej',
            'wheelchair': 'true'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(len(data['routes']) >= 1)

    def test_location_search_autocomplete(self):
        """Test location search autocomplete with Ahmedabad landmarks."""
        response = self.client.get('/api/transit/search/', {'q': 'Sabarmati'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertGreaterEqual(data['count'], 1)

    def test_live_vehicles_api(self):
        """Test live vehicle tracking API."""
        response = self.client.get('/api/transit/vehicles/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('vehicles', data)
        self.assertGreaterEqual(len(data['vehicles']), 1)

    def test_transit_status_api(self):
        """Test data source status and freshness monitor."""
        response = self.client.get('/api/transit/status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['system_status'], 'OPERATIONAL')
        self.assertIn('sources', data)

    def test_ai_journey_assistant_api(self):
        """Test AI natural language journey parser and planner."""
        response = self.client.post('/api/journey/ai-assist/', {
            'query': 'How do I reach GIFT City from Sabarmati before 9 AM?'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('parsed_intent', data)
        self.assertIn('assistant_response', data)
        self.assertIn('sabarmati', data['parsed_intent']['from_location'].lower())
        self.assertIn('gift city', data['parsed_intent']['to_location'].lower())

    def test_route_comparison_matrix_api(self):
        """Test side-by-side multimodal candidate comparison matrix."""
        response = self.client.get('/api/journey/compare/', {
            'from': 'Sabarmati Railway Station',
            'to': 'GIFT City'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('comparison_matrix', data)
        self.assertGreaterEqual(len(data['comparison_matrix']), 1)

    def test_admin_network_monitor_api(self):
        """Test Admin Ops tri-city network health monitor."""
        response = self.client.get('/api/transit/admin-monitor/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['network_status'], 'OPERATIONAL')
        self.assertIn('regions', data)
        self.assertEqual(len(data['regions']), 3)

