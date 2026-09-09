import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet'
import { ArrowLeft, MapPin, Clock, Camera, CheckCircle2, Car } from 'lucide-react'
import { incidents } from '../data/incidents'

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
      <header className="bg-white border-b border-slate-200/90 px-6 py-4 shadow-sm sticky top-0 z-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link to="/incident-center" className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Incident #{incident.id}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase border ${getSeverityBadge(incident.severity)}`}>
                  {incident.severity}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{incident.type} • Automated Optical Detection</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/vehicle-tracking" className="btn-primary text-xs px-4 py-2">
              Track Linked Vehicle
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 bg-slate-50">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Incident Overview */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">
                {incident.type} DETECTED
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
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
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="text-xs font-bold text-slate-500 mb-1">SENSED BY</div>
                  <div className="text-base font-extrabold text-blue-600">{incident.busId}</div>
                </div>
              </div>

              {incident.description && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-sm text-slate-700 leading-relaxed font-medium">
                  {incident.description}
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-5">INVESTIGATION TIMELINE</h2>

              <div className="space-y-4">
                {[
                  { time: '14:32:18', event: 'Optical event detected by on-bus Edge AI', status: 'completed' },
                  { time: '14:32:20', event: 'Bounding box & tracking telemetry locked', status: 'completed' },
                  { time: '14:32:23', event: 'High-confidence ANPR plate extracted', status: 'completed' },
                  { time: '14:32:25', event: 'High-priority alert dispatched to central command', status: 'completed' },
                  { time: '14:33:00', event: 'Case assigned to Investigation Unit 3', status: 'active' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3.5 h-3.5 rounded-full ${item.status === 'completed' ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-blue-600 ring-4 ring-blue-100'}`}></div>
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

            {/* Vehicle Information */}
            {incident.vehicleInfo && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card">
                <div className="flex items-center space-x-2 mb-4">
                  <Car className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">FLAGGED VEHICLE TELEMETRY</h2>
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
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/70">
                      <span className="text-slate-500 font-medium">Heading Direction:</span>
                      <span className="font-bold text-slate-800">{incident.vehicleInfo.direction}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Evidence Frame */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">OPTICAL EVIDENCE CAPTURE</h2>

              <div className="bg-slate-900 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden shadow-inner">
                <Camera className="w-16 h-16 text-slate-600 opacity-40" />
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

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/vehicle-tracking" className="btn-primary text-sm px-6 py-2.5">
                Track Vehicle Across Fleet
              </Link>
              <Link to="/urban-map" className="btn-secondary text-sm px-6 py-2.5">
                View On GIS Map
              </Link>
              <button className="btn-secondary text-sm px-6 py-2.5">
                Export Evidence Dossier
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location Map */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-card">
              <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/60">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">GEO-LOCATION</h3>
              </div>
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
            </div>

            {/* Quick Info */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4">QUICK AUDIT SUMMARY</h3>
              <div className="space-y-3.5 text-xs">
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

            {/* Assigned Team */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4">CIVIC ENFORCEMENT TEAM</h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="font-bold text-slate-900">Investigation Unit 3</div>
                  <div className="text-slate-500 mt-0.5">Primary Case Lead</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="font-bold text-slate-900">Traffic Command & Control</div>
                  <div className="text-slate-500 mt-0.5">Civil Support Dispatch</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
