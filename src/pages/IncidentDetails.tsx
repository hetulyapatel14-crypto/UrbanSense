import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet'
import { ArrowLeft, MapPin, Clock, Camera, CheckCircle2, Car, ShieldCheck, Users, FileText, Layers } from 'lucide-react'
import { incidents } from '../data/incidents'
import { PremiumPanel } from '../components/common/PremiumPanel'
import { ScrollReveal } from '../components/common/ScrollReveal'

export default function IncidentDetails() {
  const { id } = useParams()
  const incident = incidents.find(i => i.id === id) || incidents[0]

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-rose-700 bg-rose-50 border-rose-200'
      case 'high': return 'text-amber-800 bg-amber-50 border-amber-200'
      case 'medium': return 'text-blue-700 bg-blue-50 border-blue-200'
      default: return 'text-slate-700 bg-slate-100 border-slate-200'
    }
  }

  return (
    <DashboardLayout>
      <header className="relative bg-white/85 backdrop-blur-xl border-b border-slate-200/80 px-6 py-4 shadow-sm sticky top-0 z-20">
        {/* Ambient aurora wash */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-70" aria-hidden="true">
          <div className="absolute -top-24 -left-16 w-[28rem] h-48 bg-gradient-to-tr from-rose-400/12 via-indigo-400/10 to-transparent blur-3xl rounded-full animate-aurora" />
          <div className="absolute -top-20 right-10 w-80 h-40 bg-gradient-to-tr from-cyan-400/12 to-transparent blur-3xl rounded-full animate-aurora" />
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent" aria-hidden="true" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/incident-center"
              className="press-scale p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Back to Incident Center"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight animate-fade-in-up">Incident #{incident.id}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase border ${getSeverityBadge(incident.severity)}`}>
                  {incident.severity}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{incident.type} • Automated Optical Detection</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot" />
              Case File Active
            </span>
            <Link to="/vehicle-tracking" className="btn-primary group text-xs px-4 py-2">
              Track Linked Vehicle
              <ArrowLeft className="w-3.5 h-3.5 rotate-180 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Incident Overview */}
            <ScrollReveal direction="up" delay={0}>
            <div className="panel-premium p-6 animate-fade-in-up">
              <div className="flex items-center gap-2.5 mb-4 relative">
                <span className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  {incident.type} Detected
                </h2>
              </div>

              <div className="stagger-list grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 relative">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="text-xs font-bold text-slate-500 mb-1">STATUS</div>
                  <div className="text-base font-extrabold text-amber-600 uppercase">{incident.status}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="text-xs font-bold text-slate-500 mb-1">CONFIDENCE</div>
                  <div className="text-base font-extrabold text-emerald-600">{incident.confidence}%</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="text-xs font-bold text-slate-500 mb-1">LOCATION</div>
                  <div className="text-base font-extrabold text-slate-900 truncate">{incident.location}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 hover:bg-white hover:shadow-xs hover:-translate-y-0.5 transition-all duration-300">
                  <div className="text-xs font-bold text-slate-500 mb-1">SENSED BY</div>
                  <div className="text-base font-extrabold text-blue-600">{incident.busId}</div>
                </div>
              </div>

              {incident.description && (
                <div className="relative bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-sm text-slate-700 leading-relaxed font-medium">
                  {incident.description}
                </div>
              )}
            </div>
            </ScrollReveal>

            {/* Timeline */}
            <ScrollReveal direction="up" delay={60}>
            <div className="panel-premium p-6">
              <div className="flex items-center gap-2.5 mb-5 relative">
                <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </span>
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Investigation Timeline</h2>
              </div>

              <div className="stagger-list space-y-4 relative">
                {[
                  { time: '14:32:18', event: 'Optical event detected by on-bus Edge AI', status: 'completed' },
                  { time: '14:32:20', event: 'Bounding box & tracking telemetry locked', status: 'completed' },
                  { time: '14:32:23', event: 'High-confidence ANPR plate extracted', status: 'completed' },
                  { time: '14:32:25', event: 'High-priority alert dispatched to central command', status: 'completed' },
                  { time: '14:33:00', event: 'Case assigned to Investigation Unit 3', status: 'active' },
                ].map((item, index) => (
                  <div key={index} className="group/tl flex items-start space-x-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3.5 h-3.5 rounded-full transition-all duration-300 group-hover/tl:scale-110 ${item.status === 'completed' ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-blue-600 ring-4 ring-blue-100 live-dot'}`}></div>
                      {index < 4 && <div className="w-0.5 h-8 bg-slate-200 mt-1"></div>}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-semibold text-slate-800">{item.event}</span>
                        <span className="font-mono text-xs text-slate-400 font-bold">{item.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </ScrollReveal>

            {/* Vehicle Information */}
            {incident.vehicleInfo && (
              <ScrollReveal direction="up" delay={60}>
              <div className="panel-premium p-6">
                <div className="flex items-center space-x-2 mb-4 relative">
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                    <Car className="w-4 h-4" />
                  </span>
                  <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Flagged Vehicle Telemetry</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-xs font-bold text-slate-500 mb-1">REGISTRATION NUMBER</div>
                    <div className="text-2xl font-extrabold text-blue-700 font-mono tracking-wider">{incident.vehicleInfo.registration}</div>
                    <div className="text-xs font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ANPR Confidence: {incident.confidence}%
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/70">
                      <span className="text-slate-500 font-medium">Vehicle Model:</span>
                      <span className="font-bold text-slate-800">{incident.vehicleInfo.type}</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/70">
                      <span className="text-slate-500 font-medium">Detected Exterior:</span>
                      <span className="font-bold text-slate-800">{incident.vehicleInfo.color}</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/70 hover:bg-white transition-colors">
                      <span className="text-slate-500 font-medium">Heading Direction:</span>
                      <span className="font-bold text-slate-800">{incident.vehicleInfo.direction}</span>
                    </div>
                  </div>
                </div>
              </div>
              </ScrollReveal>
            )}

            {/* Evidence Frame */}
            <ScrollReveal direction="up" delay={60}>
            <div className="panel-premium p-6">
              <div className="flex items-center justify-between mb-4 relative">
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Optical Evidence Capture</h2>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 live-dot" />
                  REC
                </span>
              </div>

              <div className="group/frame bg-slate-900 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden shadow-inner border border-slate-800">
                <div className="scanline" aria-hidden="true" />
                <Camera className="w-16 h-16 text-slate-600 opacity-40 transition-transform duration-500 group-hover/frame:scale-110" />
                <div className="absolute top-4 left-4 bg-slate-900/80 text-white px-3 py-1 rounded text-xs font-bold border border-slate-700 backdrop-blur-xs">
                  RAW FRAME #INC-{incident.id}-01
                </div>

                {incident.vehicleInfo && (
                  <div className="absolute top-1/3 right-1/4 border-2 border-cyan-400 bg-slate-950/70 backdrop-blur-xs p-3 rounded-lg shadow-lg">
                    <div className="text-xs font-bold text-cyan-300 font-mono mb-1">
                      ANPR: {incident.vehicleInfo.registration}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold">
                      CONFIDENCE: {incident.confidence}%
                    </div>
                  </div>
                )}
              </div>
            </div>
            </ScrollReveal>

            {/* Action Bar */}
            <ScrollReveal direction="up" delay={60}>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/vehicle-tracking" className="btn-primary group text-sm px-6 py-2.5">
                Track Vehicle Across Fleet
                <ArrowLeft className="w-3.5 h-3.5 rotate-180 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <Link to="/urban-map" className="btn-secondary text-sm px-6 py-2.5">
                <Layers className="w-4 h-4" />
                View On GIS Map
              </Link>
              <button className="btn-secondary text-sm px-6 py-2.5">
                <FileText className="w-4 h-4" />
                Export Evidence Dossier
              </button>
            </div>
            </ScrollReveal>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location Map */}
            <ScrollReveal direction="up" delay={60}>
            <PremiumPanel
              flush
              title="Geo-Location"
              subtitle="Precise incident coordinates"
              icon={MapPin}
              badge={
                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  Hotspot
                </span>
              }
            >
              <div className="h-56 relative">
                <MapContainer
                  center={incident.gps}
                  zoom={14}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Circle
                    center={incident.gps}
                    radius={300}
                    pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.25 }}
                  />
                  <Marker position={incident.gps} />
                </MapContainer>
              </div>
              <div className="p-3.5 bg-slate-50 border-t border-slate-200/80 text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="text-slate-500">GPS Coordinates:</span>
                <span className="font-mono text-slate-900">{incident.gps.join(', ')}</span>
              </div>
            </PremiumPanel>
            </ScrollReveal>

            {/* Quick Info */}
            <ScrollReveal direction="up" delay={60}>
            <div className="panel-premium p-5">
              <div className="flex items-center gap-2.5 mb-4 relative">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Quick Audit Summary</h3>
              </div>
              <div className="stagger-list space-y-3.5 text-xs relative">
                <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-slate-400 font-medium">Detection Time</div>
                    <div className="font-bold text-slate-800">{incident.time}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="text-slate-400 font-medium">Incident Location</div>
                    <div className="font-bold text-slate-800">{incident.location}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="text-slate-400 font-medium">Sensing Fleet Bus</div>
                    <div className="font-bold text-slate-800">{incident.busId}</div>
                  </div>
                </div>
              </div>
            </div>
            </ScrollReveal>

            {/* Assigned Team */}
            <ScrollReveal direction="up" delay={60}>
            <div className="panel-premium p-5">
              <div className="flex items-center gap-2.5 mb-4 relative">
                <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Civic Enforcement Team</h3>
              </div>
              <div className="stagger-list space-y-2.5 text-xs relative">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 hover:bg-white hover:shadow-xs hover:-translate-y-0.5 transition-all duration-300">
                  <div className="font-bold text-slate-900">Investigation Unit 3</div>
                  <div className="text-slate-500 mt-0.5">Primary Case Lead</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 hover:bg-white hover:shadow-xs hover:-translate-y-0.5 transition-all duration-300">
                  <div className="font-bold text-slate-900">Traffic Command & Control</div>
                  <div className="text-slate-500 mt-0.5">Civil Support Dispatch</div>
                </div>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
