import json, urllib.request
url = 'http://127.0.0.1:8000/api/plan-trip/'
payload = {
    "current_location": "Chicago, IL",
    "pickup_location": "Dallas, TX",
    "dropoff_location": "Atlanta, GA",
    "current_cycle_used_hours": 20,
    "distance_miles": 1200
}
req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
with urllib.request.urlopen(req) as resp:
    data = json.load(resp)
    print(json.dumps(data, indent=2))
