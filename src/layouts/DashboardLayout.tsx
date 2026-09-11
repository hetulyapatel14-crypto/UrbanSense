import { Link, useLocation } from 'react-router-dom'
import { ReactNode, useState, useEffect } from 'react'
import {
  Map,
  Bus,
  Activity,
  AlertTriangle,
  BarChart3,
  Radio,
  MapPin,
  Layers,
  ArrowLeft,
  Compass,
  Sparkles,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'
import ScrollProgressBar from '../components/common/ScrollProgressBar'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('urbansense_sidebar_collapsed') === 'true'
  })
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev
      localStorage.setItem('urbansense_sidebar_collapsed', String(next))
      return next
    })
  }

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  const navItems = [
    { to: '/command-center', icon: Map, label: 'Command Center' },
    { to: '/live-fleet', icon: Bus, label: 'Live Fleet' },
    { to: '/urban-map', icon: MapPin, label: 'Urban Map' },
    { to: '/journey-planner', icon: Compass, label: 'Journey Planner', highlight: true },
    { to: '/road-intelligence', icon: Layers, label: 'Road Intelligence' },
    { to: '/traffic-analytics', icon: Activity, label: 'Traffic Analytics' },
    { to: '/incident-center', icon: AlertTriangle, label: 'Incident Center' },
    { to: '/vehicle-tracking', icon: BarChart3, label: 'Vehicle Tracking' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
      <ScrollProgressBar />

      <div className="flex-1 flex relative">
        {/* Mobile Backdrop Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Premium Light Sidebar (Collapsible on Desktop, Slide-over on Mobile) */}
        <aside
          className={`bg-white/95 backdrop-blur-md border-r border-slate-200/90 flex flex-col shadow-sm z-30 sticky top-0 h-screen transition-all duration-300 ease-in-out ${
            isCollapsed ? 'w-20' : 'w-64'
          } ${
            isMobileOpen
              ? 'fixed inset-y-0 left-0 w-64 max-w-[85vw] flex shadow-2xl z-40'
              : 'hidden lg:flex'
          }`}
        >
          {/* Sidebar Top Header */}
          <div className={`p-4 border-b border-slate-200/80 bg-gradient-to-b from-slate-50/50 to-transparent flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}>
            <Link to="/" className={`flex items-center space-x-3 group ${isCollapsed ? 'hidden' : 'flex'}`}>
              <div className="bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 p-2.5 rounded-xl shadow-md shadow-blue-500/15 text-white group-hover:scale-105 group-hover:shadow-blue-500/25 transition-all duration-300">
                <Radio className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-lg font-extrabold text-slate-900 tracking-tight block group-hover:text-blue-600 transition-colors">UrbanSense</span>
                <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase block flex items-center gap-1">
                  <span>GovTech AI Platform</span>
                </span>
              </div>
            </Link>

            {/* Collapsed Logo Icon */}
            {isCollapsed && (
              <Link to="/" title="UrbanSense Home" className="bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 p-2.5 rounded-xl shadow-md text-white hover:scale-105 transition-transform">
                <Radio className="w-5 h-5 text-white animate-pulse" />
              </Link>
            )}

            {/* Desktop Hamburger Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title={isCollapsed ? "Expand Sidebar (Hamburger Menu)" : "Collapse Sidebar"}
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-blue-600" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Close Mobile Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav items list */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
            {!isCollapsed && (
              <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <span>Platform Modules</span>
                <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono font-bold">{navItems.length}</span>
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.to || 
                (item.to === '/incident-center' && location.pathname.startsWith('/incident/'))

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  title={isCollapsed ? item.label : undefined}
                  className={`group relative flex items-center rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isCollapsed
                      ? 'justify-center p-3'
                      : 'justify-between px-3.5 py-2.5'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50/60 text-blue-700 border border-blue-200/80 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 hover:translate-x-0.5'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                    <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>

                  {!isCollapsed && item.highlight && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-extrabold rounded-md uppercase tracking-wider shadow-xs">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>AI</span>
                    </span>
                  )}

                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-r-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer Area */}
          <div className={`border-t border-slate-200/80 bg-slate-50/70 transition-all ${
            isCollapsed ? 'p-2 text-center' : 'p-3.5'
          }`}>
            {!isCollapsed ? (
              <Link
                to="/"
                className="flex items-center justify-center space-x-2 w-full py-2 px-3 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100/80 border border-slate-200 rounded-lg transition-all duration-200 shadow-xs hover:shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Portal Home</span>
              </Link>
            ) : (
              <div className="flex flex-col items-center">
                <Link to="/" title="Back to Portal Home" className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
          {/* Mobile floating hamburger button if drawer closed */}
          <div className="lg:hidden p-3 bg-white border-b border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 flex items-center space-x-2 font-bold text-xs"
              aria-label="Open Platform Navigation Menu"
            >
              <Menu className="w-4 h-4 text-blue-600" />
              <span>Platform Modules</span>
            </button>
            <span className="text-xs font-extrabold text-slate-800 tracking-tight">UrbanSense AI</span>
          </div>

          {children}
        </main>
      </div>
    </div>
  )
}

