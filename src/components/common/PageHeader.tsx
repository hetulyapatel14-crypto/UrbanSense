import React from 'react'
import { LucideIcon } from 'lucide-react'

type LiveTone = 'emerald' | 'blue' | 'amber' | 'rose'

interface PageHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
  icon?: LucideIcon
  accent?: string
  live?: {
    label: string
    tone?: LiveTone
    pulse?: boolean
  }
  meta?: React.ReactNode
  actions?: React.ReactNode
  children?: React.ReactNode
}

const liveToneStyles: Record<LiveTone, { pill: string; dot: string }> = {
  emerald: {
    pill: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  blue: {
    pill: 'text-blue-700 bg-blue-50 border-blue-200',
    dot: 'bg-blue-500',
  },
  amber: {
    pill: 'text-amber-700 bg-amber-50 border-amber-200',
    dot: 'bg-amber-500',
  },
  rose: {
    pill: 'text-rose-700 bg-rose-50 border-rose-200',
    dot: 'bg-rose-500',
  },
}

/**
 * Shared premium page header for the dashboard modules: glass surface,
 * animated aurora wash, gradient icon tile and a live telemetry pill.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  icon: Icon,
  accent = 'from-blue-600 via-indigo-600 to-cyan-600',
  live,
  meta,
  actions,
  children,
}) => {
  const tone = live?.tone ?? 'emerald'
  const toneStyle = liveToneStyles[tone]

  return (
    <header className="relative bg-white/85 backdrop-blur-xl border-b border-slate-200/80 px-6 py-4 sticky top-0 z-20 shadow-sm">
      {/* Ambient aurora wash */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-70"
        aria-hidden="true"
      >
        <div className="absolute -top-24 -left-16 w-[28rem] h-48 bg-gradient-to-tr from-blue-400/15 via-indigo-400/10 to-transparent blur-3xl rounded-full animate-aurora" />
        <div className="absolute -top-20 right-10 w-80 h-40 bg-gradient-to-tr from-cyan-400/12 to-transparent blur-3xl rounded-full animate-aurora" />
      </div>

      {/* Gradient hairline */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent"
        aria-hidden="true"
      />

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {Icon && (
            <div
              className={`shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-tr ${accent} text-white flex items-center justify-center shadow-md shadow-blue-500/20 transition-transform duration-500 hover:scale-105 hover:rotate-3`}
            >
              <Icon className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-2">
              {eyebrow && (
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full">
                  {eyebrow}
                </span>
              )}
              <h1 className="text-xl md:text-[1.35rem] font-extrabold text-slate-900 tracking-tight animate-fade-in-up">
                {title}
              </h1>
            </div>

            <div className="flex items-center flex-wrap gap-2 mt-1">
              {live && (
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-bold border px-2.5 py-0.5 rounded-full ${toneStyle.pill}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${toneStyle.dot} ${
                      live.pulse === false ? '' : 'live-dot'
                    }`}
                  />
                  {live.label}
                </span>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 font-medium truncate max-w-3xl">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {(meta || actions) && (
          <div className="flex items-center flex-wrap gap-3">
            {meta}
            {actions}
          </div>
        )}
      </div>

      {children && <div className="relative mt-4">{children}</div>}
    </header>
  )
}

export default PageHeader
