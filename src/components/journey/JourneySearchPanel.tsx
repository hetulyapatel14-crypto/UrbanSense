import React, { useState, useEffect, useRef } from 'react'
import {
  MapPin,
  Navigation,
  ArrowUpDown,
  Zap,
  DollarSign,
  Footprints,
  Shuffle,
  ShieldCheck,
  Accessibility,
  X,
  Sparkles
} from 'lucide-react'
import { LocationSearchResult } from '../../types/transit'
import { transitApi } from '../../services/transitApi'

interface JourneySearchPanelProps {
  onSearch: (params: {
    from: string
    to: string
    from_lat?: number
    from_lng?: number
    to_lat?: number
    to_lng?: number
    departure?: string
    arrive_by?: string
    preference: string
    modes: string[]
    wheelchair: boolean
  }) => void
  isLoading?: boolean
  initialFrom?: string
  initialTo?: string
}

export const POPULAR_LANDMARKS = [
  { name: 'Sabarmati', fullName: 'Sabarmati Railway Station' },
  { name: 'GIFT City', fullName: 'GIFT City' },
  { name: 'Infocity', fullName: 'Infocity Gandhinagar' },
  { name: 'Sector 21', fullName: 'Gandhinagar Sector 21' },
  { name: 'Thaltej', fullName: 'Thaltej' },
  { name: 'Kalupur', fullName: 'Kalupur Railway Station' },
  { name: 'Airport', fullName: 'Ahmedabad Airport (SVPIA)' },
  { name: 'Mahatma Mandir', fullName: 'Mahatma Mandir' },
  { name: 'Iskcon Cross', fullName: 'Iskcon Cross Road' },
  { name: 'Science City', fullName: 'Science City' },
]

export const JourneySearchPanel: React.FC<JourneySearchPanelProps> = ({
  onSearch,
  isLoading = false,
  initialFrom = 'Sabarmati Railway Station',
  initialTo = 'GIFT City'
}) => {
  const [fromLocation, setFromLocation] = useState(initialFrom)
  const [toLocation, setToLocation] = useState(initialTo)
  const [fromCoords, setFromCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [toCoords, setToCoords] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (initialFrom) setFromLocation(initialFrom)
  }, [initialFrom])

  useEffect(() => {
    if (initialTo) setToLocation(initialTo)
  }, [initialTo])

  const [fromSuggestions, setFromSuggestions] = useState<LocationSearchResult[]>([])
  const [toSuggestions, setToSuggestions] = useState<LocationSearchResult[]>([])
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)

  const [timeMode, setTimeMode] = useState<'NOW' | 'DEPART_AT' | 'ARRIVE_BY'>('NOW')
  const [selectedTime, setSelectedTime] = useState('15:30')
  const [preference, setPreference] = useState<'fastest' | 'cheapest' | 'least_walking' | 'fewest_transfers' | 'most_reliable' | 'min_wait'>('fastest')
  
  const [selectedModes, setSelectedModes] = useState<string[]>(['METRO', 'BRTS', 'AMTS', 'RAIL', 'BUS', 'WALK'])
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false)

  const fromRef = useRef<HTMLDivElement>(null)
  const toRef = useRef<HTMLDivElement>(null)

  // Handle outside click for suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
        setShowFromDropdown(false)
      }
      if (toRef.current && !toRef.current.contains(event.target as Node)) {
        setShowToDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Location search debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (fromLocation && fromLocation.length >= 2 && showFromDropdown) {
        const results = await transitApi.searchLocations(fromLocation, 6)
        setFromSuggestions(results)
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [fromLocation, showFromDropdown])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (toLocation && toLocation.length >= 2 && showToDropdown) {
        const results = await transitApi.searchLocations(toLocation, 6)
        setToSuggestions(results)
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [toLocation, showToDropdown])

  const handleSwap = () => {
    const tempName = fromLocation
    const tempCoords = fromCoords
    setFromLocation(toLocation)
    setFromCoords(toCoords)
    setToLocation(tempName)
    setToCoords(tempCoords)
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFromLocation('Current Location (GPS)')
          setFromCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        () => {
          // Default to Ashram Road / Central Ahmedabad
          setFromLocation('Income Tax Circle (Ashram Road)')
          setFromCoords({ lat: 23.0415, lng: 72.5710 })
        }
      )
    }
  }

  const handleModeToggle = (mode: string) => {
    if (selectedModes.includes(mode)) {
      if (selectedModes.length > 1) {
        setSelectedModes(selectedModes.filter((m) => m !== mode))
      }
    } else {
      setSelectedModes([...selectedModes, mode])
    }
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    onSearch({
      from: fromLocation || 'Sabarmati Railway Station',
      to: toLocation || 'Thaltej',
      from_lat: fromCoords?.lat,
      from_lng: fromCoords?.lng,
      to_lat: toCoords?.lat,
      to_lng: toCoords?.lng,
      departure: timeMode === 'NOW' ? 'now' : timeMode === 'DEPART_AT' ? selectedTime : undefined,
      arrive_by: timeMode === 'ARRIVE_BY' ? selectedTime : undefined,
      preference,
      modes: selectedModes,
      wheelchair: wheelchairAccessible,
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-4 md:p-5 transition-all">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Plan Your Trip
            </h2>
            <p className="text-xs text-slate-500">
              Metro • BRTS • AMTS • Rail • Bus
            </p>
          </div>
        </div>

        {/* Accessibility Mode Toggle */}
        <button
          type="button"
          onClick={() => setWheelchairAccessible(!wheelchairAccessible)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            wheelchairAccessible
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Accessibility className="w-3.5 h-3.5" />
          <span>Wheelchair Accessible</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Origin & Destination Inputs with Swap */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center">
          {/* FROM Input */}
          <div ref={fromRef} className="relative">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                From (Origin)
              </span>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
              >
                <Navigation className="w-3 h-3" />
                <span>My Location</span>
              </button>
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <input
                type="text"
                value={fromLocation}
                onChange={(e) => {
                  setFromLocation(e.target.value)
                  setShowFromDropdown(true)
                }}
                onFocus={() => setShowFromDropdown(true)}
                placeholder="Station, BRTS stop, landmark..."
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-sm font-medium text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm"
              />
              {fromLocation && (
                <button
                  type="button"
                  onClick={() => {
                    setFromLocation('')
                    setFromCoords(null)
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {showFromDropdown && fromSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto">
                {fromSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setFromLocation(item.name)
                      setFromCoords({ lat: item.latitude, lng: item.longitude })
                      setShowFromDropdown(false)
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/70 border-b border-slate-100 last:border-0 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{item.name}</div>
                      <div className="text-[11px] text-slate-400">{item.address}</div>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {item.type || item.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center md:pt-6">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap From and To"
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* TO Input */}
          <div ref={toRef} className="relative">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-red-600">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
                To (Destination)
              </span>
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4 text-red-600" />
              </div>
              <input
                type="text"
                value={toLocation}
                onChange={(e) => {
                  setToLocation(e.target.value)
                  setShowToDropdown(true)
                }}
                onFocus={() => setShowToDropdown(true)}
                placeholder="Station, BRTS stop, landmark..."
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-sm font-medium text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm"
              />
              {toLocation && (
                <button
                  type="button"
                  onClick={() => {
                    setToLocation('')
                    setToCoords(null)
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {showToDropdown && toSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto">
                {toSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setToLocation(item.name)
                      setToCoords({ lat: item.latitude, lng: item.longitude })
                      setShowToDropdown(false)
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/70 border-b border-slate-100 last:border-0 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{item.name}</div>
                      <div className="text-[11px] text-slate-400">{item.address}</div>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {item.type || item.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Popular Quick Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 whitespace-nowrap">
            Popular:
          </span>
          {POPULAR_LANDMARKS.map((lm) => (
            <button
              key={lm.name}
              type="button"
              onClick={() => {
                if (!fromLocation) setFromLocation(lm.fullName)
                else setToLocation(lm.fullName)
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100/90 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200/80 font-medium whitespace-nowrap transition-colors flex items-center gap-1 text-[11px]"
            >
              <span>{lm.name}</span>
            </button>
          ))}
        </div>

        {/* Departure Time & Preference Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          {/* Departure Time Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Schedule
            </label>
            <div className="flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setTimeMode('NOW')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  timeMode === 'NOW'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Now
              </button>
              <button
                type="button"
                onClick={() => setTimeMode('DEPART_AT')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  timeMode === 'DEPART_AT'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Depart At
              </button>
              <button
                type="button"
                onClick={() => setTimeMode('ARRIVE_BY')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  timeMode === 'ARRIVE_BY'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Arrive By
              </button>
            </div>

            {timeMode !== 'NOW' && (
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="text-[11px] text-slate-500">
                  {timeMode === 'ARRIVE_BY' ? 'Calculates departure time' : 'Target departure'}
                </span>
              </div>
            )}
          </div>

          {/* Route Preferences */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Preference
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {[
                { id: 'fastest', label: 'Fastest', icon: Zap },
                { id: 'cheapest', label: 'Cheapest', icon: DollarSign },
                { id: 'least_walking', label: 'Low Walk', icon: Footprints },
                { id: 'fewest_transfers', label: 'Direct', icon: Shuffle },
                { id: 'most_reliable', label: 'Reliable', icon: ShieldCheck },
                { id: 'min_wait', label: 'Min Wait', icon: Sparkles },
              ].map((pref) => {
                const Icon = pref.icon
                const isSelected = preference === pref.id
                return (
                  <button
                    key={pref.id}
                    type="button"
                    onClick={() => setPreference(pref.id as any)}
                    className={`py-2 px-1.5 rounded-xl text-center flex flex-col items-center justify-center gap-1 border text-[11px] font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
                        : 'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{pref.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Transport Modes Filter Checkboxes */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1">Modes:</span>
            {[
              { id: 'METRO', label: 'Metro', color: 'text-red-700 bg-red-50 border-red-200' },
              { id: 'BRTS', label: 'BRTS', color: 'text-orange-700 bg-orange-50 border-orange-200' },
              { id: 'AMTS', label: 'AMTS', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
              { id: 'RAIL', label: 'Rail', color: 'text-purple-700 bg-purple-50 border-purple-200' },
              { id: 'BUS', label: 'GIFT Bus', color: 'text-teal-700 bg-teal-50 border-teal-200' },
              { id: 'WALK', label: 'Walk', color: 'text-slate-700 bg-slate-100 border-slate-200' },
            ].map((m) => {
              const active = selectedModes.includes(m.id)
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleModeToggle(m.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    active
                      ? `${m.color} shadow-sm ring-1 ring-blue-500/20`
                      : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                  }`}
                >
                  {m.label}
                </button>
              )
            })}
          </div>

          {/* Action Search Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Finding Routes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Find Routes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
