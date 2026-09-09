# UrbanSense - AI-Powered Urban Intelligence Platform Backend

A production-grade Django REST Framework backend turning public transport buses into mobile sensing units for smart city surveillance, road safety, and traffic intelligence (Ahmedabad Urban Corridor).

Designed to power the React + TypeScript frontend running at `http://localhost:5173`.

---

## 🏗️ Architecture Overview

```
BUS CAMERAS (Front, Rear, Sides, Cabin)
        ↓
EDGE AI INFERENCE (YOLO, ANPR, Object Tracking)
        ↓
REST EDGE API (`/api/edge/*`)
        ↓
DETECTION PIPELINE (`DetectionService`)
        ↓
EVENT DISPATCH & PERSISTENCE (PostgreSQL + PostGIS)
   ├── Road Hazards (`RoadService`)
   ├── Safety Incidents & Hit-and-Run (`IncidentService`)
   └── Traffic Analytics (`TrafficService`)
        ↓
ALERT ENGINE (`AlertService`)
        ↓
REAL-TIME WEBSOCKETS (Django Channels: `/ws/dashboard/`, `/ws/fleet/`, `/ws/alerts/`)
        ↓
REACT COMMAND CENTER FRONTEND
```

---

## 🚀 Quick Start (Under 2 Minutes)

### 1. Project Directory & Virtual Environment
```bash
cd backend
python -m venv venv

# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# On Linux/macOS:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Variables
Create `.env` from `.env.example`:
```bash
cp .env.example .env
```

Key environment variables:
| Variable | Description | Default |
|---|---|---|
| `SECRET_KEY` | Django Secret Key | `django-insecure-key` |
| `DEBUG` | Debug Mode | `True` |
| `ALLOWED_HOSTS` | Allowed hostnames | `localhost,127.0.0.1` |
| `DATABASE_URL` | PostgreSQL connection string | SQLite for local dev if empty |
| `CORS_ALLOWED_ORIGINS` | Allowed origins for React app | `http://localhost:5173,http://localhost:3000` |
| `USE_REDIS` | Use Redis for channels (set `True` if Redis running) | `False` (InMemory fallback) |
| `REDIS_URL` | Redis endpoint | `redis://localhost:6379/0` |

---

### 4. Database Setup & Migrations

#### Local Zero-Dependency Development
By default, the backend automatically uses SQLite if `DATABASE_URL` is not set, meaning you can develop without running a PostgreSQL server.

#### PostgreSQL with PostGIS Setup (Production)
```sql
CREATE DATABASE urban_intelligence;
\c urban_intelligence;
CREATE EXTENSION postgis;
```
Then set in `.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/urban_intelligence
```

Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

---

### 5. Seed Realistic Demo Data
Generate Ahmedabad urban sensing data (25+ buses, 6 routes, 100+ detections, hazards, traffic observations, ANPR tracked vehicles, school zones):
```bash
python manage.py seed_demo_data
```

Default credentials created:
- **Admin**: `admin` / `Admin@1234`
- **Operator**: `operator` / `Admin@1234`
- **Analyst**: `analyst` / `Admin@1234`
- **Viewer**: `viewer` / `Admin@1234`

---

### 6. Run the Servers

#### Running Django REST & WebSockets (ASGI)
```bash
# Development server (Supports HTTP and WebSockets)
python manage.py runserver 8000
```
Or with Daphne / Uvicorn for production:
```bash
uvicorn config.asgi:application --host 0.0.0.0 --port 8000 --reload
```

#### Running Celery Worker (Optional Background Simulation)
```bash
celery -A config worker --loglevel=info
```

#### Running Celery Beat
```bash
celery -A config beat --loglevel=info
```

---

## 📖 Interactive API Documentation

- **Swagger UI**: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
- **OpenAPI Schema**: [http://localhost:8000/api/schema/](http://localhost:8000/api/schema/)
- **Django Admin**: [http://localhost:8000/admin/](http://localhost:8000/admin/)

---

## 📡 REST API Reference

### 🔐 Authentication (`/api/auth/`)
- `POST /api/auth/login/` - Login with credentials, returns JWT tokens + user profile.
- `POST /api/auth/refresh/` - Refresh expired access token.
- `GET /api/auth/me/` - Retrieve authenticated user profile and roles (`ADMIN`, `OPERATOR`, `ANALYST`, `VIEWER`).
- `POST /api/auth/logout/` - Blacklist refresh token.

### 🚌 Fleet Monitoring (`/api/fleet/`)
- `GET /api/fleet/buses/` - Search, filter (`?status=ONLINE&route=18&search=BUS-104`), sort, and paginate buses.
- `GET /api/fleet/buses/{id}/` - Bus detail with camera statuses and live coordinates.
- `POST /api/fleet/buses/` - Register new bus.
- `PATCH /api/fleet/buses/{id}/` - Update bus info.
- `DELETE /api/fleet/buses/{id}/` - Remove bus.
- `GET /api/fleet/routes/` - List all bus routes.
- `GET /api/fleet/buses/{id}/cameras/` - Camera statuses (Front, Rear, Left, Right, Passenger).
- `POST /api/fleet/buses/{id}/location/` - Ingest live GPS coordinates & update history.
- `GET /api/fleet/buses/{id}/location-history/` - Historic coordinate breadcrumbs.

### 👁️ AI Detections (`/api/detections/`)
- `GET /api/detections/` - List detections with filters (`?detection_type=POTHOLE&severity=HIGH&bus=BUS-104`).
- `GET /api/detections/{id}/` - Single detection details.
- `POST /api/detections/` - Submit detection payload from edge AI.

### 🛣️ Road Intelligence (`/api/roads/`)
- `GET /api/roads/hazards/` - List road surface hazards.
- `GET /api/roads/hazards/{id}/` - Hazard details.
- `GET /api/roads/summary/` - KPI summary:
  ```json
  {
    "roads_scanned": 1284,
    "hazards_detected": 327,
    "critical_segments": 24,
    "maintenance_priority": 86
  }
  ```
- `GET /api/roads/maintenance-priority/` - Prioritized list for Municipal Corporation PWD.

### 🚦 Traffic Intelligence (`/api/traffic/`)
- `GET /api/traffic/current/` - Current corridor speeds and density.
- `GET /api/traffic/history/?hours=24` - Hourly traffic density formatted for Recharts.
- `GET /api/traffic/summary/` - Overall traffic index and speed metrics.
- `GET /api/traffic/congestion/` - Congestion indices by city zone.
- `GET /api/traffic/vehicle-classification/` - Breakdown of Cars, Two-Wheelers, Autos, Buses, Trucks.

### 🚨 Incident Center (`/api/incidents/`)
- `GET /api/incidents/` - List safety incidents (`?severity=CRITICAL&status=OPEN&type=HIT_AND_RUN`).
- `GET /api/incidents/{id}/` - Incident investigation dossier with evidence, timeline, vehicle info.
- `POST /api/incidents/` - Create incident.
- `POST /api/incidents/{id}/resolve/` - Mark incident as resolved with operational notes.

### 🔍 ANPR & Vehicle Tracking (`/api/vehicles/`)
- `GET /api/vehicles/` - List tracked vehicles.
- `GET /api/vehicles/{id}/` - Vehicle profile.
- `GET /api/vehicles/search/?registration=GJ01XX4821` - Instant search by license plate.
- `GET /api/vehicles/{id}/detections/` - All sightings across the bus fleet.
- `GET /api/vehicles/{id}/route/` - Path coordinate array for Leaflet map polyline rendering.

### 📊 Dashboard & Simulation (`/api/dashboard/` & `/api/demo/`)
- `GET /api/dashboard/summary/` - Top-level dashboard KPI metrics.
- `GET /api/dashboard/live-alerts/` - Real-time critical alerts feed.
- `POST /api/demo/start/` - Start real-time urban event simulator.
- `POST /api/demo/stop/` - Stop simulation.
- `GET /api/demo/status/` - Check simulation runner state.

### 🗺️ Geospatial GIS (`/api/map/` & `/api/safety/`)
- `GET /api/map/all/` - Consolidated payload for Leaflet map (buses, hazards, incidents, traffic, segments).
- `GET /api/map/buses/` - Live bus marker coordinates.
- `GET /api/map/hazards/` - Road hazard map points.
- `GET /api/map/incidents/` - Incident zones.
- `GET /api/safety/school-zones/` - School safety zones and nearby pedestrian risk events.

### 📈 Analytics & AI Insights (`/api/analytics/`)
- `GET /api/analytics/detections/` - Daily detection trends & distribution.
- `GET /api/analytics/traffic/` - Consolidated traffic dashboard data.
- `GET /api/analytics/road-conditions/` - Road degradation categories.
- `GET /api/analytics/incidents/` - Severity distribution.
- `GET /api/analytics/route-delays/` - Corridor delay minutes and congestion index.
- `GET /api/analytics/insights/` - Deterministic heuristic city insights (LLM-ready interface).

### 📑 Reports (`/api/reports/`)
- `GET /api/reports/` - Historic daily reports.
- `GET /api/reports/{id}/` - Report details.
- `POST /api/reports/generate/` - Trigger report compilation for a given date.

### 🤖 Edge Device Ingestion (`/api/edge/`)
- `POST /api/edge/heartbeat/` - Device camera health & AI operational status.
- `POST /api/edge/location/` - Telemetry push from bus on-board unit.
- `POST /api/edge/detections/` - Ingest real-time vision inference.
- `POST /api/edge/incidents/` - Urgent on-device crash or incident dispatch.

---

## ⚡ WebSockets Channels

Connect using any WebSocket client or frontend hook:

| Channel | Purpose | Sample Event |
|---|---|---|
| `ws://localhost:8000/ws/dashboard/` | Real-time KPI and alert stream | `NEW_DETECTION`, `NEW_INCIDENT`, `NEW_ALERT` |
| `ws://localhost:8000/ws/fleet/` | High-frequency bus GPS movement | `BUS_LOCATION_UPDATED` |
| `ws://localhost:8000/ws/alerts/` | Dispatch alerts and emergency events | `NEW_ALERT` |

---

## 🧪 Automated Testing

Execute the comprehensive unit test suite:
```bash
python manage.py test accounts fleet detections roads traffic vehicles incidents notifications dashboard analytics reports common
```
Results: **33 automated test cases covering authentication, CRUD, filters, ANPR, hit-and-run workflow, road intelligence, and map endpoints with 100% pass rate**.

---

## 🔗 Connecting with React Frontend

In `d:\SIH frontend\`:
1. Start Django: `python manage.py runserver 8000`
2. Start Vite: `npm run dev` (running on `http://localhost:5173`)
3. The frontend can query `http://localhost:8000/api/` with CORS pre-configured.
