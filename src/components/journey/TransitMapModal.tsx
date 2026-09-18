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
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-slate-900/60 backdrop-blur-md transition-all animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 w-full max-w-6xl h-[88vh] max-h-[900px] flex flex-col relative animate-scaleIn">
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black tracking-tight">Interactive Transit GIS Map</h2>
                <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase">
                  Multimodal
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
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
