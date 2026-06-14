# ELD Route Planner

A production-ready **Trip Planning + ELD Log Generator** application for commercial truck drivers. Built with Django REST Framework (backend) and React + Vite + TailwindCSS (frontend).

## Features

- **Interactive Route Map** — OpenStreetMap via React Leaflet with waypoint markers, route polyline, and fuel stop markers
- **Route Summary** — total distance, driving time, trip days, fuel stops, cycle remaining
- **FMCSA-Compliant HOS Engine** — 11-hr driving limit, 14-hr duty window, 30-min break rule, 70hr/8day cycle
- **Multi-Day Trip Planning** — automatic day splitting with 10-hr off-duty resets
- **ELD Daily Log Sheets** — SVG-rendered FMCSA-style graphs (Off Duty, Sleeper, Driving, On Duty)
- **Download & Print** — PDF export, SVG download per day, and browser print
- **Dark Mode** — system-aware toggle with persistent preference
- **Demo Mode** — works without an API key using built-in city coordinates and haversine estimates

## Tech Stack

| Layer    | Technology                                |
|----------|-------------------------------------------|
| Backend  | Django 4.2, Django REST Framework 3.15    |
| Frontend | React 18, Vite 5, TailwindCSS 3          |
| Map      | React Leaflet 4, Leaflet 1.9, OpenStreetMap |
| Routing  | OpenRouteService API (optional)           |
| PDF      | jsPDF                                     |
| Deploy   | Vercel (frontend), Render (backend)       |

## Project Structure

```
eld_route_starter/
├── backend/
│   ├── api/              # Django app: views, serializers, urls
│   ├── backend/           # Django project: settings, urls, wsgi
│   ├── hos/              # HOS planner service (FMCSA rules)
│   ├── routing/          # Route service (ORS geocoding + directions)
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.jsx       # Main application
│   │   ├── api.js        # API client
│   │   ├── main.jsx      # Entry point
│   │   └── index.css     # TailwindCSS styles
│   ├── index.html
│   ├── tailwind.config.cjs
│   ├── postcss.config.cjs
│   ├── vite.config.js
│   ├── vercel.json
│   └── package.json
└── render.yaml
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 18+

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API will be available at `http://localhost:8000`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

**Backend** (optional):
```
ORS_API_KEY=your_openrouteservice_api_key
DJANGO_SECRET_KEY=your_secret_key
DJANGO_DEBUG=True
```

**Frontend**:
```
VITE_API_URL=http://localhost:8000
```

> **Note:** The app works in **demo mode** without an ORS API key using built-in city coordinates and haversine distance estimates.

## API Endpoints

### POST `/api/plan-trip/`

**Request:**
```json
{
  "current_location": "Dallas, TX",
  "pickup_location": "Houston, TX",
  "dropoff_location": "Atlanta, GA",
  "current_cycle_used_hours": 52
}
```

**Response:**
```json
{
  "route": {
    "distance_km": 1234.56,
    "duration_hr": 14.2,
    "geometry": { "type": "LineString", "coordinates": [...] },
    "waypoints": [...]
  },
  "fuel_stops": [...],
  "daily_logs": [
    {
      "day": 1,
      "date": "2026-06-12",
      "events": [...],
      "totals": { "off_duty": 10, "sleeper_berth": 0, "driving": 11, "on_duty_not_driving": 3 }
    }
  ],
  "summary": {
    "total_distance_miles": 767.3,
    "total_driving_time_hr": 13.9,
    "estimated_trip_days": 2,
    "fuel_stops_count": 0,
    "cycle_remaining_hours": 4.1
  }
}
```

## FMCSA HOS Rules Implemented

| Rule                 | Implementation                           |
|----------------------|------------------------------------------|
| 11-Hour Driving      | Max 11 hrs driving per duty period       |
| 14-Hour Window       | No driving after 14th hr on duty         |
| 30-Minute Break      | Required after 8 cumulative driving hrs  |
| 70-Hour/8-Day        | Tracks cycle usage, resets when exhausted |
| 10-Hour Off-Duty     | Required reset between duty periods      |

## Deployment

### Frontend → Vercel

1. Connect your GitHub repo to Vercel
2. Set root directory: `frontend`
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add env var: `VITE_API_URL=https://your-backend.onrender.com`

### Backend → Render

1. Connect your GitHub repo to Render
2. Use the `render.yaml` blueprint
3. Set env var: `ORS_API_KEY` (optional)

## License

MIT
