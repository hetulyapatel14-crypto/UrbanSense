import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_styled_table(doc, headers, data, col_widths=None, primary_color="1E3A8A", alt_color="F1F5F9"):
    table = doc.add_table(rows=len(data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    # Header Row
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_background(hdr_cells[i], primary_color)
        set_cell_margins(hdr_cells[i], 120, 120, 150, 150)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for run in p.runs:
            run.font.bold = True
            run.font.color.rgb = RGBColor(255, 255, 255)
            run.font.size = Pt(10)
            run.font.name = 'Calibri'

    # Data Rows
    for row_idx, row_data in enumerate(data):
        row_cells = table.rows[row_idx + 1].cells
        bg_color = "FFFFFF" if row_idx % 2 == 0 else alt_color
        for col_idx, cell_value in enumerate(row_data):
            row_cells[col_idx].text = str(cell_value)
            set_cell_background(row_cells[col_idx], bg_color)
            set_cell_margins(row_cells[col_idx], 80, 80, 120, 120)
            p = row_cells[col_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for run in p.runs:
                run.font.size = Pt(9.5)
                run.font.name = 'Calibri'
                run.font.color.rgb = RGBColor(30, 41, 59)

    # Set Column Widths if provided
    if col_widths:
        for row in table.rows:
            for i, w in enumerate(col_widths):
                row.cells[i].width = Inches(w)

    doc.add_paragraph() # spacing
    return table

def add_callout_box(doc, title, text, border_color="2563EB", bg_color="EFF6FF"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.rows[0].cells[0]
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, 140, 140, 180, 180)
    
    # Left border accent
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:left w:val="single" w:sz="36" w:space="0" w:color="{border_color}"/><w:top w:val="none"/><w:right w:val="none"/><w:bottom w:val="none"/></w:tcBorders>')
    tcPr.append(tcBorders)

    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(4)
    run_t = p.add_run(f"📌 {title}\n")
    run_t.bold = True
    run_t.font.name = 'Calibri'
    run_t.font.size = Pt(11)
    run_t.font.color.rgb = RGBColor(30, 58, 138)

    run_body = p.add_run(text)
    run_body.font.name = 'Calibri'
    run_body.font.size = Pt(10)
    run_body.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_paragraph()

def build_document():
    doc = Document()

    # Page Margins (1 inch all sides)
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Base Styles
    styles = doc.styles
    normal_style = styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(30, 41, 59)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(6)

    # Document Header / Title
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(2)
    run_title = title_p.add_run("UrbanSense Platform")
    run_title.bold = True
    run_title.font.size = Pt(26)
    run_title.font.name = 'Segoe UI'
    run_title.font.color.rgb = RGBColor(30, 58, 138) # Deep Blue

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(14)
    run_sub = sub_p.add_run("Comprehensive Technical Architecture, Frontend, Backend & API Keys Documentation")
    run_sub.font.size = Pt(14)
    run_sub.font.name = 'Segoe UI Semibold'
    run_sub.font.color.rgb = RGBColor(79, 70, 229) # Indigo

    # Metadata Strip
    meta_p = doc.add_paragraph()
    meta_p.paragraph_format.space_after = Pt(18)
    r_meta = meta_p.add_run("Target City: Ahmedabad & Gandhinagar (GIFT City Corridor)  |  Version: 1.0.0 Production  |  Author: UrbanSense Engineering Team")
    r_meta.font.size = Pt(9.5)
    r_meta.font.italic = True
    r_meta.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_heading("1. Executive Summary & System Overview", level=1)
    p = doc.add_paragraph()
    p.add_run(
        "UrbanSense is an enterprise-grade GovTech Artificial Intelligence Platform engineered to transform standard municipal transit buses "
        "(AMTS and Janmarg BRTS) into autonomous, mobile sensing units. As buses traverse the urban road network, onboard Edge AI computer vision "
        "pipelines continuously analyze roadway video streams in real-time, detecting critical civic anomalies—including potholes, waterlogging, missing zebra crossings, "
        "school zone safety hazards, and reckless driving. Telemetry is securely synchronized with a central command cloud, powering live GIS mapping, automated incident triage, "
        "and an AI-powered multimodal journey planner for citizens and transit operators across Ahmedabad, Gandhinagar, and GIFT City."
    )

    add_callout_box(
        doc,
        "Core Value Proposition",
        "• Automated Road Condition Monitoring: 100% automated roadway scanning without dedicated survey vehicles.\n"
        "• Edge-to-Cloud Telemetry: Ultra-low latency incident escalation with ANPR and evidence bounding boxes.\n"
        "• Comprehensive Multimodal Transit: Unified navigation across Ahmedabad Metro (Red/Blue Lines), Janmarg BRTS Busway, AMTS Feeders, and Suburban Indian Railways.\n"
        "• Zero Mandatory Cloud API Licensing: Engineered with self-contained algorithms and open geospatial services for zero recurring external API bills."
    )

    # ---------------------------------------------------------
    # 2. FRONTEND ARCHITECTURE
    # ---------------------------------------------------------
    doc.add_heading("2. Complete Frontend Architecture & Specifications", level=1)
    
    p = doc.add_paragraph()
    p.add_run(
        "The frontend is built as a single-page application (SPA) optimized for high responsiveness, fluid animations, and real-time geospatial rendering. "
        "It leverages modern React 18 with strict TypeScript typing, Tailwind CSS for custom design system tokenization, and Leaflet for interactive GIS cartography."
    )

    doc.add_heading("2.1 Frontend Tech Stack", level=2)
    fe_tech_data = [
        ["Core Framework", "React 18.2.0 + TypeScript 5.2.2", "Component-driven reactive UI architecture with full type safety."],
        ["Build System & Bundler", "Vite 5.0.8", "Instant HMR (Hot Module Replacement) and optimized tree-shaken production bundles."],
        ["Styling & Design System", "Tailwind CSS 3.3.6 + PostCSS", "Custom design tokens, glassmorphism, responsive utilities, and CSS variables."],
        ["Interactive Cartography", "Leaflet 1.9.4 & React-Leaflet 4.2.1", "Real-time GIS maps, custom bus markers, hazard heatmaps, and route polylines."],
        ["Data Visualization", "Recharts 2.10.3", "Analytical charts for hourly traffic density, road condition indexes, and alert distributions."],
        ["Iconography", "Lucide-React 0.294.0", "Crisp, lightweight SVG icons for navigation, transport modes, and telemetry indicators."],
        ["Client Routing", "React Router DOM 6.20.0", "Declarative client-side routing with deep link support and URL query synchronizers."]
    ]
    create_styled_table(doc, ["Technology Layer", "Package / Version", "Functional Purpose"], fe_tech_data, [1.6, 2.0, 3.2])

    doc.add_heading("2.2 Frontend Directory Structure & Module Breakdown", level=2)
    p = doc.add_paragraph()
    p.add_run("The frontend source directory (`src/`) is organized strictly by concern to ensure high maintainability and reusability:")

    fe_structure_data = [
        ["src/pages/", "Application Views", "Contains top-level route pages: Command Center, Live Fleet, Urban Map, Journey Planner, Road Intelligence, Traffic Analytics, Incident Center, Incident Details, Vehicle Tracking, Home, and About."],
        ["src/components/common/", "Reusable Global Widgets", "Navigation Header, Responsive Sidebar with Collapsible State, Slide-over Drawer Menu, Live Status Badges, and Scroll Progress Bars."],
        ["src/components/journey/", "Journey Planner Suite", "Search Panel with Location Swap & Voice Search, Route Cards with Mode Pills, Comprehensive Mode Comparison Matrix, Interactive Polyline Map Viewer, and AI Co-Pilot Assistant."],
        ["src/services/", "API & Telemetry Clients", "`api.ts` (Core REST client with auto JWT authentication & retry logic) and `transitApi.ts` (Multimodal journey planning, vehicle ETAs, and fallback generators)."],
        ["src/types/", "TypeScript Definitions", "Type definitions for Bus, Incident, Detection, RoadHazard, RouteOption, TransitStop, RouteLeg, and GeoLocation."],
        ["src/data/", "Geospatial Seed Data", "Rich Ahmedabad city coordinates, bus routes (Janmarg BRTS, AMTS, Metro), mock telemetry datasets, and landmark coordinates."]
    ]
    create_styled_table(doc, ["Directory", "Component Group", "Description & Responsibilities"], fe_structure_data, [1.8, 1.8, 3.2])

    doc.add_heading("2.3 Key Frontend Features & User Experience", level=2)
    fe_features = [
        ("City Intelligence Command Center", "High-altitude live operations dashboard with active vehicle counts, sensor health percentages, AI detection event feeds, and live interactive GIS view."),
        ("Multimodal AI Journey Planner", "Smart transit routing returning up to 7 Pareto-efficient route alternatives with category tags ('FASTEST', 'CHEAPEST', 'BRTS BUSWAY', 'LEAST WALKING', 'DIRECT METRO'). Features step-by-step navigation and fare estimation."),
        ("Urban Geospatial Hazard Map", "Full-screen GIS map with multi-layer filtering (Buses, Waterlogging, Potholes, School Zones, Congestion Heatmaps)."),
        ("Automated Incident Investigation", "Deep incident triage view with ANPR license plate extraction, camera evidence inspection with bounding boxes, priority escalation, and resolution tracking.")
    ]
    for feat_title, feat_desc in fe_features:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.2)
        r_title = p.add_run(f"• {feat_title}: ")
        r_title.bold = True
        r_title.font.color.rgb = RGBColor(30, 58, 138)
        p.add_run(feat_desc)

    # ---------------------------------------------------------
    # 3. BACKEND ARCHITECTURE
    # ---------------------------------------------------------
    doc.add_heading("3. Complete Backend Architecture & Specifications", level=1)
    
    p = doc.add_paragraph()
    p.add_run(
        "The backend is powered by Python 3.14 and Django 5.0.8 using Django REST Framework (DRF) for high-performance RESTful APIs, "
        "Django Channels (ASGI) for real-time WebSocket telemetry, and Celery with Redis for asynchronous background tasks. "
        "It supports both PostgreSQL with PostGIS extensions for production GIS workloads and zero-dependency local SQLite for rapid development."
    )

    doc.add_heading("3.1 Backend Tech Stack & Core Libraries", level=2)
    be_tech_data = [
        ["Framework & Web Server", "Django 5.0.8 & DRF 3.15.2", "Core application server, ORM, serialisation, and REST API controllers."],
        ["Authentication & Security", "SimpleJWT 5.3.1 & Argon2/PBKDF2", "Stateless JSON Web Token (JWT) authentication with refresh rotation."],
        ["Database Engines", "PostgreSQL (PostGIS) / SQLite3", "Relational database with geospatial geometry, spatial indexing, and distance calculations."],
        ["Real-time WebSockets", "Django Channels 4.1.0 & channels-redis", "Asynchronous ASGI server layer for live bus telemetry & incident event broadcasting."],
        ["Task Queue & Scheduling", "Celery 5.4.0 & Redis 5.0.8", "Asynchronous job worker for AI video batch processing, scheduled telemetry sync, and daily report generation."],
        ["API Schema Documentation", "drf-spectacular 0.27.2", "Automated OpenAPI 3.0 schema generation with interactive Swagger UI."],
        ["Geospatial Calculations", "Geopy 2.4.1 & PostGIS ST_Distance", "Haversine distance calculation, polygon geofencing, and landmark proximity search."],
        ["Edge AI Simulation", "Modular Computer Vision Interfaces", "Pluggable engine supporting YOLOv8, YOLOv11, OpenCV, and ONNX Runtime."]
    ]
    create_styled_table(doc, ["Component", "Technology / Package", "Technical Functionality"], be_tech_data, [1.8, 2.0, 3.0])

    doc.add_heading("3.2 Django Applications Breakdown", level=2)
    p = doc.add_paragraph()
    p.add_run("The backend architecture is modularized into discrete Django applications:")

    apps_data = [
        ["accounts", "Authentication & Users", "Custom User model, JWT login/refresh endpoints, role-based access control (Operator, City Official, Admin)."],
        ["fleet", "Vehicle Fleet Telemetry", "Bus registration, device pairing, GPS telemetry ingestion, live speed, camera health, and edge heartbeat tracking."],
        ["detections", "Edge AI Detections", "Storage and filtering of roadway anomalies (potholes, debris, waterlogging, pedestrian proximity, missing dividers)."],
        ["incidents", "Incident Triage & Lifecycle", "Automated incident generation from high-confidence detections, priority scoring (LOW, MEDIUM, HIGH, CRITICAL), team assignment."],
        ["traffic", "Traffic & Flow Analytics", "Road segment speed tracking, congestion index computation, peak hour density metrics, and delay estimation."],
        ["roads", "Road Quality & Maintenance", "Pavement Condition Index (PCI) calculation, road section catalog, and municipal maintenance work-order queues."],
        ["vehicles", "ANPR & Vehicle Search", "Automated Number Plate Recognition (ANPR) registry, vehicle search by plate, and historical movement path reconstruction."],
        ["transit", "Multimodal Journey Engine", "Graph-based routing for Metro, BRTS, AMTS, and Rail. Real-time ETA estimation, dynamic fare calculation, and AI Co-Pilot service."],
        ["analytics & reports", "Civic Intelligence Reports", "Daily PDF/CSV report generation, predictive trend analytics, and historical safety metrics."],
        ["dashboard & common", "KPIs & Demo Simulation", "Aggregated command center KPIs, autonomous bus simulation engine, and school zone safety radius monitoring."]
    ]
    create_styled_table(doc, ["Django App", "Domain Focus", "Key Responsibilities"], apps_data, [1.6, 1.8, 3.4])

    doc.add_heading("3.3 Multimodal Routing Engine Inner Architecture", level=2)
    p = doc.add_paragraph()
    p.add_run(
        "The `transit` app contains an advanced graph-based routing algorithm (`MultimodalRoutingEngine`) tailored specifically to the Ahmedabad-Gandhinagar urban continuum. "
        "It supports:"
    )
    routing_features = [
        ("Multi-Modal Connectivity", "Direct and transfer combinations across Ahmedabad Metro (Red & Blue lines), Janmarg BRTS dedicated busway, AMTS feeder buses, and Western Railway suburban lines."),
        ("Diversity-Preserving Pareto Filtering", "Groups candidate routes by mode profile (Direct Metro, Dedicated Busway, Rail Corridor, Feeder+Metro) and ranks them using multi-objective optimization (time, cost, walking distance, transfers)."),
        ("Real-time ETA Integration", "Dynamically factors live bus GPS telemetry and road congestion speeds into projected arrival times."),
        ("AI Journey Assistant Co-Pilot", "Natural language query parser (`AiJourneyAssistantService`) that extracts origin, destination, time constraints, and preferences ('cheapest', 'least walking', 'wheelchair accessible') into structured routing queries.")
    ]
    for r_title, r_desc in routing_features:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.2)
        r = p.add_run(f"• {r_title}: ")
        r.bold = True
        r.font.color.rgb = RGBColor(30, 58, 138)
        p.add_run(r_desc)

    # ---------------------------------------------------------
    # 4. API KEYS & ENVIRONMENT CONFIGURATION
    # ---------------------------------------------------------
    doc.add_heading("4. Comprehensive API Keys, Secrets & Environment Variables", level=1)
    
    p = doc.add_paragraph()
    p.add_run(
        "UrbanSense is architected for maximum operational sovereignty, meaning the entire platform runs out-of-the-box with "
        "ZERO mandatory paid external API keys. All core machine learning, geocoding, and routing logic are self-contained. "
        "Below is the complete configuration matrix of environment variables, secrets, and optional integration keys:"
    )

    api_keys_data = [
        ["SECRET_KEY", "Backend / Django", "Required (Production)", "Cryptographic signing key for Django sessions and SimpleJWT tokens. Automatically defaults to a secure dev key in local mode."],
        ["DEBUG", "Backend / Django", "Optional (Default: True)", "Controls debug error pages. Must be set to `False` in production deployments."],
        ["ALLOWED_HOSTS", "Backend / Django", "Optional", "Comma-separated list of allowed host header domains (e.g. `localhost,127.0.0.1,api.urbansense.gov`)."],
        ["DATABASE_URL", "Backend / Database", "Optional", "Standard database URI (e.g. `postgresql://user:password@localhost:5432/urban_intelligence`). If empty, uses SQLite `db.sqlite3`."],
        ["POSTGRES_HOST / PORT", "Backend / Database", "Optional", "Individual PostgreSQL host parameters when not using `DATABASE_URL`."],
        ["CORS_ALLOWED_ORIGINS", "Backend / Security", "Optional", "Allowed frontend origins permitted to make cross-origin AJAX requests (e.g. `http://localhost:5173`)."],
        ["USE_REDIS", "Backend / Telemetry", "Optional (Default: False)", "Enables Redis channel layer and Celery task broker. Defaults to In-Memory for zero-dependency development."],
        ["REDIS_URL", "Backend / Redis", "Optional", "Redis connection URL (`redis://localhost:6379/0`) for distributed caching & task queues."],
        ["DEMO_MODE", "Backend / Engine", "Optional (Default: True)", "Enables autonomous vehicle movement and incident detection simulation."],
        ["VITE_API_URL", "Frontend / Client", "Optional", "Base URL for backend REST API calls (defaults to `http://localhost:8000/api`)."],
        ["Map Tiles (Leaflet)", "Frontend / GIS", "FREE / No Key Required", "Uses OpenStreetMap / CartoDB raster tiles. Fully open-source with zero API key or billing required."],
        ["Edge AI Vision Models", "Backend / AI", "Local / No Key Required", "Onboard YOLOv8 / ONNX inference runs locally on the CPU/GPU edge hardware without external cloud API fees."],
        ["AI Assistant Co-Pilot", "Backend / AI", "Local / No Key Required", "Rule-based natural language intent parser & heuristic journey assistant runs locally without OpenAI/Gemini API keys."]
    ]
    create_styled_table(doc, ["Key / Environment Variable", "Layer / Scope", "Requirement Level", "Description & Usage Instructions"], api_keys_data, [1.8, 1.3, 1.4, 2.7])

    add_callout_box(
        doc,
        "Zero API Billing Dependency Notice",
        "Unlike platforms reliant on proprietary Google Maps Platform or OpenAI API credits, UrbanSense is designed for municipal government cost efficiency. "
        "The GIS maps use free open tile layers, the routing engine uses built-in GTFS graph algorithms, and the AI co-pilot operates on an internal deterministic NLP engine."
    )

    # ---------------------------------------------------------
    # 5. REST API ENDPOINT DIRECTORY
    # ---------------------------------------------------------
    doc.add_heading("5. Primary REST API Endpoints Directory", level=1)
    
    p = doc.add_paragraph()
    p.add_run("The backend exposes a comprehensive RESTful API suite documented via OpenAPI 3.0 at `/api/docs/`:")

    endpoints_data = [
        ["POST", "/api/auth/login/", "Authenticate operator and obtain SimpleJWT Access + Refresh tokens."],
        ["GET", "/api/dashboard/kpis/", "Retrieve citywide real-time operational KPIs (fleet, sensors, alerts, detections)."],
        ["GET", "/api/fleet/buses/", "List all registered municipal transit buses with live GPS coordinates and speed."],
        ["GET", "/api/transit/journey/plan/", "Multimodal journey planner calculating up to 7 route options with fares and transfers."],
        ["POST", "/api/transit/journey/ai-assist/", "AI natural language journey co-pilot parsing free-form passenger travel requests."],
        ["GET", "/api/incidents/", "List detected roadway incidents filtered by severity, status, or date range."],
        ["GET", "/api/incidents/{id}/", "Fetch full incident investigation details including ANPR plates and evidence frames."],
        ["GET", "/api/vehicles/search/", "Search vehicle detection history by registration plate number."],
        ["GET", "/api/roads/hazards/", "Retrieve catalog of detected road hazards (potholes, waterlogging) for GIS overlay."],
        ["GET", "/api/traffic/congestion/", "Retrieve current traffic congestion index and average route delays across urban zones."],
        ["POST", "/api/demo/start/", "Start autonomous real-time vehicle movement and incident detection simulation."],
        ["POST", "/api/demo/stop/", "Stop the background simulation engine."]
    ]
    create_styled_table(doc, ["Method", "API Route Endpoint", "Functional Description"], endpoints_data, [0.9, 2.5, 3.6])

    # ---------------------------------------------------------
    # 6. HOW TO RUN & DEPLOY
    # ---------------------------------------------------------
    doc.add_heading("6. System Execution & Deployment Guide", level=1)
    
    p = doc.add_paragraph()
    p.add_run("To launch the complete UrbanSense platform locally or in production, follow these simple steps:")

    doc.add_heading("Step 1: Start the Backend (Django Server)", level=2)
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.2)
    p.add_run(
        "1. Open terminal and navigate to `backend/`:\n"
        "   `cd backend`\n"
        "2. Install dependencies:\n"
        "   `pip install -r requirements.txt`\n"
        "3. Apply database migrations:\n"
        "   `python manage.py migrate`\n"
        "4. Seed Ahmedabad transit and initial demo data:\n"
        "   `python manage.py seed_transit_data`\n"
        "5. Start the development server:\n"
        "   `python manage.py runserver 8000`\n"
        "   -> Backend runs at: http://127.0.0.1:8000\n"
        "   -> API Documentation: http://127.0.0.1:8000/api/docs/"
    )

    doc.add_heading("Step 2: Start the Frontend (Vite Server)", level=2)
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.2)
    p.add_run(
        "1. Open a new terminal in the project root (`UrbanSense/`):\n"
        "2. Install npm dependencies:\n"
        "   `npm install`\n"
        "3. Start Vite development server:\n"
        "   `npm run dev`\n"
        "   -> Frontend opens at: http://localhost:5173\n"
        "4. Build for production:\n"
        "   `npm run build`"
    )

    # Save Word Document
    output_path = "d:\\UrbanSense\\UrbanSense_Full_System_Documentation.docx"
    doc.save(output_path)
    print(f"Successfully generated Word document at: {output_path}")

if __name__ == '__main__':
    build_document()
