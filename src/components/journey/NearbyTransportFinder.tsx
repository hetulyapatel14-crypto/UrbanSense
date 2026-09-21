import React, { useState, useEffect } from 'react'
import {
  Navigation,
  Train,
  Bus,
  Footprints,
  ArrowRight,
  Clock,
  MapPin,
  Compass,
  Building2
} from 'lucide-react'
import { TransitStop } from '../../types/transit'
import { transitApi } from '../../services/transitApi'

interface NearbyTransportFinderProps {
  onSelectOriginStop?: (stopName: string, lat: number, lng: number) => void
  onSelectStopDepartures?: (stopId: string) => void
}

const PRESET_HUBS = [
  // GIFT City
  { name: 'GIFT City FinTech Zone', lat: 23.1600, lng: 72.6840, label: 'GIFT City' },
  { name: 'GIFT Tower 1 & 2 (WTC)', lat: 23.1630, lng: 72.6865, label: 'GIFT Towers' },
  { name: 'GIFT City Club & Omaxe', lat: 23.1550, lng: 72.6810, label: 'GIFT Club' },

  // Gandhinagar
  { name: 'Infocity IT Park & Metro', lat: 23.1965, lng: 72.6288, label: 'Infocity' },
  { name: 'Dholakuva Circle & Metro', lat: 23.2087, lng: 72.6253, label: 'Dholakuva' },
  { name: 'Mahatma Mandir Convention', lat: 23.2590, lng: 72.6520, label: 'Mahatma Mandir' },
  { name: 'Sector 21 Gandhinagar', lat: 23.2380, lng: 72.6420, label: 'Sec 21' },
  { name: 'GNLU Interchange Hub', lat: 23.1540, lng: 72.6500, label: 'GNLU Hub' },
  { name: 'Akshardham Gandhinagar', lat: 23.2300, lng: 72.6730, label: 'Akshardham' },

  // Ahmedabad
  { name: 'Ashram Road (Central)', lat: 23.0415, lng: 72.5710, label: 'Ashram Rd' },
  { name: 'Sabarmati Railway Station', lat: 23.0762, lng: 72.5855, label: 'Sabarmati' },
  { name: 'Kalupur Railway Station', lat: 23.0245, lng: 72.6000, label: 'Kalupur' },
  { name: 'Thaltej Metro Interchange', lat: 23.0525, lng: 72.5165, label: 'Thaltej' },
  { name: 'Iskcon Cross Road (SG Hwy)', lat: 23.0280, lng: 72.5070, label: 'Iskcon' },
  { name: 'Prahlad Nagar Corporate Rd', lat: 23.0120, lng: 72.5080, label: 'Prahlad Nagar' },
  { name: 'Ahmedabad Airport (SVPIA)', lat: 23.0735, lng: 72.6265, label: 'Airport' },
]

export const NearbyTransportFinder: React.FC<NearbyTransportFinderProps> = ({
  onSelectOriginStop,
  onSelectStopDepartures,
}) => {
  const [nearbyStops, setNearbyStops] = useState<TransitStop[]>([])
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; label: string }>({
    lat: 23.0415,
    lng: 72.5710,
    label: 'Ashram Road (Central)'
  })
  const [radiusKm, setRadiusKm] = useState<number>(3.0)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModeFilter, setSelectedModeFilter] = useState<string | undefined>(undefined)
  const [isOutOfArea, setIsOutOfArea] = useState(false)
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null)

  const fetchNearby = async (lat: number, lng: number, radius: number, mode?: string) => {
    setIsLoading(true)
    try {
      const stops = await transitApi.getNearbyStops(lat, lng, radius, mode)
      setNearbyStops(stops)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNearby(userCoords.lat, userCoords.lng, radiusKm, selectedModeFilter)
  }, [userCoords, radiusKm, selectedModeFilter])

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude
          const acc = pos.coords.accuracy
          setGpsAccuracy(acc)

          // Check if coordinates are in Ahmedabad/Gandhinagar region (~22.8 - 23.4 lat, ~72.3 - 72.8 lng)
          const inArea = lat >= 22.8 && lat <= 23.4 && lng >= 72.3 && lng <= 72.8
          setIsOutOfArea(!inArea)
          
          if (inArea) {
            setUserCoords({ lat, lng, label: 'My Current Location' })
          } else {
            // Keep Ahmedabad anchor but inform user
            setUserCoords({ lat: 23.0415, lng: 72.5710, label: 'Ashram Road (Network Center)' })
          }
          setIsLoading(false)
        },
        () => {
          setIsLoading(false)
          setGpsAccuracy(null)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    }
  }

  const getModeIcon = (mode: string) => {
    if (mode === 'METRO') return <Train className="w-4 h-4 text-blue-600" />
    if (mode === 'BRTS') return <Bus className="w-4 h-4 text-orange-600" />
    if (mode === 'GANDHINAGAR_ELECTRIC_BUS') return <Bus className="w-4 h-4 text-emerald-600" />
    return <Bus className="w-4 h-4 text-slate-600" />
  }

  return (
    <div className="u-panel space-y-4 p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              Nearby Stops & Stations
              <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-blue-50 text-blue-700">
                {nearbyStops.length} Found
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Closest transit nodes & pedestrian walking estimates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {gpsAccuracy !== null && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                gpsAccuracy <= 30
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : gpsAccuracy <= 100
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              <span>±{Math.round(gpsAccuracy)}m</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            className="text-xs text-brand-600 hover:text-brand-500 font-semibold flex items-center gap-1.5 bg-iris-50 hover:bg-iris-100/80 px-3 py-1.5 rounded-xl border border-iris-200/60 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-iris-600" />
            <span>Use GPS</span>
          </button>
        </div>
      </div>

      {/* Out-of-area fallback banner */}
      {isOutOfArea && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
          <span>GPS coordinates located outside Ahmedabad-Gandhinagar. Showing central network hubs below.</span>
        </div>
      )}

      {/* Anchor Hub Location Selector */}
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Reference Transit Hub
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {PRESET_HUBS.map((hub) => {
            const isSelected = userCoords.label === hub.name || (userCoords.lat === hub.lat && userCoords.lng === hub.lng)
            return (
              <button
                key={hub.name}
                type="button"
                onClick={() => {
                  setIsOutOfArea(false)
                  setGpsAccuracy(null)
                  setUserCoords({ lat: hub.lat, lng: hub.lng, label: hub.name })
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-brand-500 text-white border-brand-500 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-3 h-3" />
                <span>{hub.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Mode and Radius Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {/* Mode Filter Pills */}
        <div className="flex items-center gap-1 text-xs">
          {[
            { id: undefined, label: 'All Modes' },
            { id: 'METRO', label: 'Metro' },
            { id: 'GANDHINAGAR_ELECTRIC_BUS', label: '⚡ e-Bus' },
            { id: 'BRTS', label: 'BRTS' },
            { id: 'AMTS', label: 'AMTS' },
          ].map((item) => {
            const isSelected = selectedModeFilter === item.id
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setSelectedModeFilter(item.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold border transition-all text-[11px] ${
                  isSelected
                    ? 'border-line-strong bg-surface-4 text-ink shadow-e1'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Radius Filter */}
        <div className="flex items-center gap-1 text-xs">
          {[
            { r: 1.5, label: '1.5 km' },
            { r: 3.0, label: '3 km' },
            { r: 5.0, label: '5 km' },
            { r: 15.0, label: 'All Hubs' },
          ].map((item) => {
            const isSelected = radiusKm === item.r
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setRadiusKm(item.r)}
                className={`px-2 py-0.5 rounded-md font-semibold border text-[10px] transition-all ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                    : 'border-line bg-surface-2/60 text-ink-muted hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Stops List */}
      <div className="space-y-2 pt-1">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Calculating nearby transit stops & walking routes...</span>
          </div>
        ) : nearbyStops.length > 0 ? (
          nearbyStops.slice(0, 7).map((stop) => (
            <div
              key={stop.stop_id}
              className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-all flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  {getModeIcon(stop.mode)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">{stop.name}</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase">
                      {stop.mode}
                    </span>
                    {stop.is_interchange && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">
                        HUB
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>
                      {(stop.distance_m || 0) < 1000
                        ? `${stop.distance_m || 0} m away`
                        : `${((stop.distance_m || 0) / 1000).toFixed(1)} km away`}
                    </span>
                    <span>•</span>
                    <span className="text-iris-600 font-semibold flex items-center gap-1">
                      <Footprints className="w-3 h-3" />
                      ~{stop.walking_time_mins || Math.max(1, Math.round((stop.distance_m || 100) / 75))} min walk
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
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-iris-50 hover:text-iris-600 text-slate-700 text-xs font-semibold transition-all shadow-2xs"
                    title="View Station Departures"
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </button>
                )}
                {onSelectOriginStop && (
                  <button
                    type="button"
                    onClick={() => onSelectOriginStop(stop.name, stop.latitude, stop.longitude)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-500 hover:text-white text-slate-700 text-xs font-semibold transition-all flex items-center gap-1 shadow-2xs"
                  >
                    <span>Set Origin</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 space-y-2">
            <div>No stops found for this filter.</div>
            <button
              type="button"
              onClick={() => {
                setRadiusKm(15.0)
                setSelectedModeFilter(undefined)
              }}
              className="text-blue-600 font-semibold hover:underline text-xs"
            >
              Expand to all network hubs
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
