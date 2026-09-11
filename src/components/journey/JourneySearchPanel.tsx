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
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Train,
  Bus
} from 'lucide-react'
import { LocationSearchResult } from '../../types/transit'
import { transitApi, NearestStationCandidate } from '../../services/transitApi'

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

export interface PopularLocationItem {
  name: string
  fullName: string
  city: 'Ahmedabad' | 'Gandhinagar' | 'GIFT City'
  category?: string
  lat: number
  lng: number
}

export const POPULAR_LANDMARKS: PopularLocationItem[] = [
  // --- GIFT City ---
  { name: 'GIFT City FinTech', fullName: 'GIFT City FinTech Zone', city: 'GIFT City', category: 'FinTech CBD', lat: 23.1600, lng: 72.6840 },
  { name: 'GIFT Metro', fullName: 'GIFT City Metro Station', city: 'GIFT City', category: 'Metro Station', lat: 23.1600, lng: 72.6840 },
  { name: 'GIFT Towers / WTC', fullName: 'GIFT Tower 1 & 2 (World Trade Center)', city: 'GIFT City', category: 'Corporate Towers', lat: 23.1630, lng: 72.6865 },
  { name: 'GIFT City Club', fullName: 'GIFT City Club & Grand Omaxe', city: 'GIFT City', category: 'Hospitality', lat: 23.1550, lng: 72.6810 },
  { name: 'GIFT SEZ Zone', fullName: 'GIFT Multi-Services SEZ', city: 'GIFT City', category: 'Special Economic Zone', lat: 23.1610, lng: 72.6870 },
  { name: 'GIFT Bullion (IIBX)', fullName: 'GIFT International Bullion Exchange (IIBX)', city: 'GIFT City', category: 'Global Exchange', lat: 23.1640, lng: 72.6850 },
  { name: 'GIFT EV Shuttle Hub', fullName: 'GIFT City EV Smart Shuttle Terminal', city: 'GIFT City', category: 'EV Transit Hub', lat: 23.1605, lng: 72.6835 },

  // --- Gandhinagar ---
  { name: 'Mahatma Mandir', fullName: 'Mahatma Mandir Convention Centre', city: 'Gandhinagar', category: 'Convention Hub', lat: 23.2590, lng: 72.6520 },
  { name: 'Gandhinagar Capital', fullName: 'Gandhinagar Capital Railway Station', city: 'Gandhinagar', category: 'Railway Junction', lat: 23.2480, lng: 72.6490 },
  { name: 'Infocity (Gandhinagar)', fullName: 'Infocity IT Park & Metro (Gandhinagar)', city: 'Gandhinagar', category: 'IT & Tech Hub', lat: 23.1965, lng: 72.6288 },
  { name: 'Dholakuva Circle', fullName: 'Dholakuva Circle & Metro Station', city: 'Gandhinagar', category: 'Metro Station', lat: 23.2087, lng: 72.6253 },
  { name: 'Akshardham Temple', fullName: 'Akshardham Temple (Sector 20)', city: 'Gandhinagar', category: 'Spiritual Landmark', lat: 23.2300, lng: 72.6730 },
  { name: 'Sachivalaya (Secretariat)', fullName: 'Gujarat New Sachivalaya (Secretariat)', city: 'Gandhinagar', category: 'Government', lat: 23.2320, lng: 72.6480 },
  { name: 'Pathikashram Bus Hub', fullName: 'Pathikashram Central Bus Station (GSRTC)', city: 'Gandhinagar', category: 'Bus Terminal', lat: 23.2200, lng: 72.6480 },
  { name: 'Sector 21 Market', fullName: 'Gandhinagar Sector 21 Shopping Centre', city: 'Gandhinagar', category: 'Commercial Hub', lat: 23.2380, lng: 72.6420 },
  { name: 'GNLU Interchange', fullName: 'GNLU (Gujarat National Law University)', city: 'Gandhinagar', category: 'Metro Interchange', lat: 23.1540, lng: 72.6500 },
  { name: 'PDPU / PDEU', fullName: 'Pandit Deendayal Energy University (PDEU)', city: 'Gandhinagar', category: 'Education', lat: 23.1610, lng: 72.6650 },
  { name: 'DA-IICT', fullName: 'DA-IICT (Dhirubhai Ambani Institute)', city: 'Gandhinagar', category: 'Education', lat: 23.1880, lng: 72.6280 },
  { name: 'Indroda Nature Park', fullName: 'Indroda Dinosaur & Nature Fossil Park', city: 'Gandhinagar', category: 'Nature / Tourism', lat: 23.1950, lng: 72.6720 },
  { name: 'Sector 10A Metro', fullName: 'Sector 10A / Sachivalaya Metro', city: 'Gandhinagar', category: 'Metro Station', lat: 23.2320, lng: 72.6480 },
  { name: 'Sector 16 Metro', fullName: 'Sector 16 Metro Station', city: 'Gandhinagar', category: 'Metro Station', lat: 23.2450, lng: 72.6550 },
  { name: 'Kudasan Cross Road', fullName: 'Kudasan Commercial Hub', city: 'Gandhinagar', category: 'Commercial', lat: 23.1780, lng: 72.6320 },
  { name: 'Koba Circle', fullName: 'Koba Circle Transit Junction', city: 'Gandhinagar', category: 'Transit Junction', lat: 23.1550, lng: 72.6100 },
  { name: 'IIT Gandhinagar', fullName: 'IIT Gandhinagar (Palaj Campus)', city: 'Gandhinagar', category: 'Premier Institute', lat: 23.2130, lng: 72.6840 },

  // --- Ahmedabad ---
  { name: 'Sabarmati Stn', fullName: 'Sabarmati Railway Station', city: 'Ahmedabad', category: 'Railway Junction', lat: 23.0762, lng: 72.5855 },
  { name: 'Kalupur Central', fullName: 'Kalupur Railway Station (Ahmedabad Central)', city: 'Ahmedabad', category: 'Main Rail Terminal', lat: 23.0245, lng: 72.6000 },
  { name: 'Airport (SVPIA)', fullName: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad', category: 'International Airport', lat: 23.0735, lng: 72.6265 },
  { name: 'Narendra Modi Stadium', fullName: 'Narendra Modi Stadium (Motera)', city: 'Ahmedabad', category: 'Cricket Stadium', lat: 23.0915, lng: 72.5975 },
  { name: 'Science City', fullName: 'Gujarat Science City', city: 'Ahmedabad', category: 'Science & Tech', lat: 23.0780, lng: 72.5030 },
  { name: 'Iskcon Cross Road', fullName: 'Iskcon Cross Road (SG Highway)', city: 'Ahmedabad', category: 'SG Highway Hub', lat: 23.0280, lng: 72.5070 },
  { name: 'Prahlad Nagar', fullName: 'Prahlad Nagar Corporate Road & Garden', city: 'Ahmedabad', category: 'Corporate Hub', lat: 23.0120, lng: 72.5080 },
  { name: 'Thaltej Metro', fullName: 'Thaltej Metro Interchange', city: 'Ahmedabad', category: 'Metro Station', lat: 23.0525, lng: 72.5165 },
  { name: 'Gujarat University', fullName: 'Gujarat University (Navrangpura)', city: 'Ahmedabad', category: 'Education', lat: 23.0381, lng: 72.5482 },
  { name: 'IIM / Vastrapur', fullName: 'IIM Ahmedabad / Vastrapur Lake', city: 'Ahmedabad', category: 'Education / Lake', lat: 23.0315, lng: 72.5460 },
  { name: 'Ashram Road', fullName: 'Ashram Road / Income Tax Circle', city: 'Ahmedabad', category: 'Commercial CBD', lat: 23.0415, lng: 72.5710 },
  { name: 'Law Garden / CG Rd', fullName: 'Law Garden & C.G. Road', city: 'Ahmedabad', category: 'Shopping / Cultural', lat: 23.0275, lng: 72.5590 },
  { name: 'Kankaria Lake', fullName: 'Kankaria Lake & Zoo', city: 'Ahmedabad', category: 'Heritage Lake', lat: 23.0070, lng: 72.5990 },
  { name: 'Ranip Bus Hub', fullName: 'Ranip GSRTC Central Bus Stand', city: 'Ahmedabad', category: 'GSRTC Hub', lat: 23.0545, lng: 72.5740 },
  { name: 'Sola High Court', fullName: 'Gujarat High Court (Sola SG Highway)', city: 'Ahmedabad', category: 'Judicial Landmark', lat: 23.0810, lng: 72.5270 },
  { name: 'Bopal Approach', fullName: 'Bopal Cross Road & SP Ring Road', city: 'Ahmedabad', category: 'Residential Hub', lat: 23.0310, lng: 72.4850 },
  { name: 'Gota Cross Road', fullName: 'Gota Cross Road (SG Highway)', city: 'Ahmedabad', category: 'SG Highway North', lat: 23.0980, lng: 72.5350 },
  { name: 'Tapovan Circle', fullName: 'Tapovan Circle (Visat Highway)', city: 'Ahmedabad', category: 'Highway Junction', lat: 23.1290, lng: 72.5950 },
  { name: 'VGEC College', fullName: 'Vishwakarma Government Engineering College (VGEC)', city: 'Ahmedabad', category: 'Engineering College', lat: 23.1090, lng: 72.5950 },
  { name: 'Vishwakarma Metro', fullName: 'Vishwakarma College Metro Station', city: 'Ahmedabad', category: 'Metro Station', lat: 23.1090, lng: 72.5950 },
  { name: 'Shivranjani BRTS', fullName: 'Shivranjani Cross Road BRTS', city: 'Ahmedabad', category: 'BRTS Hub', lat: 23.0245, lng: 72.5312 },
  { name: 'Maninagar Stn', fullName: 'Maninagar Railway Station & Hub', city: 'Ahmedabad', category: 'Transit Hub', lat: 22.9975, lng: 72.6020 },
  { name: 'Lal Darwaja', fullName: 'Lal Darwaja Central Terminus', city: 'Ahmedabad', category: 'City Bus Terminus', lat: 23.0250, lng: 72.5820 },
  { name: 'Geeta Mandir', fullName: 'Geeta Mandir Central ST Bus Stand', city: 'Ahmedabad', category: 'Bus Terminal', lat: 23.0145, lng: 72.5890 },
  { name: 'Vastral Gam Metro', fullName: 'Vastral Gam Metro Terminal', city: 'Ahmedabad', category: 'Metro Station', lat: 22.9990, lng: 72.6680 },
]

export const JourneySearchPanel: React.FC<JourneySearchPanelProps> = ({
  onSearch,
  isLoading = false,
  initialFrom = '',
  initialTo = ''
}) => {
  const [fromLocation, setFromLocation] = useState(initialFrom || '')
  const [toLocation, setToLocation] = useState(initialTo || '')
  const [fromCoords, setFromCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [toCoords, setToCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null)
  const [nearestCandidates, setNearestCandidates] = useState<NearestStationCandidate[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)
  const [cityTab, setCityTab] = useState<'ALL' | 'Ahmedabad' | 'Gandhinagar' | 'GIFT City'>('ALL')

  useEffect(() => {
    setFromLocation(initialFrom || '')
  }, [initialFrom])

  useEffect(() => {
    setToLocation(initialTo || '')
  }, [initialTo])

  const [fromSuggestions, setFromSuggestions] = useState<LocationSearchResult[]>([])
  const [toSuggestions, setToSuggestions] = useState<LocationSearchResult[]>([])
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)

  const [timeMode, setTimeMode] = useState<'NOW' | 'DEPART_AT' | 'ARRIVE_BY'>('NOW')
  const [selectedTime, setSelectedTime] = useState('15:30')
  const [preference, setPreference] = useState<'fastest' | 'cheapest' | 'least_walking' | 'fewest_transfers' | 'most_reliable' | 'min_wait'>('fastest')
  
  const [selectedModes, setSelectedModes] = useState<string[]>([
    'METRO',
    'GANDHINAGAR_ELECTRIC_BUS',
    'BRTS',
    'AMTS',
    'RAIL',
    'BUS',
    'WALK'
  ])
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

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

  const handleUseCurrentLocation = (forceRefresh = false) => {
    if (!navigator.geolocation) {
      setValidationError('Geolocation is not supported by your browser.')
      return
    }

    setIsLocating(true)
    setValidationError(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const accuracy = pos.coords.accuracy

        setFromLocation('Current Location (GPS)')
        setFromCoords({ lat, lng })
        setGpsAccuracy(accuracy)

        try {
          // Query authoritative nearest transit station candidates
          const res = await transitApi.getNearestStations(lat, lng, undefined, 4)
          setNearestCandidates(res.results)
        } catch (err) {
          console.warn('Failed to fetch nearest station candidates:', err)
        } finally {
          setIsLocating(false)
        }
      },
      (err) => {
        setIsLocating(false)
        console.warn('Geolocation error:', err.message)
        // Fallback to Ashram Road / Central Ahmedabad
        setFromLocation('Income Tax Circle (Ashram Road)')
        setFromCoords({ lat: 23.0415, lng: 72.5710 })
        setGpsAccuracy(null)
        setNearestCandidates([])
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: forceRefresh ? 0 : 5000,
      }
    )
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
    setValidationError(null)
    const trimmedFrom = fromLocation.trim()
    const trimmedTo = toLocation.trim()

    if (!trimmedFrom && !trimmedTo) {
      setValidationError('Please enter both origin (From) and destination (To) locations.')
      return
    }
    if (!trimmedFrom) {
      setValidationError('Please enter an origin (From) location.')
      return
    }
    if (!trimmedTo) {
      setValidationError('Please enter a destination (To) location.')
      return
    }

    onSearch({
      from: trimmedFrom,
      to: trimmedTo,
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

  const getPreferenceLabel = (p: string) => {
    switch (p) {
      case 'fastest': return 'Fastest'
      case 'cheapest': return 'Cheapest'
      case 'least_walking': return 'Low Walk'
      case 'fewest_transfers': return 'Direct'
      case 'most_reliable': return 'Reliable'
      case 'min_wait': return 'Min Wait'
      default: return p
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-3.5 sm:p-4 transition-all">
      {/* Header Banner */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Plan Your Trip</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-medium">
              Metro • BRTS • AMTS • Rail • Bus
            </p>
          </div>
        </div>

        {/* Controls: Wheelchair & Filter Toggle */}
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => setWheelchairAccessible(!wheelchairAccessible)}
            title="Wheelchair accessible routes only"
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
              wheelchairAccessible
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Accessibility className="w-3 h-3" />
            <span className="hidden sm:inline">Accessible</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
              showAdvancedFilters
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3 text-indigo-600" />
            <span>Options</span>
            {showAdvancedFilters ? (
              <ChevronUp className="w-3 h-3 ml-0.5" />
            ) : (
              <ChevronDown className="w-3 h-3 ml-0.5 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {validationError && (
        <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-3 space-y-2.5">
        {/* Origin & Destination Inputs with Swap */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 items-center">
          {/* FROM Input */}
          <div ref={fromRef} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                From (Origin)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleUseCurrentLocation(true)}
                  disabled={isLocating}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline disabled:opacity-50"
                  title="Use precise GPS location"
                >
                  {isLocating ? (
                    <RefreshCw className="w-2.5 h-2.5 animate-spin text-blue-600" />
                  ) : (
                    <Navigation className="w-2.5 h-2.5" />
                  )}
                  <span>{isLocating ? 'Locating...' : 'My Location'}</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
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
                className="w-full pl-9 pr-7 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white text-xs font-medium text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
              />
              {fromLocation && (
                <button
                  type="button"
                  onClick={() => {
                    setFromLocation('')
                    setFromCoords(null)
                    setGpsAccuracy(null)
                    setNearestCandidates([])
                  }}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* GPS Accuracy & Nearest Station Quick Recommendation Banner */}
            {fromCoords && (gpsAccuracy !== null || nearestCandidates.length > 0) && (
              <div className="mt-1 p-1.5 bg-blue-50/70 border border-blue-200/80 rounded-lg text-[10px] text-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        gpsAccuracy === null
                          ? 'bg-blue-500'
                          : gpsAccuracy <= 30
                          ? 'bg-emerald-500 animate-pulse'
                          : gpsAccuracy <= 100
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      title={gpsAccuracy ? `GPS Accuracy: ±${Math.round(gpsAccuracy)}m` : 'Coordinates set'}
                    />
                    <span className="font-semibold text-slate-800">
                      {gpsAccuracy !== null
                        ? gpsAccuracy <= 30
                          ? `GPS: High Accuracy (±${Math.round(gpsAccuracy)}m)`
                          : gpsAccuracy <= 100
                          ? `GPS: Approx (±${Math.round(gpsAccuracy)}m)`
                          : `GPS: Low Accuracy (±${Math.round(gpsAccuracy)}m)`
                        : 'Coordinates Active'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUseCurrentLocation(true)}
                    className="text-[9px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-0.5"
                  >
                    <RefreshCw className="w-2 h-2" />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Nearest Station candidates quick chips */}
                {nearestCandidates.length > 0 && (
                  <div className="pt-0.5">
                    <div className="text-[9px] text-slate-500 font-medium mb-1">
                      Closest stations (click to use station origin):
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {nearestCandidates.slice(0, 2).map((candidate) => {
                        const isMetro = candidate.mode === 'METRO'
                        const isElectric = candidate.mode === 'GANDHINAGAR_ELECTRIC_BUS'

                        return (
                          <button
                            key={candidate.id}
                            type="button"
                            onClick={() => {
                              setFromLocation(candidate.name)
                              setFromCoords({ lat: candidate.latitude, lng: candidate.longitude })
                            }}
                            className="px-1.5 py-0.5 rounded bg-white hover:bg-blue-100/80 border border-blue-200 text-slate-800 text-[9px] font-medium flex items-center gap-1 transition-colors shadow-2xs"
                            title={`Use ${candidate.name} as origin`}
                          >
                            {isMetro ? (
                              <Train className="w-2.5 h-2.5 text-blue-600" />
                            ) : (
                              <Bus className={`w-2.5 h-2.5 ${isElectric ? 'text-emerald-600' : 'text-orange-600'}`} />
                            )}
                            <span className="font-semibold truncate max-w-[130px]">{candidate.name}</span>
                            <span className="text-slate-400">({candidate.walkingDistanceMeters}m • {candidate.walkingMinutes}m walk)</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Suggestions dropdown */}
            {showFromDropdown && fromSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto">
                {fromSuggestions.map((item) => {
                  const isGift = item.name.toLowerCase().includes('gift') || (item.address && item.address.toLowerCase().includes('gift'))
                  const isGnd = item.name.toLowerCase().includes('gandhinagar') || item.name.toLowerCase().includes('infocity') || item.name.toLowerCase().includes('sector') || item.name.toLowerCase().includes('sachivalaya') || (item.address && item.address.toLowerCase().includes('gandhinagar'))
                  const cityTag = isGift ? 'GIFT City' : isGnd ? 'Gandhinagar' : 'Ahmedabad'
                  const cityBadgeColor = isGift ? 'bg-teal-50 text-teal-700 border-teal-200' : isGnd ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setFromLocation(item.name)
                        setFromCoords({ lat: item.latitude, lng: item.longitude })
                        setShowFromDropdown(false)
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50/70 border-b border-slate-100 last:border-0 flex items-center justify-between text-xs transition-colors group"
                    >
                      <div className="pr-2">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.name_gu && (
                            <span className="text-[10px] font-normal text-slate-400 font-serif">
                              ({item.name_gu})
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <span className={`text-[8px] font-bold px-1 rounded border ${cityBadgeColor}`}>
                            {cityTag}
                          </span>
                          <span className="truncate max-w-[200px]">{item.address}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded flex-shrink-0 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                        {item.type || item.category}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center md:pt-4">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap From and To"
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TO Input */}
          <div ref={toRef} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
                To (Destination)
              </span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
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
                className="w-full pl-9 pr-7 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white text-xs font-medium text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
              />
              {toLocation && (
                <button
                  type="button"
                  onClick={() => {
                    setToLocation('')
                    setToCoords(null)
                  }}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {showToDropdown && toSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto">
                {toSuggestions.map((item) => {
                  const isGift = item.name.toLowerCase().includes('gift') || (item.address && item.address.toLowerCase().includes('gift'))
                  const isGnd = item.name.toLowerCase().includes('gandhinagar') || item.name.toLowerCase().includes('infocity') || item.name.toLowerCase().includes('sector') || item.name.toLowerCase().includes('sachivalaya') || (item.address && item.address.toLowerCase().includes('gandhinagar'))
                  const cityTag = isGift ? 'GIFT City' : isGnd ? 'Gandhinagar' : 'Ahmedabad'
                  const cityBadgeColor = isGift ? 'bg-teal-50 text-teal-700 border-teal-200' : isGnd ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setToLocation(item.name)
                        setToCoords({ lat: item.latitude, lng: item.longitude })
                        setShowToDropdown(false)
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50/70 border-b border-slate-100 last:border-0 flex items-center justify-between text-xs transition-colors group"
                    >
                      <div className="pr-2">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.name_gu && (
                            <span className="text-[10px] font-normal text-slate-400 font-serif">
                              ({item.name_gu})
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <span className={`text-[8px] font-bold px-1 rounded border ${cityBadgeColor}`}>
                            {cityTag}
                          </span>
                          <span className="truncate max-w-[200px]">{item.address}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded flex-shrink-0 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                        {item.type || item.category}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Popular Locations Quick Hub Chips with City Tabs */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mr-0.5 whitespace-nowrap flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                Hubs:
              </span>
              {(['ALL', 'GIFT City', 'Gandhinagar', 'Ahmedabad'] as const).map((tab) => {
                const count = tab === 'ALL'
                  ? POPULAR_LANDMARKS.length
                  : POPULAR_LANDMARKS.filter((l) => l.city === tab).length

                const isActive = cityTab === tab
                let activeClass = 'bg-slate-900 text-white shadow-xs'
                if (isActive) {
                  if (tab === 'GIFT City') activeClass = 'bg-teal-600 text-white'
                  else if (tab === 'Gandhinagar') activeClass = 'bg-emerald-600 text-white'
                  else if (tab === 'Ahmedabad') activeClass = 'bg-blue-600 text-white'
                }

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setCityTab(tab)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all whitespace-nowrap flex items-center gap-1 border ${
                      isActive
                        ? `${activeClass} border-transparent`
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200/70'
                    }`}
                  >
                    <span>{tab === 'ALL' ? 'All' : tab}</span>
                    <span className={`text-[8px] px-1 py-0.1 rounded-full font-extrabold ${isActive ? 'bg-white/20' : 'bg-slate-200/80 text-slate-600'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick Hub Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
            {POPULAR_LANDMARKS
              .filter((lm) => cityTab === 'ALL' || lm.city === cityTab)
              .slice(0, 15)
              .map((lm) => {
                let badgeDotColor = 'bg-blue-500'
                if (lm.city === 'GIFT City') badgeDotColor = 'bg-teal-500'
                else if (lm.city === 'Gandhinagar') badgeDotColor = 'bg-emerald-500'

                return (
                  <button
                    key={lm.fullName}
                    type="button"
                    onClick={() => {
                      if (!fromLocation) {
                        setFromLocation(lm.fullName)
                        setFromCoords({ lat: lm.lat, lng: lm.lng })
                      } else {
                        setToLocation(lm.fullName)
                        setToCoords({ lat: lm.lat, lng: lm.lng })
                      }
                    }}
                    title={`${lm.fullName} (${lm.city})`}
                    className="px-2 py-0.5 rounded-lg bg-slate-100/80 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200/70 font-medium whitespace-nowrap transition-colors flex items-center gap-1 text-[10px] hover:border-blue-300 flex-shrink-0"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${badgeDotColor} flex-shrink-0`}></span>
                    <span>{lm.name}</span>
                  </button>
                )
              })}
          </div>
        </div>

        {/* Collapsible Advanced Preferences & Schedule */}
        {showAdvancedFilters && (
          <div className="pt-2.5 pb-1 border-t border-slate-100 space-y-2.5 animate-fadeIn">
            {/* Schedule & Preference Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Schedule Mode */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Schedule
                </label>
                <div className="flex items-center space-x-1 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setTimeMode('NOW')}
                    className={`flex-1 py-1 px-1.5 rounded-md text-[11px] font-semibold transition-all ${
                      timeMode === 'NOW'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeMode('DEPART_AT')}
                    className={`flex-1 py-1 px-1.5 rounded-md text-[11px] font-semibold transition-all ${
                      timeMode === 'DEPART_AT'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Depart At
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeMode('ARRIVE_BY')}
                    className={`flex-1 py-1 px-1.5 rounded-md text-[11px] font-semibold transition-all ${
                      timeMode === 'ARRIVE_BY'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Arrive By
                  </button>
                </div>

                {timeMode !== 'NOW' && (
                  <div className="mt-1.5 flex items-center space-x-2">
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <span className="text-[10px] text-slate-500">
                      {timeMode === 'ARRIVE_BY' ? 'Calculates departure' : 'Target departure'}
                    </span>
                  </div>
                )}
              </div>

              {/* Preferences */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Routing Preference
                </label>
                <div className="grid grid-cols-3 gap-1">
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
                        className={`py-1 px-1 rounded-lg text-center flex items-center justify-center gap-1 border text-[10px] font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs'
                            : 'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className={`w-3 h-3 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{pref.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Transport Modes Filter Checkboxes */}
            <div className="pt-1.5 flex items-center space-x-1 flex-wrap gap-y-1">
              <span className="text-[10px] font-bold text-slate-500 mr-1">Allowed Modes:</span>
              {[
                { id: 'METRO', label: 'Metro', color: 'text-red-700 bg-red-50 border-red-200' },
                { id: 'GANDHINAGAR_ELECTRIC_BUS', label: '🚌⚡ Gandhinagar e-Bus', color: 'text-emerald-800 bg-emerald-100 border-emerald-300' },
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
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                      active
                        ? `${m.color} shadow-2xs font-bold ring-1 ring-black/5`
                        : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
                    }`}
                  >
                    {m.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Action Row: Summary Pills + Search Button */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium overflow-x-auto no-scrollbar">
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold whitespace-nowrap">
              ⚡ {getPreferenceLabel(preference)}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold whitespace-nowrap">
              ⏱️ {timeMode === 'NOW' ? 'Now' : selectedTime}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold whitespace-nowrap hidden sm:inline">
              🚆 {selectedModes.length} Modes
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Routing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Find Routes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}


