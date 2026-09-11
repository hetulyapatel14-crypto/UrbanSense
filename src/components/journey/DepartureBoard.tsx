import React, { useState, useEffect } from 'react'
import {
  Clock,
  Train,
  Bus,
  RefreshCw,
  MapPin,
  Search
} from 'lucide-react'
import { StopDeparturesData, TransportMode } from '../../types/transit'
import { transitApi, ALL_TRANSIT_STOPS } from '../../services/transitApi'

interface DepartureBoardProps {
  initialStopId?: string
}

const POPULAR_STOPS = [
  // GIFT City
  { id: 'METRO-GIFT-02', name: 'GIFT City Metro Station', shortName: 'GIFT City Metro', mode: 'METRO' as TransportMode, city: 'GIFT City' },
  { id: 'GND-BUS-GIFT-HUB', name: 'GIFT City Main Concourse Hub', shortName: 'GIFT Concourse', mode: 'BUS' as TransportMode, city: 'GIFT City' },
  { id: 'GND-BUS-GIFT-T1', name: 'GIFT Tower 1 & 2 / WTC', shortName: 'GIFT Towers', mode: 'BUS' as TransportMode, city: 'GIFT City' },

  // Gandhinagar
  { id: 'METRO-INT-02', name: 'GNLU (Red Line / GIFT Interchange)', shortName: 'GNLU Interchange', mode: 'METRO' as TransportMode, city: 'Gandhinagar' },
  { id: 'METRO-GND-04', name: 'Infocity Metro (Gandhinagar)', shortName: 'Infocity Metro', mode: 'METRO' as TransportMode, city: 'Gandhinagar' },
  { id: 'METRO-GND-07', name: 'Mahatma Mandir Metro Station', shortName: 'Mahatma Mandir', mode: 'METRO' as TransportMode, city: 'Gandhinagar' },
  { id: 'METRO-GND-06', name: 'Sector 10A / Sachivalaya Metro', shortName: 'Sector 10A Metro', mode: 'METRO' as TransportMode, city: 'Gandhinagar' },
  { id: 'GND-BUS-SEC21', name: 'Sector 21 Shopping Centre Stand', shortName: 'Sec 21 Stand', mode: 'BUS' as TransportMode, city: 'Gandhinagar' },
  { id: 'GND-BUS-PATHIK', name: 'Pathikashram Central GSRTC Hub', shortName: 'Pathikashram GSRTC', mode: 'BUS' as TransportMode, city: 'Gandhinagar' },

  // Ahmedabad
  { id: 'METRO-INT-01', name: 'Old High Court Interchange', shortName: 'Old High Court', mode: 'METRO' as TransportMode, city: 'Ahmedabad' },
  { id: 'METRO-NS-02', name: 'Sabarmati Railway Station Metro', shortName: 'Sabarmati Metro', mode: 'METRO' as TransportMode, city: 'Ahmedabad' },
  { id: 'METRO-EW-02', name: 'Thaltej Metro Station', shortName: 'Thaltej Metro', mode: 'METRO' as TransportMode, city: 'Ahmedabad' },
  { id: 'METRO-EW-11', name: 'Kalupur Railway Station Metro', shortName: 'Kalupur Metro', mode: 'METRO' as TransportMode, city: 'Ahmedabad' },
  { id: 'BRTS-01', name: 'RTO Circle BRTS', shortName: 'RTO Circle BRTS', mode: 'BRTS' as TransportMode, city: 'Ahmedabad' },
  { id: 'BRTS-12', name: 'Iskcon Cross Road BRTS', shortName: 'Iskcon BRTS', mode: 'BRTS' as TransportMode, city: 'Ahmedabad' },
  { id: 'BRTS-07', name: 'Shivranjani Cross Road BRTS', shortName: 'Shivranjani BRTS', mode: 'BRTS' as TransportMode, city: 'Ahmedabad' },
  { id: 'AMTS-01', name: 'Sabarmati Railway Station AMTS', shortName: 'Sabarmati AMTS', mode: 'AMTS' as TransportMode, city: 'Ahmedabad' },
  { id: 'AMTS-08', name: 'Ashram Road (Income Tax Circle)', shortName: 'Ashram Rd AMTS', mode: 'AMTS' as TransportMode, city: 'Ahmedabad' },
  { id: 'AMTS-20', name: 'Ahmedabad Airport T2 Express Stand', shortName: 'Airport Express', mode: 'AMTS' as TransportMode, city: 'Ahmedabad' },
]

export const DepartureBoard: React.FC<DepartureBoardProps> = ({
  initialStopId = 'METRO-INT-01'
}) => {
  const [selectedStopId, setSelectedStopId] = useState(initialStopId)
  const [selectedModeFilter, setSelectedModeFilter] = useState<string | undefined>(undefined)
  const [boardData, setBoardData] = useState<StopDeparturesData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)

  const fetchDepartures = async (stopId: string) => {
    setIsLoading(true)
    try {
      const data = await transitApi.getDepartures(stopId, 8)
      if (data) {
        setBoardData(data)
        setLastUpdated(new Date())
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartures(selectedStopId)
    // Auto-refresh every 20 seconds
    const interval = setInterval(() => {
      fetchDepartures(selectedStopId)
    }, 20000)
    return () => clearInterval(interval)
  }, [selectedStopId])

  const filteredPopularStops = selectedModeFilter
    ? POPULAR_STOPS.filter((st) => st.mode === selectedModeFilter)
    : POPULAR_STOPS

  const searchedStops = searchQuery.trim()
    ? ALL_TRANSIT_STOPS.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.name_gu && s.name_gu.includes(searchQuery))
      ).slice(0, 8)
    : []

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              Live Station Departures
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Real-time platform countdowns & timetables
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-slate-400">
            Updated {Math.max(1, Math.round((new Date().getTime() - lastUpdated.getTime()) / 1000))}s ago
          </span>
          <button
            type="button"
            onClick={() => fetchDepartures(selectedStopId)}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Refresh departures"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mode Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-xs">
          {[
            { id: undefined, label: 'All Modes' },
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

        {/* Quick Search Input */}
        <div className="relative">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs w-48 focus-within:w-64 focus-within:border-blue-500 focus-within:bg-white transition-all">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
            <input
              type="text"
              placeholder="Search station..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSearchDropdown(true)
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="bg-transparent border-none outline-none text-xs w-full text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && searchedStops.length > 0 && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 max-h-48 overflow-y-auto">
              {searchedStops.map((st) => (
                <button
                  key={st.stop_id}
                  type="button"
                  onClick={() => {
                    setSelectedStopId(st.stop_id)
                    setSearchQuery('')
                    setShowSearchDropdown(false)
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs flex items-center justify-between border-b border-slate-100 last:border-none"
                >
                  <div className="truncate pr-2">
                    <span className="font-bold text-slate-800 block truncate">{st.name}</span>
                    <span className="text-[10px] text-slate-400">{st.stop_id}</span>
                  </div>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase">
                    {st.mode}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Station Selector Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {filteredPopularStops.map((st) => {
          const isSelected = selectedStopId === st.id
          const isGift = st.city === 'GIFT City'
          const isGnd = st.city === 'Gandhinagar'
          const dotColor = isSelected ? 'bg-white' : isGift ? 'bg-teal-500' : isGnd ? 'bg-emerald-500' : 'bg-blue-500'

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => setSelectedStopId(st.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold border whitespace-nowrap transition-all text-xs flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`}></span>
              {st.mode === 'METRO' ? <Train className="w-3 h-3" /> : <Bus className="w-3 h-3" />}
              <span>{st.shortName}</span>
            </button>
          )
        })}
      </div>

      {/* Selected Station Title */}
      {boardData?.stop && (
        <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-900 block text-xs">{boardData.stop.name}</strong>
              <span className="text-[11px] text-slate-500 font-medium">
                {boardData.stop.platform_info || `${boardData.stop.mode} Platform`}
              </span>
            </div>
          </div>
          {boardData.stop.is_interchange && (
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 tracking-wide">
              INTERCHANGE HUB
            </span>
          )}
        </div>
      )}

      {/* Departures Table / List */}
      <div className="space-y-2">
        {isLoading && !boardData ? (
          <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Fetching live station departures & timetable...</span>
          </div>
        ) : boardData?.departures && boardData.departures.length > 0 ? (
          boardData.departures.map((dep, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-2xs shrink-0"
                  style={{ backgroundColor: dep.color || '#2563EB' }}
                >
                  {dep.mode === 'METRO' ? <Train className="w-4 h-4" /> : <Bus className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">{dep.route_number}</span>
                    <span className="text-xs text-slate-700 font-medium">→ {dep.destination}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Scheduled at {dep.departure_time}
                  </div>
                </div>
              </div>

              {/* Countdown and Live Tag */}
              <div className="text-right">
                <div className="text-base font-black text-slate-900 flex items-center justify-end gap-1">
                  <span>{dep.eta_minutes}</span>
                  <span className="text-xs font-semibold text-slate-500">min</span>
                </div>
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider inline-block mt-0.5 ${
                    dep.status === 'LIVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {dep.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No immediate departures found. Refreshing timetable...
          </div>
        )}
      </div>
    </div>
  )
}
