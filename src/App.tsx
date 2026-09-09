import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CommandCenter from './pages/CommandCenter'
import LiveFleet from './pages/LiveFleet'
import UrbanMap from './pages/UrbanMap'
import RoadIntelligence from './pages/RoadIntelligence'
import TrafficAnalytics from './pages/TrafficAnalytics'
import IncidentCenter from './pages/IncidentCenter'
import IncidentDetails from './pages/IncidentDetails'
import VehicleTracking from './pages/VehicleTracking'
import Reports from './pages/Reports'
import Architecture from './pages/Architecture'
import About from './pages/About'
import JourneyPlanner from './pages/JourneyPlanner'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/journey-planner" element={<JourneyPlanner />} />
        <Route path="/command-center" element={<CommandCenter />} />
        <Route path="/live-fleet" element={<LiveFleet />} />
        <Route path="/urban-map" element={<UrbanMap />} />
        <Route path="/road-intelligence" element={<RoadIntelligence />} />
        <Route path="/traffic-analytics" element={<TrafficAnalytics />} />
        <Route path="/incident-center" element={<IncidentCenter />} />
        <Route path="/incident/:id" element={<IncidentDetails />} />
        <Route path="/vehicle-tracking" element={<VehicleTracking />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/architecture" element={<Architecture />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  )
}

export default App
