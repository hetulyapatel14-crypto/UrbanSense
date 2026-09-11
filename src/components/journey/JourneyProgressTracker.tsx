import React, { useState, useEffect } from 'react'
import {
  CheckCircle2,
  Footprints,
  Train,
  Bus,
  Zap,
  ArrowRight,
  AlertTriangle,
  X
} from 'lucide-react'
import { JourneyRouteOption, JourneyStep } from '../../types/transit'

interface JourneyProgressTrackerProps {
  route: JourneyRouteOption
  onClose: () => void
  onFocusStepOnMap?: (coordinates: [number, number][]) => void
}

export const JourneyProgressTracker: React.FC<JourneyProgressTrackerProps> = ({
  route,
  onClose,
  onFocusStepOnMap,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [elapsedMinutes, setElapsedMinutes] = useState(0)
  const steps = route.steps || []
  const currentStep = steps[currentStepIndex] || steps[0]

  // Simulated elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedMinutes(prev => prev + 1)
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const totalMinutes = route.duration_minutes || 35
  const remainingMinutes = Math.max(0, totalMinutes - elapsedMinutes)
  const progressPct = Math.min(100, Math.round(((currentStepIndex + 0.5) / Math.max(1, steps.length)) * 100))

  const getStepIcon = (step: JourneyStep) => {
    if (step.step_type === 'WALK') return <Footprints className="w-4 h-4 text-amber-400" />
    if (step.mode === 'GANDHINAGAR_ELECTRIC_BUS' || step.mode?.includes('ELECTRIC'))
      return <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
    if (step.mode === 'METRO') return <Train className="w-4 h-4 text-red-400" />
    if (step.mode === 'BRTS') return <Bus className="w-4 h-4 text-amber-400" />
    return <Bus className="w-4 h-4 text-cyan-400" />
  }

  return (
    <div className="fixed inset-x-4 bottom-4 md:inset-x-auto md:right-6 md:bottom-6 md:w-[460px] z-50 rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-b from-slate-900/98 via-slate-900/95 to-slate-950 p-5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom duration-300">
      {/* Companion Mode Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
            📍 LIVE COMPANION MODE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-full border border-white/10">
            {remainingMinutes}m remaining
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Exit Companion Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Step Progress Bar */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Step {currentStepIndex + 1} of {steps.length}</span>
          <span className="text-emerald-400 font-bold">{progressPct}% Completed</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-white/10 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500 shadow-sm shadow-emerald-500/50"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Active Current Step Focus Card */}
      {currentStep && (
        <div className="bg-black/40 rounded-xl p-4 border border-emerald-500/40 space-y-3 mb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                {getStepIcon(currentStep)}
              </span>
              <div>
                <p className="text-sm font-bold text-white leading-tight">
                  {currentStep.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentStep.from_name} ➔ {currentStep.to_name}
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 shrink-0">
              ~{currentStep.duration_mins} min
            </span>
          </div>

          <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-white/5 leading-relaxed">
            {currentStep.instructions}
          </p>

          {/* Platform / Stand Reminder */}
          {(currentStep.from_platform || currentStep.platform_info) && (
            <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 bg-cyan-950/30 px-3 py-1.5 rounded-lg border border-cyan-500/20">
              <span>Platform / Bay:</span>
              <strong className="text-white">{currentStep.from_platform || currentStep.platform_info}</strong>
            </div>
          )}

          {/* High risk transfer warning if on tight transfer step */}
          {currentStep.is_tight && (
            <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
              <span>{currentStep.tight_transfer_warning || 'Connection window is tight! Walk briskly to the next stand.'}</span>
            </div>
          )}
        </div>
      )}

      {/* Step Navigation Controls */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
          disabled={currentStepIndex === 0}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          Previous Step
        </button>

        {currentStepIndex < steps.length - 1 ? (
          <button
            onClick={() => {
              const nextIdx = currentStepIndex + 1
              setCurrentStepIndex(nextIdx)
              if (onFocusStepOnMap && steps[nextIdx]?.coordinates) {
                onFocusStepOnMap(steps[nextIdx].coordinates)
              }
            }}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold transition-all shadow-md shadow-emerald-950 flex items-center justify-center gap-1.5"
          >
            <span>Next Step: {steps[currentStepIndex + 1]?.title?.slice(0, 20)}...</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-extrabold transition-all shadow-md shadow-emerald-950 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Journey</span>
          </button>
        )}
      </div>
    </div>
  )
}
