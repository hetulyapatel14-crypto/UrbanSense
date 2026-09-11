import React from 'react'
import {
  Zap,
  Battery,
  BatteryCharging,
  BatteryMedium,
  BatteryLow,
  Gauge,
  MapPin,
  Snowflake,
  Accessibility,
  Radio
} from 'lucide-react'
import { ElectricBusVehicle } from '../../types/transit'

interface ElectricBusVehicleCardProps {
  vehicle: ElectricBusVehicle
  onFocusOnMap?: (lat: number, lng: number) => void
  isSelected?: boolean
}

export const ElectricBusVehicleCard: React.FC<ElectricBusVehicleCardProps> = ({
  vehicle,
  onFocusOnMap,
  isSelected = false,
}) => {
  const soc = vehicle.battery_soc_pct ?? 78
  const isCharging = vehicle.charging_status === 'CHARGING' || vehicle.charging_status === 'FAST_CHARGING'
  const isGift = vehicle.operator?.includes('GIFT') || vehicle.agency?.includes('GIFT')

  const getBatteryIcon = (level: number) => {
    if (isCharging) return <BatteryCharging className="w-4 h-4 text-emerald-400 animate-bounce" />
    if (level > 60) return <Battery className="w-4 h-4 text-emerald-400" />
    if (level > 25) return <BatteryMedium className="w-4 h-4 text-amber-400" />
    return <BatteryLow className="w-4 h-4 text-rose-400 animate-pulse" />
  }

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-300 shadow-md ${
        isSelected
          ? 'bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-500/30'
          : 'bg-slate-900/80 hover:bg-slate-900 border-white/10 hover:border-emerald-500/40'
      }`}
    >
      {/* Top Bar: Vehicle ID, Route & Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>🚌⚡ {vehicle.route_number || 'Electric Bus'}</span>
            </span>

            <span className="text-[11px] font-mono font-medium text-slate-300 bg-black/40 px-2 py-0.5 rounded border border-white/10">
              {vehicle.registration || vehicle.vehicle_id}
            </span>

            {/* Operator tag */}
            <span className="text-[10px] font-semibold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              {isGift ? 'GIFT City EV' : 'GGTSL PM-eBus'}
            </span>
          </div>

          <p className="text-sm font-bold text-white mt-1.5 leading-snug">
            {vehicle.route_name || `Bound for ${vehicle.destination}`}
          </p>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <span>To:</span>
            <span className="text-slate-200 font-semibold">{vehicle.destination}</span>
          </p>
        </div>

        {/* Provenance Badge */}
        <div className="text-right shrink-0">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              vehicle.provenance === 'REAL_TIME'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            <span>{vehicle.provenance || 'REAL_TIME'}</span>
          </span>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            {vehicle.delay_minutes === 0
              ? '🟢 On Time'
              : `🔴 +${vehicle.delay_minutes}m delay`}
          </p>
        </div>
      </div>

      {/* Battery SOC & Live Telemetry Meter */}
      <div className="bg-black/30 rounded-lg p-3 border border-white/5 space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            {getBatteryIcon(soc)}
            <span>Battery State of Charge (SOC)</span>
          </span>
          <span className="font-extrabold font-mono text-emerald-400">
            {soc}% {isCharging ? '(Charging)' : ''}
          </span>
        </div>

        {/* Visual Progress Gauge */}
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              soc > 60
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : soc > 25
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : 'bg-gradient-to-r from-rose-500 to-red-600'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, soc))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
          <span className="flex items-center gap-1">
            <Gauge className="w-3 h-3 text-cyan-400" />
            <span>Speed: <strong className="text-white">{vehicle.speed_kmh} km/h</strong></span>
          </span>
          <span>Status: <strong className="text-emerald-300">{vehicle.charging_status || 'IN_SERVICE'}</strong></span>
        </div>
      </div>

      {/* Comfort & Low Floor Badges + Locate Action */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5 text-[11px]">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="inline-flex items-center gap-1 text-emerald-400/90 font-medium">
            <Snowflake className="w-3 h-3" /> AC
          </span>
          <span className="inline-flex items-center gap-1 text-teal-400/90 font-medium">
            <Accessibility className="w-3 h-3" /> Low-Floor
          </span>
          <span className="text-slate-500 font-mono">
            {vehicle.fleet_number ? `Fleet: ${vehicle.fleet_number}` : ''}
          </span>
        </div>

        {onFocusOnMap && (
          <button
            onClick={() => onFocusOnMap(vehicle.latitude, vehicle.longitude)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white font-bold transition-all text-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
            <span>Locate Bus</span>
          </button>
        )}
      </div>
    </div>
  )
}
