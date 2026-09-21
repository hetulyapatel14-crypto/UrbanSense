import { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { MapContainer, Marker, Circle } from 'react-leaflet'
import {
  Search,
  AlertTriangle,
  Siren,
  ListChecks,
  SearchCheck,
  CheckCircle2,
  ClipboardList,
  MapPin,
  ChevronRight,
  Camera,
  Clock,
  Car,
  FileText,
  Layers,
} from 'lucide-react'
import { incidents as defaultIncidents } from '../data/incidents'
import { apiService } from '../services/api'
import { Link } from 'react-router-dom'
import HeaderActions from '../components/HeaderActions'
import { PageHeader } from '../components/common/PageHeader'
import { MetricStrip } from '../components/common/MetricStrip'
import { StatusBadge, StatusTone } from '../components/common/StatusBadge'
import { MapTileLayer, MapViewToggle, type MapTileMode } from '../components/common/MapTileLayer'
import { EmptyState } from '../components/common/EmptyState'
import { severityTone } from '../components/common/mapIcons'
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

const severityToneMap: Record<string, StatusTone> = {
  critical: 'rose',
  high: 'amber',
  medium: 'blue',
  low: 'slate',
}

const statusToneMap: Record<string, StatusTone> = {
  open: 'rose',
  investigating: 'amber',
  assigned: 'blue',
  resolved: 'emerald',
}

export default function IncidentCenter() {
  const [incidents, setIncidents] = useState(defaultIncidents)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mapMode, setMapMode] = useState<MapTileMode>('street')

  useEffect(() => {
    apiService.getIncidents().then(data => {
      if (data && data.length > 0) setIncidents(data)
    })
  }, [])

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch =
      incident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter
    return matchesSearch && matchesStatus && matchesSeverity
  })

  const selected = useMemo(
    () => filteredIncidents.find(i => i.id === selectedId) ?? filteredIncidents[0] ?? null,
    [filteredIncidents, selectedId]
  )

  const criticalCount = incidents.filter(i => i.severity === 'critical').length

  /**
   * Case history derived from the detection pipeline stages the record already
   * carries — no invented backend fields.
   */
  const caseHistory = selected
    ? [
        { time: selected.time, label: 'Optical event detected', detail: `On-vehicle AI · ${selected.busId}`, state: 'done' },
        { time: selected.time, label: 'Classification assigned', detail: `${selected.type} · ${selected.confidence}% confidence`, state: 'done' },
        { time: selected.time, label: 'Dispatch decision', detail: `Status: ${selected.status}`, state: selected.status === 'resolved' ? 'done' : 'active' },
        {
          time: selected.time,
          label: selected.status === 'resolved' ? 'Case closed' : 'Field response pending',
          detail: selected.status === 'resolved' ? 'Cleared by enforcement unit' : 'Queued with traffic control',
          state: selected.status === 'resolved' ? 'done' : 'pending',
        },
      ]
    : []

  return (
    <DashboardLayout>
      <PageHeader
        title="Incident Center"
        eyebrow="Enforcement · triage queue"
        icon={AlertTriangle}
        live={{ label: `${criticalCount} critical escalations`, tone: 'rose' }}
        subtitle="Detection triage, investigation history and enforcement escalation"
        actions={<HeaderActions />}
      />

      <div className="flex-1 space-y-4 overflow-auto p-4 sm:p-5">
        <MetricStrip
          dense
          items={[
            { label: 'Total incidents', value: incidents.length, sublabel: 'Logged in window', icon: ClipboardList },
            { label: 'Critical', value: criticalCount, sublabel: 'Immediate action', icon: Siren, valueTone: 'rose' },
            { label: 'High priority', value: incidents.filter(i => i.severity === 'high').length, sublabel: 'Enforcement alerted', icon: AlertTriangle, valueTone: 'amber' },
            { label: 'Investigating', value: incidents.filter(i => i.status === 'investigating').length, sublabel: 'Review in progress', icon: SearchCheck, valueTone: 'iris' },
            { label: 'Resolved today', value: incidents.filter(i => i.status === 'resolved').length, sublabel: 'Cases closed', icon: CheckCircle2, valueTone: 'emerald' },
          ]}
        />

        {/* Filter bar */}
        <div className="u-panel flex flex-col gap-3 p-3.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              placeholder="Search by incident ID, type or location…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="u-search"
              aria-label="Search incidents"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <label className="sr-only" htmlFor="severity-filter">
              Severity
            </label>
            <select
              id="severity-filter"
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="u-select"
            >
              <option value="all">All severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>

            <label className="sr-only" htmlFor="status-filter">
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="u-select"
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="assigned">Assigned</option>
              <option value="resolved">Resolved</option>
            </select>

            <span className="u-num text-[11.5px] text-ink-muted">{filteredIncidents.length} cases</span>
          </div>
        </div>

        {/* Master–detail */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
          {/* Feed */}
          <section className="u-panel flex max-h-[720px] flex-col overflow-hidden">
            <span className="u-hair" aria-hidden="true" />
            <div className="u-panel-head">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface-3 text-rose-600">
                  <ListChecks className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h2 className="text-[13px] font-semibold text-ink">Incident queue</h2>
                  <p className="text-[11px] text-ink-muted">Newest detections first</p>
                </div>
              </div>
              <span className="u-num text-[11px] text-ink-muted">{filteredIncidents.length}</span>
            </div>

            <div className="u-scroll flex-1 space-y-2 overflow-y-auto p-3">
              {filteredIncidents.length === 0 && (
                <EmptyState
                  title="No incidents match these filters"
                  description="Clear the severity or status filter to see the full queue."
                  icon={SearchCheck}
                />
              )}

              {filteredIncidents.map(incident => {
                const isActive = selected?.id === incident.id
                const tone = severityTone(incident.severity)
                const rail =
                  tone === 'rose' ? '#DC2626' : tone === 'amber' ? '#D97706' : tone === 'brand' ? '#FF4757' : '#78716C'

                return (
                  <button
                    key={incident.id}
                    onClick={() => setSelectedId(incident.id)}
                    className={`group relative w-full overflow-hidden rounded-xl border px-3.5 py-3 text-left transition-all duration-200 ease-silk ${
                      isActive
                        ? 'border-brand-200/70 bg-brand-50/50'
                        : 'border-line bg-surface-2/60 hover:border-line-strong hover:bg-surface-3/60'
                    }`}
                  >
                    <span
                      className="absolute inset-y-0 left-0 w-[2px]"
                      style={{ backgroundColor: rail, opacity: isActive ? 1 : 0.45 }}
                      aria-hidden="true"
                    />
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="min-w-0">
                        <p className="u-num text-[11px] text-ink-faint">{incident.id}</p>
                        <p className="mt-0.5 truncate text-[13px] font-medium text-ink">{incident.type}</p>
                      </div>
                      <StatusBadge status={incident.severity} tone={severityToneMap[incident.severity] ?? 'slate'} size="sm" />
                    </div>

                    <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{incident.location}</span>
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-line/70 pt-2">
                      <span className="u-num text-[10.5px] text-ink-faint">
                        {incident.busId} · {incident.confidence}% · {incident.time}
                      </span>
                      <span className={`u-num text-[10.5px] ${isActive ? 'text-brand-600' : 'text-ink-faint'}`}>
                        {incident.status}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Detail */}
          <section className="u-panel overflow-hidden">
            <span className="u-hair" aria-hidden="true" />

            {!selected ? (
              <EmptyState title="Select an incident" description="Choose a case from the queue to review its evidence and history." />
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-4 sm:p-5">
                  <div>
                    <p className="u-overline">{selected.id} · case file</p>
                    <h2 className="mt-1 text-[19px] font-semibold tracking-tight text-ink">{selected.type}</h2>
                    <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-ink-muted">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {selected.location}
                      </span>
                      <span className="text-ink-faint">·</span>
                      <span className="u-num">
                        {selected.gps[0].toFixed(4)}, {selected.gps[1].toFixed(4)}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={selected.severity} tone={severityToneMap[selected.severity] ?? 'slate'} />
                    <StatusBadge status={selected.status} tone={statusToneMap[selected.status] ?? 'slate'} dot />
                    <Link to={`/incident/${selected.id}`} className="u-btn u-btn-outline u-btn-sm">
                      <FileText className="h-3.5 w-3.5" />
                      Open dossier
                    </Link>
                  </div>
                </div>

                {/* Key facts */}
                <div className="grid grid-cols-2 divide-line/70 border-b border-line/70 sm:grid-cols-4 sm:divide-x">
                  {[
                    ['Detected by', selected.busId],
                    ['Confidence', `${selected.confidence}%`],
                    ['Reported', selected.time],
                    ['Linked vehicle', selected.vehicleInfo?.registration ?? 'Under review'],
                  ].map(([k, v]) => (
                    <div key={k} className="px-4 py-3">
                      <p className="u-overline">{k}</p>
                      <p className="u-num mt-1.5 truncate text-[13px] font-medium text-ink">{v}</p>
                    </div>
                  ))}
                </div>

                {selected.description && (
                  <p className="border-b border-line/70 px-4 py-3.5 text-[12.5px] leading-relaxed text-ink-secondary sm:px-5">
                    {selected.description}
                  </p>
                )}

                <div className="grid grid-cols-1 divide-y divide-line/70 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                  {/* Map position */}
                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                        <Layers className="h-3.5 w-3.5 text-brand-500" />
                        Map position
                      </h3>
                      <MapViewToggle mode={mapMode} onChange={setMapMode} />
                    </div>

                    <div className="h-56 overflow-hidden rounded-xl border border-line">
                      <MapContainer center={selected.gps} zoom={14} style={{ height: '100%', width: '100%' }} key={selected.id}>
                        <MapTileLayer mode={mapMode} />
                        <Circle
                          center={selected.gps}
                          radius={280}
                          pathOptions={{ color: '#DC2626', fillColor: '#DC2626', fillOpacity: 0.12, weight: 1.2 }}
                        />
                        <Marker position={selected.gps} />
                      </MapContainer>
                    </div>

                    {selected.vehicleInfo && (
                      <dl className="mt-3 divide-y divide-line/70 rounded-xl border border-line/70 bg-surface-1/50 px-3.5">
                        {[
                          ['Vehicle', `${selected.vehicleInfo.type} · ${selected.vehicleInfo.color}`],
                          ['Heading', selected.vehicleInfo.direction],
                        ].map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between gap-3 py-2">
                            <dt className="text-[11.5px] text-ink-muted">{k}</dt>
                            <dd className="text-[11.5px] font-medium text-ink-secondary">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>

                  {/* Case history */}
                  <div className="p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-ink">
                      <Clock className="h-3.5 w-3.5 text-brand-500" />
                      Event history
                    </h3>

                    <ol className="relative space-y-4 pl-6">
                      <span className="u-timeline-rail" aria-hidden="true" />
                      {caseHistory.map((step, i) => (
                        <li key={i} className="relative">
                          <span
                            className={`absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-surface-2 ${
                              step.state === 'done' ? 'bg-emerald-400' : step.state === 'active' ? 'bg-brand-500' : 'bg-ink-faint'
                            }`}
                            aria-hidden="true"
                          />
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[12.5px] font-medium text-ink">{step.label}</p>
                              <p className="mt-0.5 text-[11.5px] text-ink-muted">{step.detail}</p>
                            </div>
                            <span className="u-num shrink-0 text-[11px] text-ink-faint">{step.time}</span>
                          </div>
                        </li>
                      ))}
                    </ol>

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line/70 pt-4">
                      <Link to="/vehicle-tracking" className="u-btn u-btn-outline u-btn-sm">
                        <Car className="h-3.5 w-3.5" />
                        Track linked vehicle
                      </Link>
                      <Link to="/urban-map" className="u-btn u-btn-ghost u-btn-sm">
                        <Camera className="h-3.5 w-3.5" />
                        Review on map
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
