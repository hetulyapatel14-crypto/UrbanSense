import React from 'react'
import {
  AlertTriangle,
  Zap,
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react'
import { ServiceAlertItem } from '../../types/transit'

interface ElectricBusAlertProps {
  alert?: ServiceAlertItem
  title?: string
  description?: string
  severity?: 'INFO' | 'WARNING' | 'CRITICAL'
  routeNumber?: string
  affectedStops?: string[]
  recommendedAlternative?: string
  timeImpactMins?: number
}

export const ElectricBusAlert: React.FC<ElectricBusAlertProps> = ({
  alert,
  title = 'Gandhinagar Green Corridor Advisory',
  description = 'GGTSL electric buses operating with 100% on-time reliability across all sector hubs.',
  severity = 'INFO',
  routeNumber,
  recommendedAlternative,
  timeImpactMins,
}) => {
  const alertTitle = alert?.title || title
  const alertDesc = alert?.description || description
  const alertSev = alert?.severity || severity
  const impact = alert?.delay_impact_mins ?? timeImpactMins

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-950/40 border-rose-500/60 text-rose-300'
      case 'WARNING':
        return 'bg-amber-950/40 border-amber-500/60 text-amber-300'
      default:
        return 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
    }
  }

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      default:
        return <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
    }
  }

  return (
    <div className={`rounded-xl border p-4 shadow-lg transition-all ${getSeverityStyle(alertSev)}`}>
      <div className="flex items-start gap-3">
        {getSeverityIcon(alertSev)}
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-white tracking-tight">
              {alertTitle}
            </h4>
            {routeNumber && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 text-emerald-300 border border-emerald-500/30 font-mono">
                Route {routeNumber}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {alertDesc}
          </p>

          {/* Alternative Route Advice */}
          {recommendedAlternative && (
            <div className="mt-2 p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-200">
              <p className="font-semibold text-emerald-300 flex items-center gap-1.5 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Recommended Alternative Route:</span>
              </p>
              <p className="text-slate-300">{recommendedAlternative}</p>
            </div>
          )}

          {impact && impact > 0 && (
            <p className="text-[11px] font-mono text-amber-300 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Estimated delay impact: +{impact} minutes</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
