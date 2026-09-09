import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Mic,
  Compass,
  Clock,
  IndianRupee,
  Shuffle,
  ShieldCheck,
  X,
  Radio,
  MapPin,
  Check
} from 'lucide-react'
import { transitApi } from '../../services/transitApi'
import { JourneyPlanResult, AiJourneyResponse } from '../../types/transit'

interface AiJourneyAssistantBarProps {
  onJourneyPlanned: (plan: JourneyPlanResult, queryText: string) => void
  onUpdateSearchParams?: (from: string, to: string) => void
}

const SAMPLE_QUERIES = [
  'Gandhinagar Sector 21 to Airport',
  'Sabarmati to GIFT City before 9 AM',
  'Infocity to Vastral Gam (Cheapest)'
]

export const AiJourneyAssistantBar: React.FC<AiJourneyAssistantBarProps> = ({
  onJourneyPlanned,
  onUpdateSearchParams
}) => {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [aiData, setAiData] = useState<AiJourneyResponse | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isApplied, setIsApplied] = useState(false)

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechSupported(true)
    }
  }, [])

  const startVoiceInput = () => {
    if (!speechSupported) return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-IN'
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => setIsListening(true)
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        setIsListening(false)
        handleSubmit(transcript)
      }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      recognition.start()
    } catch (err) {
      console.warn('Speech recognition error:', err)
      setIsListening(false)
    }
  }

  const handleSubmit = async (textToSubmit?: string) => {
    const q = textToSubmit || query
    if (!q.trim()) return

    setLoading(true)
    setIsOpen(true)
    setIsApplied(false)
    try {
      const res: AiJourneyResponse = await transitApi.askAiAssistant(q)
      if (res) {
        setAiData(res)

        if (res.journey_plan && res.journey_plan.routes && res.journey_plan.routes.length > 0) {
          onJourneyPlanned(res.journey_plan, q)
        }

        if (onUpdateSearchParams && res.parsed_intent) {
          onUpdateSearchParams(res.parsed_intent.from_location, res.parsed_intent.to_location)
        }
      }
    } catch (err) {
      console.error('AI assistant error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyRoute = () => {
    if (aiData?.journey_plan && aiData.journey_plan.routes?.length > 0) {
      onJourneyPlanned(aiData.journey_plan, query)
      if (onUpdateSearchParams && aiData.parsed_intent) {
        onUpdateSearchParams(aiData.parsed_intent.from_location, aiData.parsed_intent.to_location)
      }
      setIsApplied(true)
    }
  }

  const card = aiData?.structured_card
  const bestRoute = aiData?.journey_plan?.routes?.[0]

  return (
    <div className="w-full bg-slate-900/95 border border-indigo-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-xl transition-all">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              AI Journey Assistant
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Transit AI
              </span>
            </h3>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400">
          <Radio className="w-2.5 h-2.5 animate-pulse" />
          <span>Real-Time AI Engine</span>
        </div>
      </div>

      {/* Query Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Compass className="w-4 h-4 text-indigo-400" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything (e.g., 'Fastest way from Gandhinagar Sec 21 to Airport' or 'Reach GIFT City before 9 AM')"
            className="w-full bg-slate-950/80 border border-slate-700/80 hover:border-indigo-500/50 focus:border-indigo-400 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-400 outline-none transition"
          />

          {speechSupported && (
            <button
              type="button"
              onClick={startVoiceInput}
              title="Voice Input"
              className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                isListening ? 'text-red-400 animate-pulse' : 'text-slate-400 hover:text-indigo-400'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-md flex-shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Ask AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
        <span className="text-[11px] text-slate-400 font-medium">Try asking:</span>
        {SAMPLE_QUERIES.map((sq, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setQuery(sq)
              handleSubmit(sq)
            }}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-950 text-slate-300 hover:text-indigo-200 border border-slate-700/70 hover:border-indigo-500/40 transition truncate"
          >
            "{sq}"
          </button>
        ))}
      </div>

      {/* Clean, Non-Congested AI Response Card */}
      {isOpen && card && (
        <div className="mt-3.5 pt-3 border-t border-slate-800 animate-fadeIn">
          <div className="bg-slate-950/90 border border-indigo-500/40 rounded-xl p-4 space-y-3">
            {/* Header with Title & Dismiss */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  AI RECOMMENDATION
                </span>
                <span className="text-xs font-bold text-white">
                  {card.structured_title}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Concise Stats Row (Travel Time, Fare, Transfers, Punctuality) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-400" /> Travel Time
                </div>
                <div className="font-extrabold text-white text-sm mt-0.5">
                  {card.travel_time_mins} min
                </div>
                {card.departure_time && card.arrival_time && (
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {card.departure_time} → {card.arrival_time}
                  </div>
                )}
              </div>

              <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <IndianRupee className="w-3 h-3 text-emerald-400" /> Total Fare
                </div>
                <div className="font-extrabold text-emerald-400 text-sm mt-0.5">
                  ₹{card.fare}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Save {card.taxi_comparison?.savings_pct || 90}% vs cab
                </div>
              </div>

              <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Shuffle className="w-3 h-3 text-blue-400" /> Transfers
                </div>
                <div className="font-extrabold text-white text-sm mt-0.5">
                  {card.transfers_count === 0 ? 'Direct (0)' : `${card.transfers_count} transfer`}
                </div>
                <div className="text-[10px] text-blue-300 mt-0.5 truncate">
                  {card.modes.join(' + ') || 'Transit'}
                </div>
              </div>

              <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-400" /> Reliability
                </div>
                <div className="font-extrabold text-purple-300 text-sm mt-0.5">
                  {card.reliability_pct}% Punctual
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {card.co2_saved_kg} kg CO₂ saved
                </div>
              </div>
            </div>

            {/* Simple Transit Leg Breakdown */}
            {bestRoute && bestRoute.steps && (
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] pt-1">
                <span className="text-slate-400 font-medium">Route:</span>
                {bestRoute.steps.map((s, si) => (
                  <span
                    key={si}
                    className={`px-2 py-0.5 rounded ${
                      s.step_type === 'WALK'
                        ? 'bg-slate-800 text-slate-300'
                        : s.step_type === 'TRANSFER'
                        ? 'bg-purple-950 text-purple-300 border border-purple-500/30 font-semibold'
                        : 'bg-indigo-950 text-indigo-200 border border-indigo-500/30 font-bold'
                    }`}
                  >
                    {s.step_type === 'WALK'
                      ? `Walk (${s.duration_mins}m)`
                      : s.step_type === 'TRANSFER'
                      ? `Transfer (${s.duration_mins}m)`
                      : `${s.route_number || s.mode} (${s.duration_mins}m)`}
                  </span>
                ))}
              </div>
            )}

            {/* One Simple Advisory Line */}
            {aiData?.parsed_intent?.arrive_by && (
              <p className="text-[11px] text-amber-300/90 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                ⏰ <strong>Target Arrival:</strong> Arrive before {aiData.parsed_intent.arrive_by} with safety buffer.
              </p>
            )}

            {/* Clean Action Footer */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
              <div className="text-[11px] text-slate-400">
                Found {aiData?.journey_plan?.routes?.length || 1} candidate options
              </div>

              <button
                type="button"
                onClick={handleApplyRoute}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isApplied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                }`}
              >
                {isApplied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Plotted on Map</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5" />
                    <span>View on Map</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
