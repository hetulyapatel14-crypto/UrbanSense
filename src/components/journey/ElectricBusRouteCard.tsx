import React, { useState } from 'react'
import {
  Zap,
  Clock,
  ChevronDown,
  ChevronUp,
  Snowflake,
  Accessibility,
  IndianRupee,
  Navigation,
  ArrowRight
} from 'lucide-react'
import { ElectricBusRoute } from '../../types/transit'
import { ElectricBusBadge } from './ElectricBusBadge'

interface ElectricBusRouteCardProps {
  route: ElectricBusRoute
  onSelectRoute?: (route: ElectricBusRoute) => void
  onPlanTripToRoute?: (origin: string, destination: string) => void
}

export const ElectricBusRouteCard: React.FC<ElectricBusRouteCardProps> = ({
  route,
  onPlanTripToRoute,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const isGift = route.operator_code.includes('GIFT')

  return (
    <div
      className={`rounded-xl border transition-all duration-300 overflow-hidden shadow-lg ${
        isGift
          ? 'bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-teal-950/30 border-teal-500/30 hover:border-teal-400/60'
          : 'bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-emerald-950/30 border-emerald-500/30 hover:border-emerald-400/60'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <ElectricBusBadge
              routeNumber={route.route_number}
              operator={route.operator_code}
              size="md"
              showZeroEmission={false}
            />
            <span className="text-[11px] font-semibold text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              ⚡ {route.electrification_level}
            </span>
          </div>

          <h3 className="text-base font-bold text-white tracking-tight leading-snug">
            {route.route_name}
          </h3>

          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
            <span className="text-slate-300 font-medium">{route.origin}</span>
            <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="text-slate-300 font-medium">{route.destination}</span>
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="inline-flex items-center gap-1 text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <IndianRupee className="w-3.5 h-3.5" />
            <span>{route.fare_min} - {route.fare_max}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Affordable Fare</p>
        </div>
      </div>

      {/* Quick Specs Grid */}
      <div className="grid grid-cols-3 divide-x divide-white/5 bg-black/20 p-3 text-xs">
        <div className="px-2 text-center">
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Peak Headway</p>
          <p className="text-white font-semibold flex items-center justify-center gap-1 mt-0.5">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Every {route.peak_frequency_minutes}m</span>
          </p>
        </div>

        <div className="px-2 text-center">
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Service Hours</p>
          <p className="text-slate-200 font-semibold flex items-center justify-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{route.operating_hours}</span>
          </p>
        </div>

        <div className="px-2 text-center">
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Operator</p>
          <p className="text-emerald-300 font-semibold truncate mt-0.5">
            {isGift ? 'GIFT City EV' : 'GGTSL PM-eBus'}
          </p>
        </div>
      </div>

      {/* Features strip */}
      <div className="px-4 py-2 bg-emerald-950/20 border-t border-b border-white/5 flex items-center justify-between text-[11px] text-slate-300 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <Snowflake className="w-3.5 h-3.5" /> 100% Air Conditioned
          </span>
          <span className="flex items-center gap-1 text-teal-400">
            <Accessibility className="w-3.5 h-3.5" /> Low Floor & Wheelchair
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors ml-auto text-xs"
        >
          <span>{route.stops?.length || route.stops_count || 8} Stops</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Stops Sequence */}
      {isExpanded && route.stops && (
        <div className="p-4 bg-black/40 border-t border-white/5 max-h-60 overflow-y-auto space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Route Stop Sequence:
          </p>
          <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-500/40">
            {route.stops.map((s, idx) => (
              <div key={s.stop_id || idx} className="relative flex items-start justify-between gap-2 text-xs">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
                <div>
                  <p className="font-semibold text-white">{s.name}</p>
                  {s.gujarati_name && (
                    <p className="text-[10px] text-slate-400 font-gujarati">{s.gujarati_name}</p>
                  )}
                  {s.is_major_hub && (
                    <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Interchange Hub
                    </span>
                  )}
                </div>
                {s.distance_from_start_km > 0 && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    {s.distance_from_start_km.toFixed(1)} km
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-3 bg-slate-900/60 border-t border-white/5 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400 font-mono truncate">
          Off-peak: {route.off_peak_frequency_minutes}m frequency
        </span>

        {onPlanTripToRoute && (
          <button
            onClick={() => onPlanTripToRoute(route.origin, route.destination)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Plan Journey on this Route</span>
          </button>
        )}
      </div>
    </div>
  )
}
