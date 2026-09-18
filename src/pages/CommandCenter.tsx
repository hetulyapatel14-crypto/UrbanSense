import { useState, useEffect, type CSSProperties } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import {
  TrendingUp,
  AlertCircle,
  ShieldAlert,
  Radar,
  Bus,
  Activity,
  ScanLine,
  AlertTriangle,
  Siren,
  Map as MapIcon
} from 'lucide-react'

import { buses as defaultBuses } from '../data/buses'
import { alerts as defaultAlerts } from '../data/alerts'
import { apiService } from '../services/api'
import { Link } from 'react-router-dom'
import HeaderActions from '../components/HeaderActions'
import { PageHeader } from '../components/common/PageHeader'
import { KpiCard } from '../components/common/KpiCard'
import { PremiumPanel } from '../components/common/PremiumPanel'
import { AnimatedCounter } from '../components/common/AnimatedCounter'
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
      <PageHeader
        title="Command Center"
        icon={Radar}
        live={{
          label: `${stats.activeBuses} Buses Sensing`,
          tone: 'emerald'
        }}
        subtitle="Real-time edge-AI telemetry and geospatial events across Ahmedabad"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDemoMode(!demoMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                demoMode
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${demoMode ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>{demoMode ? 'Demo Active' : 'Simulation'}</span>
            </button>

            <HeaderActions />
          </div>
        }
      />


      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <KpiCard
              label="Active Fleet"
              value={<AnimatedCounter value={stats.activeBuses} />}
              icon={Bus}
              accent="blue"
              hint="Buses en route"
              trend="Live"
              trendTone="positive"
              delay={0}
            />

            <KpiCard
              label="Online Sensors"
              value={<AnimatedCounter value={stats.onlineBuses} />}
              icon={Activity}
              accent="emerald"
              hint="95.2% operational"
              trend="+1.4%"
              trendTone="positive"
              delay={70}
            />

            <KpiCard
              label="AI Detections"
              value={<AnimatedCounter value={stats.detections.toLocaleString()} />}
              icon={ScanLine}
              accent="indigo"
              hint="Today's total events"
              trend="+8.2%"
              trendTone="positive"
              delay={140}
            />

            <KpiCard
              label="Open Incidents"
              value={<AnimatedCounter value={stats.incidents} />}
              icon={AlertTriangle}
              accent="amber"
              hint="Action required"
              trend="Monitoring"
              trendTone="warning"
              delay={210}
            />

            <KpiCard
              label="Critical Alerts"
              value={<AnimatedCounter value={stats.criticalAlerts} />}
              icon={Siren}
              accent="rose"
              hint="Urgent attention"
              trend="Escalated"
              trendTone="critical"
              delay={280}
            />
          </div>

          {/* Map and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <PremiumPanel
                flush
                title="Live Urban Geospatial Feed"
                subtitle="Bus telemetry, incident zones and hazard overlays"
                icon={MapIcon}
                badge={
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                    Interactive
                  </span>
                }
                actions={
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
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
                }
              >
                <div className="h-[550px] relative">
                  {/* Cinematic scan sweep over the live feed */}
                  <div className="scanline z-[450]" aria-hidden="true" />
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
              </PremiumPanel>
            </div>

            {/* Live Alerts */}
            <div>
              <PremiumPanel
                title="Live Urban Alerts"
                icon={ShieldAlert}
                badge={
                  <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 live-dot" />
                    {alerts.length} Active
                  </span>
                }
              >
                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-0.5">
                  {alerts.map((alert, alertIndex) => (
                    <div
                      key={alert.id}
                      style={{ '--i': alertIndex } as CSSProperties}
                      className={`stagger-item bg-white border rounded-xl p-3.5 transition-all duration-300 ease-silk shadow-sm hover:shadow-card hover:-translate-y-0.5 ${getSeverityBorder(alert.severity)}`}
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
              </PremiumPanel>
            </div>
          </div>

          {/* Recent Activity */}
          <PremiumPanel
            className="mt-6"
            title="Recent Event Stream"
            subtitle="Autonomous edge detections"
            icon={Activity}
            badge={
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot" />
                Streaming
              </span>
            }
          >
            <div className="relative">
              <div className="stagger-list space-y-3.5">
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
          </PremiumPanel>
        </div>
      </div>
    </DashboardLayout>
  )
}
