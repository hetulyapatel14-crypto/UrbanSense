import { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { MapContainer, Marker, Popup, Circle } from 'react-leaflet'
import {
  Activity,
  Bus,
  Layers,
  AlertTriangle,
  ShieldCheck,
  Play,
  Square,
  MapPin,
  ChevronRight,
  Crosshair,
  Waypoints,
} from 'lucide-react'

import { buses as defaultBuses } from '../data/buses'
import { alerts as defaultAlerts } from '../data/alerts'
import { apiService } from '../services/api'
import { roadSimulator } from '../services/roadSimulator'
import { Link } from 'react-router-dom'
import HeaderActions from '../components/HeaderActions'
import { PageHeader } from '../components/common/PageHeader'
import { MetricStrip } from '../components/common/MetricStrip'
import { StatusBadge, StatusTone } from '../components/common/StatusBadge'
import { MapTileLayer, MapViewToggle, type MapTileMode } from '../components/common/MapTileLayer'
import { vehicleIcon, eventIcon, severityTone } from '../components/common/mapIcons'
import { EmptyState } from '../components/common/EmptyState'
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

const severityToneMap: Record<string, StatusTone> = {
  critical: 'rose',
  high: 'amber',
  medium: 'blue',
  low: 'slate',
}

export default function CommandCenter() {
  const [mapMode, setMapMode] = useState<MapTileMode>('street')
  const [demoMode, setDemoMode] = useState(false)
  const [buses, setBuses] = useState(defaultBuses)
  const [alerts, setAlerts] = useState(defaultAlerts)
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)
  const [stats, setStats] = useState({
    activeBuses: 248,
    onlineBuses: 236,
    detections: 12846,
    incidents: 18,
    criticalAlerts: 4,
  })

  // Live stats, alerts and road-snapped vehicle movement
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

    const unsubscribe = roadSimulator.subscribeBuses((liveBuses) => {
      setBuses(liveBuses.filter(b => b.status === 'online'))
    })

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!demoMode) {
      apiService.stopDemoMode()
      return
    }

    apiService.startDemoMode()

    const interval = setInterval(() => {
      apiService.getDashboardSummary().then(data => {
        setStats(prev => ({ ...prev, ...data }))
      })
      apiService.getLiveAlerts().then(data => {
        if (data && data.length > 0) setAlerts(data)
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [demoMode])

  const selectedAlert = useMemo(
    () => alerts.find(a => String(a.id) === selectedAlertId) ?? alerts[0],
    [alerts, selectedAlertId]
  )

  const criticalCount = alerts.filter(a => a.severity === 'critical').length

  return (
    <DashboardLayout>
      <PageHeader
        title="Command Center"
        eyebrow="Operations · Ahmedabad region"
        icon={Activity}
        live={{ label: 'All systems operational', tone: 'emerald' }}
        subtitle={`${stats.onlineBuses} vehicles transmitting · ${alerts.length} events in feed · ${criticalCount} critical escalations`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDemoMode(!demoMode)}
              className={`u-btn u-btn-sm ${demoMode ? 'u-btn-danger' : 'u-btn-outline'}`}
              aria-pressed={demoMode}
            >
              {demoMode ? (
                <>
                  <Square className="h-3 w-3 fill-current" />
                  <span className="hidden sm:inline">Pause stream</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 fill-current" />
                  <span className="hidden sm:inline">Live stream</span>
                </>
              )}
            </button>
            <HeaderActions />
          </div>
        }
      />

      <div className="flex-1 space-y-4 overflow-auto p-4 sm:p-5">
        {/* Operational telemetry strip */}
        <MetricStrip
          dense
          items={[
            { label: 'Fleet active', value: stats.activeBuses, sublabel: 'Probes transmitting', icon: Bus },
            { label: 'AI events today', value: '12.8K', sublabel: 'On-vehicle inferences', icon: Activity },
            { label: 'Road hazards', value: '327', sublabel: 'Awaiting repair', icon: Layers, valueTone: 'amber' },
            { label: 'Open incidents', value: stats.incidents, sublabel: `${stats.criticalAlerts} priority`, icon: AlertTriangle, valueTone: 'rose' },
            { label: 'Detection confidence', value: '94.6%', sublabel: 'Network benchmark', icon: ShieldCheck, valueTone: 'emerald' },
          ]}
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* ── Live city canvas ─────────────────────────────────────── */}
          <section className="u-panel flex min-h-[560px] flex-col overflow-hidden lg:min-h-[640px]">
            <span className="u-hair" aria-hidden="true" />

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="live-dot" />
                <h2 className="text-[13px] font-semibold text-ink">Regional operations canvas</h2>
                <span className="u-overline hidden sm:inline">GIS · live</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="u-num hidden rounded-lg border border-line bg-surface-3/60 px-2 py-1 text-[11px] text-ink-muted sm:inline">
                  {buses.length} nodes
                </span>
                <MapViewToggle mode={mapMode} onChange={setMapMode} />
              </div>
            </div>

            <div className="relative flex-1">
              <div className="u-scanline z-[450]" aria-hidden="true" />

              <MapContainer
                center={[23.03, 72.57]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
              >
                <MapTileLayer mode={mapMode} />

                {/* Fleet nodes */}
                {buses.map(bus => (
                  <Marker
                    key={bus.id}
                    position={bus.gps}
                    icon={vehicleIcon({ tone: 'brand', speed: bus.speed })}
                  >
                    <Popup>
                      <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="font-mono text-[12px] font-semibold text-ink">{bus.id}</span>
                          <span className="text-[10px] uppercase tracking-wider text-ink-muted">{bus.route}</span>
                        </div>
                        <p className="text-[11.5px] text-ink-secondary">{bus.location}</p>
                        <p className="font-mono text-[11px] text-ink-muted">
                          {bus.speed} km/h · {bus.status}
                        </p>
                        <Link
                          to={`/live-fleet?bus=${bus.id}`}
                          className="inline-block pt-1 text-[11.5px] font-medium text-brand-600 hover:text-brand-500"
                        >
                          Open vehicle feed →
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Incident radius zones */}
                {alerts.map(alert => (
                  <Circle
                    key={`zone-${alert.id}`}
                    center={alert.gps}
                    radius={200}
                    pathOptions={{
                      color: alert.severity === 'critical' ? '#DC2626' : alert.severity === 'high' ? '#D97706' : '#FF4757',
                      fillColor: alert.severity === 'critical' ? '#DC2626' : alert.severity === 'high' ? '#D97706' : '#FF4757',
                      fillOpacity: 0.12,
                      weight: 1.2,
                    }}
                  />
                ))}

                {/* Incident markers */}
                {alerts.map(alert => (
                  <Marker
                    key={alert.id}
                    position={alert.gps}
                    icon={eventIcon(alert.severity, String(alert.id) === String(selectedAlert?.id) ? 22 : 16)}
                  >
                    <Popup>
                      <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-[12px] font-semibold text-ink">{alert.type}</span>
                          <span className="text-[10px] uppercase tracking-wider text-ink-muted">{alert.severity}</span>
                        </div>
                        <p className="text-[11.5px] text-ink-secondary">{alert.location}</p>
                        <p className="font-mono text-[11px] text-ink-muted">
                          {alert.busId} · {alert.confidence}% · {alert.timestamp}
                        </p>
                        <Link
                          to={`/incident/${alert.id}`}
                          className="inline-block pt-1 text-[11.5px] font-medium text-brand-600 hover:text-brand-500"
                        >
                          Open incident dossier →
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* Floating canvas overlays */}
              <div className="pointer-events-none absolute bottom-4 left-4 z-[400] flex flex-wrap gap-2">
                <div className="u-glass pointer-events-auto px-3 py-2">
                  <p className="u-overline">Snap quality</p>
                  <p className="u-num mt-1 text-[12px] font-semibold text-emerald-600">100% centreline</p>
                </div>
                <div className="u-glass pointer-events-auto px-3 py-2">
                  <p className="u-overline">Open incidents</p>
                  <p className="u-num mt-1 text-[12px] font-semibold text-rose-600">{alerts.length} active</p>
                </div>
              </div>

              <div className="pointer-events-none absolute right-4 top-4 z-[400] hidden lg:block">
                <div className="u-glass pointer-events-auto space-y-1.5 px-3 py-2.5">
                  <p className="u-overline mb-1">Legend</p>
                  {[
                    { c: '#FF4757', l: 'Fleet node' },
                    { c: '#DC2626', l: 'Critical event' },
                    { c: '#D97706', l: 'High severity' },
                    { c: '#059669', l: 'Nominal corridor' },
                  ].map(item => (
                    <p key={item.l} className="flex items-center gap-2 text-[11px] text-ink-secondary">
                      <span className="u-dot" style={{ backgroundColor: item.c }} />
                      {item.l}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Live operations feed ─────────────────────────────────── */}
          <section className="u-panel flex max-h-[640px] flex-col overflow-hidden">
            <span className="u-hair" aria-hidden="true" />

            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  <span className="absolute h-1.5 w-1.5 animate-ping-slow rounded-full bg-rose-400" />
                </span>
                <h2 className="text-[13px] font-semibold text-ink">Live event feed</h2>
              </div>
              <span className="u-num text-[11px] text-ink-muted">{alerts.length} events</span>
            </div>

            <div className="u-scroll flex-1 space-y-2 overflow-y-auto p-3">
              {alerts.length === 0 && (
                <EmptyState title="No active events" description="Detections will appear here as the fleet moves." />
              )}

              {alerts.map(alert => {
                const isSelected = String(alert.id) === String(selectedAlert?.id)
                return (
                  <button
                    key={alert.id}
                    onClick={() => setSelectedAlertId(String(alert.id))}
                    className={`group relative w-full overflow-hidden rounded-xl border px-3.5 py-3 text-left transition-all duration-200 ease-silk ${
                      isSelected
                        ? 'border-brand-200/70 bg-brand-50/60'
                        : 'border-line bg-surface-2/60 hover:border-line-strong hover:bg-surface-3/60'
                    }`}
                  >
                    <span
                      className="absolute inset-y-0 left-0 w-[2px]"
                      style={{
                        backgroundColor:
                          alert.severity === 'critical' ? '#DC2626' : alert.severity === 'high' ? '#D97706' : '#FF4757',
                        opacity: isSelected ? 1 : 0.5,
                      }}
                      aria-hidden="true"
                    />

                    <div className="flex items-start justify-between gap-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-ink">{alert.type}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{alert.location}</span>
                        </p>
                      </div>
                      <StatusBadge status={alert.severity} tone={severityToneMap[alert.severity] ?? 'slate'} size="sm" />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line/70 pt-2">
                      <span className="u-num text-[10.5px] text-ink-faint">
                        {alert.busId} · {alert.confidence}% · {alert.timestamp}
                      </span>
                      <Link
                        to={`/incident/${alert.id}`}
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-0.5 text-[11px] font-medium text-brand-600 transition-colors hover:text-brand-500"
                      >
                        Dossier
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
              <Link
                to="/incident-center"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-brand-600 transition-colors hover:text-brand-500"
              >
                All queued incidents
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <span className="flex items-center gap-1.5 text-[11px] text-ink-faint">
                <Crosshair className="h-3.5 w-3.5" />
                {severityTone(selectedAlert?.severity ?? 'medium')}
              </span>
            </div>
          </section>
        </div>

        {/* ── Corridor summary rows ─────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[
            {
              title: 'Corridor health',
              icon: Waypoints,
              rows: [
                { k: 'SG Highway', v: 'Degraded · 18 hazards' },
                { k: '132ft Ring Road', v: 'Watch · 14 hazards' },
                { k: 'Ashram Road', v: 'Watch · 12 hazards' },
              ],
              to: '/road-intelligence',
              cta: 'Road intelligence',
            },
            {
              title: 'Fleet readiness',
              icon: Bus,
              rows: [
                { k: 'Transmitting', v: `${stats.onlineBuses} vehicles` },
                { k: 'Depot standby', v: `${Math.max(stats.activeBuses - stats.onlineBuses, 0)} vehicles` },
                { k: 'Camera channels', v: `${stats.onlineBuses * 5} streams` },
              ],
              to: '/live-fleet',
              cta: 'Fleet console',
            },
            {
              title: 'Transit network',
              icon: Layers,
              rows: [
                { k: 'Metro & BRTS', v: 'Nominal service' },
                { k: 'AMTS feeders', v: '2 corridor delays' },
                { k: 'GIFT EV loop', v: 'Nominal service' },
              ],
              to: '/journey-planner',
              cta: 'Journey planner',
            },
          ].map(card => (
            <div key={card.title} className="u-panel u-panel-hover group p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <card.icon className="h-3.5 w-3.5 text-brand-500" />
                  <h3 className="text-[13px] font-semibold text-ink">{card.title}</h3>
                </div>
                <Link
                  to={card.to}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted transition-colors hover:text-brand-600"
                >
                  {card.cta}
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <dl className="mt-3 divide-y divide-line/70 border-t border-line/70">
                {card.rows.map(row => (
                  <div key={row.k} className="flex items-center justify-between py-2">
                    <dt className="text-[12px] text-ink-muted">{row.k}</dt>
                    <dd className="u-num text-[12px] font-medium text-ink-secondary">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </section>
      </div>
    </DashboardLayout>
  )
}
