import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Compass } from 'lucide-react'
import { TransitMap } from './TransitMap'
import { JourneyRouteOption, LiveVehicle, TransitStop } from '../../types/transit'

interface TransitMapModalProps {
  isOpen: boolean
  onClose: () => void
  route: JourneyRouteOption | null
  liveVehicles: LiveVehicle[]
  selectedStop?: TransitStop | null
  onSelectVehicle?: (vehicleId: string) => void
}

export const TransitMapModal: React.FC<TransitMapModalProps> = ({
  isOpen,
  onClose,
  route,
  liveVehicles,
  selectedStop,
  onSelectVehicle,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-surface-0/75 p-3 backdrop-blur-md transition-all animate-fade sm:p-5 md:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="animate-pop relative flex h-[88vh] max-h-[900px] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-line bg-surface-1 shadow-float">
        {/* Modal Top Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-line bg-surface-2 px-5 py-3.5">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-brand-200 bg-brand-50 text-brand-600">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-tight text-ink">Transit map</h2>
                <span className="u-chip u-chip-brand">
                  Multimodal
                </span>
              </div>
              <p className="text-[11px] text-ink-muted">
                {route
                  ? `Showing Route: ${route.summary_title} • ${route.duration_minutes} min (₹${route.fare})`
                  : 'Ahmedabad ↔ Gandhinagar ↔ GIFT City Transit Network'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <span className="hidden sm:flex text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{liveVehicles.length} Live Vehicles</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close Map (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Map Body */}
        <div className="flex-1 min-h-0 w-full relative">
          <TransitMap
            route={route}
            liveVehicles={liveVehicles}
            selectedStop={selectedStop}
            onSelectVehicle={onSelectVehicle}
          />
        </div>
      </div>
    </div>,
    document.body
  )
}

export default TransitMapModal
