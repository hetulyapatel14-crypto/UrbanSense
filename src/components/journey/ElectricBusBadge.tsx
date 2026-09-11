import React from 'react'
import { Zap, Leaf } from 'lucide-react'

interface ElectricBusBadgeProps {
  routeNumber?: string
  operator?: 'GGTSL' | 'GIFT_TRANSIT' | 'GANDHINAGAR_TRANSIT' | string
  size?: 'sm' | 'md' | 'lg'
  showZeroEmission?: boolean
  showOperator?: boolean
  className?: string
}

export const ElectricBusBadge: React.FC<ElectricBusBadgeProps> = ({
  routeNumber,
  operator = 'GGTSL',
  size = 'md',
  showZeroEmission = true,
  showOperator = true,
  className = '',
}) => {
  const isGift = operator.includes('GIFT')

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }

  return (
    <div className={`inline-flex items-center flex-wrap gap-1.5 ${className}`}>
      {/* Primary Electric Bus Badge */}
      <span
        className={`inline-flex items-center font-bold tracking-wide rounded-full border shadow-sm transition-all duration-300 ${
          sizeClasses[size]
        } ${
          isGift
            ? 'bg-gradient-to-r from-teal-950/80 to-emerald-950/80 border-teal-500/40 text-teal-300 shadow-teal-950/50'
            : 'bg-gradient-to-r from-emerald-950/90 via-emerald-900/70 to-teal-950/90 border-emerald-500/40 text-emerald-300 shadow-emerald-950/50'
        }`}
      >
        <span className="relative flex items-center justify-center">
          <Zap className={`${iconSizes[size]} text-emerald-400 fill-emerald-400 animate-pulse`} />
        </span>
        <span className="font-extrabold text-white">
          {routeNumber ? `🚌⚡ ${routeNumber}` : '🚌⚡ Gandhinagar Electric Bus'}
        </span>
        {showOperator && (
          <span className="opacity-80 text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 border border-white/10 ml-0.5">
            {isGift ? 'GIFT City EV' : 'GGTSL PM-eBus'}
          </span>
        )}
      </span>

      {/* Zero Emission Tag */}
      {showZeroEmission && (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          <Leaf className="w-2.5 h-2.5 text-emerald-400" />
          <span>100% Electric (Zero Emission)</span>
        </span>
      )}
    </div>
  )
}
