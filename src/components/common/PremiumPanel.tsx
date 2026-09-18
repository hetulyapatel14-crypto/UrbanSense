import React from 'react'
import { LucideIcon } from 'lucide-react'

interface PremiumPanelProps {
  title?: string
  subtitle?: string
  icon?: LucideIcon
  badge?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  headerClassName?: string
  bodyClassName?: string
  /** Renders the header row without the surrounding body padding. */
  flush?: boolean
}

/**
 * Premium dashboard panel — glass header, gradient hairline, hover elevation
 * and an optional icon tile. Content is rendered untouched.
 */
export const PremiumPanel: React.FC<PremiumPanelProps> = ({
  title,
  subtitle,
  icon: Icon,
  badge,
  actions,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = 'p-5',
  flush = false,
}) => {
  return (
    <section className={`group/panel panel-premium relative ${className}`}>
      {/* Hairline top highlight */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
        aria-hidden="true"
      />

      {(title || actions || badge) && (
        <div
          className={`relative px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/70 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3 ${headerClassName}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <span className="shrink-0 w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center shadow-2xs transition-all duration-500 group-hover/panel:scale-105 group-hover/panel:text-blue-600 group-hover/panel:border-blue-200">
                <Icon className="w-4 h-4" />
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h2 className="font-bold text-slate-900 text-sm tracking-tight uppercase leading-tight break-words">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-[11px] text-slate-500 font-medium leading-tight break-words">{subtitle}</p>
              )}
            </div>
            {badge}
          </div>

          {actions && <div className="flex items-center flex-wrap gap-2">{actions}</div>}
        </div>
      )}

      <div className={flush ? 'relative' : `relative ${bodyClassName}`}>{children}</div>
    </section>
  )
}

export default PremiumPanel
