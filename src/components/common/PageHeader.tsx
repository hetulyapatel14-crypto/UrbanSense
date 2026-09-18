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
    pill: 'text-emerald-700 bg-emerald-50/90 border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  blue: {
    pill: 'text-blue-700 bg-blue-50/90 border-blue-200/80',
    dot: 'bg-blue-500',
  },
  amber: {
    pill: 'text-amber-700 bg-amber-50/90 border-amber-200/80',
    dot: 'bg-amber-500',
  },
  rose: {
    pill: 'text-rose-700 bg-rose-50/90 border-rose-200/80',
    dot: 'bg-rose-500',
  },
}

/**
 * Simplified, clean, single-row header component for dashboard modules.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  icon: Icon,
  accent = 'from-blue-600 to-indigo-600',
  live,
  meta,
  actions,
  children,
}) => {
  const tone = live?.tone ?? 'emerald'
  const toneStyle = liveToneStyles[tone]

  return (
    <header className="relative bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3 sticky top-0 z-20 shadow-2xs">
      <div className="flex items-center justify-between gap-4">
        {/* Left: icon + title + status/subtitle */}
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div
              className={`shrink-0 w-8 h-8 rounded-lg bg-gradient-to-tr ${accent} text-white flex items-center justify-center shadow-xs`}
            >
              <Icon className="w-4 h-4" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight truncate">
                {title}
              </h1>

              {live && (
                <span
                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold border px-2 py-0.5 rounded-full ${toneStyle.pill}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${toneStyle.dot} ${
                      live.pulse === false ? '' : 'live-dot'
                    }`}
                  />
                  <span>{live.label}</span>
                </span>
              )}

              {eyebrow && !live && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200/70 px-1.5 py-0.5 rounded">
                  {eyebrow}
                </span>
              )}
            </div>

            {subtitle && (
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: meta info & action buttons */}
        {(meta || actions) && (
          <div className="flex items-center gap-2.5 shrink-0">
            {meta}
            {actions}
          </div>
        )}
      </div>

      {children && <div className="mt-2.5 pt-2.5 border-t border-slate-100">{children}</div>}
    </header>
  )
}

export default PageHeader
