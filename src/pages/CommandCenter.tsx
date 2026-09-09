import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { TrendingUp, AlertCircle, ShieldAlert } from 'lucide-react'

import { buses as defaultBuses } from '../data/buses'
import { alerts as defaultAlerts } from '../data/alerts'
import { apiService } from '../services/api'
import { Link } from 'react-router-dom'
import HeaderActions from '../components/HeaderActions'
import 'leaflet/dist/leaflet.css'

import L from 'leaflet'

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
})

export default function CommandCenter() {
  const [demoMode, setDemoMode] = useState(false)
  const [buses, setBuses] = useState(defaultBuses)
  const [alerts, setAlerts] = useState(defaultAlerts)
  const [stats, setStats] = useState({
    activeBuses: 248,
    onlineBuses: 236,
    detections: 12846,
    incidents: 18,
    criticalAlerts: 4,
  })

  // Fetch live stats and alerts from Django backend
  useEffect(() => {
    apiService.getDashboardSummary().then(data => {
      setStats(prev => ({ ...prev, ...data }))
    })
    apiService.getLiveAlerts().then(data => {
      if (data && data.length > 0) setAlerts(data)
    })
    apiService.getBuses('online').then(data => {
      if (data && data.length > 0) setBuses(data)
    })
  }, [])

  useEffect(() => {
    if (!demoMode) {
      apiService.stopDemoMode()
      return
    }

    apiService.startDemoMode()

    const interval = setInterval(() => {
      // Pull fresh data from backend
      apiService.getDashboardSummary().then(data => {
        setStats(prev => ({ ...prev, ...data }))
      })
      apiService.getLiveAlerts().then(data => {
        if (data && data.length > 0) setAlerts(data)
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [demoMode])

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-rose-700 bg-rose-50 border-rose-200'
      case 'high':
        return 'text-amber-800 bg-amber-50 border-amber-200'
      case 'medium':
        return 'text-blue-700 bg-blue-50 border-blue-200'
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200'
    }
  }

  const getSeverityBorder = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'hover:border-rose-400 border-slate-200'
      case 'high':
        return 'hover:border-amber-400 border-slate-200'
      case 'medium':
        return 'hover:border-blue-400 border-slate-200'
      default:
        return 'hover:border-slate-300 border-slate-200'
    }
  }

  return (
    <DashboardLayout>
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200/90 px-6 py-4 shadow-sm sticky top-0 z-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              City Intelligence Command Center
            </h1>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider">
                System Active • 248 Buses Sensing
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDemoMode(!demoMode)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                demoMode
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${demoMode ? 'bg-white animate-ping' : 'bg-slate-400'}`}></span>
              <span>{demoMode ? 'Demo Simulation Live' : 'Enable Demo Simulation'}</span>
            </button>

            <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              {new Date().toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </div>

            <HeaderActions />
          </div>
        </div>
      </header>


      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="p-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="stat-card">
              <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">ACTIVE FLEET</div>
              <div className="text-3xl font-extrabold text-blue-600">{stats.activeBuses}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">Buses en route</div>
            </div>

            <div className="stat-card">
              <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">ONLINE SENSORS</div>
              <div className="text-3xl font-extrabold text-emerald-600">{stats.onlineBuses}</div>
              <div className="text-xs text-emerald-700 mt-1 font-semibold">95.2% operational</div>
            </div>

            <div className="stat-card">
              <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">AI DETECTIONS</div>
              <div className="text-3xl font-extrabold text-indigo-600">{stats.detections.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">Today's total events</div>
            </div>

            <div className="stat-card">
              <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">OPEN INCIDENTS</div>
              <div className="text-3xl font-extrabold text-amber-600">{stats.incidents}</div>
              <div className="text-xs text-amber-700 mt-1 font-semibold">Action required</div>
            </div>

            <div className="stat-card">
              <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">CRITICAL ALERTS</div>
              <div className="text-3xl font-extrabold text-rose-600">{stats.criticalAlerts}</div>
              <div className="text-xs text-rose-700 mt-1 font-semibold">Urgent attention</div>
            </div>
          </div>

          {/* Map and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-card">
                <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <h2 className="font-bold text-slate-900 text-sm tracking-tight uppercase">Live Urban Geospatial Feed</h2>
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Interactive
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-semibold text-slate-600">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                      <span>Buses</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                      <span>Incidents</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                      <span>Hazards</span>
                    </label>
                  </div>
                </div>

                <div className="h-[550px] relative">
                  <MapContainer
                    center={[23.0300, 72.5700]}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />

                    {/* Buses */}
                    {buses.filter(b => b.status === 'online').map(bus => (
                      <Marker key={bus.id} position={bus.gps}>
                        <Popup>
                          <div className="text-slate-900 font-sans p-1">
                            <div className="font-extrabold text-base text-blue-700">{bus.id}</div>
                            <div className="text-xs text-slate-600 mt-1 font-semibold">Route: {bus.route}</div>
                            <div className="text-xs text-slate-600">{bus.location}</div>
                            <div className="text-xs font-bold text-slate-800 mt-1">{bus.speed} km/h</div>
                            <Link to="/live-fleet" className="text-blue-600 hover:text-blue-800 text-xs font-bold mt-2 block">
                              View Fleet Telemetry →
                            </Link>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {/* Alert zones */}
                    {alerts.map(alert => (
                      <Circle
                        key={alert.id}
                        center={alert.gps}
                        radius={200}
                        pathOptions={{
                          color: alert.severity === 'critical' ? '#ef4444' : alert.severity === 'high' ? '#f59e0b' : '#3b82f6',
                          fillColor: alert.severity === 'critical' ? '#ef4444' : alert.severity === 'high' ? '#f59e0b' : '#3b82f6',
                          fillOpacity: 0.25,
                          weight: 2,
                        }}
                      >
                        <Popup>
                          <div className="text-slate-900 font-sans p-1">
                            <div className="font-extrabold text-sm">{alert.type}</div>
                            <div className="text-xs text-slate-600 mt-0.5">{alert.location}</div>
                            <div className="text-xs font-bold text-blue-600 mt-1">Confidence: {alert.confidence}%</div>
                            <Link to={`/incident/${alert.id}`} className="text-xs font-bold text-blue-600 hover:underline mt-1 block">
                              Investigate Incident →
                            </Link>
                          </div>
                        </Popup>
                      </Circle>
                    ))}
                  </MapContainer>
                </div>
              </div>
            </div>

            {/* Live Alerts */}
            <div>
              <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-card">
                <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/60 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-slate-700" />
                    <h2 className="font-bold text-slate-900 text-sm tracking-tight uppercase">Live Urban Alerts</h2>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {alerts.length} Active
                  </span>
                </div>

                <div className="p-4 space-y-3 max-h-[550px] overflow-y-auto">
                  {alerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`bg-white border rounded-xl p-3.5 transition-all shadow-sm hover:shadow ${getSeverityBorder(alert.severity)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getSeverityBadge(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs font-medium text-slate-400">{alert.timestamp}</span>
                      </div>

                      <div className="font-bold text-slate-900 text-sm mb-2">{alert.type}</div>

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Location:</span>
                          <span className="font-semibold text-slate-800">{alert.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Sensed By:</span>
                          <span className="font-semibold text-slate-800">{alert.busId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Confidence:</span>
                          <span className="font-semibold text-emerald-600">{alert.confidence}%</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-end">
                        <Link
                          to={`/incident/${alert.id}`}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-6 bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-card">
            <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/60 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm tracking-tight uppercase">Recent Event Stream</h2>
              <span className="text-xs font-semibold text-slate-500">Autonomous Edge Detections</span>
            </div>
            <div className="p-5">
              <div className="space-y-3.5">
                <div className="flex flex-wrap items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs sm:text-sm">
                  <div className="flex items-center space-x-3">
                    <span className="p-1.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
                      <AlertCircle className="w-4 h-4" />
                    </span>
                    <span className="font-semibold text-slate-400">14:32:18</span>
                    <span className="font-medium text-slate-800">Hit-and-run detected on SG Highway by BUS-104</span>
                  </div>
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-xs">96.4% confidence</span>
                </div>

                <div className="flex flex-wrap items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs sm:text-sm">
                  <div className="flex items-center space-x-3">
                    <span className="p-1.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
                      <AlertCircle className="w-4 h-4" />
                    </span>
                    <span className="font-semibold text-slate-400">14:20:45</span>
                    <span className="font-medium text-slate-800">Heavy congestion detected on Ashram Road</span>
                  </div>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs">91% confidence</span>
                </div>

                <div className="flex flex-wrap items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs sm:text-sm">
                  <div className="flex items-center space-x-3">
                    <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">
                      <TrendingUp className="w-4 h-4" />
                    </span>
                    <span className="font-semibold text-slate-400">14:15:22</span>
                    <span className="font-medium text-slate-800">BUS-234 came online on Route 33 (5 cameras active)</span>
                  </div>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs">Online</span>
                </div>

                <div className="flex flex-wrap items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs sm:text-sm">
                  <div className="flex items-center space-x-3">
                    <span className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
                      <AlertCircle className="w-4 h-4" />
                    </span>
                    <span className="font-semibold text-slate-400">14:10:10</span>
                    <span className="font-medium text-slate-800">Pothole detected on Ring Road by BUS-121</span>
                  </div>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">94% confidence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
