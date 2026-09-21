import React from 'react'

interface UrbanSenseLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  subtext?: string
  className?: string
  /** `color` = accent tile, `dark` = solid ink tile, `mono` = bare mark inheriting currentColor. */
  variant?: 'color' | 'dark' | 'mono'
  id?: string
}

const ICON_SIZE: Record<string, string> = {
  xs: 'w-5 h-5',
  sm: 'w-7 h-7',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12',
}

const TEXT_SIZE: Record<string, string> = {
  xs: 'text-[13px]',
  sm: 'text-[15px]',
  md: 'text-[17px]',
  lg: 'text-[20px]',
  xl: 'text-[23px]',
}

/**
 * UrbanSense brand mark — a beacon node (a city block rotated into a diamond)
 * with four junction satellites, standing for a sensing grid that reads the
 * city from every direction. Rendered on a machined accent tile with a
 * top-left specular highlight.
 */
export const UrbanSenseMark: React.FC<{
  className?: string
  variant?: 'color' | 'dark' | 'mono'
  gradientId?: string
}> = ({ className = '', variant = 'color', gradientId = 'us-mark-grad' }) => {
  const isMono = variant === 'mono'
  const stroke = isMono ? 'currentColor' : '#FFFFFF'
  const node = isMono ? 'currentColor' : '#FFD3D7'

  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7680" />
          <stop offset="1" stopColor="#E93A49" />
        </linearGradient>
      </defs>

      {!isMono && (
        <g>
          <rect width="32" height="32" rx="9" fill={variant === 'dark' ? '#2d3436' : `url(#${gradientId})`} />
          {/* Top-left specular highlight — machined tile under the light */}
          <rect x="1" y="1" width="30" height="14" rx="8" fill="rgba(255,255,255,0.16)" />
          <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" stroke="rgba(255,255,255,0.25)" />
        </g>
      )}
      {variant === 'dark' && (
        <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" stroke="rgba(255,255,255,0.10)" />
      )}

      {/* Beacon field */}
      <path
        d="M16 7.1 24.9 16 16 24.9 7.1 16Z"
        stroke={stroke}
        strokeOpacity={isMono ? 0.5 : 0.9}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      {/* Sensing core */}
      <path d="M16 12.9 19.1 16 16 19.1 12.9 16Z" fill={isMono ? 'currentColor' : '#FFFFFF'} />
      {/* Junction satellites */}
      <circle cx="16" cy="7.1" r="1.6" fill={node} />
      <circle cx="24.9" cy="16" r="1.6" fill={node} />
      <circle cx="16" cy="24.9" r="1.6" fill={node} />
      <circle cx="7.1" cy="16" r="1.6" fill={node} />
    </svg>
  )
}

export const UrbanSenseLogo: React.FC<UrbanSenseLogoProps> = ({
  size = 'md',
  showText = true,
  subtext,
  className = '',
  variant = 'color',
  id = 'logo',
}) => {
  return (
    <div className={`inline-flex select-none items-center gap-2.5 ${className}`}>
      <UrbanSenseMark
        className={`${ICON_SIZE[size]} shrink-0 rounded-[9px] shadow-key`}
        variant={variant}
        gradientId={`us-grad-${id}`}
      />

      {showText && (
        <div className="flex flex-col leading-none">
          <div className={`font-bold tracking-[-0.03em] text-ink u-emboss ${TEXT_SIZE[size]}`}>
            Urban<span className="text-brand-600">Sense</span>
          </div>
          {subtext ? (
            <span className="mt-[3px] font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
              {subtext}
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default UrbanSenseLogo
