import React from 'react'
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Footprints,
  Zap,
  Accessibility
} from 'lucide-react'

interface ElectricBusTransferProps {
  fromMode: string
  toMode: string
  stationName: string
  walkMinutes: number
  availableWindowMinutes: number
  isTight?: boolean
  nextSafeDeparture?: string
  fromPlatform?: string
  toPlatform?: string
  instructions?: string
  isStepFree?: boolean
}

export const ElectricBusTransfer: React.FC<ElectricBusTransferProps> = ({
  fromMode,
  toMode,
  stationName,
  walkMinutes = 3,
  availableWindowMinutes = 6,
  isTight = false,
  nextSafeDeparture,
  fromPlatform,
  toPlatform,
  instructions,
  isStepFree = true,
}) => {
  const isEBus = toMode === 'GANDHINAGAR_ELECTRIC_BUS' || toMode.includes('ELECTRIC')

  return (
    <div
      className={`rounded-xl border p-4 my-2 transition-all ${
        isTight
          ? 'bg-rose-950/30 border-rose-500/50 shadow-rose-950/40'
          : 'bg-emerald-950/20 border-emerald-500/30 shadow-emerald-950/30'
      }`}
    >
      {/* Header: Transfer Badge & Risk Indicator */}
      <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
            <Footprints className="w-4 h-4" />
          </span>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Interchange Connection @ {stationName}
          </h4>
        </div>

        {/* Tight Transfer Warning or Protected Connection */}
        {isTight ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>🔴 HIGH RISK TRANSFER</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Protected Connection ({availableWindowMinutes}m window)</span>
          </span>
        )}
      </div>

      {/* Transfer Details Grid */}
      <div className="bg-black/40 rounded-lg p-3 border border-white/5 space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white">{fromMode}</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-emerald-300 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-emerald-400 text-emerald-400" />
              <span>{isEBus ? 'Gandhinagar Electric Bus' : toMode}</span>
            </span>
          </div>

          <span className="text-slate-400 font-mono">
            ~{walkMinutes} min walk
          </span>
        </div>

        {/* Platform Guidance */}
        {(fromPlatform || toPlatform) && (
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-white/5">
            <span>From: <strong className="text-white">{fromPlatform || 'Main Concourse'}</strong></span>
            <span>To: <strong className="text-emerald-300">{toPlatform || 'Electric Bus Stand'}</strong></span>
          </div>
        )}

        {/* Custom Transfer Instructions */}
        {instructions && (
          <p className="text-[11px] text-slate-300 pt-1 border-t border-white/5">
            {instructions}
          </p>
        )}
      </div>

      {/* High-Risk Transfer Safe Alternate Advice */}
      {isTight && (
        <div className="mt-2.5 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
          <p className="font-bold text-rose-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Connection is tight ({availableWindowMinutes}m window vs {walkMinutes}m walk)</span>
          </p>
          <p className="text-slate-300 text-[11px]">
            If you miss this connection, the next safe scheduled bus departs at{' '}
            <strong className="text-emerald-300 font-mono">
              {nextSafeDeparture || 'subsequent scheduled departure (+10-15m)'}
            </strong>.
          </p>
        </div>
      )}

      {/* Accessibility */}
      {isStepFree && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-teal-400/90 font-medium">
          <Accessibility className="w-3 h-3" />
          <span>Step-Free Accessible Route (Elevator & tactile path available)</span>
        </div>
      )}
    </div>
  )
}
