import React, { useState, useEffect } from 'react'
import {
  Navigation,
  Train,
  Bus,
  Footprints,
  ArrowRight,
  Clock
} from 'lucide-react'
import { TransitStop } from '../../types/transit'
import { transitApi } from '../../services/transitApi'

interface NearbyTransportFinderProps {
  onSelectOriginStop?: (stopName: string, lat: number, lng: number) => void
  onSelectStopDepartures?: (stopId: string) => void
}

export const NearbyTransportFinder: React.FC<NearbyTransportFinderProps> = ({
  onSelectOriginStop,
  onSelectStopDepartures,
}) => {
  const [nearbyStops, setNearbyStops] = useState<TransitStop[]>([])
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 23.0415, lng: 72.5710 }) // Ashram Road default
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModeFilter, setSelectedModeFilter] = useState<string | undefined>(undefined)

  const fetchNearby = async (lat: number, lng: number, mode?: string) => {
    setIsLoading(true)
    try {
      const stops = await transitApi.getNearbyStops(lat, lng, 2.5, mode)
      setNearbyStops(stops)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNearby(userCoords.lat, userCoords.lng, selectedModeFilter)
  }, [userCoords, selectedModeFilter])

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setUserCoords(coords)
          fetchNearby(coords.lat, coords.lng, selectedModeFilter)
        },
        () => {
          // Keep default
        }
      )
    }
  }

  const getModeIcon = (mode: string) => {
    if (mode === 'METRO') return <Train className="w-4 h-4 text-blue-600" />
    if (mode === 'BRTS') return <Bus className="w-4 h-4 text-orange-600" />
    return <Bus className="w-4 h-4 text-emerald-600" />
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Nearby Stops</h3>
            <p className="text-[11px] text-slate-500">Closest stations & walking times</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200/60 transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Refresh GPS</span>
        </button>
      </div>

      {/* Mode Filter Pills */}
      <div className="flex items-center gap-1.5 text-xs">
        {[
          { id: undefined, label: 'All' },
          { id: 'METRO', label: 'Metro' },
          { id: 'BRTS', label: 'BRTS' },
          { id: 'AMTS', label: 'AMTS' },
        ].map((item) => {
          const isSelected = selectedModeFilter === item.id
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setSelectedModeFilter(item.id)}
              className={`px-3 py-1 rounded-lg font-semibold border transition-all text-[11px] ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Stops List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="py-6 text-center text-xs text-slate-400">Locating nearby transport stops...</div>
        ) : nearbyStops.length > 0 ? (
          nearbyStops.slice(0, 6).map((stop) => (
            <div
              key={stop.stop_id}
              className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  {getModeIcon(stop.mode)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">{stop.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {stop.mode}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{stop.distance_m} m away</span>
                    <span>•</span>
                    <span className="text-blue-600 font-semibold flex items-center gap-1">
                      <Footprints className="w-3 h-3" />
                      ~{stop.walking_time_mins} min walk
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1.5">
                {onSelectStopDepartures && (
                  <button
                    type="button"
                    onClick={() => onSelectStopDepartures(stop.stop_id)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-2xs"
                    title="View Live Departures"
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </button>
                )}
                {onSelectOriginStop && (
                  <button
                    type="button"
                    onClick={() => onSelectOriginStop(stop.name, stop.latitude, stop.longitude)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-semibold transition-all flex items-center gap-1 shadow-2xs"
                  >
                    <span>Set Origin</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">No stops found within 2.5 km radius</div>
        )}
      </div>
    </div>
  )
}
