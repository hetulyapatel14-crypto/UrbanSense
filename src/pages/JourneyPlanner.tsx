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
  Sparkles,
  Map,
  Zap
} from 'lucide-react'
import { JourneySearchPanel } from '../components/journey/JourneySearchPanel'
import { RouteResultsList } from '../components/journey/RouteResultsList'
import { JourneyTimeline } from '../components/journey/JourneyTimeline'
import { DepartureBoard } from '../components/journey/DepartureBoard'
import { LiveVehicleTrackerCard } from '../components/journey/LiveVehicleTrackerCard'
import { NearbyTransportFinder } from '../components/journey/NearbyTransportFinder'
import { ServiceAlertsBanner } from '../components/journey/ServiceAlertsBanner'
import { DataSourceStatusModal } from '../components/journey/DataSourceStatusModal'
import { AiJourneyAssistantBar } from '../components/journey/AiJourneyAssistantBar'
import { RouteComparisonTable } from '../components/journey/RouteComparisonTable'
import { AdminNetworkMonitorModal } from '../components/journey/AdminNetworkMonitorModal'
import { TransitMapModal } from '../components/journey/TransitMapModal'
import { TraccarGpsModal } from '../components/journey/TraccarGpsModal'
import { ElectricBusDetails } from '../components/journey/ElectricBusDetails'
import { ElectricBusDepartureBoard } from '../components/journey/ElectricBusDepartureBoard'
import { ElectricBusRouteCard } from '../components/journey/ElectricBusRouteCard'
import { ElectricBusVehicleCard } from '../components/journey/ElectricBusVehicleCard'
import { JourneyProgressTracker } from '../components/journey/JourneyProgressTracker'
import { JourneyPlanResult, JourneyRouteOption, LiveVehicle, ElectricBusRoute, ElectricBusVehicle } from '../types/transit'
import { transitApi } from '../services/transitApi'

type FeatureMode = 'plan' | 'ai' | 'electric-bus' | 'tracker' | 'departures' | 'nearby'

export default function JourneyPlanner() {
  const [activeFeature, setActiveFeature] = useState<FeatureMode>('plan')
  const [journeyData, setJourneyData] = useState<JourneyPlanResult | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<JourneyRouteOption | null>(null)
  const [liveVehicles, setLiveVehicles] = useState<LiveVehicle[]>([])
  const [electricRoutes, setElectricRoutes] = useState<ElectricBusRoute[]>([])
  const [electricVehicles, setElectricVehicles] = useState<ElectricBusVehicle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showAdminMonitor, setShowAdminMonitor] = useState(false)
  const [showTraccarModal, setShowTraccarModal] = useState(false)
  const [showMatrix, setShowMatrix] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [isCompanionActive, setIsCompanionActive] = useState(false)
  const [companionRoute, setCompanionRoute] = useState<JourneyRouteOption | null>(null)

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

  useEffect(() => {
    transitApi.getElectricBusRoutes().then(setElectricRoutes)
    transitApi.getElectricBusVehicles().then(res => setElectricVehicles(res.vehicles || []))
  }, [])

  const FEATURES = [
    { id: 'plan' as FeatureMode, label: 'Plan Trip', icon: Compass },
    { id: 'electric-bus' as FeatureMode, label: '⚡ Gandhinagar e-Bus', icon: Zap, isLive: true, isElectric: true },
    { id: 'ai' as FeatureMode, label: 'AI Assistant', icon: Sparkles },
    { id: 'tracker' as FeatureMode, label: 'Live Tracker', icon: Radio, isLive: true },
    { id: 'departures' as FeatureMode, label: 'Departures', icon: Clock },
    { id: 'nearby' as FeatureMode, label: 'Nearby Stops', icon: Navigation },
  ]

  return (
    <DashboardLayout>
      <div className="h-full min-h-screen lg:min-h-0 lg:h-screen lg:max-h-screen flex flex-col p-2.5 sm:p-3 md:p-4 gap-2.5 max-w-[1900px] w-full mx-auto overflow-y-auto custom-scrollbar">
        {/* Top Header Bar: Brand & Action Controls */}
        <div className="relative overflow-hidden flex items-center justify-between gap-3 bg-white/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-slate-200/90 shadow-card flex-shrink-0 animate-fade-in-up">
          {/* Ambient glow wash */}
          <span className="pointer-events-none absolute -top-16 left-1/4 w-72 h-32 bg-gradient-to-tr from-blue-400/12 via-indigo-400/10 to-transparent blur-3xl rounded-full animate-aurora" aria-hidden="true" />
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" aria-hidden="true" />
          {/* Brand & Subtitle */}
          <div className="relative flex items-center space-x-3">
            <div className="relative overflow-hidden w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-xs transition-transform duration-500 hover:scale-105">
              <Compass className="w-4 h-4 relative z-10" />
              <span className="pointer-events-none absolute inset-0 bg-sheen opacity-60 animate-sheen" aria-hidden="true" />
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

          {/* Quick Action Tools with Open Map Button */}
          <div className="relative flex items-center space-x-2 flex-shrink-0">
            {/* Dedicated Open Map Button */}
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              title="Open Interactive Transit Map in Center"
              className="group relative overflow-hidden flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-[length:200%_auto] hover:bg-[position:right_center] text-white text-xs font-bold shadow-sm shadow-blue-500/20 hover:shadow-glow-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <span className="pointer-events-none absolute inset-0 bg-sheen opacity-0 group-hover:opacity-100 group-hover:animate-sheen" aria-hidden="true" />
              <Map className="w-3.5 h-3.5" />
              <span>Open Map</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAdminMonitor(true)}
              title="Live Network Status"
              className="press-scale flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 text-xs font-bold shadow-xs hover:shadow-sm transition-all duration-300 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span className="hidden sm:inline">Network</span>
            </button>

            <button
              type="button"
              onClick={() => setShowStatusModal(true)}
              title="Data Feeds"
              className="press-scale flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all duration-300 shadow-xs hover:shadow-sm cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Feeds</span>
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Refresh Data"
              className="press-scale flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all duration-300 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 transition-transform duration-300 ${isLoading ? 'animate-spin' : 'group-hover:rotate-90'}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Dedicated Feature Navigation Portion (Plan Trip, Gandhinagar e-Bus, AI Assistant, Live Tracker, Departures, Nearby Stops) */}
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200/90 shadow-card flex-shrink-0 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" aria-hidden="true" />
          <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
            {FEATURES.map((feat) => {
              const Icon = feat.icon
              const isActive = activeFeature === feat.id
              return (
                <button
                  key={feat.id}
                  type="button"
                  onClick={() => setActiveFeature(feat.id)}
                  className={`group/tab relative overflow-hidden py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all duration-300 ease-silk cursor-pointer ${
                    isActive
                      ? feat.isElectric
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm ring-1 ring-emerald-400/30'
                        : 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/60 hover:-translate-y-0.5 hover:shadow-xs'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? feat.isElectric
                          ? 'text-emerald-200 fill-emerald-200'
                          : 'text-white'
                        : feat.isElectric
                        ? 'text-emerald-600'
                        : 'text-slate-500'
                    }`}
                  />
                  <span>{feat.label}</span>
                  {/* Active sheen sweep */}
                  {isActive && (
                    <span
                      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-white/25 blur-md animate-sheen"
                      aria-hidden="true"
                    />
                  )}
                  {feat.isLive && (
                    <span
                      className={`w-2 h-2 rounded-full ml-0.5 live-dot ${
                        isActive ? 'bg-emerald-300' : 'bg-emerald-500'
                      }`}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* FEATURE 1: PLAN TRIP */}
        {activeFeature === 'plan' && (
          <div className="flex-1 min-h-0 space-y-3 pb-4">
            {/* Live Service Alerts Banner */}
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

            {/* If no route planned yet: Popular Express Corridors */}
            {!journeyData ? (
              <div className="panel-premium p-5 space-y-3.5 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Popular Express Corridors</h3>
                      <p className="text-xs text-slate-500">Tap any corridor to route instantly across Metro, BRTS, and Rail</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMapModal(true)}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-blue-600 text-xs font-bold border border-slate-200 hover:border-blue-300 transition-all"
                  >
                    <Map className="w-3.5 h-3.5" />
                    <span>View Transit Map</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
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
                      className="text-left p-3 rounded-xl bg-slate-50 hover:bg-blue-50/90 hover:border-blue-300 border border-slate-200/80 transition-all duration-300 ease-silk group shadow-2xs hover:shadow-card hover:-translate-y-1"
                    >
                      <div className="font-bold text-slate-800 text-xs group-hover:text-blue-700 flex items-center justify-between">
                        <span>{item.label}</span>
                        <span className="text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5">➔</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* If journey planned: 2-Column Results List & Step-by-Step Directions */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Route Options List */}
                <div className="lg:col-span-6">
                  <RouteResultsList
                    routes={journeyData.routes}
                    selectedRouteKey={selectedRoute?.route_key || null}
                    onSelectRoute={(r) => setSelectedRoute(r)}
                    onToggleMatrix={() => setShowMatrix(!showMatrix)}
                    onOpenMap={(r) => {
                      if (r) setSelectedRoute(r)
                      setShowMapModal(true)
                    }}
                    onStartCompanion={(r) => {
                      setCompanionRoute(r)
                      setIsCompanionActive(true)
                    }}
                    delayCallout={journeyData.delay_alert_callout}
                    leaveBySummary={journeyData.leave_by_summary}
                  />
                </div>

                {/* Step-by-Step Directions */}
                <div className="lg:col-span-6">
                  {selectedRoute && (
                    <JourneyTimeline
                      steps={selectedRoute.steps}
                      fareBreakdown={selectedRoute.fare_breakdown}
                      totalFare={selectedRoute.fare}
                      totalDuration={selectedRoute.duration_minutes}
                      departureTime={selectedRoute.departure_time}
                      arrivalTime={selectedRoute.arrival_time}
                      onOpenMap={() => setShowMapModal(true)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FEATURE: GANDHINAGAR ELECTRIC BUS NETWORK (GGTSL / PM-eBus Sewa / GIFT) */}
        {activeFeature === 'electric-bus' && (
          <div className="flex-1 min-h-0 space-y-6 max-w-7xl mx-auto w-full pb-8">
            {/* Real-time Green Fleet Intelligence Header */}
            <ElectricBusDetails />

            {/* Live Electric Departures Board */}
            <ElectricBusDepartureBoard />

            {/* Electric Routes Directory */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap border-b border-white/10 pb-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                    <span>Electrified Route Directory (E-1 to E-16 & GIFT Shuttles)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    100% Battery Electric Vehicles connecting Gandhinagar Sectors, Metro Phase 2 & GIFT City
                  </p>
                </div>

                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {electricRoutes.length} Electrified Routes
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {electricRoutes.map((route) => (
                  <ElectricBusRouteCard
                    key={route.route_id}
                    route={route}
                    onPlanTripToRoute={(orig, dest) => {
                      setSearchFrom(orig)
                      setSearchTo(dest)
                      handleSearch({
                        from: orig,
                        to: dest,
                        preference: 'fastest',
                        modes: ['METRO', 'GANDHINAGAR_ELECTRIC_BUS', 'BRTS', 'AMTS', 'BUS', 'WALK'],
                        wheelchair: false,
                      })
                      setActiveFeature('plan')
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Live GPS Telemetry Fleet Feed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Live Telemetry & Battery Health Stream</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time battery SOC %, live speed, charging state, and delay monitor
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-teal-300 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                  {electricVehicles.length} Active e-Buses Tracked
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {electricVehicles.map((veh) => (
                  <ElectricBusVehicleCard
                    key={veh.vehicle_id}
                    vehicle={veh}
                    onFocusOnMap={() => {
                      setShowMapModal(true)
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FEATURE 2: AI ASSISTANT */}
        {activeFeature === 'ai' && (
          <div className="flex-1 min-h-0 space-y-4 max-w-5xl mx-auto w-full pb-6">
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

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>How to Use AI Transit Assistant</span>
                </h3>

                <button
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Open Map</span>
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Type your request in natural language. The AI understands multimodal routes, departures, transfer windows, landmarks, and fares.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="font-bold text-slate-700">Try these prompt examples:</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {[
                    'Fastest way from Sabarmati to GIFT City before 9 AM',
                    'Cheapest route from Gandhinagar Sector 21 to Airport',
                    'Direct route from Infocity to Vastral Gam with low walking',
                  ].map((prompt, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700 flex flex-col justify-between">
                      <span className="text-slate-800 font-semibold">"{prompt}"</span>
                      <span className="text-[10px] text-blue-600 font-bold mt-2">Natural Language AI</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FEATURE 3: LIVE TRACKER */}
        {activeFeature === 'tracker' && (
          <div className="flex-1 min-h-0 max-w-5xl mx-auto w-full pb-6 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Live Transit Fleet Tracker
              </div>
              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
              >
                <Map className="w-3.5 h-3.5" />
                <span>View Live Vehicles on Map</span>
              </button>
            </div>
            <LiveVehicleTrackerCard />
          </div>
        )}

        {/* FEATURE 4: DEPARTURES */}
        {activeFeature === 'departures' && (
          <div className="flex-1 min-h-0 max-w-5xl mx-auto w-full pb-6 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Live Platform Departure Board
              </div>
              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
              >
                <Map className="w-3.5 h-3.5" />
                <span>View Station on Map</span>
              </button>
            </div>
            <DepartureBoard initialStopId={selectedDepartureStopId} />
          </div>
        )}

        {/* FEATURE 5: NEARBY STOPS */}
        {activeFeature === 'nearby' && (
          <div className="flex-1 min-h-0 max-w-5xl mx-auto w-full pb-6 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Nearby Transport Hubs & Stops
              </div>
              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
              >
                <Map className="w-3.5 h-3.5" />
                <span>View Stops on Map</span>
              </button>
            </div>
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
        )}
      </div>

      {/* Centered Transit Map Modal with Backdrop Blur */}
      <TransitMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        route={selectedRoute}
        liveVehicles={liveVehicles}
        onSelectVehicle={() => {
          setShowMapModal(false)
          setActiveFeature('tracker')
        }}
      />

      {/* Data Source Status Modal */}
      <DataSourceStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
      />

      {/* Live Turn-by-Turn Companion Mode Tracker */}
      {isCompanionActive && (companionRoute || selectedRoute) && (
        <JourneyProgressTracker
          route={companionRoute || selectedRoute!}
          onClose={() => setIsCompanionActive(false)}
          onFocusStepOnMap={() => setShowMapModal(true)}
        />
      )}

      {/* Admin Network Monitor Modal */}
      <AdminNetworkMonitorModal
        isOpen={showAdminMonitor}
        onClose={() => setShowAdminMonitor(false)}
      />

      {/* Traccar Phone & Live GPS Controller Modal */}
      <TraccarGpsModal
        isOpen={showTraccarModal}
        onClose={() => setShowTraccarModal(false)}
      />
    </DashboardLayout>
  )
}


