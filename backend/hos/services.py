"""
HOSPlanner — generates a multi-day trip timeline respecting FMCSA HOS rules.

FMCSA Rules implemented:
  • 11-Hour Driving Limit
  • 14-Hour Duty Window
  • 30-Minute Break after 8 cumulative driving hours
  • 70 Hour / 8 Day Rule
  • Fuel stop every 1,000 miles
  • 1 hr pickup / 1 hr dropoff
  • Average speed 55 MPH
"""
import math
from datetime import datetime, timedelta

# ── Fixed assumptions ──────────────────────────────────────────
AVG_SPEED_MPH = 55
MILES_PER_FUEL_STOP = 1000
PICKUP_DURATION_HRS = 1
DROPOFF_DURATION_HRS = 1
MAX_DRIVING_HRS = 11        # 11-hr driving limit per day
DUTY_WINDOW_HRS = 14        # 14-hr on-duty window
BREAK_AFTER_DRIVING_HRS = 8 # mandatory 30-min break trigger
BREAK_DURATION_HRS = 0.5    # 30 minutes
OFF_DUTY_RESET_HRS = 10     # 10-hr reset between duty periods
TOTAL_CYCLE_HRS = 70        # 70 hrs / 8-day rule


class HOSPlanner:
    """Creates a timeline of events respecting FMCSA HOS rules."""

    def plan_trip(self, route_distance_km: float, route_duration_hr: float, current_cycle_used: int):
        total_miles = route_distance_km / 1.60934
        fuel_stop_count = max(0, math.floor(total_miles / MILES_PER_FUEL_STOP))
        fuel_stop_markers = [MILES_PER_FUEL_STOP * i for i in range(1, fuel_stop_count + 1)]

        # ── State ──────────────────────────────────────────────
        # Start duty day at 06:00 today
        day_anchor = datetime.combine(datetime.today().date(), datetime.min.time()).replace(hour=6)
        current_time = day_anchor
        cycle_remaining = TOTAL_CYCLE_HRS - current_cycle_used
        driving_since_break = 0.0   # cumulative driving hours since last break
        duty_elapsed = 0.0          # hours into current 14-hr window
        day_driving = 0.0           # driving hours in current duty period

        all_events = []   # flat list of every event across all days
        day_number = 1

        # ── Helper: add an event ───────────────────────────────
        def _add_event(event_type, duration_hr, location="", day=None):
            nonlocal current_time, cycle_remaining, driving_since_break, duty_elapsed, day_driving
            start = current_time
            end = start + timedelta(hours=duration_hr)
            all_events.append({
                "type": event_type,
                "start_time": start.strftime("%H:%M"),
                "end_time": end.strftime("%H:%M"),
                "start_datetime": start.isoformat(),
                "end_datetime": end.isoformat(),
                "duration_hours": round(duration_hr, 2),
                "location": location,
                "day": day or day_number,
            })
            current_time = end
            duty_elapsed += duration_hr
            if event_type == "driving":
                driving_since_break += duration_hr
                day_driving += duration_hr
                cycle_remaining -= duration_hr

        # ── Helper: end-of-day reset ──────────────────────────
        def _reset_day():
            nonlocal day_number, duty_elapsed, day_driving, driving_since_break, current_time, day_anchor
            _add_event("off_duty", OFF_DUTY_RESET_HRS, "10-hr Off-Duty Reset", day=day_number)
            day_number += 1
            day_anchor = datetime.combine(current_time.date(), datetime.min.time()).replace(hour=6)
            if current_time < day_anchor:
                current_time = day_anchor
            duty_elapsed = 0.0
            day_driving = 0.0
            driving_since_break = 0.0

        # ── Pickup ─────────────────────────────────────────────
        _add_event("on_duty_not_driving", PICKUP_DURATION_HRS, "Pickup", day=day_number)

        # ── Main driving loop ──────────────────────────────────
        remaining_miles = total_miles
        miles_covered = 0.0

        while remaining_miles > 0.5:  # tolerance for floating-point
            # How many hours can we drive right now?
            hours_until_break = max(0, BREAK_AFTER_DRIVING_HRS - driving_since_break)
            hours_until_duty_end = max(0, DUTY_WINDOW_HRS - duty_elapsed)
            hours_until_drive_limit = max(0, MAX_DRIVING_HRS - day_driving)
            hours_until_cycle_end = max(0, cycle_remaining)

            max_drive_hrs = min(hours_until_break, hours_until_duty_end, hours_until_drive_limit, hours_until_cycle_end)

            # Need a reset?
            if max_drive_hrs <= 0:
                if cycle_remaining <= 0:
                    # 34-hr restart would apply; simplified to 10-hr + full cycle reset
                    _add_event("off_duty", OFF_DUTY_RESET_HRS, "10-hr Off-Duty Reset (cycle)", day=day_number)
                    day_number += 1
                    cycle_remaining = TOTAL_CYCLE_HRS
                    duty_elapsed = 0
                    day_driving = 0
                    driving_since_break = 0
                    continue
                if hours_until_break <= 0:
                    _add_event("on_duty_not_driving", BREAK_DURATION_HRS, "30-min Break (HOS)", day=day_number)
                    driving_since_break = 0
                    continue
                # duty window or daily driving limit exhausted → off-duty reset
                _reset_day()
                continue

            # Convert drive hours to miles
            max_drive_miles = max_drive_hrs * AVG_SPEED_MPH

            # Check next fuel stop
            next_fuel_mile = float('inf')
            if fuel_stop_markers:
                next_fuel_mile = fuel_stop_markers[0] - miles_covered

            segment_miles = min(remaining_miles, max_drive_miles, next_fuel_mile)
            segment_hours = segment_miles / AVG_SPEED_MPH

            if segment_hours < 0.01:
                break  # safety valve

            _add_event("driving", segment_hours,
                       f"Driving ({miles_covered:.0f}→{miles_covered + segment_miles:.0f} mi)",
                       day=day_number)

            miles_covered += segment_miles
            remaining_miles -= segment_miles

            # Fuel stop?
            if fuel_stop_markers and miles_covered >= fuel_stop_markers[0] - 0.5:
                _add_event("fuel_stop", 0.5,
                           f"Fuel Stop @ {fuel_stop_markers[0]} mi",
                           day=day_number)
                fuel_stop_markers.pop(0)

            # 30-min break needed?
            if driving_since_break >= BREAK_AFTER_DRIVING_HRS and remaining_miles > 0.5:
                _add_event("on_duty_not_driving", BREAK_DURATION_HRS, "30-min Break (HOS)", day=day_number)
                driving_since_break = 0

            # Check duty window / daily driving limit
            if (duty_elapsed >= DUTY_WINDOW_HRS or day_driving >= MAX_DRIVING_HRS) and remaining_miles > 0.5:
                _reset_day()

        # ── Dropoff ────────────────────────────────────────────
        if duty_elapsed + DROPOFF_DURATION_HRS > DUTY_WINDOW_HRS:
            _reset_day()
        _add_event("on_duty_not_driving", DROPOFF_DURATION_HRS, "Dropoff", day=day_number)

        # Fill rest of last day with off_duty
        remaining_off = 24 - duty_elapsed
        if remaining_off > 0:
            _add_event("off_duty", remaining_off, "Off Duty", day=day_number)

        # ── Split into daily logs ──────────────────────────────
        daily_logs = {}
        for ev in all_events:
            d = ev["day"]
            if d not in daily_logs:
                daily_logs[d] = {"day": d, "date": "", "events": [], "totals": {
                    "off_duty": 0, "sleeper_berth": 0, "driving": 0, "on_duty_not_driving": 0
                }}
            daily_logs[d]["events"].append(ev)
            t = ev["type"]
            if t in ("off_duty",):
                daily_logs[d]["totals"]["off_duty"] += ev["duration_hours"]
            elif t == "sleeper_berth":
                daily_logs[d]["totals"]["sleeper_berth"] += ev["duration_hours"]
            elif t == "driving":
                daily_logs[d]["totals"]["driving"] += ev["duration_hours"]
            elif t in ("on_duty_not_driving", "pickup", "dropoff", "fuel_stop"):
                daily_logs[d]["totals"]["on_duty_not_driving"] += ev["duration_hours"]

        # Set dates and round totals
        base_date = datetime.today().date()
        for d, log in daily_logs.items():
            log["date"] = (base_date + timedelta(days=d - 1)).strftime("%Y-%m-%d")
            for k in log["totals"]:
                log["totals"][k] = round(log["totals"][k], 2)

        sorted_logs = [daily_logs[k] for k in sorted(daily_logs.keys())]

        # ── Fuel stops list ────────────────────────────────────
        fuel_stops = [
            {"mile_marker": MILES_PER_FUEL_STOP * i, "location": f"Fuel Stop @ {MILES_PER_FUEL_STOP * i} mi"}
            for i in range(1, fuel_stop_count + 1)
        ]

        # ── Summary ────────────────────────────────────────────
        summary = {
            "total_distance_miles": round(total_miles, 1),
            "total_driving_time_hr": round(total_miles / AVG_SPEED_MPH, 1),
            "estimated_trip_days": len(sorted_logs),
            "fuel_stops_count": fuel_stop_count,
            "cycle_remaining_hours": round(max(0, cycle_remaining), 1),
        }

        return {
            "fuel_stops": fuel_stops,
            "daily_logs": sorted_logs,
            "summary": summary,
        }
