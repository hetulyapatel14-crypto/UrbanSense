import { Link } from 'react-router-dom'
import { ArrowLeft, Camera, Cpu, Database, Map, Radio, ArrowDown, Zap, Server, Shield, Sparkles } from 'lucide-react'
import ScrollProgressBar from '../components/common/ScrollProgressBar'

export default function Architecture() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      <ScrollProgressBar />
      {/* Header */}
      <header className="border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-sm text-white">
                  <Radio className="w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">UrbanSense</span>
              </div>
            </div>

            <Link to="/command-center" className="btn-primary text-xs sm:text-sm px-5 py-2.5">
              Launch Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Technical Specification
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mt-3 mb-4">
            SYSTEM ARCHITECTURE
          </h1>
          <p className="text-base md:text-lg text-slate-600 leading-relaxed">
            End-to-end urban intelligence architecture connecting on-vehicle Edge AI computer vision models with centralized spatial telemetry.
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="max-w-5xl mx-auto mb-16 space-y-6">
          {/* Layer 1: Mobile Sensing */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-card">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 border border-blue-200 text-blue-700 font-extrabold text-lg rounded-full mb-3 shadow-sm">
                1
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">MOBILE SENSING LAYER</h2>
              <p className="text-slate-500 text-sm mt-1">Multi-perspective data capture from moving public transit fleets</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 text-center hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 mb-1">Bus Camera Array</div>
                <div className="text-xs text-slate-500">5 Synchronized HD lenses</div>
                <div className="text-[11px] text-slate-400 mt-2">Front, Rear, Left, Right, Cabin</div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 text-center hover:border-emerald-300 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <Map className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 mb-1">GNSS / GPS Receiver</div>
                <div className="text-xs text-slate-500">Real-time coordinates (10Hz)</div>
                <div className="text-[11px] text-slate-400 mt-2">Sub-meter urban precision</div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 text-center hover:border-amber-300 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 mb-1">Bus Telemetry CAN-Bus</div>
                <div className="text-xs text-slate-500">Speed, heading, braking</div>
                <div className="text-[11px] text-slate-400 mt-2">Vehicle dynamic context</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
              <ArrowDown className="w-5 h-5" />
            </div>
          </div>

          {/* Layer 2: Edge AI */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-card">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-lg rounded-full mb-3 shadow-sm">
                2
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">EDGE AI INFERENCE LAYER</h2>
              <p className="text-slate-500 text-sm mt-1">Local deep learning execution directly onboard each vehicle</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 mb-2">Object Classification</div>
                <div className="text-xs text-slate-600 space-y-1.5">
                  <div>• Vehicles (Cars, Auto-rickshaws, Buses, Trucks)</div>
                  <div>• Pedestrians in roadways & school zones</div>
                  <div>• Traffic lights, road signs, and zebra lanes</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5">
                <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 mb-2">Road Hazard Detection</div>
                <div className="text-xs text-slate-600 space-y-1.5">
                  <div>• Pothole depth & surface disintegration</div>
                  <div>• Waterlogging & drain overflow pooling</div>
                  <div>• Missing physical lane dividers</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 mb-2">Advanced Perception</div>
                <div className="text-xs text-slate-600 space-y-1.5">
                  <div>• High-accuracy optical ANPR plate OCR</div>
                  <div>• Sudden deceleration & collision anomalies</div>
                  <div>• Cross-bus spatial trajectory tracking</div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50/70 border border-blue-200/80 rounded-xl p-4.5 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-blue-900 text-sm mb-0.5">Why Edge Inference Over Cloud Streaming?</div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Executing computer vision directly on bus hardware minimizes bandwidth overhead by over <strong>95%</strong> (transmitting JSON telemetry and micro-crops rather than raw HD streams), providing instantaneous response times under 50ms.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
              <ArrowDown className="w-5 h-5" />
            </div>
          </div>

          {/* Layer 3: Data & Intelligence */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-card">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-50 border border-cyan-200 text-cyan-700 font-extrabold text-lg rounded-full mb-3 shadow-sm">
                3
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">DATA & TELEMETRY HUB</h2>
              <p className="text-slate-500 text-sm mt-1">High-throughput ingestion, spatial aggregation, and predictive analytics</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
                <Server className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <div className="font-bold text-slate-900 text-sm mb-1">Event Ingestion</div>
                <div className="text-xs text-slate-500">MQTT / gRPC live messaging</div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
                <Database className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="font-bold text-slate-900 text-sm mb-1">Geospatial GIS DB</div>
                <div className="text-xs text-slate-500">PostGIS spatial indexing</div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
                <Cpu className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <div className="font-bold text-slate-900 text-sm mb-1">Analytics Engine</div>
                <div className="text-xs text-slate-500">Congestion & flow prediction</div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
                <Zap className="w-6 h-6 text-rose-600 mx-auto mb-2" />
                <div className="font-bold text-slate-900 text-sm mb-1">Alert Dispatcher</div>
                <div className="text-xs text-slate-500">Real-time push notifications</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-sm">
              <ArrowDown className="w-5 h-5" />
            </div>
          </div>

          {/* Layer 4: Command Center */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-card">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-lg rounded-full mb-3 shadow-sm">
                4
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">CIVIC COMMAND CENTER</h2>
              <p className="text-slate-500 text-sm mt-1">Operational interfaces for municipal authorities and emergency response</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
                <Map className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-bold text-slate-900 mb-1">GIS Command Map</div>
                <div className="text-xs text-slate-500">Live fleet & hazard layer</div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
                <Zap className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <div className="text-sm font-bold text-slate-900 mb-1">Traffic Hub</div>
                <div className="text-xs text-slate-500">Corridor density metrics</div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
                <Shield className="w-6 h-6 text-rose-600 mx-auto mb-2" />
                <div className="text-sm font-bold text-slate-900 mb-1">Incident Control</div>
                <div className="text-xs text-slate-500">Civil priority escalation</div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
                <Database className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <div className="text-sm font-bold text-slate-900 mb-1">Civil Reports</div>
                <div className="text-xs text-slate-500">Daily synthesis briefings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">DATA TRANSMISSION</h3>
            <div className="space-y-3 text-xs font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">Video Processing:</span>
                <span className="font-bold text-slate-900">Edge Hardware</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transmission Mode:</span>
                <span className="font-bold text-slate-900">Event Telemetry Only</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bandwidth Savings:</span>
                <span className="font-bold text-emerald-600">~95% Efficiency</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">End-to-End Latency:</span>
                <span className="font-bold text-blue-600">&lt;1 Second</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">AI INFERENCE STACK</h3>
            <div className="space-y-3 text-xs font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">Object Detection:</span>
                <span className="font-bold text-slate-900">YOLOv8 Edge Nano</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ANPR OCR:</span>
                <span className="font-bold text-slate-900">Custom Dual CNN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mean Precision:</span>
                <span className="font-bold text-emerald-600">94.6% mAP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Processing Rate:</span>
                <span className="font-bold text-blue-600">30+ FPS Onboard</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">FLEET SCALABILITY</h3>
            <div className="space-y-3 text-xs font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">Current Active Fleet:</span>
                <span className="font-bold text-slate-900">248 Units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Max Network Capacity:</span>
                <span className="font-bold text-slate-900">10,000+ Buses</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Daily Events Handled:</span>
                <span className="font-bold text-blue-600">1,000,000+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cloud Architecture:</span>
                <span className="font-bold text-slate-900">Multi-Region Redundant</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/command-center" className="btn-primary text-base px-8 py-3.5 shadow-md shadow-blue-500/20">
            Launch Urban Command Center
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 bg-white mt-16">
        <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© 2026 UrbanSense. Smart City Intelligence Platform.</p>
        </div>
      </footer>
    </div>
  )
}
