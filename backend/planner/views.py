from datetime import datetime, timedelta
from math import ceil

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

def health(request):
    return JsonResponse({"status": "ok"})

def _build_segments(distance_miles: float, cycle_used_hours: float):
    # MVP assumptions from assessment:
    # - 70 hr / 8 day schedule
    # - fuel stop every 1000 miles
    # - 1 hour pickup and 1 hour dropoff
    # - no adverse driving conditions
    drive_speed_mph = 50
    drive_hours = distance_miles / drive_speed_mph

    # Split driving into chunks with fuel stops every 1000 miles.
    chunks = []
    remaining = distance_miles
    while remaining > 0:
        chunk = min(1000, remaining)
        chunks.append(chunk)
        remaining -= chunk

    stops = []
    current_hour = cycle_used_hours

    # Pickup
    stops.append({"type": "pickup", "label": "Pickup / loading", "duration_hours": 1, "at_cycle_hour": current_hour})
    current_hour += 1

    # Drive + fuel
    for i, chunk in enumerate(chunks):
        drive_chunk_hours = chunk / drive_speed_mph
        stops.append({
            "type": "drive",
            "label": f"Drive {chunk:.0f} mi",
            "duration_hours": round(drive_chunk_hours, 2),
            "at_cycle_hour": current_hour
        })
        current_hour += drive_chunk_hours

        if i < len(chunks) - 1:
            stops.append({
                "type": "fuel",
                "label": "Fuel stop",
                "duration_hours": 0.5,
                "at_cycle_hour": current_hour
            })
            current_hour += 0.5

    # Dropoff
    stops.append({"type": "dropoff", "label": "Dropoff / unloading", "duration_hours": 1, "at_cycle_hour": current_hour})
    current_hour += 1

    # Rest if needed to stay within 14-hour window and daily limits
    if current_hour % 14 > 11:
        stops.append({"type": "rest", "label": "Mandatory rest break", "duration_hours": 10, "at_cycle_hour": current_hour})
        current_hour += 10

    return stops

@csrf_exempt
def plan_trip(request):
    if request.method != "POST":
        return JsonResponse({"detail": "POST only"}, status=405)

    payload = json.loads(request.body.decode("utf-8") or "{}")
    current_location = payload.get("current_location", "")
    pickup_location = payload.get("pickup_location", "")
    dropoff_location = payload.get("dropoff_location", "")
    cycle_used_hours = float(payload.get("current_cycle_used_hours", 0))
    distance_miles = float(payload.get("distance_miles", 250))

    segments = _build_segments(distance_miles, cycle_used_hours)

    total_hours = sum(seg["duration_hours"] for seg in segments)
    days_needed = ceil((cycle_used_hours + total_hours) / 24)

    logs = []
    for day in range(days_needed):
        logs.append({
            "day": day + 1,
            "date": None,
            "off_duty": 8,
            "sleeper_berth": 0,
            "driving": 0,
            "on_duty_not_driving": 0,
            "remarks": [
                current_location if day == 0 else "",
                pickup_location if day == 0 else "",
                dropoff_location if day == days_needed - 1 else "",
            ],
        })

    return JsonResponse({
        "input": payload,
        "route_summary": {
            "distance_miles": distance_miles,
            "estimated_drive_hours": round(distance_miles / 50, 2),
            "days_needed": days_needed,
            "segments": segments,
        },
        "eld_logs": logs,
    })
