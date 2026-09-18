import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Camera,
  Activity,
  Bus,
  MapPin,
  ExternalLink,
  ChevronRight,
  Radio,
  Gauge,
  Wifi
} from 'lucide-react'

import { MapContainer, Marker, Popup, Circle } from 'react-leaflet'
import { buses as defaultBuses } from '../data/buses'
import { apiService } from '../services/api'
import HeaderActions from '../components/HeaderActions'
import { PageHeader } from '../components/common/PageHeader'
import { KpiCard } from '../components/common/KpiCard'
import { PremiumPanel } from '../components/common/PremiumPanel'
import { AnimatedCounter } from '../components/common/AnimatedCounter'
import { ScrollReveal } from '../components/common/ScrollReveal'
import { TraccarGpsModal } from '../components/journey/TraccarGpsModal'
import { traccarApi, TraccarGpsPacket } from '../services/traccarApi'
import { MapTileLayer, MapViewToggle, type MapTileMode } from '../components/common/MapTileLayer'
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

export default function LiveFleet() {
  const [buses, setBuses] = useState(defaultBuses)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeLens, setActiveLens] = useState<'front' | 'rear' | 'left' | 'right' | 'passenger'>('front')
  const [showTraccarModal, setShowTraccarModal] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()
  const busQueryParam = searchParams.get('bus')

  const [mapMode, setMapMode] = useState<MapTileMode>('street')
  const [selectedBusId, setSelectedBusId] = useState<string>(busQueryParam || 'BUS-078')
  const detailsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    apiService.getBuses(statusFilter).then(data => {
      if (data && data.length > 0) setBuses(data)
    })

    // Listen to live Traccar SSE stream
    const unsubscribe = traccarApi.connectLiveStream(
      (packet: TraccarGpsPacket) => {
        setBuses(prev => prev.map(b => {
          if (b.id.toLowerCase() === packet.vehicle_id.toLowerCase()) {
            return {
              ...b,
              gps: [packet.latitude, packet.longitude],
              speed: packet.speed_kmh,
              location: packet.location_name || b.location,
              lastUpdate: 'Just now (Live)',
              status: 'online'
            }
          }
          return b
        }))
      }
    )

    return () => {
      unsubscribe()
    }
  }, [statusFilter])

  // Sync with URL query parameter
  useEffect(() => {
    if (busQueryParam) {
      setSelectedBusId(busQueryParam)
    }
  }, [busQueryParam])

  const filteredBuses = buses.filter(bus => {
    const matchesSearch = bus.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bus.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bus.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || bus.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Selected bus object
  const selectedBus = buses.find(b => b.id.toLowerCase() === selectedBusId.toLowerCase()) || buses[0] || defaultBuses[0]

  const handleSelectBus = (busId: string) => {
    setSelectedBusId(busId)
    setSearchParams({ bus: busId })
    // Smooth scroll down to details panel
    if (detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200'
      case 'offline':
        return 'text-rose-700 bg-rose-50 border border-rose-200'
      case 'processing':
        return 'text-blue-700 bg-blue-50 border border-blue-200'
      default:
        return 'text-slate-700 bg-slate-100 border border-slate-200'
    }
  }

  const selectedActiveCameras = Object.values(selectedBus.cameras || {}).filter(Boolean).length
  const selectedTotalCameras = Object.values(selectedBus.cameras || {}).length || 5

  return (
    <DashboardLayout>
      <PageHeader
        title="Live Fleet Monitoring"
        eyebrow="Fleet Telemetry"
        icon={Bus}
        live={{ label: 'Fleet Network Synchronized', tone: 'emerald' }}
        subtitle="Real-time status of 248 city buses acting as mobile optical sensors"
        actions={<HeaderActions />}
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Statistics */}
        <ScrollReveal direction="up" delay={0}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Total Fleet"
            value={<AnimatedCounter value={buses.length} />}
            icon={Bus}
            accent="blue"
            hint="Instrumented vehicles"
            trend="Registered"
            trendTone="neutral"
            delay={0}
          />

          <KpiCard
            label="Online & Active"
            value={<AnimatedCounter value={buses.filter(b => b.status === 'online').length} />}
            icon={Wifi}
            accent="emerald"
            hint="95.2% fleet uptime"
            trend="+2.1%"
            trendTone="positive"
            delay={70}
          />

          <KpiCard
            label="Standby / Offline"
            value={<AnimatedCounter value={buses.filter(b => b.status === 'offline').length} />}
            icon={XCircle}
            accent="rose"
            hint="Depot maintenance"
            trend="Attention"
            trendTone="warning"
            delay={140}
          />

          <KpiCard
            label="Edge AI Streams"
            value={<AnimatedCounter value={buses.filter(b => b.status === 'online').length * 5} />}
            icon={Gauge}
            accent="indigo"
            hint="Active video channels"
            trend="1080p"
            trendTone="neutral"
            delay={210}
          />
        </div>
        </ScrollReveal>

        {/* Selected Bus Banner Notice */}
        <ScrollReveal direction="up" delay={80}>
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 bg-[length:200%_auto] animate-gradient-x text-white rounded-2xl p-4 mb-6 shadow-md hover:shadow-glow-md transition-shadow duration-500 flex flex-wrap items-center justify-between gap-3">
          <span className="pointer-events-none absolute inset-0 bg-sheen opacity-25 animate-sheen" aria-hidden="true" />
          <div className="relative z-10 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center font-bold text-sm transition-transform duration-500 hover:scale-105">
              <Bus className="w-5 h-5 text-white/90" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/90">Active Sensor Telemetry:</span>
                <span className="text-base font-extrabold text-white">{selectedBus.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-white/20 text-white`}>
                  {selectedBus.status}
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5 font-medium">
                {selectedBus.route} • {selectedBus.location} • Speed: {selectedBus.speed} km/h • GPS: [{selectedBus.gps.join(', ')}]
              </p>
            </div>
          </div>

          <button
            onClick={() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="relative z-10 group flex items-center space-x-1.5 px-3.5 py-1.5 bg-white text-blue-700 rounded-xl text-xs font-extrabold hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer press-scale"
          >
            <span>Jump to Sensor Diagnostics</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        </div>
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal direction="up" delay={120}>
        <div className="panel-premium p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by bus ID or route number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="all">All Operational Statuses</option>
                <option value="online">Online Only</option>
                <option value="offline">Offline Only</option>
              </select>
            </div>
          </div>
        </div>
        </ScrollReveal>

        {/* Fleet Table */}
        <ScrollReveal direction="up" delay={160}>
        <PremiumPanel
          flush
          className="mb-8"
          title={`Fleet Sensing Nodes (${filteredBuses.length} Vehicles)`}
          subtitle="Select a Bus ID to inspect multi-angle camera feeds and edge diagnostics"
          icon={Bus}
          badge={
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot" />
              Streaming
            </span>
          }
        >
          <div className="overflow-x-auto">
            <table className="premium-table w-full text-left">
              <thead className="bg-slate-50/80 border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Bus ID</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Live Position</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Velocity</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Cameras</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Edge Inference</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Heartbeat</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredBuses.map(bus => {
                  const activeCameras = Object.values(bus.cameras || {}).filter(Boolean).length
                  const totalCameras = Object.values(bus.cameras || {}).length || 5
                  const isSelected = selectedBus.id === bus.id

                  return (
                    <tr
                      key={bus.id}
                      onClick={() => handleSelectBus(bus.id)}
                      className={`transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/90 font-medium ring-1 ring-inset ring-blue-400'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectBus(bus.id)
                          }}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                          }`}
                        >
                          <Bus className="w-4 h-4 shrink-0" />
                          <span className="font-extrabold">{bus.id}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-800">
                        {bus.route}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{bus.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                        {bus.speed} km/h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          activeCameras === totalCameras
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {activeCameras}/{totalCameras} Lenses
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          {bus.status === 'online' ? (
                            <Activity className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500" />
                          )}
                          <span className={bus.status === 'online' ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-medium'}>
                            {bus.aiStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs font-medium">
                        {bus.lastUpdate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase ${getStatusBadge(bus.status)}`}>
                          {bus.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectBus(bus.id)
                          }}
                          className={`text-xs font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-blue-700 hover:bg-slate-200/70 border border-slate-200'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Inspect'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </PremiumPanel>
        </ScrollReveal>

        {/* DYNAMIC BUS DETAILS PANEL (Ref for smooth scroll) */}
        <div
          ref={detailsRef}
          key={selectedBus.id}
          className="bg-white border-2 border-blue-400/60 rounded-2xl p-6 shadow-premium relative overflow-hidden animate-fade-in-up"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between pb-4 mb-5 border-b border-slate-200/80 gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80">
                <Bus className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Active Sensor Details: {selectedBus.id}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${getStatusBadge(selectedBus.status)}`}>
                    {selectedBus.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time mobile edge telemetry, multi-angle optical sensors, and geospatial telemetry
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to={`/urban-map`}
                className="flex items-center space-x-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <span>Track on Urban GIS Map</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">ASSIGNED ROUTE</div>
              <div className="text-lg font-extrabold text-slate-900">{selectedBus.route}</div>
              <div className="text-xs text-slate-500 mt-0.5">{selectedBus.location}</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">VEHICLE STATE</div>
              <div className={`text-lg font-extrabold uppercase ${
                selectedBus.status === 'online' ? 'text-emerald-600' :
                selectedBus.status === 'offline' ? 'text-rose-600' : 'text-blue-600'
              }`}>
                {selectedBus.status === 'online' ? 'IN TRANSIT (LIVE)' : selectedBus.status}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">AI Status: {selectedBus.aiStatus}</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">CRUISING SPEED</div>
              <div className="text-lg font-extrabold text-slate-900">{selectedBus.speed} km/h</div>
              <div className="text-xs text-slate-500 mt-0.5">Updated {selectedBus.lastUpdate}</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">GEO POSITION</div>
              <div className="text-sm font-extrabold font-mono text-slate-800 mt-1">
                {selectedBus.gps[0].toFixed(4)}° N, {selectedBus.gps[1].toFixed(4)}° E
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Ahmedabad Municipal Grid</div>
            </div>
          </div>

          {/* Sensors & Mini Map Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Hardware Sensors */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  HARDWARE SENSORS & CAMERAS ({selectedActiveCameras}/{selectedTotalCameras} ACTIVE)
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">
                  5-Channel Multi-Angle Rig
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  { key: 'front', name: 'Front Wide-Angle Perception Lens', active: selectedBus.cameras?.front ?? true, desc: 'Pothole detection, road obstructions & ANPR' },
                  { key: 'rear', name: 'Rear Lane & Tailgating Observer', active: selectedBus.cameras?.rear ?? true, desc: 'Traffic trailing density & rear vehicle tracking' },
                  { key: 'left', name: 'Left Curb & Sidewalk Scanner', active: selectedBus.cameras?.left ?? true, desc: 'Pedestrian zones & roadside waterlogging' },
                  { key: 'right', name: 'Right Overtaking Observer', active: selectedBus.cameras?.right ?? true, desc: 'Passing vehicle plate scan & lane deviation' },
                  { key: 'passenger', name: 'Cabin & Driver Safety Sensor', active: selectedBus.cameras?.passenger ?? true, desc: 'Driver alertness & telemetry check' },
                ].map((camera) => (
                  <div
                    key={camera.name}
                    className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                      activeLens === camera.key
                        ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300'
                        : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100/70'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{camera.name}</div>
                      <div className="text-[11px] text-slate-500">{camera.desc}</div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      {camera.active ? (
                        <span className="flex items-center text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-bold">
                          <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Streaming
                        </span>
                      ) : (
                        <span className="flex items-center text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-xs font-bold">
                          <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                          Standby
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveLens(camera.key as any)}
                        className={`text-xs font-bold px-2 py-1 rounded transition-colors cursor-pointer ${
                          activeLens === camera.key
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        View Feed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live GPS Mini Map */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  LIVE SENSOR LOCATION ON AHMEDABAD MAP
                </h3>
                <div className="flex items-center gap-2">
                  <MapViewToggle mode={mapMode} onChange={setMapMode} />
                  <span className="text-xs font-bold text-blue-600 font-mono hidden sm:inline">
                    {selectedBus.gps.join(', ')}
                  </span>
                </div>
              </div>

              <div className="h-64 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative">
                <MapContainer
                  center={selectedBus.gps}
                  zoom={14}
                  style={{ height: '100%', width: '100%' }}
                  key={`${selectedBus.id}-${selectedBus.gps.join('-')}`}
                >
                  <MapTileLayer mode={mapMode} />
                  <Circle
                    center={selectedBus.gps}
                    radius={350}
                    pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.2 }}
                  />
                  <Marker position={selectedBus.gps}>
                    <Popup>
                      <div className="p-1 text-xs">
                        <div className="font-extrabold text-blue-600">{selectedBus.id}</div>
                        <div>{selectedBus.route}</div>
                        <div>{selectedBus.location}</div>
                        <div className="font-bold text-slate-700 mt-1">{selectedBus.speed} km/h • {selectedBus.status}</div>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              <div className="mt-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-slate-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot" />
                  <Radio className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Transmitting real-time NMEA GPS coordinate packets</span>
                </div>
                <span className="font-bold text-slate-800">{selectedBus.lastUpdate}</span>
              </div>
            </div>
          </div>

          {/* Primary Vision Inference Stream */}
          <div className="pt-6 border-t border-slate-200/80">
            <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  OPTICAL INFERENCE STREAM • {selectedBus.id} ({activeLens.toUpperCase()} LENS)
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border ${
                  selectedBus.status === 'online'
                    ? 'text-rose-600 bg-rose-50 border-rose-200'
                    : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedBus.status === 'online' ? 'bg-rose-600 animate-pulse' : 'bg-amber-600'}`}></span>
                  {selectedBus.status === 'online' ? 'LIVE 1080p AT 30 FPS' : 'DIAGNOSTIC STANDBY FEED'}
                </span>
              </div>
            </div>

            {/* Video Canvas Simulation */}
            <div className="bg-slate-950 rounded-2xl aspect-video max-h-[380px] w-full flex items-center justify-center relative overflow-hidden shadow-2xl border border-slate-800">
              <Camera className="w-16 h-16 text-slate-700 opacity-40 animate-float-slow" />
              {/* Inference scan sweep */}
              <div className="scanline" aria-hidden="true" />

              {/* Lens info overlay */}
              <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono text-white flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>BUS: {selectedBus.id}</span>
                <span className="text-slate-400">|</span>
                <span className="text-cyan-300">LENS: {activeLens.toUpperCase()}</span>
                <span className="text-slate-400">|</span>
                <span className="text-amber-300">{selectedBus.speed} KM/H</span>
              </div>

              {/* Dynamic simulated detections */}
              {selectedBus.status === 'online' ? (
                <>
                  <div className="absolute top-16 left-20 border-2 border-cyan-400 bg-cyan-950/70 backdrop-blur-xs px-2.5 py-1 rounded text-xs font-mono shadow-md animate-pulse">
                    <span className="text-cyan-300 font-bold">VEHICLE #84 • 94% CONF</span>
                  </div>
                  <div className="absolute bottom-24 right-36 border-2 border-emerald-400 bg-emerald-950/70 backdrop-blur-xs px-2.5 py-1 rounded text-xs font-mono shadow-md animate-bob">
                    <span className="text-emerald-300 font-bold">PEDESTRIAN • 96% CONF</span>
                  </div>
                  <div className="absolute bottom-12 left-32 border-2 border-rose-400 bg-rose-950/70 backdrop-blur-xs px-2.5 py-1 rounded text-xs font-mono shadow-md animate-bob" style={{ animationDelay: '600ms' }}>
                    <span className="text-rose-300 font-bold">ROAD HAZARD • 91% CONF</span>
                  </div>
                  <div className="absolute top-20 right-20 border border-indigo-400/80 bg-indigo-950/80 px-2.5 py-1 rounded text-xs font-mono text-indigo-300">
                    ANPR SCAN: ACTIVE
                  </div>
                </>
              ) : (
                <div className="text-center p-6 bg-slate-900/80 rounded-xl border border-slate-800 backdrop-blur-sm">
                  <div className="text-amber-400 font-bold text-sm mb-1">Optical Rig in Depot Standby</div>
                  <div className="text-xs text-slate-400">Vehicle currently resting at depot bay. Sensors awaiting route dispatch.</div>
                </div>
              )}

              {/* Timestamp overlay */}
              <div className="absolute bottom-3 right-4 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                EDGE FRAME: #{Math.floor(Math.random() * 8000 + 12000)} • 1080p RGB • YOLOv8
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Traccar Phone & Live GPS Controller Modal */}
      <TraccarGpsModal
        isOpen={showTraccarModal}
        onClose={() => setShowTraccarModal(false)}
      />
    </DashboardLayout>
  )
}
