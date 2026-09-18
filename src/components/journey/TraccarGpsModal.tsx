import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Radio,
  Play,
  Pause,
  RotateCw,
  Smartphone,
  Activity,
  Copy,
  Check,
  Send,
  Zap,
} from 'lucide-react'
import { traccarApi, TraccarStatus, TraccarGpsPacket } from '../../services/traccarApi'

interface TraccarGpsModalProps {
  isOpen: boolean
  onClose: () => void
  onVehicleUpdated?: (packet: TraccarGpsPacket) => void
}

export const TraccarGpsModal: React.FC<TraccarGpsModalProps> = ({
  isOpen,
  onClose,
  onVehicleUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'phone' | 'manual' | 'packets'>('simulator')
  const [statusInfo, setStatusInfo] = useState<TraccarStatus | null>(null)
  const [isSimRunning, setIsSimRunning] = useState(false)
  const [simSpeed, setSimSpeed] = useState(1.0)
  const [isSending, setIsSending] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [recentPackets, setRecentPackets] = useState<TraccarGpsPacket[]>([])

  // Manual GPS Inputs
  const [manualId, setManualId] = useState('GGTSL-EB-101')
  const [manualLat, setManualLat] = useState(23.2156)
  const [manualLon, setManualLon] = useState(72.6369)
  const [manualSpeed, setManualSpeed] = useState(35)
  const [manualBearing, setManualBearing] = useState(180)
  const [manualBatt, setManualBatt] = useState(88)
  const [sendSuccessMsg, setSendSuccessMsg] = useState<string | null>(null)

  // Server URL for phone apps
  const serverHost = window.location.origin
  const clientEndpointUrl = `${serverHost}/api/traccar/client/`

  useEffect(() => {
    if (!isOpen) return

    traccarApi.getStatus().then((data) => {
      setStatusInfo(data)
      setIsSimRunning(data.simulation_running)
      setSimSpeed(data.simulation_speed || 1.0)
      if (data.recent_packets) {
        setRecentPackets(data.recent_packets)
      }
    })

    // Subscribe to SSE stream for live packet monitor
    const unsubscribe = traccarApi.connectLiveStream(
      (packet) => {
        setRecentPackets((prev) => [packet, ...prev.slice(0, 30)])
        if (onVehicleUpdated) {
          onVehicleUpdated(packet)
        }
      },
      undefined,
      (err) => console.warn('Traccar modal SSE issue:', err)
    )

    return () => {
      unsubscribe()
    }
  }, [isOpen, onVehicleUpdated])

  if (!isOpen) return null

  const handleToggleSimulation = async () => {
    try {
      const nextAction = isSimRunning ? 'stop' : 'start'
      await traccarApi.controlSimulator(nextAction, simSpeed)
      setIsSimRunning(!isSimRunning)
    } catch (err) {
      console.error('Failed to toggle simulation:', err)
    }
  }

  const handleStepSimulation = async () => {
    try {
      setIsSending(true)
      const res = await traccarApi.controlSimulator('step')
      if (res.events && res.events.length > 0) {
        setRecentPackets((prev) => [...res.events, ...prev.slice(0, 30)])
        res.events.forEach((ev: TraccarGpsPacket) => {
          if (onVehicleUpdated) onVehicleUpdated(ev)
        })
      }
    } catch (err) {
      console.error('Failed to step simulation:', err)
    } finally {
      setIsSending(false)
    }
  }

  const handleSpeedChange = async (newSpeed: number) => {
    setSimSpeed(newSpeed)
    if (isSimRunning) {
      await traccarApi.controlSimulator('start', newSpeed)
    }
  }

  const handleSendManualFix = async () => {
    try {
      setIsSending(true)
      setSendSuccessMsg(null)
      const res = await traccarApi.sendGpsFix({
        id: manualId,
        lat: manualLat,
        lon: manualLon,
        speed: manualSpeed,
        bearing: manualBearing,
        batt: manualBatt,
      })
      setSendSuccessMsg(`✅ Sent GPS Fix for ${res.event.vehicle_id} @ [${manualLat}, ${manualLon}]`)
      if (onVehicleUpdated) {
        onVehicleUpdated(res.event)
      }
    } catch (err: any) {
      setSendSuccessMsg(`❌ Error: ${err.message}`)
    } finally {
      setIsSending(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  Traccar Live GPS Ingestion & Telemetry
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  REAL-TIME PIPELINE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                GPS Device / Phone → Traccar Protocol → UrbanSense Backend → Live Moving Map
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto">
          {[
            { id: 'simulator', label: 'Route Simulator', icon: Play },
            { id: 'phone', label: 'Smartphone (Traccar App)', icon: Smartphone },
            { id: 'manual', label: 'Manual GPS Transmitter', icon: Send },
            { id: 'packets', label: `Live Packets (${recentPackets.length})`, icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-indigo-700 border-t-2 border-x border-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: ROUTE SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200/80 rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      Autonomous Gandhinagar Electric Bus & Transit GPS Simulator
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Emulates continuous live GPS coordinates streaming from on-board Traccar transponders installed on{' '}
                      <strong>GGTSL Electric Buses (E-1, E-2)</strong> and <strong>Ahmedabad Fleet</strong>, computing realistic road bearings, dynamic velocity, and battery SOC discharge.
                    </p>
                  </div>
                </div>
              </div>

              {/* Simulation Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Continuous Playback
                    </span>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                        isSimRunning
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isSimRunning ? 'STREAMING ACTIVE' : 'PAUSED'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleToggleSimulation}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer ${
                        isSimRunning
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {isSimRunning ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Pause Live Movement</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-white" />
                          <span>Start Live Movement Stream</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleStepSimulation}
                      disabled={isSending}
                      className="flex items-center space-x-1.5 py-3 px-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
                      <span>Single Step</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Speed Multiplier
                    </span>
                    <span className="text-xs font-extrabold text-indigo-600 font-mono">
                      {simSpeed}x Realtime
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {[0.5, 1.0, 2.0, 5.0].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSpeedChange(s)}
                        className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                          simSpeed === s
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Simulated Routes */}
              <div className="border border-slate-200/90 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Active Live Simulated Vehicles
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-extrabold text-emerald-800">⚡ GGTSL-EB-101</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Route E-1</span>
                    </div>
                    <div className="text-[11px] text-slate-600">Gandhinagar Rly Stn ↔ Mahatma Mandir</div>
                  </div>

                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-extrabold text-emerald-800">⚡ GGTSL-EB-102</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Route E-2</span>
                    </div>
                    <div className="text-[11px] text-slate-600">Akshardham Temple ↔ GIFT City SEZ</div>
                  </div>

                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-extrabold text-blue-800">🚌 BUS-078</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">SG Highway</span>
                    </div>
                    <div className="text-[11px] text-slate-600">Visat Gandhinagar ↔ ISKCON Cross</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHONE APP / TRACCAR CLIENT GUIDE */}
          {activeTab === 'phone' && (
            <div className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start space-x-3">
                <Smartphone className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Connect Any Android or iOS Smartphone as a Live Bus Tracker
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Install the official free <strong>Traccar Client</strong> app on your smartphone to turn your phone into a live transit GPS transmitter sending coordinates directly into UrbanSense!
                  </p>
                </div>
              </div>

              {/* Step by Step Configuration */}
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Download Traccar Client</span>
                  </div>
                  <p className="text-xs text-slate-600 pl-7">
                    Available for free on Google Play Store (Android) and Apple App Store (iOS). Search for <strong>"Traccar Client"</strong>.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Configure Server URL in App Settings</span>
                  </div>
                  <div className="pl-7 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={clientEndpointUrl}
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(clientEndpointUrl)}
                        className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      In Traccar Client settings, set <strong>Server URL</strong> to the address above.
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Set Device Identifier & Start Service</span>
                  </div>
                  <div className="pl-7 space-y-2 text-xs text-slate-600">
                    <p>
                      Set <strong>Device Identifier</strong> to your target vehicle ID, e.g.{' '}
                      <code className="bg-slate-200 px-1.5 py-0.5 rounded font-bold text-indigo-700">GGTSL-EB-101</code> or{' '}
                      <code className="bg-slate-200 px-1.5 py-0.5 rounded font-bold text-blue-700">BUS-078</code>.
                    </p>
                    <p>
                      Toggle <strong>Service Status</strong> to <strong className="text-emerald-700">ON</strong>. Your phone will immediately begin transmitting real GPS packets!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MANUAL TRANSMITTER */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Push Custom GPS Fix to UrbanSense Map
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Device ID / Vehicle</label>
                    <input
                      type="text"
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Speed (km/h)</label>
                    <input
                      type="number"
                      value={manualSpeed}
                      onChange={(e) => setManualSpeed(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={manualLat}
                      onChange={(e) => setManualLat(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={manualLon}
                      onChange={(e) => setManualLon(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Heading / Bearing (0-360°)</label>
                    <input
                      type="number"
                      value={manualBearing}
                      onChange={(e) => setManualBearing(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Battery SOC (%)</label>
                    <input
                      type="number"
                      value={manualBatt}
                      onChange={(e) => setManualBatt(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setManualLat(23.2156)
                        setManualLon(72.6369)
                        setManualBearing(180)
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      Gandhinagar Sec 10
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setManualLat(23.1620)
                        setManualLon(72.6840)
                        setManualBearing(90)
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      GIFT City Diamond Tower
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendManualFix}
                    disabled={isSending}
                    className="flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Transmit GPS Fix</span>
                  </button>
                </div>

                {sendSuccessMsg && (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                    {sendSuccessMsg}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LIVE PACKET CONSOLE */}
          {activeTab === 'packets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Incoming GPS Stream Telemetry
                </span>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live SSE Connected
                </span>
              </div>

              <div className="bg-slate-950 rounded-2xl p-4 font-mono text-xs text-slate-300 max-h-80 overflow-y-auto space-y-2 border border-slate-800 shadow-inner">
                {recentPackets.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Awaiting GPS packets... (Start simulation or transmit a manual GPS fix)
                  </div>
                ) : (
                  recentPackets.map((pkt, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-slate-900/80 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-emerald-400 font-bold">{pkt.vehicle_id}</span>
                        <span className="text-slate-400">
                          [{pkt.latitude?.toFixed(4)}, {pkt.longitude?.toFixed(4)}]
                        </span>
                        <span className="text-cyan-300">{pkt.speed_kmh} km/h</span>
                        <span className="text-amber-300">{pkt.heading}°</span>
                        {pkt.battery_soc_pct !== undefined && (
                          <span className="text-emerald-300 font-bold">{pkt.battery_soc_pct}%</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {pkt.received_at || pkt.timestamp?.substring(11, 19) || 'Just now'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Traccar Protocol: OsmAnd + HTTP Webhook v2</span>
            {statusInfo && (
              <span className="text-[11px] font-semibold text-slate-600 border-l border-slate-300 pl-3">
                {statusInfo.active_live_vehicles} Active Live Vehicles • {statusInfo.active_sse_subscribers} SSE Clients
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-bold transition-colors cursor-pointer"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
