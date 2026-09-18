import React from 'react'
import { LucideIcon } from 'lucide-react'

type Accent = 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'slate'

type Tone = 'positive' | 'warning' | 'critical' | 'neutral'

interface KpiCardProps {
  label: string
  value: React.ReactNode
  icon?: LucideIcon
  accent?: Accent
  hint?: React.ReactNode
  trend?: string
  trendTone?: Tone
  delay?: number
  className?: string
}

const accentStyles: Record<Accent, { icon: string; value: string; rail: string }> = {
  blue: {
    icon: 'bg-blue-50 text-blue-600 border-blue-200/80',
    value: 'text-blue-600',
    rail: 'from-blue-500 to-indigo-500',
  },
  indigo: {
    icon: 'bg-indigo-50 text-indigo-600 border-indigo-200/80',
    value: 'text-indigo-600',
    rail: 'from-indigo-500 to-violet-500',
  },
  emerald: {
    icon: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
    value: 'text-emerald-600',
    rail: 'from-emerald-500 to-teal-500',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600 border-amber-200/80',
    value: 'text-amber-600',
    rail: 'from-amber-500 to-orange-500',
  },
  rose: {
    icon: 'bg-rose-50 text-rose-600 border-rose-200/80',
    value: 'text-rose-600',
    rail: 'from-rose-500 to-pink-500',
  },
  cyan: {
    icon: 'bg-cyan-50 text-cyan-600 border-cyan-200/80',
    value: 'text-cyan-600',
    rail: 'from-cyan-500 to-blue-500',
  },
  slate: {
    icon: 'bg-slate-100 text-slate-600 border-slate-200/80',
    value: 'text-slate-800',
    rail: 'from-slate-400 to-slate-600',
  },
}

const trendStyles: Record<Tone, string> = {
  positive: 'text-emerald-700 bg-emerald-50 border-emerald-200/70',
  warning: 'text-amber-700 bg-amber-50 border-amber-200/70',
  critical: 'text-rose-700 bg-rose-50 border-rose-200/70',
  neutral: 'text-slate-600 bg-slate-100 border-slate-200/70',
}

const pillStyles: Record<Tone, string> = {
  positive: 'bg-emerald-500',
  warning: 'bg-amber-500',
  critical: 'bg-rose-500',
  neutral: 'bg-slate-400',
}

/**
 * Premium telemetry tile — animated entrance, hover lift, sheen sweep and a
 * gradient accent rail. Purely presentational.
 */
export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  icon: Icon,
  accent = 'blue',
  hint,
  trend,
  trendTone = 'neutral',
  delay = 0,
  className = '',
}) => {
  const styles = accentStyles[accent]

  return (
    <div
      className={`stat-card accent-top sheen-sweep group ${className}`}
      style={{
        animation: 'fade-in-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Gradient accent rail pinned to the bottom edge */}
      <span
        className={`pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${styles.rail} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3 relative">
        <div className="min-w-0">
          <div className="text-[11px] font-extrabold text-slate-500 mb-1.5 uppercase tracking-wide leading-tight break-words">
            {label}
          </div>
          <div className={`text-2xl lg:text-3xl font-black tracking-tight tabular-nums ${styles.value}`}>
            {value}
          </div>
        </div>

        {Icon && (
          <div
            className={`shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 ${styles.icon}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(hint || trend) && (
        <div className="flex flex-wrap items-center gap-2 mt-3 relative">
          {trend && (
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full border ${trendStyles[trendTone]}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${pillStyles[trendTone]}`} />
              {trend}
            </span>
          )}
          {hint && <span className="text-[11px] text-slate-500 font-medium leading-tight break-words">{hint}</span>}
        </div>
      )}
    </div>
  )
}

export default KpiCard
