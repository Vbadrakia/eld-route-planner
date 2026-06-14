import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix default Leaflet marker icons (webpack/vite compatibility)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored markers
function createIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

const ICONS = {
  start:   createIcon('#3b82f6'), // blue
  pickup:  createIcon('#f59e0b'), // amber
  dropoff: createIcon('#10b981'), // green
  fuel:    createIcon('#ef4444'), // red
};

/**
 * RouteMap — displays the route polyline, waypoints, and fuel stops on a Leaflet map.
 */
export default function RouteMap({ route, fuelStops }) {
  // Decode route coordinates
  const coords = useMemo(() => {
    if (!route?.geometry) return [];
    const geom = route.geometry;

    // GeoJSON LineString
    if (geom.type === 'LineString' && geom.coordinates) {
      return geom.coordinates.map(([lon, lat]) => [lat, lon]);
    }
    // Encoded polyline string (ORS returns this for driving-hgv)
    if (typeof geom === 'string') {
      return decodePolyline(geom);
    }
    return [];
  }, [route]);

  // Waypoint markers
  const waypoints = useMemo(() => {
    if (!route?.waypoints) return [];
    return route.waypoints.map((wp, i) => ({
      position: [wp.coordinates[1], wp.coordinates[0]],
      name: wp.name,
      type: i === 0 ? 'start' : i === route.waypoints.length - 1 ? 'dropoff' : 'pickup',
    }));
  }, [route]);

  // Center of map
  const center = useMemo(() => {
    if (waypoints.length > 0) {
      const lats = waypoints.map((w) => w.position[0]);
      const lons = waypoints.map((w) => w.position[1]);
      return [(Math.min(...lats) + Math.max(...lats)) / 2, (Math.min(...lons) + Math.max(...lons)) / 2];
    }
    return [39.8283, -98.5795]; // center of US
  }, [waypoints]);

  // Bounds
  const bounds = useMemo(() => {
    if (coords.length > 1) return coords;
    if (waypoints.length > 1) return waypoints.map((w) => w.position);
    return null;
  }, [coords, waypoints]);

  return (
    <div id="route-map" className="bg-white dark:bg-surface-800 rounded-2xl overflow-hidden shadow-card">
      <div className="px-5 pt-4 pb-2">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          Route Map
        </h2>
      </div>
      <MapContainer
        center={center}
        zoom={6}
        bounds={bounds}
        boundsOptions={{ padding: [40, 40] }}
        scrollWheelZoom={true}
        className="w-full"
        style={{ height: 420 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route polyline */}
        {coords.length > 1 && (
          <Polyline positions={coords} pathOptions={{ color: '#12c9a4', weight: 4, opacity: 0.85 }} />
        )}

        {/* Waypoint markers */}
        {waypoints.map((wp, i) => (
          <Marker key={`wp-${i}`} position={wp.position} icon={ICONS[wp.type]}>
            <Popup>
              <strong className="capitalize">{wp.type}</strong><br />
              {wp.name}
            </Popup>
          </Marker>
        ))}

        {/* Fuel stop markers */}
        {fuelStops?.map((fs, i) => {
          // Distribute fuel markers along the route
          if (coords.length < 2) return null;
          const idx = Math.min(
            Math.round((coords.length - 1) * ((i + 1) / (fuelStops.length + 1))),
            coords.length - 1
          );
          return (
            <Marker key={`fuel-${i}`} position={coords[idx]} icon={ICONS.fuel}>
              <Popup>
                <strong>⛽ Fuel Stop</strong><br />
                {fs.location}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

/**
 * Decode an ORS encoded polyline string into [[lat, lon], ...]
 */
function decodePolyline(encoded) {
  const coords = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);

    shift = 0; result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);

    coords.push([lat / 1e5, lng / 1e5]);
  }
  return coords;
}
