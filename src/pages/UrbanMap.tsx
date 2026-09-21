import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { MapContainer, Popup, Circle } from 'react-leaflet'
import { buses as defaultBuses } from '../data/buses'
import { alerts as defaultAlerts } from '../data/alerts'
import { roadHazards as defaultHazards } from '../data/roadHazards'
import { apiService } from '../services/api'
import { Layers, Info, Map as MapIcon, Globe, ChevronDown, ChevronUp, Compass } from 'lucide-react'
import HeaderActions from '../components/HeaderActions'
import { PageHeader } from '../components/common/PageHeader'
import { AnimatedCounter } from '../components/common/AnimatedCounter'
import { MapTileLayer, type MapTileMode } from '../components/common/MapTileLayer'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MovingVehicleMarker } from '../components/journey/MovingVehicleMarker'
import { TraccarGpsModal } from '../components/journey/TraccarGpsModal'
import { traccarApi, TraccarGpsPacket } from '../services/traccarApi'
import { LiveVehicle } from '../types/transit'

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

export default function UrbanMap() {
  const [alerts, setAlerts] = useState(defaultAlerts)
  const [roadHazards, setRoadHazards] = useState(defaultHazards)
  const [mapMode, setMapMode] = useState<MapTileMode>('street')
  const [telemetryCollapsed, setTelemetryCollapsed] = useState(false)
  const [isTraccarModalOpen, setIsTraccarModalOpen] = useState(false)
  const [liveVehiclesMap, setLiveVehiclesMap] = useState<Record<string, LiveVehicle>>(() => {
    const initialMap: Record<string, LiveVehicle> = {}
    defaultBuses.forEach((b: any) => {
      initialMap[b.id] = {
        vehicle_id: b.id,
        registration: b.id,
        mode: 'BUS',
        is_electric: b.id.includes('EB') || b.id.includes('EV'),
        battery_soc_pct: 85,
        agency_code: 'AMTS',
        agency_name: 'Ahmedabad Transport',
        route_number: b.route || 'AMTS-101',
        route_name: b.location || 'Ahmedabad Corridor',
        latitude: b.gps[0],
        longitude: b.gps[1],
        speed_kmh: b.speed || 30,
        heading: 0,
        current_location_name: b.location,
        status: 'ON_TIME',
        telemetry_type: 'REAL_TIME',
        data_source: 'TRACCAR_GPS',
      }
    })
    return initialMap
  })

  useEffect(() => {
    apiService.getBuses('online').then(data => {
      if (data && data.length > 0) {
        setLiveVehiclesMap(prev => {
          const next = { ...prev }
          data.forEach((b: any) => {
            next[b.id] = {
              vehicle_id: b.id,
              registration: b.id,
              mode: 'BUS',
              is_electric: b.id.includes('EB') || b.id.includes('EV'),
              battery_soc_pct: 85,
              agency_code: 'AMTS',
              agency_name: 'Ahmedabad Transport',
              route_number: b.route || 'AMTS-101',
              route_name: b.location || 'Ahmedabad Corridor',
              latitude: b.gps[0],
              longitude: b.gps[1],
              speed_kmh: b.speed || 30,
              heading: 0,
              current_location_name: b.location,
              status: 'ON_TIME',
              telemetry_type: 'REAL_TIME',
              data_source: 'TRACCAR_GPS',
            }
          })
          return next
        })
      }
    })
    apiService.getLiveAlerts().then(data => {
      if (data && data.length > 0) setAlerts(data)
    })
    apiService.getRoadHazards().then(data => {
      if (data && data.length > 0) setRoadHazards(data)
    })

    // Connect to live road-snapped stream
    const unsubscribe = traccarApi.connectLiveStream(
      (packet: TraccarGpsPacket) => {
        setLiveVehiclesMap(prev => ({
          ...prev,
          [packet.vehicle_id]: {
            vehicle_id: packet.vehicle_id,
            registration: packet.registration || packet.vehicle_id,
            mode: (packet.mode as any) || prev[packet.vehicle_id]?.mode || 'BUS',
            is_electric: packet.is_electric ?? prev[packet.vehicle_id]?.is_electric,
            battery_soc_pct: packet.battery_soc_pct ?? prev[packet.vehicle_id]?.battery_soc_pct,
            agency_code: prev[packet.vehicle_id]?.agency_code || 'AMTS',
            agency_name: packet.operator || prev[packet.vehicle_id]?.agency_name || 'Ahmedabad Transport',
            route_number: packet.route_number || prev[packet.vehicle_id]?.route_number || 'Route 18',
            route_name: packet.route_name || prev[packet.vehicle_id]?.route_name || 'Transit Corridor',
            route_color: packet.route_color || prev[packet.vehicle_id]?.route_color || '#2563EB',
            latitude: packet.latitude,
            longitude: packet.longitude,
            speed_kmh: packet.speed_kmh,
            heading: packet.heading,
            current_location_name: packet.location_name || prev[packet.vehicle_id]?.current_location_name || 'Transit Corridor',
            next_stop_name: packet.next_stop_name || prev[packet.vehicle_id]?.next_stop_name,
            next_stop_id: packet.next_stop_id !== undefined ? String(packet.next_stop_id) : prev[packet.vehicle_id]?.next_stop_id,
            status: 'ON_TIME',
            telemetry_type: 'REAL_TIME',
            data_source: packet.data_source || 'ROAD_SNAPPED_TELEMETRY',
          }
        }))
      },
      (initialVehicles) => {
        if (initialVehicles && initialVehicles.length > 0) {
          setLiveVehiclesMap(prev => {
            const next = { ...prev }
            initialVehicles.forEach(v => {
              next[v.vehicle_id] = { ...v, ...(next[v.vehicle_id] || {}) }
            })
            return next
          })
        }
      }
    )

    return () => {
      unsubscribe()
    }
  }, [])

  const [layers, setLayers] = useState({
    buses: true,
    hazards: true,
    traffic: true,
    waterlogging: true,
    infrastructure: true,
    incidents: true,
    schoolZones: true,
  })

  const toggleLayer = (layer: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }))
  }

  const liveVehicleArray = Object.values(liveVehiclesMap)

  return (
    <DashboardLayout>
      <PageHeader
        title="Urban GIS Map"
        eyebrow="Geospatial"
        icon={Compass}
        live={{
          label: mapMode === 'satellite' ? 'High-Resolution Satellite View' : 'Live OpenStreetMap Grid',
          tone: mapMode === 'satellite' ? 'blue' : 'emerald'
        }}
        subtitle="High-resolution geospatial layers fed continuously by public transport units"
        actions={<HeaderActions />}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Filter Panel */}
        <div className="w-72 bg-white/70 backdrop-blur-xl border-r border-white/70 p-5 flex flex-col justify-between shadow-clay-card z-10 overflow-y-auto">
          <div>
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
              <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </span>
              <h2 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Geospatial Layers</h2>
            </div>

            <div className="stagger-list space-y-1.5">
              {Object.entries(layers).map(([key, value]) => (
                <label key={key} className="group/layer flex items-center space-x-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200/60 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-300 ease-silk">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => toggleLayer(key as keyof typeof layers)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer transition-transform duration-300 group-hover/layer:scale-110"
                  />
                  <span className="text-xs font-semibold text-slate-700 capitalize group-hover/layer:text-blue-700 transition-colors">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200/80">
              <h3 className="font-extrabold text-slate-900 text-xs mb-3 uppercase tracking-wider">Map Legend</h3>
              <div className="stagger-list space-y-2.5 text-xs font-medium">
                <div className="flex items-center space-x-2.5 hover:translate-x-0.5 transition-transform duration-300">
                  <div className="w-3 h-3 bg-emerald-600 rounded-full ring-2 ring-emerald-100 live-dot"></div>
                  <span className="text-slate-700 font-bold">⚡ Electric Bus (Live)</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 bg-blue-600 rounded-full ring-2 ring-blue-100"></div>
                  <span className="text-slate-700">Active Bus Transponder</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 bg-rose-500 rounded-full ring-2 ring-rose-100"></div>
                  <span className="text-slate-700">Critical Road Alert</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 bg-amber-500 rounded-full ring-2 ring-amber-100"></div>
                  <span className="text-slate-700">High Priority Hazard</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full ring-2 ring-cyan-100"></div>
                  <span className="text-slate-700">Medium Traffic Density</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Click any marker to inspect telemetry</span>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-slate-200/60">
          {/* Cinematic scan sweep across the live map */}
          <div className="scanline z-[400]" aria-hidden="true" />
          {/* SATELLITE & STREET VIEW MODE SWITCHER (Top-Right Floating Control) */}
          <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md p-1 rounded-2xl shadow-xl border border-slate-200/80 flex items-center space-x-1">              <button
                type="button"
                onClick={() => setMapMode('street')}
                className={`press-scale flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                mapMode === 'street'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Street View</span>
            </button>              <button
                type="button"
                onClick={() => setMapMode('satellite')}
                className={`press-scale flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                mapMode === 'satellite'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Satellite View</span>
            </button>
          </div>

          <MapContainer
            center={[23.1000, 72.6000]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            {/* Tile Layer: Street vs Satellite */}
            <MapTileLayer mode={mapMode} />

            {/* Smooth Moving Buses on Map */}
            {layers.buses && liveVehicleArray.map(v => (
              <MovingVehicleMarker
                key={v.vehicle_id}
                vehicle={v}
              />
            ))}

            {/* Road Hazards */}
            {layers.hazards && roadHazards.map(hazard => (
              <Circle
                key={hazard.id}
                center={hazard.gps}
                radius={150}
                pathOptions={{
                  color: hazard.severity === 'critical' ? '#ef4444' : hazard.severity === 'high' ? '#f59e0b' : '#0284c7',
                  fillColor: hazard.severity === 'critical' ? '#ef4444' : hazard.severity === 'high' ? '#f59e0b' : '#0284c7',
                  fillOpacity: 0.35,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="text-slate-900 font-sans min-w-[200px] p-1">
                    <div className="font-extrabold text-base mb-2 text-rose-700">{hazard.type}</div>
                    <div className="space-y-1 text-xs">
                      <div><strong className="text-slate-600">Location:</strong> {hazard.location}</div>
                      <div><strong className="text-slate-600">Severity:</strong> <span className="uppercase font-bold text-rose-600">{hazard.severity}</span></div>
                      <div><strong className="text-slate-600">Detected By:</strong> {hazard.busId}</div>
                      <div><strong className="text-slate-600">Confidence:</strong> {hazard.confidence}%</div>
                      <div><strong className="text-slate-600">Status:</strong> {hazard.status}</div>
                      <div className="text-[11px] text-slate-400 mt-2 font-mono">{hazard.timestamp}</div>
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}

            {/* Incidents */}
            {layers.incidents && alerts.map(alert => (
              <Circle
                key={alert.id}
                center={alert.gps}
                radius={200}
                pathOptions={{
                  color: alert.severity === 'critical' ? '#dc2626' : alert.severity === 'high' ? '#d97706' : '#2563eb',
                  fillColor: alert.severity === 'critical' ? '#dc2626' : alert.severity === 'high' ? '#d97706' : '#2563eb',
                  fillOpacity: 0.25,
                  dashArray: '8, 8',
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="text-slate-900 font-sans p-1">
                    <div className="font-extrabold text-base mb-2">{alert.type}</div>
                    <div className="space-y-1 text-xs">
                      <div><strong className="text-slate-600">Location:</strong> {alert.location}</div>
                      <div><strong className="text-slate-600">Bus:</strong> {alert.busId}</div>
                      <div><strong className="text-slate-600">Confidence:</strong> {alert.confidence}%</div>
                      <div className="text-[11px] text-slate-400 mt-2 font-mono">{alert.timestamp}</div>
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}
          </MapContainer>

          {/* MAP SUMMARY TELEMETRY - SLEEK BORDERLESS FLOATING GLASS HUD */}
          <div className="absolute bottom-6 left-6 z-[1000] min-w-[280px] max-w-[340px]">
            <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-5 shadow-premium border border-white/70 transition-all duration-500 hover:shadow-glow-md">
              {/* Header with status pulse & minimize button */}
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 live-dot"></span>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                    Live Map Telemetry
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50/90 px-2 py-0.5 rounded-full">
                    Ahmedabad • Gandhinagar
                  </span>
                  <button
                    type="button"
                    onClick={() => setTelemetryCollapsed(!telemetryCollapsed)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-colors cursor-pointer"
                    title={telemetryCollapsed ? 'Expand Telemetry' : 'Minimize Telemetry'}
                  >
                    {telemetryCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 4 Clean Stats */}
              {!telemetryCollapsed && (
                <div className="stagger-list grid grid-cols-2 gap-x-6 gap-y-3 pt-1">
                  <div className="hover:translate-y-[-2px] transition-transform duration-300">
                    <div className="text-[11px] font-medium text-slate-500">Active Live Units</div>
                    <div className="text-2xl font-black text-blue-600 tracking-tight mt-0.5 tabular-nums">
                      <AnimatedCounter value={liveVehicleArray.length} />
                    </div>
                    <div className="text-[10px] text-slate-400">Live Telemetry stream</div>
                  </div>

                  <div className="hover:translate-y-[-2px] transition-transform duration-300">
                    <div className="text-[11px] font-medium text-slate-500">Road Hazards</div>
                    <div className="text-2xl font-black text-amber-600 tracking-tight mt-0.5 tabular-nums">
                      <AnimatedCounter value={roadHazards.length} />
                    </div>
                    <div className="text-[10px] text-slate-400">Potholes & flaws</div>
                  </div>

                  <div className="hover:translate-y-[-2px] transition-transform duration-300">
                    <div className="text-[11px] font-medium text-slate-500">Live Incidents</div>
                    <div className="text-2xl font-black text-rose-600 tracking-tight mt-0.5 tabular-nums">
                      <AnimatedCounter value={alerts.length} />
                    </div>
                    <div className="text-[10px] text-slate-400">Active events</div>
                  </div>

                  <div className="hover:translate-y-[-2px] transition-transform duration-300">
                    <div className="text-[11px] font-medium text-slate-500">Coverage Area</div>
                    <div className="text-2xl font-black text-emerald-600 tracking-tight mt-0.5 tabular-nums">
                      <AnimatedCounter value={340} /> <span className="text-sm font-bold">km²</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Twin cities sweep</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Traccar Phone & GPS Modal */}
      <TraccarGpsModal
        isOpen={isTraccarModalOpen}
        onClose={() => setIsTraccarModalOpen(false)}
      />
    </DashboardLayout>
  )
}
