"""
RouteService — geocodes addresses via OpenRouteService and fetches driving directions.

Returns route geometry (GeoJSON), distance (km), duration (hr), and waypoint coordinates.
Falls back to straight-line estimates when ORS_API_KEY is not set (demo mode).
"""
import os
import math
import requests


class RouteService:
    """Wrapper around OpenRouteService to obtain route data."""

    DIRECTIONS_URL = "https://api.openrouteservice.org/v2/directions/driving-hgv"
    GEOCODE_URL = "https://api.openrouteservice.org/geocode/search"

    def __init__(self):
        self.api_key = os.getenv("ORS_API_KEY", "")

    # ── Geocoding ──────────────────────────────────────────────
    def _geocode(self, address: str):
        """Geocode an address → [lon, lat]. Falls back to known cities in demo mode."""
        if self.api_key:
            params = {"api_key": self.api_key, "text": address, "size": 1}
            resp = requests.get(self.GEOCODE_URL, params=params, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            if data.get("features"):
                return data["features"][0]["geometry"]["coordinates"]  # [lon, lat]

        # ── Fallback: simple lookup for demo/testing ───────────
        known = {
            "dallas, tx":      [-96.7970, 32.7767],
            "houston, tx":     [-95.3698, 29.7604],
            "atlanta, ga":     [-84.3880, 33.7490],
            "los angeles, ca": [-118.2437, 34.0522],
            "chicago, il":     [-87.6298, 41.8781],
            "new york, ny":    [-74.0060, 40.7128],
            "miami, fl":       [-80.1918, 25.7617],
            "denver, co":      [-104.9903, 39.7392],
            "phoenix, az":     [-112.0740, 33.4484],
            "seattle, wa":     [-122.3321, 47.6062],
            "san francisco, ca": [-122.4194, 37.7749],
            "nashville, tn":   [-86.7816, 36.1627],
            "memphis, tn":     [-90.0490, 35.1495],
            "san antonio, tx": [-98.4936, 29.4241],
            "orlando, fl":     [-81.3792, 28.5383],
            "austin, tx":      [-97.7431, 30.2672],
            "portland, or":    [-122.6765, 45.5152],
            "kansas city, mo": [-94.5786, 39.0997],
            "oklahoma city, ok": [-97.5164, 35.4676],
            "las vegas, nv":   [-115.1398, 36.1699],
        }
        key = address.strip().lower()
        if key in known:
            return known[key]
        # Generate pseudo-random coords from hash
        h = hash(address)
        return [-(80 + (h % 40)), 25 + (h % 25)]

    # ── Haversine ──────────────────────────────────────────────
    @staticmethod
    def _haversine(lon1, lat1, lon2, lat2):
        """Return distance in km between two [lon,lat] points."""
        R = 6371
        dLat = math.radians(lat2 - lat1)
        dLon = math.radians(lon2 - lon1)
        a = (math.sin(dLat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dLon / 2) ** 2)
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    # ── Main route method ──────────────────────────────────────
    def get_route(self, start: str, pickup: str, dropoff: str):
        """Return route geometry, total distance (km) and duration (hr)."""
        start_coords = self._geocode(start)
        pickup_coords = self._geocode(pickup)
        dropoff_coords = self._geocode(dropoff)
        coordinates = [start_coords, pickup_coords, dropoff_coords]

        if self.api_key:
            return self._fetch_ors_route(coordinates, start, pickup, dropoff)
        else:
            return self._fallback_route(coordinates, start, pickup, dropoff)

    def _fetch_ors_route(self, coordinates, start, pickup, dropoff):
        """Call the real ORS directions API."""
        payload = {
            "coordinates": coordinates,
            "instructions": False,
            "units": "km",
            "elevation": False,
        }
        headers = {"Authorization": self.api_key, "Content-Type": "application/json"}
        resp = requests.post(self.DIRECTIONS_URL, json=payload, headers=headers, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        # ORS v2 wraps in routes[] not features[]
        if "routes" in data:
            route = data["routes"][0]
            distance_km = route["summary"]["distance"] / 1000
            duration_hr = route["summary"]["duration"] / 3600
            geometry = route.get("geometry", "")
        else:
            feature = data["features"][0]
            route_props = feature["properties"]["summary"]
            distance_km = route_props["distance"] / 1000
            duration_hr = route_props["duration"] / 3600
            geometry = feature["geometry"]

        return {
            "distance_km": round(distance_km, 2),
            "duration_hr": round(duration_hr, 2),
            "geometry": geometry,
            "waypoints": [
                {"name": start,   "coordinates": coordinates[0]},
                {"name": pickup,  "coordinates": coordinates[1]},
                {"name": dropoff, "coordinates": coordinates[2]},
            ],
        }

    def _fallback_route(self, coordinates, start, pickup, dropoff):
        """Straight-line estimate when no API key is available (demo mode)."""
        total_km = 0
        for i in range(len(coordinates) - 1):
            total_km += self._haversine(
                coordinates[i][0], coordinates[i][1],
                coordinates[i + 1][0], coordinates[i + 1][1]
            )
        # Road distance ≈ 1.3 × straight-line
        total_km *= 1.3
        duration_hr = (total_km / 1.60934) / 55  # miles / 55 mph

        # Build a simple LineString geometry for the map
        geometry = {
            "type": "LineString",
            "coordinates": coordinates,
        }

        return {
            "distance_km": round(total_km, 2),
            "duration_hr": round(duration_hr, 2),
            "geometry": geometry,
            "waypoints": [
                {"name": start,   "coordinates": coordinates[0]},
                {"name": pickup,  "coordinates": coordinates[1]},
                {"name": dropoff, "coordinates": coordinates[2]},
            ],
        }
