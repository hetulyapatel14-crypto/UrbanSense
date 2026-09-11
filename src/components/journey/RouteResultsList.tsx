import React, { useState } from 'react'
import {
  Clock,
  Footprints,
  Shuffle,
  AlertTriangle,
  ArrowRight,
  Train,
  Bus,
  Zap,
  Info,
  Sparkles,
  Leaf,
  Layers,
  ChevronDown,
  ChevronUp,
  Map,
  Navigation
} from 'lucide-react'
import { JourneyRouteOption, DelayAlertCallout, LeaveBySummary } from '../../types/transit'

interface RouteResultsListProps {
  routes: JourneyRouteOption[]
  selectedRouteKey: string | null
  onSelectRoute: (route: JourneyRouteOption) => void
  onToggleMatrix?: () => void
  onOpenMap?: (route?: JourneyRouteOption) => void
  onStartCompanion?: (route: JourneyRouteOption) => void
  delayCallout?: DelayAlertCallout | null
  leaveBySummary?: LeaveBySummary | null
}

const formatWalkDistance = (route: JourneyRouteOption): string => {
  if (route.walking_distance_km !== undefined && route.walking_distance_km > 0) {
    if (route.walking_distance_km < 1) {
      return `${Math.round(route.walking_distance_km * 1000)}m`
    }
    return `${route.walking_distance_km.toFixed(1)} km`
  }
  if (route.steps && route.steps.length > 0) {
    const walkKm = route.steps
      .filter((s) => s.step_type === 'WALK' || s.step_type === 'TRANSFER')
      .reduce((sum, s) => sum + (s.distance_km || 0), 0)
    if (walkKm > 0) {
      if (walkKm < 1) {
        return `${Math.round(walkKm * 1000)}m`
      }
      return `${walkKm.toFixed(1)} km`
    }
  }
  const estM = (route.walking_minutes || 0) * 75
  return estM < 1000 ? `${estM}m` : `${(estM / 1000).toFixed(1)} km`
}

const getBadgeInfo = (route: JourneyRouteOption) => {
  const rawLabel = (route.tag_label || route.category_badge || '').trim()
  const label = rawLabel || 'RECOMMENDED'
  let colorClass = route.badge_color || 'bg-blue-600 text-white'

  if (label === 'FASTEST') {
    colorClass = 'bg-amber-500 text-white shadow-xs'
  } else if (label === 'CHEAPEST') {
    colorClass = 'bg-emerald-600 text-white shadow-xs'
  } else if (label === 'LEAST WALKING') {
    colorClass = 'bg-blue-600 text-white shadow-xs'
  } else if (label === 'FEWEST TRANSFERS') {
    colorClass = 'bg-purple-600 text-white shadow-xs'
  } else if (label === 'MOST RELIABLE') {
    colorClass = 'bg-indigo-600 text-white shadow-xs'
  } else if (label === 'MINIMUM WAIT' || label === '⏱ MINIMIZE WAITING') {
    colorClass = 'bg-teal-600 text-white shadow-xs'
  } else if (label === 'ELECTRIC EXPRESS' || label === 'ZERO EMISSION') {
    colorClass = 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400'
  } else if (label === 'BRTS BUSWAY') {
    colorClass = 'bg-orange-600 text-white shadow-xs'
  } else if (label === 'SUBURBAN RAIL') {
    colorClass = 'bg-purple-700 text-white shadow-xs'
  } else if (label === 'CITY FEEDER') {
    colorClass = 'bg-emerald-700 text-white shadow-xs'
  } else if (label === 'MULTIMODAL') {
    colorClass = 'bg-indigo-600 text-white shadow-xs'
  } else if (label === 'ALTERNATIVE') {
    colorClass = 'bg-slate-600 text-white shadow-xs'
  } else if (!route.badge_color) {
    colorClass = 'bg-blue-600 text-white shadow-xs'
  }

  return { label, colorClass }
}

export const RouteResultsList: React.FC<RouteResultsListProps> = ({
  routes,
  selectedRouteKey,
  onSelectRoute,
  onToggleMatrix,
  onOpenMap,
  onStartCompanion,
  delayCallout,
  leaveBySummary,
}) => {
  const [showAllRoutes, setShowAllRoutes] = useState(false)
  const TOP_ROUTES_LIMIT = 5

  if (!routes || routes.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Info className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-800 text-base">No Direct Transit Route Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Try expanding your walking distance preference or enabling all transport modes (Metro, BRTS, AMTS, Rail, Regional Bus).
        </p>
      </div>
    )
  }

  const hasMore = routes.length > TOP_ROUTES_LIMIT
  const visibleRoutes = showAllRoutes ? routes : routes.slice(0, TOP_ROUTES_LIMIT)
  const remainingCount = routes.length - TOP_ROUTES_LIMIT

  return (
    <div className="space-y-4">
      {/* Top Action & Summary Bar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <span>
            {hasMore && !showAllRoutes
              ? `Top 5 of ${routes.length} Multimodal Routes`
              : `Found ${routes.length} Multimodal Routes`}
          </span>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            Real-Time Verified
          </span>
        </div>

        {onToggleMatrix && (
          <button
            type="button"
            onClick={onToggleMatrix}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-semibold border border-slate-200 hover:border-indigo-200 transition shadow-xs"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Side-by-Side Matrix</span>
          </button>
        )}
      </div>

      {/* Leave By Target Arrival Box (if present) */}
      {leaveBySummary && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider">
                Recommended Departure for {leaveBySummary.target_arrival_time} Arrival
              </div>
              <div className="text-lg font-extrabold flex items-center gap-2">
                Leave at {leaveBySummary.recommended_departure_time}
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-white/20 text-white">
                  +{leaveBySummary.safety_buffer_minutes}m buffer
                </span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block text-right text-xs text-blue-100">
            Expected Arrival: <strong className="text-white font-bold">{leaveBySummary.expected_arrival_time}</strong>
          </div>
        </div>
      )}

      {/* Delay-Aware Dynamic Alert Callout */}
      {delayCallout && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3.5 flex items-start space-x-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="font-bold text-amber-900 flex items-center gap-2">
              <span>Dynamic Delay Advisory</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-800 font-extrabold text-[10px]">
                Saves ~{delayCallout.time_saved_minutes} min
              </span>
            </div>
            <p className="text-amber-800 mt-0.5 leading-relaxed">
              {delayCallout.alert_message}
            </p>
          </div>
        </div>
      )}

      {/* Route Cards List */}
      <div className="space-y-3">
        {visibleRoutes.map((route, idx) => {
          const isSelected = selectedRouteKey === route.route_key || (!selectedRouteKey && idx === 0)
          const tightStep = route.steps.find((s) => s.is_tight)

          return (
            <div
              key={route.route_key || idx}
              onClick={() => onSelectRoute(route)}
              className={`p-4 md:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-white hover:bg-slate-50/80 border-slate-200/90 shadow-sm'
              }`}
            >
              {/* Category Badge Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {(() => {
                    const { label, colorClass } = getBadgeInfo(route)
                    return (
                      <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm ${colorClass}`}>
                        {label}
                      </span>
                    )
                  })()}
                  <span className="text-xs font-bold text-slate-800">
                    {route.summary_title}
                  </span>
                </div>

                {/* Fare, Duration Summary, View on Map & Start Journey Buttons */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-baseline space-x-1.5 text-right">
                    <div className="text-lg font-black text-slate-900 tracking-tight">
                      {route.duration_minutes} <span className="text-[10px] font-semibold text-slate-500">min</span>
                    </div>
                    <div className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ₹{route.fare}
                    </div>
                  </div>

                  {onOpenMap && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectRoute(route)
                        onOpenMap(route)
                      }}
                      title="Open full interactive map modal"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition-all hover:scale-105 active:scale-95"
                    >
                      <Map className="w-3 h-3" />
                      <span>Map</span>
                    </button>
                  )}

                  {onStartCompanion && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectRoute(route)
                        onStartCompanion(route)
                      }}
                      title="Start Live Turn-by-Turn Journey Companion"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-bold shadow-xs transition-all hover:scale-105 active:scale-95"
                    >
                      <Navigation className="w-3 h-3" />
                      <span className="hidden sm:inline">Start</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Why Recommended / Key Advantages */}
              {route.why_recommended && route.why_recommended.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap my-2">
                  {route.why_recommended.map((adv, ai) => (
                    <span
                      key={ai}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-100"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                      {adv}
                    </span>
                  ))}
                  {route.co2_saved_kg && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      <Leaf className="w-2.5 h-2.5 text-emerald-500" />
                      {route.co2_saved_kg} kg CO₂ saved
                    </span>
                  )}
                </div>
              )}

              {/* Tight Transfer Warning if applicable */}
              {tightStep && (
                <div className="mb-2 bg-rose-50 border border-rose-300 rounded-lg p-2 text-[11px] text-rose-900 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                  <span>
                    <strong>🔴 Tight Transfer Connection:</strong> {tightStep.tight_transfer_warning || `Only ${tightStep.transfer_window_mins || 4} mins transfer window.`}
                  </span>
                </div>
              )}

              {/* Mode Chain Visualizer */}
              <div className="flex flex-wrap items-center gap-1.5 py-1.5 text-xs">
                {route.steps.map((step, sIdx) => {
                  const isEBus = step.mode === 'GANDHINAGAR_ELECTRIC_BUS' || step.mode?.includes('ELECTRIC') || step.route_number?.startsWith('E-') || step.route_number?.startsWith('GIFT-')
                  return (
                    <React.Fragment key={sIdx}>
                      <div className="flex items-center space-x-1">
                        {step.step_type === 'WALK' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium">
                            <Footprints className="w-3 h-3 text-slate-400" />
                            {step.duration_mins}m
                          </span>
                        ) : step.step_type === 'TRANSFER' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[11px] font-semibold border border-purple-200/60">
                            <Shuffle className="w-3 h-3 text-purple-500" />
                            Transfer ({step.duration_mins}m)
                            {step.transfer_window_mins && (
                              <span className="text-[10px] text-purple-500">
                                [{step.transfer_window_mins}m window]
                              </span>
                            )}
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: step.route_color || (isEBus ? '#059669' : '#2563EB') }}
                          >
                            {isEBus ? (
                              <Zap className="w-3 h-3 fill-emerald-200 text-emerald-200" />
                            ) : step.mode === 'METRO' || step.mode === 'RAIL' ? (
                              <Train className="w-3 h-3" />
                            ) : (
                              <Bus className="w-3 h-3" />
                            )}
                            {isEBus ? `🚌⚡ ${step.route_number}` : `${step.route_number}`} ({step.duration_mins}m{step.fare !== undefined && step.fare > 0 ? ` • ₹${step.fare}` : ''})
                          </span>
                        )}
                      </div>
                      {sIdx < route.steps.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                      )}
                    </React.Fragment>
                  )
                })}
              </div>

              {/* Metrics Grid Footer */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Dep: <strong>{route.departure_time}</strong> → Arr: <strong>{route.arrival_time}</strong></span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <Footprints className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Walk: <strong>{route.walking_minutes} min</strong> <span className="text-slate-400 font-normal">({formatWalkDistance(route)})</span>
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <Shuffle className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Transfers: <strong>{route.transfers}</strong> <span className="text-slate-400 font-normal">• {route.total_distance_km} km</span>
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-1.5">
                  {route.delay_minutes > 0 ? (
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      +{route.delay_minutes}m delay
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      ON TIME
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-semibold">
                    {Math.round(route.reliability_score * 100)}% rel
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {/* Expand / Collapse More Routes Option Button */}
        {hasMore && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAllRoutes(!showAllRoutes)}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all group"
            >
              {showAllRoutes ? (
                <>
                  <ChevronUp className="w-4 h-4 text-indigo-600 group-hover:-translate-y-0.5 transition-transform" />
                  <span>Show Top 5 Only (Hide {remainingCount} other options)</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 text-indigo-600 group-hover:translate-y-0.5 transition-transform" />
                  <span>More Options (+{remainingCount} more Multimodal Routes available)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
