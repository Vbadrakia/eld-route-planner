# ELD Route Planner – Backend

## Overview
A **Django 4.x** project with **Django REST Framework** that provides a single endpoint `/api/plan-trip/`. The endpoint receives the current location, pickup, drop‑off and hours used in the current 70‑hour cycle, then:

1. Calls **OpenRouteService** to geocode the three addresses and retrieve a driving route.
2. Computes **fuel stops** (every 1000 mi) and **breaks** according to FMCSA Hours‑of‑Service rules via the `HOSPlanner` service.
3. Splits the trip into daily log sheets (FMCSA‑style SVG data).
4. Returns a JSON payload containing the route geometry, fuel‑stop list, daily logs and a summary.

The backend is containerised for easy deployment on **Render**.

---
### Quick Start (Local Development)
```bash
# Clone the repo and cd into backend
cd backend

# Create a virtual environment (Windows)
python -m venv .venv
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file (see .env.example) and add your OpenRouteService API key
cp .env.example .env
# edit .env → set ORS_API_KEY=your_key_here

# Run PostgreSQL (Docker is easiest)
# You can also use a local Postgres installation.

docker run --name pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

# Apply migrations and start the server
python manage.py migrate
python manage.py runserver
```
The API will be reachable at `http://127.0.0.1:8000/api/plan-trip/`.

---
### Running Tests
```bash
python manage.py test
```

---
### Deployment to Render
1. Push this repository to a Git provider (GitHub, GitLab, etc.).
2. In Render, create a **Web Service** and point it at the repository.
3. Render will automatically detect the `Dockerfile` and the `render.yaml` file.
4. Add the following environment variables in Render:
   - `DJANGO_SECRET_KEY` – any long random string (Render can generate one).
   - `ORS_API_KEY` – your OpenRouteService API key.
   - `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT` – these are automatically injected when you add a Render Postgres service and link it.
5. Render will build the Docker image, run migrations (`python manage.py migrate`) and start the app with **Gunicorn**.

---
### Folder Structure
```
backend/
├─ api/               # API app (models, serializers, views)
├─ routing/           # RouteService (OpenRouteService wrapper)
├─ hos/               # HOSPlanner (hours‑of‑service logic)
├─ trips/             # (optional) future carrier/vehicle models
├─ backend/           # Django project settings, urls, wsgi
├─ requirements.txt   # Python dependencies
├─ Dockerfile         # Multi‑stage Docker build for Render
├─ render.yaml        # Render service definition
├─ .env.example       # Template for environment variables
└─ README.md          # This file
```

---
### License
MIT © 2026 VEDANT (or your organization)
