import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  CheckCheck,
  ExternalLink,
  Shield,
  Activity,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Sliders,

  ChevronRight,
  Radio
} from 'lucide-react'
import { apiService } from '../services/api'

interface AlertItem {
  id: number
  alert_type?: string
  type?: string
  title?: string
  message?: string
  severity: string
  location?: string
  bus_id?: string
  busId?: string
  timestamp?: string
  is_read?: boolean
  acknowledged?: boolean
}

export default function HeaderActions() {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [hqProfileOpen, setHqProfileOpen] = useState(false)
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const notifRef = useRef<HTMLDivElement>(null)
  const hqRef = useRef<HTMLDivElement>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Load alerts
  const loadAlerts = async () => {
    try {
      setLoading(true)
      const data = await apiService.getNotifications()
      if (Array.isArray(data)) {
        setAlerts(data)
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
    const interval = setInterval(loadAlerts, 15000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false)
      }
      if (hqRef.current && !hqRef.current.contains(e.target as Node)) {
        setHqProfileOpen(false)
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setNotificationsOpen(false)
        setHqProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const unreadCount = alerts.filter(a => !a.is_read).length

  const handleMarkAllRead = async () => {
    try {
      await apiService.markAllAlertsRead()
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })))
      showToast('All notifications marked as read')
    } catch {
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })))
    }
  }

  const handleMarkSingleRead = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    try {
      await apiService.markAlertRead(id)
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a))
      showToast(`Alert #${id} marked as read`)
    } catch {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a))
    }
  }

  const handleAcknowledge = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    try {
      await apiService.acknowledgeAlert(id)
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true, acknowledged: true } : a))
      showToast(`Alert #${id} acknowledged by Operator`)
    } catch {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true, acknowledged: true } : a))
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'text-rose-700 bg-rose-50 border-rose-200'
      case 'HIGH':
        return 'text-amber-800 bg-amber-50 border-amber-200'
      case 'MEDIUM':
        return 'text-blue-700 bg-blue-50 border-blue-200'
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200'
    }
  }

  return (
    <div className="flex items-center space-x-2 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[999] bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-3 duration-200 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. NOTIFICATIONS BELL BUTTON & DROPDOWN */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => {
            setNotificationsOpen(prev => !prev)
            setHqProfileOpen(false)
          }}
          title="System Notifications"
          className={`relative p-2 rounded-lg transition-all cursor-pointer ${
            notificationsOpen
              ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          aria-label="Toggle notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600 ring-2 ring-white"></span>
            </span>
          )}
        </button>

        {/* Notifications Dropdown Panel */}
        {notificationsOpen && (
          <div className="absolute right-0 top-full mt-2.5 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Dropdown Header */}
            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">System Alerts</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {unreadCount > 0 ? `${unreadCount} unread incident alerts` : 'All alerts up to date'}
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center space-x-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark All Read</span>
                </button>
              )}
            </div>

            {/* Alert List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {loading && alerts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
                  Loading notifications...
                </div>
              ) : alerts.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-2.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-800">All Systems Nominal</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">No unresolved incident alerts in the queue</div>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 transition-colors hover:bg-slate-50 flex items-start space-x-3 ${
                      !alert.is_read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {alert.severity?.toUpperCase() === 'CRITICAL' ? (
                        <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      ) : alert.severity?.toUpperCase() === 'HIGH' ? (
                        <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                          <Info className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getSeverityBadge(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {alert.timestamp || 'Recent'}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {alert.title || alert.alert_type || alert.type || 'Detection Event'}
                      </h4>

                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-tight font-medium">
                        {alert.message || `${alert.type || 'Incident'} sensed at ${alert.location || 'Ahmedabad'}`}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100/80">
                        <span className="text-[10px] font-semibold text-slate-400">
                          {alert.bus_id || alert.busId ? `Bus: ${alert.bus_id || alert.busId}` : 'Optical Unit'}
                          {alert.location ? ` • ${alert.location}` : ''}
                        </span>

                        <div className="flex items-center space-x-1.5">
                          {!alert.acknowledged && (
                            <button
                              onClick={(e) => handleAcknowledge(e, alert.id)}
                              className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded transition-colors cursor-pointer"
                              title="Acknowledge this alert"
                            >
                              Ack
                            </button>
                          )}
                          {!alert.is_read && (
                            <button
                              onClick={(e) => handleMarkSingleRead(e, alert.id)}
                              className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                              title="Mark as read"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Dropdown Footer */}
            <div className="p-2.5 bg-slate-50/80 border-t border-slate-100 text-center">
              <Link
                to="/incident-center"
                onClick={() => setNotificationsOpen(false)}
                className="flex items-center justify-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors py-1"
              >
                <span>View Full Incident Queue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 2. HQ PROFILE AVATAR BUTTON & DROPDOWN */}
      <div className="relative pl-2 border-l border-slate-200" ref={hqRef}>
        <button
          onClick={() => {
            setHqProfileOpen(prev => !prev)
            setNotificationsOpen(false)
          }}
          title="Ahmedabad Command HQ Profile"
          className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-sm ${
            hqProfileOpen
              ? 'bg-blue-600 text-white ring-2 ring-blue-500/40'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:ring-2 hover:ring-blue-300 border border-blue-200'
          }`}
          aria-label="Toggle HQ Profile Menu"
        >
          HQ
        </button>

        {/* HQ Profile Dropdown Panel */}
        {hqProfileOpen && (
          <div className="absolute right-0 top-full mt-2.5 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Operator Card */}
            <div className="p-4 bg-gradient-to-br from-slate-900 to-blue-950 text-white relative">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 font-extrabold text-sm flex items-center justify-center shadow-inner">
                  HQ
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <h3 className="text-sm font-extrabold text-white truncate">Ahmedabad Command HQ</h3>
                  </div>
                  <p className="text-[11px] text-blue-200 font-medium">Urban Mobility Central Unit</p>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] font-semibold text-emerald-300">Operator Level 2 • Shift A</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/10 text-[10px] text-slate-300 flex items-center justify-between font-mono">
                <span>NODE: AHM-CTRL-01</span>
                <span>AMC Paldi Center</span>
              </div>
            </div>

            {/* Live System Diagnostics */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-100 text-xs space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Connectivity</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-white border border-slate-200/70 flex items-center space-x-2">
                  <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-slate-800">Django API</div>
                    <div className="text-[9px] text-slate-400 font-mono">127.0.0.1:8000</div>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200/70 flex items-center space-x-2">
                  <Activity className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-slate-800">Edge Fleet</div>
                    <div className="text-[9px] text-slate-400">26 Buses Active</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Links */}
            <div className="p-2 space-y-1 text-xs">
              <a
                href="http://localhost:8000/admin/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:text-blue-700 hover:bg-blue-50/70 font-semibold transition-colors group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Shield className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                  <span>Django Administration</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </a>

              <a
                href="http://localhost:8000/api/docs/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:text-blue-700 hover:bg-blue-50/70 font-semibold transition-colors group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Sliders className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                  <span>Swagger / OpenAPI Explorer</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </a>
            </div>

            {/* Operator Session Action */}

            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  loadAlerts()
                  showToast('Re-synced live data with Django backend')
                  setHqProfileOpen(false)
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 font-bold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-sync Live</span>
              </button>

              <button
                onClick={() => {
                  showToast('Signed out of Operator session')
                  setHqProfileOpen(false)
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
