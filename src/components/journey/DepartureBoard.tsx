import React, { useState, useEffect } from 'react'
import {
  Clock,
  Train,
  Bus,
  RefreshCw,
  MapPin
} from 'lucide-react'
import { StopDeparturesData } from '../../types/transit'
import { transitApi } from '../../services/transitApi'

interface DepartureBoardProps {
  initialStopId?: string
}

const POPULAR_STOPS = [
  { id: 'METRO-INT-01', name: 'Old High Court Interchange', shortName: 'Old High Court', mode: 'METRO' },
  { id: 'METRO-NS-02', name: 'Sabarmati Railway Station Metro', shortName: 'Sabarmati Metro', mode: 'METRO' },
  { id: 'METRO-EW-02', name: 'Thaltej Metro Station', shortName: 'Thaltej Metro', mode: 'METRO' },
  { id: 'METRO-EW-10', name: 'Kalupur Railway Station Metro', shortName: 'Kalupur Metro', mode: 'METRO' },
  { id: 'GMRC-GIFT-01', name: 'GIFT City Metro Station', shortName: 'GIFT City Metro', mode: 'METRO' },
  { id: 'BRTS-01', name: 'RTO Circle BRTS', shortName: 'RTO Circle BRTS', mode: 'BRTS' },
  { id: 'BRTS-12', name: 'Iskcon Cross Road BRTS', shortName: 'Iskcon BRTS', mode: 'BRTS' },
  { id: 'AMTS-01', name: 'Sabarmati Railway Station AMTS', shortName: 'Sabarmati AMTS', mode: 'AMTS' },
]

export const DepartureBoard: React.FC<DepartureBoardProps> = ({
  initialStopId = 'METRO-INT-01'
}) => {
  const [selectedStopId, setSelectedStopId] = useState(initialStopId)
  const [boardData, setBoardData] = useState<StopDeparturesData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

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
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDepartures(selectedStopId)
    }, 30000)
    return () => clearInterval(interval)
  }, [selectedStopId])

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
              Live Departures
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Real-time timetable & platform countdowns
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-slate-400">
            Updated {Math.round((new Date().getTime() - lastUpdated.getTime()) / 1000)}s ago
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

      {/* Station Selector Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {POPULAR_STOPS.map((st) => {
          const isSelected = selectedStopId === st.id
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
              {st.mode === 'METRO' ? <Train className="w-3 h-3" /> : <Bus className="w-3 h-3" />}
              <span>{st.shortName}</span>
            </button>
          )
        })}
      </div>

      {/* Selected Station Title */}
      {boardData?.stop && (
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <div>
              <strong className="text-slate-900 block">{boardData.stop.name}</strong>
              <span className="text-[11px] text-slate-500">{boardData.stop.platform_info || `${boardData.stop.mode} Platform`}</span>
            </div>
          </div>
          {boardData.stop.is_interchange && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
              INTERCHANGE HUB
            </span>
          )}
        </div>
      )}

      {/* Departures Table / List */}
      <div className="space-y-2">
        {isLoading && !boardData ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading live departures...</div>
        ) : boardData?.departures && boardData.departures.length > 0 ? (
          boardData.departures.map((dep, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-2xs"
                  style={{ backgroundColor: dep.color || '#2563EB' }}
                >
                  {dep.mode === 'METRO' ? <Train className="w-3.5 h-3.5" /> : <Bus className="w-3.5 h-3.5" />}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">{dep.route_number}</span>
                    <span className="text-xs text-slate-600">→ {dep.destination}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Scheduled at {dep.departure_time}
                  </div>
                </div>
              </div>

              {/* Countdown and Live Tag */}
              <div className="text-right">
                <div className="text-sm font-black text-slate-900 flex items-center justify-end gap-1.5">
                  <span>{dep.eta_minutes}</span>
                  <span className="text-xs font-semibold text-slate-500">min</span>
                </div>
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider inline-block ${
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
          <div className="py-6 text-center text-xs text-slate-400">No immediate upcoming departures</div>
        )}
      </div>
    </div>
  )
}
