import React, { useState, useEffect } from 'react'
import {
  Radio,
  Train,
  Bus,
  MapPin,
  Gauge,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Navigation
} from 'lucide-react'
import { LiveVehicle } from '../../types/transit'
import { transitApi } from '../../services/transitApi'

interface LiveVehicleTrackerCardProps {
  initialVehicleId?: string
  onFocusVehicleOnMap?: (lat: number, lng: number) => void
}

export const LiveVehicleTrackerCard: React.FC<LiveVehicleTrackerCardProps> = ({
  initialVehicleId = 'BRTS-BUS-104',
  onFocusVehicleOnMap,
}) => {
  const [vehicles, setVehicles] = useState<LiveVehicle[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicleId)
  const [isLoading, setIsLoading] = useState(false)

  const fetchVehicles = async () => {
    setIsLoading(true)
    try {
      const data = await transitApi.getLiveVehicles()
      setVehicles(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
    const interval = setInterval(fetchVehicles, 15000)
    return () => clearInterval(interval)
  }, [])

  const currentVehicle = vehicles.find((v) => v.vehicle_id === selectedVehicleId) || vehicles[0]

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Radio className="w-4 h-4 animate-pulse text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Live Tracker</h3>
            <p className="text-[11px] text-slate-500">Real-time vehicle positions & ETA</p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchVehicles}
          disabled={isLoading}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          title="Refresh vehicle telemetry"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Vehicle Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {vehicles.map((v) => {
          const isSelected = (currentVehicle?.vehicle_id === v.vehicle_id)
          const cleanLabel = v.route_number || v.vehicle_id.replace('GMRC-', '').replace('BRTS-', '').replace('AMTS-', '')
          return (
            <button
              key={v.vehicle_id}
              type="button"
              onClick={() => setSelectedVehicleId(v.vehicle_id)}
              className={`px-3 py-1.5 rounded-xl font-semibold border whitespace-nowrap transition-all text-xs flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {v.mode === 'METRO' ? <Train className="w-3 h-3 text-blue-400" /> : <Bus className="w-3 h-3 text-orange-400" />}
              <span>{cleanLabel}</span>
            </button>
          )
        })}
      </div>

      {/* Active Vehicle Status Card */}
      {currentVehicle && (
        <div className="bg-slate-50/90 rounded-xl p-4 border border-slate-200 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-slate-900">{currentVehicle.vehicle_id}</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded text-white shadow-2xs"
                  style={{ backgroundColor: currentVehicle.route_color || '#2563EB' }}
                >
                  {currentVehicle.route_number}
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-0.5">{currentVehicle.route_name}</div>
            </div>

            {/* Delay Badge */}
            {currentVehicle.delay_minutes > 0 ? (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                +{currentVehicle.delay_minutes}m delay
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                ON TIME
              </span>
            )}
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Location</span>
              <strong className="text-slate-800 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-red-500" />
                {currentVehicle.current_location_name}
              </strong>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Approaching Next Stop</span>
              <strong className="text-slate-800 flex items-center gap-1 mt-0.5">
                <Navigation className="w-3 h-3 text-blue-500" />
                {currentVehicle.next_stop_name || 'Approaching station'}
              </strong>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Speed</span>
              <strong className="text-slate-800 flex items-center gap-1 mt-0.5">
                <Gauge className="w-3 h-3 text-slate-500" />
                {currentVehicle.speed_kmh} km/h
              </strong>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ETA Next Stop</span>
              <strong className="text-slate-800 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-indigo-500" />
                ~{currentVehicle.eta_next_stop_mins} min
              </strong>
            </div>
          </div>

          {/* Freshness & Transparency Notice & Map Action */}
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>{currentVehicle.freshness_label}</span>
            <div className="flex items-center space-x-2">
              {onFocusVehicleOnMap && (
                <button
                  type="button"
                  onClick={() => onFocusVehicleOnMap(currentVehicle.latitude, currentVehicle.longitude)}
                  className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-[10px] transition-colors"
                >
                  Locate on Map
                </button>
              )}
              <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-semibold">
                {currentVehicle.data_source}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
