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

  const [searchFrom, setSearchFrom] = useState('Sabarmati Railway Station')
  const [searchTo, setSearchTo] = useState('GIFT City')

  // Initial plan load: Sabarmati -> GIFT City
  const loadInitialPlan = async () => {
    setIsLoading(true)
    try {
      const [res, vehicles] = await Promise.all([
        transitApi.planJourney({
          from: searchFrom || 'Sabarmati Railway Station',
          to: searchTo || 'GIFT City',
          preference: 'fastest',
        }),
        transitApi.getLiveVehicles(),
      ])
      if (res) {
        setJourneyData(res)
        if (res.routes && res.routes.length > 0) {
          setSelectedRoute(res.routes[0])
        }
      }
      setLiveVehicles(vehicles)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInitialPlan()
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
      <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 mb-0.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Public Transit Network</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium">Ahmedabad ↔ Gandhinagar ↔ GIFT City</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Journey Planner</span>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 tracking-wide uppercase">
                Multimodal
              </span>
            </h1>
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center space-x-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowAdminMonitor(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>Network Status</span>
            </button>

            <button
              type="button"
              onClick={() => setShowStatusModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>Data Feeds</span>
            </button>

            <button
              type="button"
              onClick={loadInitialPlan}
              disabled={isLoading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Feature Navigation Bar */}
        <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {FEATURES.map((feat) => {
            const Icon = feat.icon
            const isActive = activeFeature === feat.id
            return (
              <button
                key={feat.id}
                type="button"
                onClick={() => setActiveFeature(feat.id)}
                className={`flex-1 min-w-[120px] py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{feat.label}</span>
                {feat.isLive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5"></span>
                )}
              </button>
            )
          })}
        </div>

        {/* FEATURE 1: PLAN TRIP */}
        {activeFeature === 'plan' && (
          <div className="space-y-6">
            {/* Live Service Alerts Banner */}
            <ServiceAlertsBanner />

            {/* Search Panel */}
            <JourneySearchPanel
              onSearch={handleSearch}
              isLoading={isLoading}
              initialFrom={searchFrom}
              initialTo={searchTo}
            />

            {/* Route Comparison Matrix (Toggleable) */}
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

            {/* 2-Column Clean Workspace: Route Details & Clean Map */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Routes List & Step-by-Step Directions */}
              <div className="lg:col-span-6 space-y-6">
                {journeyData && (
                  <RouteResultsList
                    routes={journeyData.routes}
                    selectedRouteKey={selectedRoute?.route_key || null}
                    onSelectRoute={(r) => setSelectedRoute(r)}
                    onToggleMatrix={() => setShowMatrix(!showMatrix)}
                    delayCallout={journeyData.delay_alert_callout}
                    leaveBySummary={journeyData.leave_by_summary}
                  />
                )}

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

              {/* Right Column: Clean, Full-Height Transit Map (No extra companion widgets!) */}
              <div className="lg:col-span-6 sticky top-6">
                <div className="h-[520px] lg:h-[620px] rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                  <TransitMap
                    route={selectedRoute}
                    liveVehicles={liveVehicles}
                    onSelectVehicle={() => {
                      setActiveFeature('tracker')
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FEATURE 2: AI ASSISTANT */}
        {activeFeature === 'ai' && (
          <div className="space-y-6">
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

            {/* Interactive Preview Map for AI suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    How to Use AI Assistant
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Type your request in natural language. The AI understands multimodal routes, departures, transfer windows, landmarks, and fares.
                  </p>
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="font-bold text-slate-700">Example queries:</div>
                    <ul className="space-y-1.5 text-slate-600 list-disc pl-4">
                      <li>"Fastest way from Sabarmati to GIFT City before 9 AM"</li>
                      <li>"How to reach Airport from Gandhinagar Sector 21 with least walking"</li>
                      <li>"Cheapest route from Infocity to Vastral Gam"</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="h-[460px] rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                  <TransitMap
                    route={selectedRoute}
                    liveVehicles={liveVehicles}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FEATURE 3: LIVE TRACKER */}
        {activeFeature === 'tracker' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <LiveVehicleTrackerCard />
            </div>

            <div className="lg:col-span-7">
              <div className="h-[560px] rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                <TransitMap
                  route={null}
                  liveVehicles={liveVehicles}
                />
              </div>
            </div>
          </div>
        )}

        {/* FEATURE 4: DEPARTURES */}
        {activeFeature === 'departures' && (
          <div className="max-w-4xl mx-auto">
            <DepartureBoard initialStopId="METRO-INT-01" />
          </div>
        )}

        {/* FEATURE 5: NEARBY STOPS */}
        {activeFeature === 'nearby' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-6">
              <NearbyTransportFinder
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

            <div className="lg:col-span-6">
              <div className="h-[520px] rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                <TransitMap
                  route={null}
                  liveVehicles={liveVehicles}
                />
              </div>
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
