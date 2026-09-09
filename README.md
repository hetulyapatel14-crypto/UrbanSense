# UrbanSense - Smart City Intelligence Platform

A complete, modern frontend web application for an AI-powered urban intelligence platform that uses public transport buses as mobile sensing units.

## 🚀 Features

- **Home Page** - Professional landing page with platform overview
- **Command Center** - Main dashboard with live map, KPIs, and real-time alerts
- **Live Fleet** - Fleet monitoring with bus details and camera status
- **Urban Map** - Interactive GIS map with multiple layers
- **Road Intelligence** - Road condition analytics and maintenance priorities
- **Traffic Analytics** - Traffic density, vehicle classification, congestion analysis
- **Incident Center** - Incident management and investigation
- **Incident Details** - Detailed incident investigation with evidence and timeline
- **Vehicle Tracking** - ANPR-based vehicle tracking with movement history
- **Reports & Insights** - AI-generated daily intelligence reports
- **System Architecture** - Visual architecture diagram and technical specs
- **Demo Mode** - Real-time simulation of live events

## 🛠️ Tech Stack

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Leaflet / OpenStreetMap** - Interactive maps
- **Recharts** - Data visualization
- **Lucide React** - Icons

## 📦 Installation

Install dependencies:

```bash
npm install
```

## 🚀 Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/         # Reusable components
├── pages/             # Page components
│   ├── Home.tsx
│   ├── CommandCenter.tsx
│   ├── LiveFleet.tsx
│   ├── UrbanMap.tsx
│   ├── RoadIntelligence.tsx
│   ├── TrafficAnalytics.tsx
│   ├── IncidentCenter.tsx
│   ├── IncidentDetails.tsx
│   ├── VehicleTracking.tsx
│   ├── Reports.tsx
│   ├── Architecture.tsx
│   └── About.tsx
├── layouts/           # Layout components
│   └── DashboardLayout.tsx
├── data/              # Mock data
│   ├── buses.ts
│   ├── incidents.ts
│   ├── alerts.ts
│   └── roadHazards.ts
├── types/             # TypeScript types
│   └── index.ts
└── App.tsx            # Main app component
```

## 🎨 Design System

### Colors

- **Deep Navy** - Primary background
- **Dark Blue** - Secondary background
- **Teal/Cyan** - Primary accent
- **Green** - Success/Normal status
- **Amber** - Warnings
- **Red** - Critical alerts

### Components

- Clean layout with strong spacing and visual hierarchy
- Professional government/smart city aesthetic
- Minimal use of gradients and glassmorphism
- Consistent borders and typography

## 🗺️ Key Pages

### Command Center
The main demo screen featuring:
- Live urban map with bus locations and incidents
- Real-time KPIs (active buses, detections, incidents)
- Live alerts panel with severity-based filtering
- Demo mode for real-time simulation

### Urban Map
Full-screen GIS interface with:
- Multiple map layers (buses, hazards, traffic, incidents)
- Interactive markers with detailed popups
- Legend and layer controls
- Map statistics overlay

### Incident Details
Comprehensive incident investigation screen with:
- Incident timeline
- Vehicle information (ANPR data)
- Evidence frames
- Location map
- Assigned team information

## 📊 Mock Data

The application uses realistic mock data for:
- 248 buses across multiple routes in Ahmedabad, Gujarat
- Road hazards (potholes, damage, waterlogging)
- Traffic incidents (hit-and-run, rash driving, congestion)
- ANPR detections with vehicle information
- Real-time alerts with confidence scores

## 🎯 Demo Mode

Enable Demo Mode in the Command Center to simulate:
- Real-time KPI updates
- New detections and incidents
- Live fleet status changes
- Dynamic chart updates

## 🚦 Key Features

### Edge AI Processing
- Local video processing on buses
- Only event data transmitted (95% bandwidth savings)
- Sub-second latency
- 94.6% average detection confidence

### Detection Capabilities
- Road hazard detection (potholes, damage, waterlogging)
- Traffic intelligence (vehicle classification, density)
- Infrastructure monitoring (signs, dividers, crossings)
- Pedestrian safety
- Incident detection (hit-and-run, rash driving)
- ANPR (Automatic Number Plate Recognition)

## 📱 Responsive Design

The application is optimized for:
- Desktop (primary)
- Tablet
- Mobile (responsive layouts)

## 🔧 Configuration

The application uses:
- Vite for fast builds and HMR
- Tailwind CSS for utility-first styling
- TypeScript for type safety
- ESLint for code quality

## 📄 License

This is a hackathon prototype for demonstration purposes.

## 👥 About

UrbanSense transforms public transport fleets into real-time urban sensing networks using Edge AI, computer vision, and geospatial intelligence.

---

Built with ❤️ for Smart Cities
