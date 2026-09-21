import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { Search, Camera, AlertCircle, Car, Route, ScanLine, Clock, Layers } from 'lucide-react'
import { MapContainer, Polyline, Marker, Circle } from 'react-leaflet'
import { apiService } from '../services/api'
import HeaderActions from '../components/HeaderActions'
import { PageHeader } from '../components/common/PageHeader'
import { PremiumPanel } from '../components/common/PremiumPanel'
import { StatusBadge } from '../components/common/StatusBadge'
import { MapTileLayer, MapViewToggle, type MapTileMode } from '../components/common/MapTileLayer'
import { eventIcon } from '../components/common/mapIcons'
import { Link } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

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

const defaultDetections = [
  { id: 1, busId: 'BUS-104', location: 'SG Highway', timestamp: '14:32:18', direction: 'Northbound', confidence: 96.4, gps: [23.0395, 72.5667] as [number, number] },
  { id: 2, busId: 'BUS-087', location: 'Ashram Road', timestamp: '14:28:45', direction: 'Southbound', confidence: 94.2, gps: [23.0225, 72.5714] as [number, number] },
  { id: 3, busId: 'BUS-121', location: 'Ring Road', timestamp: '14:25:12', direction: 'Eastbound', confidence: 92.8, gps: [23.03, 72.58] as [number, number] },
  { id: 4, busId: 'BUS-156', location: 'CG Road', timestamp: '14:20:33', direction: 'Westbound', confidence: 89.5, gps: [23.035, 72.555] as [number, number] },
]

export default function VehicleTracking() {
  const [mapMode, setMapMode] = useState<MapTileMode>('street')
  const [searchQuery, setSearchQuery] = useState('GJ 01 XX 4821')
  const [vehicleDetections, setVehicleDetections] = useState(defaultDetections)
  const [vehiclePath, setVehiclePath] = useState<[number, number][]>([
    [23.0395, 72.5667],
    [23.035, 72.565],
    [23.03, 72.563],
    [23.0225, 72.5714],
  ])

  const handleSearch = () => {
    if (!searchQuery) return
    apiService.searchVehicle(searchQuery).then(res => {
      if (res && res.route && res.route.length > 0) {
        setVehiclePath(res.route)
      }
      if (res && res.sightings && res.sightings.length > 0) {
        setVehicleDetections(
          res.sightings.map((s: any) => ({
            id: s.id,
            busId: s.bus_id || 'BUS-104',
            location: s.location,
            timestamp: s.timestamp.substring(11, 19),
            direction: s.direction,
            confidence: s.confidence * 100,
            gps: s.gps,
          }))
        )
      }
    })
  }

  useEffect(() => {
    handleSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const meanConfidence = (
    vehicleDetections.reduce((sum, d) => sum + d.confidence, 0) / Math.max(vehicleDetections.length, 1)
  ).toFixed(1)

  return (
    <DashboardLayout>
      <PageHeader
        title="Vehicle Tracking"
        eyebrow="Optical enforcement · ANPR correlation"
        icon={ScanLine}
        live={{ label: 'Cross-fleet correlation active', tone: 'blue' }}
        subtitle="Number plate recognition and movement reconstruction across the sensing fleet"
        actions={<HeaderActions />}
      >
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              placeholder="Registration plate (e.g. GJ 01 XX 4821)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSearch()
              }}
              className="u-search u-num uppercase"
              aria-label="Search vehicle registration"
            />
          </div>
          <button onClick={handleSearch} className="u-btn u-btn-primary u-btn-sm">
            <Search className="h-3.5 w-3.5" />
            Search fleet detections
          </button>
        </div>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* ── Identified target ────────────────────────────────────── */}
          <div className="space-y-4">
            <section className="u-panel overflow-hidden">
              <span className="u-hair" aria-hidden="true" />

              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-4 sm:p-5">
                <div>
                  <p className="u-overline">Identified target</p>
                  <p className="u-num mt-2 text-[24px] font-semibold tracking-[0.06em] text-ink sm:text-[28px]">
                    {searchQuery || 'No plate selected'}
                  </p>
                  <p className="mt-1.5 text-[12px] text-ink-muted">
                    Correlated across {vehicleDetections.length} fleet sightings · mean confidence {meanConfidence}%
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status="Flagged for investigation" tone="rose" />
                  <Link to="/incident/INC-1042" className="u-btn u-btn-outline u-btn-sm">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Linked case
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-line/70 sm:grid-cols-4 sm:divide-x">
                {[
                  { icon: Car, k: 'Registration', v: searchQuery || '—' },
                  { icon: Car, k: 'Vehicle type', v: 'White sedan' },
                  { icon: Layers, k: 'Optical colour', v: 'White pearl' },
                  { icon: Clock, k: 'Sightings', v: `${vehicleDetections.length} sightings` },
                ].map(item => (
                  <div key={item.k} className="px-4 py-3.5">
                    <p className="u-overline flex items-center gap-1.5">
                      <item.icon className="h-3 w-3" />
                      {item.k}
                    </p>
                    <p className="u-num mt-1.5 truncate text-[13px] font-medium text-ink">{item.v}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-3 border-t border-line/70 bg-rose-50/60 px-4 py-3.5 sm:px-5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <div>
                  <p className="text-[12.5px] font-medium text-ink">Associated incident escalation</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-secondary">
                    This vehicle matches case <span className="u-num font-medium text-rose-600">INC-1042</span> — a
                    hit-and-run detected on SG Highway. Subsequent sightings are reported to traffic control
                    automatically.
                  </p>
                </div>
              </div>
            </section>

            {/* Timeline */}
            <PremiumPanel
              flush
              title="Detection timeline"
              subtitle="Cross-fleet ANPR correlation of the target plate"
              icon={Clock}
              badge={<span className="u-chip u-chip-brand">{vehicleDetections.length} sightings</span>}
            >
              <div className="u-scroll-x">
                <table className="w-full min-w-[680px] text-left">
                  <thead className="bg-surface-1/60">
                    <tr>
                      <th className="u-th">Sensing bus</th>
                      <th className="u-th">Street location</th>
                      <th className="u-th">Time</th>
                      <th className="u-th">Direction</th>
                      <th className="u-th">ANPR confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicleDetections.map(detection => (
                      <tr key={detection.id} className="u-row">
                        <td className="u-td">
                          <Link to="/live-fleet" className="u-num font-medium text-brand-600 hover:text-brand-500">
                            {detection.busId}
                          </Link>
                        </td>
                        <td className="u-td text-ink">{detection.location}</td>
                        <td className="u-td u-num text-ink-muted">{detection.timestamp}</td>
                        <td className="u-td">{detection.direction}</td>
                        <td className="u-td">
                          <span className="flex items-center gap-2">
                            <span className="u-progress w-16">
                              <span
                                className="block h-full rounded-full bg-emerald-400"
                                style={{ width: `${detection.confidence}%` }}
                              />
                            </span>
                            <span className="u-num text-ink">{detection.confidence}%</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PremiumPanel>

            {/* Evidence frames */}
            <section className="u-panel p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="u-overline">Evidence</p>
                  <h2 className="u-h3 mt-1">Extracted capture frames</h2>
                </div>
                <span className="u-chip u-chip-rose">
                  <span className="live-dot" />
                  Captured
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                  <figure
                    key={i}
                    className="group relative aspect-video overflow-hidden rounded-xl border border-line bg-surface-0"
                  >
                    <div className="u-scanline" aria-hidden="true" />
                    <Camera className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-ink-faint transition-transform duration-500 group-hover:scale-110" />
                    <figcaption className="absolute left-2 top-2 rounded border border-line bg-surface-1/80 px-1.5 py-0.5 backdrop-blur-md">
                      <span className="u-num text-[10px] text-ink-secondary">BUS-{100 + i}</span>
                    </figcaption>
                    <span className="absolute bottom-2 right-2 rounded border border-brand-200/60 bg-brand-50/90 px-1.5 py-0.5">
                      <span className="u-num text-[10px] font-medium text-brand-600">{95 + i}% match</span>
                    </span>
                  </figure>
                ))}
              </div>
            </section>
          </div>

          {/* ── Reconstructed path ───────────────────────────────────── */}
          <div>
            <div className="sticky top-4">
              <PremiumPanel
                flush
                title="Reconstructed path"
                subtitle="GPS-interpolated trajectory across sightings"
                icon={Route}
                actions={<MapViewToggle mode={mapMode} onChange={setMapMode} />}
              >
                <div className="relative h-[420px]">
                  <MapContainer center={[23.03, 72.565]} zoom={12} style={{ height: '100%', width: '100%' }}>
                    <MapTileLayer mode={mapMode} />
                    <Polyline
                      positions={vehiclePath as [number, number][]}
                      pathOptions={{ color: '#FF4757', weight: 3, dashArray: '6 7' }}
                    />
                    {vehicleDetections.map(detection => (
                      <Circle
                        key={`c-${detection.id}`}
                        center={detection.gps}
                        radius={120}
                        pathOptions={{ color: '#0C8BA6', fillColor: '#0C8BA6', fillOpacity: 0.1, weight: 1 }}
                      />
                    ))}
                    {vehicleDetections.map(detection => (
                      <Marker
                        key={detection.id}
                        position={detection.gps}
                        icon={eventIcon(detection.confidence >= 95 ? 'high' : 'medium', 14)}
                      />
                    ))}
                  </MapContainer>

                  <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-line bg-surface-1/80 px-2.5 py-1.5 backdrop-blur-md">
                    <p className="u-overline">Path</p>
                    <p className="u-num mt-0.5 text-[11px] text-ink-secondary">{vehiclePath.length} GPS nodes</p>
                  </div>
                </div>

                <dl className="divide-y divide-line/70 border-t border-line px-4 py-1">
                  {[
                    ['First sighting', `${vehicleDetections[vehicleDetections.length - 1]?.timestamp ?? '—'} · ${
                      vehicleDetections[vehicleDetections.length - 1]?.location ?? '—'
                    }`],
                    ['Last sighting', `${vehicleDetections[0]?.timestamp ?? '—'} · ${vehicleDetections[0]?.location ?? '—'}`],
                    ['Estimated distance', '4.2 km'],
                    ['Mean confidence', `${meanConfidence}%`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-3 py-2.5">
                      <dt className="text-[11.5px] text-ink-muted">{k}</dt>
                      <dd className="u-num truncate text-[11.5px] font-medium text-ink-secondary">{v}</dd>
                    </div>
                  ))}
                </dl>
              </PremiumPanel>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
