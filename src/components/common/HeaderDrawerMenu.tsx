import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  Map,
  Bus,
  Activity,
  AlertTriangle,
  BarChart3,
  FileText,
  Radio,
  MapPin,
  Layers,
  Compass,
  Sparkles,
  Info,
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react'

export const HeaderDrawerMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { to: '/command-center', icon: Map, label: 'Command Center', desc: 'Real-time citywide operations' },
    { to: '/live-fleet', icon: Bus, label: 'Live Fleet', desc: 'Active bus sensing & camera feeds' },
    { to: '/urban-map', icon: MapPin, label: 'Urban Map', desc: 'Geospatial hazard & transit view' },
    { to: '/journey-planner', icon: Compass, label: 'Journey Planner', desc: 'Multimodal AI route optimizer', highlight: true },
    { to: '/road-intelligence', icon: Layers, label: 'Road Intelligence', desc: 'Pavement & infrastructure analytics' },
    { to: '/traffic-analytics', icon: Activity, label: 'Traffic Analytics', desc: 'Congestion & speed patterns' },
    { to: '/incident-center', icon: AlertTriangle, label: 'Incident Center', desc: 'Edge detections & alert triage' },
    { to: '/vehicle-tracking', icon: BarChart3, label: 'Vehicle Tracking', desc: 'Speed, telemetry & diagnostics' },
    { to: '/reports', icon: FileText, label: 'Reports & Insights', desc: 'Automated executive summaries' },
    { to: '/architecture', icon: Layers, label: 'Architecture', desc: 'End-to-end edge AI specs' },
  ]

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // Close drawer on Escape key & lock scroll when open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <>
      {/* Hamburger Toggle Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="p-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-center cursor-pointer group"
        aria-label="Toggle navigation menu"
        title="Explore Platform Modules"
      >
        <Menu className="w-5 h-5 transition-transform group-hover:scale-110" />
      </button>

      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-full max-w-sm sm:max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out border-l border-slate-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Navigation Drawer"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-sm">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-base tracking-tight block">
                UrbanSense Platform
              </span>
              <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase block">
                GovTech AI Ecosystem
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
          <div className="px-3 py-2 flex items-center justify-between text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
            <span>Platform Modules</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-bold">
              10
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50/60 border-blue-200 text-blue-700 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold flex items-center gap-1.5">
                      <span>{item.label}</span>
                      {item.highlight && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-black rounded uppercase shadow-2xs">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>AI</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium line-clamp-1">{item.desc}</p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            )
          })}

          <div className="pt-2 px-1">
            <div className="border-t border-slate-100 my-2" />
            <Link
              to="/about"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Info className="w-4 h-4 text-slate-400" />
                <span>About UrbanSense Vision</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/70 space-y-2.5">
          <div className="flex items-center justify-between text-xs px-3 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200/60 font-semibold shadow-2xs">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>Django API Active</span>
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>

          <a
            href="http://localhost:8000/api/docs/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between w-full py-2 px-3 text-xs font-bold text-blue-700 bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl transition-all shadow-2xs"
          >
            <span>Swagger / OpenAPI Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </aside>
    </>
  )
}

export default HeaderDrawerMenu
