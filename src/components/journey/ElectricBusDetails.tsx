import React, { useState, useEffect } from 'react'
import {
  Zap,
  Leaf,
  BatteryCharging,
  Gauge,
  Building,
  Sparkles,
  TreeDeciduous,
  Fuel,
  RefreshCw
} from 'lucide-react'
import { ElectricBusStats } from '../../types/transit'
import { transitApi } from '../../services/transitApi'

export const ElectricBusDetails: React.FC = () => {
  const [stats, setStats] = useState<ElectricBusStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const data = await transitApi.getElectricBusStats()
      if (data) {
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to load electric bus stats', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(() => {
      fetchStats()
    }, 20000)
    return () => clearInterval(interval)
  }, [])

  if (!stats) return null

  const { fleet_metrics, environmental_impact, service_quality } = stats

  return (
    <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-emerald-950/40 p-6 shadow-2xl space-y-6">
      {/* Top Banner: PM-eBus Sewa & GGTSL */}
      <div className="flex items-start justify-between gap-4 flex-wrap border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              <span>PM-eBus Sewa Initiative</span>
            </span>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-300 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
              <Leaf className="w-3 h-3 text-teal-400" />
              <span>Gujarat Green Mobility</span>
            </span>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 text-slate-400 border border-white/10">
              Provenance: {stats.provenance}
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {stats.network_name}
          </h2>
          <p className="text-xs text-slate-300">
            Primary Operator: <strong className="text-emerald-300">{stats.operator}</strong> | Partner: <strong className="text-teal-300">{stats.partner_agency}</strong>
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={isLoading}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-all self-start"
          title="Refresh Fleet Stats"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {/* Dynamic Fleet Deployment Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-black/30 rounded-xl p-3.5 border border-white/10">
          <p className="text-[11px] text-slate-400 font-medium">Total Electric Fleet</p>
          <p className="text-2xl font-black text-white mt-1 font-mono">
            {fleet_metrics.fleet_total} <span className="text-xs font-normal text-slate-400">e-Buses</span>
          </p>
          <p className="text-[10px] text-emerald-400 font-semibold mt-1">100% BEV Contracted</p>
        </div>

        <div className="bg-black/30 rounded-xl p-3.5 border border-white/10">
          <p className="text-[11px] text-slate-400 font-medium">Fleet Deployed</p>
          <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">
            {fleet_metrics.fleet_deployed} <span className="text-xs font-normal text-slate-400">on Road</span>
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Scheduled Operations</p>
        </div>

        <div className="bg-black/30 rounded-xl p-3.5 border border-white/10">
          <p className="text-[11px] text-slate-400 font-medium">Live Active on GPS</p>
          <p className="text-2xl font-black text-teal-300 mt-1 font-mono flex items-center gap-1.5">
            <span>{fleet_metrics.fleet_active}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </p>
          <p className="text-[10px] text-emerald-300 font-semibold mt-1">Real-Time Telemetry</p>
        </div>

        <div className="bg-black/30 rounded-xl p-3.5 border border-white/10">
          <p className="text-[11px] text-slate-400 font-medium">Electrified Network</p>
          <p className="text-2xl font-black text-amber-300 mt-1 font-mono">
            {fleet_metrics.active_routes_count} <span className="text-xs font-normal text-slate-400">Routes</span>
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            {fleet_metrics.electrified_stops_count} Served Stops
          </p>
        </div>
      </div>

      {/* Environmental Impact Counter Banner */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-emerald-950/80 border border-emerald-500/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Daily Green Impact & Zero Emission Achievements
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/60 p-3 rounded-lg border border-white/5">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span>Clean Distance</span>
            </span>
            <p className="text-lg font-bold text-white font-mono mt-1">
              {environmental_impact.clean_km_today.toLocaleString()} km
            </p>
            <p className="text-[10px] text-emerald-400">Traveled Today</p>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-white/5">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>CO₂ Prevented</span>
            </span>
            <p className="text-lg font-bold text-emerald-300 font-mono mt-1">
              {environmental_impact.co2_saved_kg_today.toLocaleString()} kg
            </p>
            <p className="text-[10px] text-slate-400">Zero Tailpipe Emission</p>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-white/5">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
              <span>Diesel Saved</span>
            </span>
            <p className="text-lg font-bold text-amber-300 font-mono mt-1">
              {environmental_impact.diesel_saved_liters_today.toLocaleString()} L
            </p>
            <p className="text-[10px] text-slate-400">Fuel Displaced</p>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-white/5">
            <span className="flex items-center gap-1.5 text-slate-400">
              <TreeDeciduous className="w-3.5 h-3.5 text-teal-400" />
              <span>Tree Equivalent</span>
            </span>
            <p className="text-lg font-bold text-teal-300 font-mono mt-1">
              {environmental_impact.tree_equivalent_co2_offset.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400">Mature Trees/Year</p>
          </div>
        </div>
      </div>

      {/* EV Depots & Charging Infrastructure */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active EV Fast Charging Hubs & Depots:</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {fleet_metrics.ev_depot_locations.map((loc, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/70 border border-white/5 text-xs text-slate-300"
            >
              <Building className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">{loc}</p>
                <p className="text-[10px] text-emerald-400/90 mt-0.5">
                  ⚡ 240kW CCS-2 DC Fast Chargers
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Quality Bar */}
      {service_quality && (
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10 pt-3 flex-wrap gap-2">
          <span>Fleet Electrification: <strong className="text-emerald-400">{service_quality.fleet_electrification_rate}</strong></span>
          <span>On-Time Performance: <strong className="text-white">{service_quality.on_time_performance_pct}%</strong></span>
          <span>Avg Peak Headway: <strong className="text-teal-300">{service_quality.average_peak_headway_mins}m</strong></span>
          <span>Low-Floor Accessible: <strong className="text-emerald-300">{service_quality.low_floor_accessible_pct}%</strong></span>
        </div>
      )}
    </div>
  )
}
