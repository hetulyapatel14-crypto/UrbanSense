import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import {
  Clock,
  Radio,
  Compass,
  Navigation,
  RefreshCw,
  Database,
  Activity,
  Sparkles
} from 'lucide-react'
import { JourneySearchPanel } from '../components/journey/JourneySearchPanel'
import { RouteResultsList } from '../components/journey/RouteResultsList'
import { JourneyTimeline } from '../components/journey/JourneyTimeline'
import { TransitMap } from '../components/journey/TransitMap'
import { DepartureBoard } from '../components/journey/DepartureBoard'
import { LiveVehicleTrackerCard } from '../components/journey/LiveVehicleTrackerCard'
import { NearbyTransportFinder } from '../components/journey/NearbyTransportFinder'
import { ServiceAlertsBanner } from '../components/journey/ServiceAlertsBanner'
import { DataSourceStatusModal } from '../components/journey/DataSourceStatusModal'
import { AiJourneyAssistantBar } from '../components/journey/AiJourneyAssistantBar'
import { RouteComparisonTable } from '../components/journey/RouteComparisonTable'
import { AdminNetworkMonitorModal } from '../components/journey/AdminNetworkMonitorModal'
import { JourneyPlanResult, JourneyRouteOption, LiveVehicle } from '../types/transit'
import { transitApi } from '../services/transitApi'

type FeatureMode = 'plan' | 'ai' | 'tracker' | 'departures' | 'nearby'

export default function JourneyPlanner() {
  const [activeFeature, setActiveFeature] = useState<FeatureMode>('plan')
  const [journeyData, setJourneyData] = useState<JourneyPlanResult | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<JourneyRouteOption | null>(null)
  const [liveVehicles, setLiveVehicles] = useState<LiveVehicle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showAdminMonitor, setShowAdminMonitor] = useState(false)
  const [showMatrix, setShowMatrix] = useState(false)

  const [searchFrom, setSearchFrom] = useState('')
  const [searchTo, setSearchTo] = useState('')
  const [selectedDepartureStopId, setSelectedDepartureStopId] = useState('METRO-INT-01')

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const vehicles = await transitApi.getLiveVehicles()
      setLiveVehicles(vehicles)
      if (searchFrom && searchTo) {
        const res = await transitApi.planJourney({
          from: searchFrom,
          to: searchTo,
          preference: 'fastest',
        })
        if (res) {
          setJourneyData(res)
          if (res.routes && res.routes.length > 0) {
            setSelectedRoute(res.routes[0])
          }
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    transitApi.getLiveVehicles().then(setLiveVehicles)
    const interval = setInterval(() => {
      transitApi.getLiveVehicles().then(setLiveVehicles)
    }, 20000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = async (params: {
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
  }) => {
    setIsLoading(true)
    if (params.from) setSearchFrom(params.from)
    if (params.to) setSearchTo(params.to)
    try {
      const res = await transitApi.planJourney(params)
      if (res) {
        setJourneyData(res)
        if (res.routes && res.routes.length > 0) {
          setSelectedRoute(res.routes[0])
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAiPlan = (plan: JourneyPlanResult) => {
    setJourneyData(plan)
    if (plan.routes && plan.routes.length > 0) {
      setSelectedRoute(plan.routes[0])
    }
    if (plan.from?.name) setSearchFrom(plan.from.name)
    if (plan.to?.name) setSearchTo(plan.to.name)
  }

  const FEATURES = [
    { id: 'plan' as FeatureMode, label: 'Plan Trip', icon: Compass },
    { id: 'ai' as FeatureMode, label: 'AI Assistant', icon: Sparkles },
    { id: 'tracker' as FeatureMode, label: 'Live Tracker', icon: Radio, isLive: true },
    { id: 'departures' as FeatureMode, label: 'Departures', icon: Clock },
    { id: 'nearby' as FeatureMode, label: 'Nearby Stops', icon: Navigation },
  ]

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh)] lg:h-screen lg:max-h-screen flex flex-col p-2.5 sm:p-3 md:p-3.5 gap-2 max-w-[1900px] w-full mx-auto overflow-y-auto lg:overflow-hidden">
        {/* Top Header & Navigation Command Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/90 shadow-xs flex-shrink-0">
          {/* Brand & Subtitle */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-slate-900 tracking-tight">
                  Journey Planner
                </h1>
                <span className="text-[9px] font-extrabold px-2 py-0.2 rounded-full bg-blue-100 text-blue-700 tracking-wide uppercase">
                  Multimodal
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Ahmedabad ↔ Gandhinagar ↔ GIFT City
              </div>
            </div>
          </div>

          {/* Feature Navigation Tabs */}
          <div className="bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {FEATURES.map((feat) => {
              const Icon = feat.icon
              const isActive = activeFeature === feat.id
              return (
                <button
                  key={feat.id}
                  type="button"
                  onClick={() => setActiveFeature(feat.id)}
                  className={`py-1 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{feat.label}</span>
                  {feat.isLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5"></span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowAdminMonitor(true)}
              title="Live Network Status"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">Network</span>
            </button>

            <button
              type="button"
              onClick={() => setShowStatusModal(true)}
              title="Data Feeds"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-colors shadow-xs"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Feeds</span>
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Refresh Data"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* FEATURE 1: PLAN TRIP (2-PANE SPLIT SCREEN) */}
        {activeFeature === 'plan' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1 min-h-0 h-full overflow-hidden">
            {/* Left Column: Search Form, Route Options & Step-by-Step Directions */}
            <div className="lg:col-span-5 h-full flex flex-col min-h-0 overflow-y-auto custom-scrollbar space-y-2.5 pr-0.5">
              {/* Service Alert Banner (Compact) */}
              <ServiceAlertsBanner />

              {/* Search Panel */}
              <JourneySearchPanel
                onSearch={handleSearch}
                isLoading={isLoading}
                initialFrom={searchFrom}
                initialTo={searchTo}
              />

              {/* Route Comparison Matrix Modal/Table if open */}
              {showMatrix && journeyData && journeyData.routes && (
                <RouteComparisonTable
                  routes={journeyData.routes}
                  selectedRouteKey={selectedRoute?.route_key || ''}
                  onSelectRoute={(key) => {
                    const target = journeyData.routes.find((r) => r.route_key === key)
                    if (target) setSelectedRoute(target)
                  }}
                  onClose={() => setShowMatrix(false)}
                />
              )}

              {/* Results or Empty State */}
              {!journeyData ? (
                <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs">Popular Express Corridors</h3>
                      <p className="text-[11px] text-slate-500">Tap to instantly route across cities</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { from: 'Kalupur Railway Station', to: 'GIFT City FinTech Zone', label: 'Kalupur ➔ GIFT City', desc: 'Metro Line 1 + EV Shuttle' },
                      { from: 'Sardar Vallabhbhai Patel International Airport', to: 'Mahatma Mandir Convention Centre', label: 'Airport ➔ Gandhinagar', desc: 'Express Bus + BRTS' },
                      { from: 'Sabarmati Railway Station', to: 'Infocity IT Park (Gandhinagar)', label: 'Sabarmati ➔ Infocity', desc: 'Metro Phase 2 / Rail' },
                      { from: 'Iskcon Cross Road (SG Highway)', to: 'Vastral Gam Metro Terminal', label: 'Iskcon ➔ Vastral Gam', desc: 'East-West Metro Cross' },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSearchFrom(item.from)
                          setSearchTo(item.to)
                          handleSearch({
                            from: item.from,
                            to: item.to,
                            preference: 'fastest',
                            modes: ['METRO', 'BRTS', 'AMTS', 'RAIL', 'BUS', 'WALK'],
                            wheelchair: false,
                          })
                        }}
                        className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/80 hover:border-blue-300 border border-slate-200/80 transition-all group"
                      >
                        <div className="font-bold text-slate-800 text-[11px] group-hover:text-blue-700 flex items-center justify-between">
                          <span>{item.label}</span>
                          <span className="text-slate-400 group-hover:text-blue-600">➔</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 pb-2">
                  <RouteResultsList
                    routes={journeyData.routes}
                    selectedRouteKey={selectedRoute?.route_key || null}
                    onSelectRoute={(r) => setSelectedRoute(r)}
                    onToggleMatrix={() => setShowMatrix(!showMatrix)}
                    delayCallout={journeyData.delay_alert_callout}
                    leaveBySummary={journeyData.leave_by_summary}
                  />

                  {selectedRoute && (
                    <JourneyTimeline
                      steps={selectedRoute.steps}
                      fareBreakdown={selectedRoute.fare_breakdown}
                      totalFare={selectedRoute.fare}
                      totalDuration={selectedRoute.duration_minutes}
                      departureTime={selectedRoute.departure_time}
                      arrivalTime={selectedRoute.arrival_time}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Full-Height Interactive Transit Map */}
            <div className="lg:col-span-7 h-full min-h-[360px] lg:min-h-0 rounded-2xl overflow-hidden shadow-sm border border-slate-200/90 relative bg-white">
              <TransitMap
                route={selectedRoute}
                liveVehicles={liveVehicles}
                onSelectVehicle={() => {
                  setActiveFeature('tracker')
                }}
              />
            </div>
          </div>
        )}

        {/* FEATURE 2: AI ASSISTANT (2-PANE SPLIT SCREEN) */}
        {activeFeature === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1 min-h-0 h-full overflow-hidden">
            <div className="lg:col-span-5 h-full flex flex-col min-h-0 overflow-y-auto custom-scrollbar space-y-2.5 pr-0.5">
              <AiJourneyAssistantBar
                onJourneyPlanned={(plan) => {
                  handleAiPlan(plan)
                  setActiveFeature('plan')
                }}
                onUpdateSearchParams={(from, to) => {
                  setSearchFrom(from)
                  setSearchTo(to)
                }}
              />

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  How to Use AI Transit Assistant
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Type your request in natural language. The AI understands multimodal routes, departures, transfer windows, landmarks, and fares.
                </p>
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px]">
                  <div className="font-bold text-slate-700">Try these prompt examples:</div>
                  <div className="space-y-1 text-slate-600">
                    {[
                      'Fastest way from Sabarmati to GIFT City before 9 AM',
                      'Cheapest route from Gandhinagar Sector 21 to Airport',
                      'Direct route from Infocity to Vastral Gam with low walking',
                    ].map((prompt, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[10px] font-medium text-slate-700 flex items-center gap-1.5">
                        <span className="text-blue-600">💬</span>
                        <span>"{prompt}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 h-full min-h-[360px] lg:min-h-0 rounded-2xl overflow-hidden shadow-sm border border-slate-200/90 relative bg-white">
              <TransitMap
                route={selectedRoute}
                liveVehicles={liveVehicles}
              />
            </div>
          </div>
        )}

        {/* FEATURE 3: LIVE TRACKER (2-PANE SPLIT SCREEN) */}
        {activeFeature === 'tracker' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1 min-h-0 h-full overflow-hidden">
            <div className="lg:col-span-5 h-full flex flex-col min-h-0 overflow-y-auto custom-scrollbar pr-0.5">
              <LiveVehicleTrackerCard />
            </div>

            <div className="lg:col-span-7 h-full min-h-[360px] lg:min-h-0 rounded-2xl overflow-hidden shadow-sm border border-slate-200/90 relative bg-white">
              <TransitMap
                route={null}
                liveVehicles={liveVehicles}
              />
            </div>
          </div>
        )}

        {/* FEATURE 4: DEPARTURES (2-PANE SPLIT SCREEN) */}
        {activeFeature === 'departures' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1 min-h-0 h-full overflow-hidden">
            <div className="lg:col-span-6 h-full flex flex-col min-h-0 overflow-y-auto custom-scrollbar pr-0.5">
              <DepartureBoard initialStopId={selectedDepartureStopId} />
            </div>

            <div className="lg:col-span-6 h-full min-h-[360px] lg:min-h-0 rounded-2xl overflow-hidden shadow-sm border border-slate-200/90 relative bg-white">
              <TransitMap
                route={null}
                liveVehicles={liveVehicles}
              />
            </div>
          </div>
        )}

        {/* FEATURE 5: NEARBY STOPS (2-PANE SPLIT SCREEN) */}
        {activeFeature === 'nearby' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1 min-h-0 h-full overflow-hidden">
            <div className="lg:col-span-5 h-full flex flex-col min-h-0 overflow-y-auto custom-scrollbar pr-0.5">
              <NearbyTransportFinder
                onSelectStopDepartures={(stopId) => {
                  setSelectedDepartureStopId(stopId)
                  setActiveFeature('departures')
                }}
                onSelectOriginStop={(name) => {
                  handleSearch({
                    from: name,
                    to: journeyData?.to?.name || 'GIFT City',
                    preference: 'fastest',
                    modes: ['METRO', 'BRTS', 'AMTS', 'RAIL', 'BUS', 'WALK'],
                    wheelchair: false,
                  })
                  setActiveFeature('plan')
                }}
              />
            </div>

            <div className="lg:col-span-7 h-full min-h-[360px] lg:min-h-0 rounded-2xl overflow-hidden shadow-sm border border-slate-200/90 relative bg-white">
              <TransitMap
                route={null}
                liveVehicles={liveVehicles}
              />
            </div>
          </div>
        )}
      </div>

      {/* Data Source Status Modal */}
      <DataSourceStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
      />

      {/* Admin Network Monitor Modal */}
      <AdminNetworkMonitorModal
        isOpen={showAdminMonitor}
        onClose={() => setShowAdminMonitor(false)}
      />
    </DashboardLayout>
  )
}

