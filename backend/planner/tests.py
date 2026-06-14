from django.test import TestCase, Client
import json

class PlannerTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_health_endpoint(self):
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data, {"status": "ok"})

    def test_plan_trip_get_not_allowed(self):
        response = self.client.get('/api/plan-trip/')
        self.assertEqual(response.status_code, 405)
        data = response.json()
        self.assertEqual(data, {"detail": "POST only"})

    def test_plan_trip_success(self):
        payload = {
            "current_location": "New York, NY",
            "pickup_location": "Boston, MA",
            "dropoff_location": "Chicago, IL",
            "current_cycle_used_hours": 2.5,
            "distance_miles": 600.0
        }
        response = self.client.post(
            '/api/plan-trip/',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Check main structure
        self.assertIn("input", data)
        self.assertIn("route_summary", data)
        self.assertIn("eld_logs", data)

        # Check input echo
        self.assertEqual(data["input"]["current_location"], "New York, NY")
        self.assertEqual(float(data["input"]["distance_miles"]), 600.0)

        # Check route summary
        summary = data["route_summary"]
        self.assertEqual(summary["distance_miles"], 600.0)
        # 600 miles / 50 mph = 12.0 hours
        self.assertEqual(summary["estimated_drive_hours"], 12.0)

        # Check segments: pickup (1h) + drive 600mi (12h) + dropoff (1h) = 14h duration.
        # Since it goes above 11 hours (at_cycle_hour % 14 > 11), a rest stop might be appended.
        segments = summary["segments"]
        self.assertTrue(len(segments) >= 3)
        self.assertEqual(segments[0]["type"], "pickup")
        self.assertEqual(segments[1]["type"], "drive")
        self.assertEqual(segments[2]["type"], "dropoff")

        # Check ELD logs
        logs = data["eld_logs"]
        self.assertTrue(len(logs) > 0)
        self.assertEqual(logs[0]["day"], 1)
