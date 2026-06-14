from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from unittest import mock


class PlanTripAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('plan-trip')

    @mock.patch('routing.services.RouteService.get_route')
    @mock.patch('hos.services.HOSPlanner.plan_trip')
    def test_plan_trip_success(self, mock_plan, mock_route):
        """POST /api/plan-trip/ returns 200 with correct response shape."""
        mock_route.return_value = {
            "distance_km": 1500,
            "duration_hr": 27,
            "geometry": {"type": "LineString", "coordinates": []},
            "waypoints": [
                {"name": "Dallas, TX", "coordinates": [-96.797, 32.777]},
                {"name": "Houston, TX", "coordinates": [-95.370, 29.760]},
                {"name": "Atlanta, GA", "coordinates": [-84.388, 33.749]},
            ],
        }
        mock_plan.return_value = {
            "fuel_stops": [{"mile_marker": 1000, "location": "Fuel Stop @ 1000 mi"}],
            "daily_logs": [
                {
                    "day": 1,
                    "date": "2026-06-13",
                    "events": [{"type": "driving", "start_time": "07:00", "end_time": "18:00",
                                "duration_hours": 11, "location": "Driving"}],
                    "totals": {"off_duty": 10, "sleeper_berth": 0, "driving": 11, "on_duty_not_driving": 3},
                }
            ],
            "summary": {
                "total_distance_miles": 932.1,
                "total_driving_time_hr": 27,
                "estimated_trip_days": 1,
                "fuel_stops_count": 1,
                "cycle_remaining_hours": 18,
            },
        }
        payload = {
            "current_location": "Dallas, TX",
            "pickup_location": "Houston, TX",
            "dropoff_location": "Atlanta, GA",
            "current_cycle_used_hours": 52,
        }
        resp = self.client.post(self.url, payload, format="json")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("route", resp.data)
        self.assertIn("fuel_stops", resp.data)
        self.assertIn("daily_logs", resp.data)
        self.assertIn("summary", resp.data)

    def test_plan_trip_validation_error(self):
        """POST with missing fields returns 400."""
        resp = self.client.post(self.url, {}, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_plan_trip_cycle_exceeds_max(self):
        """POST with cycle > 70 returns 400."""
        payload = {
            "current_location": "Dallas, TX",
            "pickup_location": "Houston, TX",
            "dropoff_location": "Atlanta, GA",
            "current_cycle_used_hours": 75,
        }
        resp = self.client.post(self.url, payload, format="json")
        self.assertEqual(resp.status_code, 400)
