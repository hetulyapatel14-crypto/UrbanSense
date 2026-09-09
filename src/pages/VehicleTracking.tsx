import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { Search, Camera, AlertCircle, Car } from 'lucide-react'
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet'
import { apiService } from '../services/api'
import HeaderActions from '../components/HeaderActions'


const defaultDetections = [
  { id: 1, busId: 'BUS-104', location: 'SG Highway', timestamp: '14:32:18', direction: 'Northbound', confidence: 96.4, gps: [23.0395, 72.5667] },
  { id: 2, busId: 'BUS-087', location: 'Ashram Road', timestamp: '14:28:45', direction: 'Southbound', confidence: 94.2, gps: [23.0225, 72.5714] },
  { id: 3, busId: 'BUS-121', location: 'Ring Road', timestamp: '14:25:12', direction: 'Eastbound', confidence: 92.8, gps: [23.0300, 72.5800] },
  { id: 4, busId: 'BUS-156', location: 'CG Road', timestamp: '14:20:33', direction: 'Westbound', confidence: 89.5, gps: [23.0350, 72.5550] },
]

export default function VehicleTracking() {
  const [searchQuery, setSearchQuery] = useState('GJ 01 XX 4821')
  const [vehicleDetections, setVehicleDetections] = useState(defaultDetections)
  const [vehiclePath, setVehiclePath] = useState<[number, number][]>([
    [23.0395, 72.5667],
    [23.0350, 72.5650],
    [23.0300, 72.5630],
    [23.0225, 72.5714],
  ])

  const handleSearch = () => {
    if (!searchQuery) return
    apiService.searchVehicle(searchQuery).then(res => {
      if (res && res.route && res.route.length > 0) {
        setVehiclePath(res.route)
      }
      if (res && res.sightings && res.sightings.length > 0) {
        setVehicleDetections(res.sightings.map((s: any) => ({
          id: s.id,
          busId: s.bus_id || 'BUS-104',
          location: s.location,
          timestamp: s.timestamp.substring(11, 19),
          direction: s.direction,
          confidence: s.confidence * 100,
          gps: s.gps
        })))
      }
    })
  }

  useEffect(() => {
    handleSearch()
  }, [])

  return (
    <DashboardLayout>
      <header className="bg-white border-b border-slate-200/90 px-6 py-4 shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">ANPR Vehicle Tracking System</h1>
            <p className="text-xs text-slate-500 mt-0.5">Automated Number Plate Recognition and cross-fleet spatial reconstruction</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Multi-Bus Cross-Correlation
            </span>
            <HeaderActions />
          </div>
        </div>
      </header>


      <div className="flex-1 overflow-auto p-6 bg-slate-50">
        {/* Search */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 mb-6 shadow-card">
          <div className="flex items-center space-x-2 mb-3">
            <Car className="w-4 h-4 text-blue-600" />
            <h2 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">SEARCH VEHICLE BY REGISTRATION</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[260px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter registration (e.g. GJ 01 XX 4821)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
              />
            </div>
            <button onClick={handleSearch} className="btn-primary text-sm px-8 py-3">
              Search Fleet Detections
            </button>
          </div>
        </div>

        {/* Results */}
        {searchQuery && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Vehicle Info & Detections */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Identified Target</span>
                    <h2 className="text-2xl font-extrabold text-blue-700 font-mono tracking-wider">
                      {searchQuery}
                    </h2>
                  </div>
                  <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-1 rounded-full">
                    Flagged For Investigation
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="text-xs font-bold text-slate-500 mb-1">REGISTRATION</div>
                    <div className="text-base font-extrabold font-mono text-slate-900">{searchQuery}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="text-xs font-bold text-slate-500 mb-1">VEHICLE TYPE</div>
                    <div className="text-base font-extrabold text-slate-900">White Sedan</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="text-xs font-bold text-slate-500 mb-1">OPTICAL COLOR</div>
                    <div className="text-base font-extrabold text-slate-900">White Pearl</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="text-xs font-bold text-slate-500 mb-1">TOTAL SIGHTINGS</div>
                    <div className="text-base font-extrabold text-emerald-600">4 Bus Sightings</div>
                  </div>
                </div>

                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-rose-700 text-sm mb-0.5">Associated Incident Escalation</div>
                    <div className="text-xs text-rose-800 leading-relaxed">
                      This vehicle matches incident <strong>INC-1042</strong> (Hit-and-Run occurrence detected on SG Highway). All subsequent sightings are automatically reported to Traffic Control.
                    </div>
                  </div>
                </div>
              </div>

              {/* Detection History */}
              <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-card">
                <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/60 flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase">DETECTION TIMELINE & SIGHTINGS</h3>
                  <span className="text-xs text-slate-500 font-semibold">4 Sightings Logged</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/80 border-b border-slate-200/80">
                      <tr>
                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Bus Unit</th>
                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Street Location</th>
                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Direction</th>
                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">ANPR Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {vehicleDetections.map(detection => (
                        <tr key={detection.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">
                            {detection.busId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-800">
                            {detection.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs font-mono">
                            {detection.timestamp}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                            {detection.direction}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {detection.confidence}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Evidence Frames */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card">
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase mb-4">EXTRACTED EVIDENCE FRAMES</h3>

                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-slate-900 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden shadow-inner">
                      <Camera className="w-10 h-10 text-slate-600 opacity-40" />
                      <div className="absolute top-2 left-2 bg-slate-900/80 text-white px-2 py-0.5 rounded text-[10px] font-bold border border-slate-700 backdrop-blur-xs">
                        BUS-{100 + i}
                      </div>
                      <div className="absolute bottom-2 right-2 bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">
                        {95 + i}% ANPR MATCH
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Path Map */}
            <div>
              <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-card sticky top-24">
                <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/60">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">RECONSTRUCTED MOVEMENT PATH</h3>
                </div>
                <div className="h-[450px]">
                  <MapContainer
                    center={[23.0300, 72.5650]}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Polyline positions={vehiclePath as [number, number][]} color="#2563eb" weight={4} dashArray="6, 6" />
                    {vehicleDetections.map(detection => (
                      <Marker key={detection.id} position={detection.gps as [number, number]} />
                    ))}
                  </MapContainer>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200/80 text-xs font-medium">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">First Sighting:</span>
                      <span className="font-bold text-slate-800">14:20:33 (CG Road)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Last Sighting:</span>
                      <span className="font-bold text-slate-800">14:32:18 (SG Highway)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Estimated Transit Distance:</span>
                      <span className="font-bold text-blue-600">4.2 km</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
