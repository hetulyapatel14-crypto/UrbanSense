import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  CheckCheck,
  ExternalLink,
  Shield,
  Activity,
  Info,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Sliders,
  ChevronRight,
  Radio,
} from 'lucide-react'
import { apiService } from '../services/api'
import { StatusBadge, StatusTone } from './common/StatusBadge'

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

const severityTone = (severity?: string): StatusTone => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return 'rose'
    case 'HIGH':
      return 'amber'
    case 'MEDIUM':
      return 'blue'
    default:
      return 'slate'
  }
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

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const data = await apiService.getNotifications()
      if (Array.isArray(data)) setAlerts(data)
    } catch {
      // Fallback to whatever is already cached
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
    const interval = setInterval(loadAlerts, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotificationsOpen(false)
      if (hqRef.current && !hqRef.current.contains(e.target as Node)) setHqProfileOpen(false)
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
      setAlerts(prev => prev.map(a => (a.id === id ? { ...a, is_read: true } : a)))
      showToast(`Alert #${id} marked as read`)
    } catch {
      setAlerts(prev => prev.map(a => (a.id === id ? { ...a, is_read: true } : a)))
    }
  }

  const handleAcknowledge = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    try {
      await apiService.acknowledgeAlert(id)
      setAlerts(prev => prev.map(a => (a.id === id ? { ...a, is_read: true, acknowledged: true } : a)))
      showToast(`Alert #${id} acknowledged by operator`)
    } catch {
      setAlerts(prev => prev.map(a => (a.id === id ? { ...a, is_read: true, acknowledged: true } : a)))
    }
  }

  return (
    <div className="relative flex items-center gap-2">
      {toastMessage && (
        <div className="u-panel fixed right-4 top-16 z-[999] flex items-center gap-2 px-3.5 py-2.5 text-[12.5px] font-medium text-ink animate-pop">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Notifications ───────────────────────────────────────────── */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => {
            setNotificationsOpen(prev => !prev)
            setHqProfileOpen(false)
          }}
          title="System notifications"
          aria-label="Toggle notifications"
          aria-expanded={notificationsOpen}
          className={`u-icon-btn relative ${notificationsOpen ? 'border-brand-200/70 text-ink' : ''}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-surface-1 bg-rose-500 px-1 text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        {notificationsOpen && (
          <div className="u-glass absolute right-0 top-full z-50 mt-2.5 w-[368px] max-w-[calc(100vw-2rem)] overflow-hidden animate-pop">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Bell className="h-3.5 w-3.5 text-brand-500" />
                <div>
                  <h3 className="text-[12.5px] font-semibold text-ink">System alerts</h3>
                  <p className="text-[11px] text-ink-muted">
                    {unreadCount > 0 ? `${unreadCount} unread incident alerts` : 'All alerts up to date'}
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="u-btn u-btn-ghost u-btn-sm" title="Mark all as read">
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all
                </button>
              )}
            </div>

            <div className="u-scroll max-h-80 overflow-y-auto">
              {loading && alerts.length === 0 ? (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-[12px] text-ink-muted">
                  <RefreshCw className="h-4 w-4 animate-spin text-brand-500" />
                  Loading notifications…
                </div>
              ) : alerts.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-3 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <p className="text-[12.5px] font-medium text-ink">All systems nominal</p>
                  <p className="mt-1 text-[11.5px] text-ink-muted">No unresolved incident alerts in the queue</p>
                </div>
              ) : (
                alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`border-t border-line/70 px-4 py-3 transition-colors hover:bg-surface-3/50 ${
                      !alert.is_read ? 'bg-brand-50/40' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={alert.severity} tone={severityTone(alert.severity)} size="sm" />
                      <span className="text-[10.5px] text-ink-faint">{alert.timestamp || 'Recent'}</span>
                    </div>

                    <p className="mt-2 truncate text-[12.5px] font-medium text-ink">
                      {alert.title || alert.alert_type || alert.type || 'Detection event'}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-relaxed text-ink-secondary">
                      {alert.message || `${alert.type || 'Incident'} sensed at ${alert.location || 'Ahmedabad'}`}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-line/70 pt-2">
                      <span className="u-num truncate text-[10.5px] text-ink-faint">
                        {alert.bus_id || alert.busId ? `${alert.bus_id || alert.busId}` : 'Optical unit'}
                        {alert.location ? ` · ${alert.location}` : ''}
                      </span>

                      <div className="flex shrink-0 items-center gap-1.5">
                        {!alert.acknowledged && (
                          <button
                            onClick={e => handleAcknowledge(e, alert.id)}
                            className="rounded-md border border-emerald-200/70 px-1.5 py-0.5 text-[10.5px] font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
                            title="Acknowledge this alert"
                          >
                            Ack
                          </button>
                        )}
                        {!alert.is_read && (
                          <button
                            onClick={e => handleMarkSingleRead(e, alert.id)}
                            className="rounded-md px-1.5 py-0.5 text-[10.5px] text-ink-muted transition-colors hover:text-ink"
                            title="Mark as read"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-line px-4 py-2.5 text-center">
              <Link
                to="/incident-center"
                onClick={() => setNotificationsOpen(false)}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-brand-600 transition-colors hover:text-brand-500"
              >
                View incident queue
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── HQ profile ──────────────────────────────────────────────── */}
      <div className="relative pl-2" ref={hqRef}>
        <div className="absolute left-0 top-1/2 h-5 w-px -translate-y-1/2 bg-line" aria-hidden="true" />
        <button
          onClick={() => {
            setHqProfileOpen(prev => !prev)
            setNotificationsOpen(false)
          }}
          title="Ahmedabad command HQ profile"
          aria-label="Toggle HQ profile menu"
          aria-expanded={hqProfileOpen}
          className={`flex h-8 w-8 items-center justify-center rounded-full border text-[10.5px] font-bold transition-all duration-150 ${
            hqProfileOpen
              ? 'border-brand-300/70 bg-brand-500/20 text-brand-600'
              : 'border-line bg-surface-3 text-ink-secondary hover:border-line-strong hover:text-ink'
          }`}
        >
          HQ
        </button>

        {hqProfileOpen && (
          <div className="u-glass absolute right-0 top-full z-50 mt-2.5 w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden animate-pop">
            <div className="border-b border-line px-4 py-3.5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-200/60 bg-brand-50 text-[12px] font-bold text-brand-600">
                  HQ
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink">Ahmedabad command HQ</p>
                  <p className="truncate text-[11.5px] text-ink-muted">Urban mobility central unit</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600">
                    <span className="live-dot" />
                    Operator level 2 · shift A
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-2.5 text-[10.5px] text-ink-faint">
                <span className="u-num">NODE: AHM-CTRL-01</span>
                <span>AMC Paldi centre</span>
              </div>
            </div>

            <div className="border-b border-line px-4 py-3">
              <p className="u-overline mb-2">Connectivity</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-2/60 px-2.5 py-2">
                  <Radio className="h-3.5 w-3.5 shrink-0 animate-pulse text-emerald-500" />
                  <div className="min-w-0">
                    <p className="truncate text-[11.5px] font-medium text-ink">Telemetry API</p>
                    <p className="u-num truncate text-[10px] text-ink-faint">127.0.0.1:8000</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-2/60 px-2.5 py-2">
                  <Activity className="h-3.5 w-3.5 shrink-0 text-brand-500" />
                  <div className="min-w-0">
                    <p className="truncate text-[11.5px] font-medium text-ink">Edge fleet</p>
                    <p className="truncate text-[10px] text-ink-faint">26 vehicles active</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-1.5">
              <a
                href="http://localhost:8000/admin/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[12.5px] text-ink-secondary transition-colors hover:bg-surface-3/60 hover:text-ink"
              >
                <span className="flex items-center gap-2.5">
                  <Shield className="h-3.5 w-3.5 text-ink-faint" />
                  Administration console
                </span>
                <ExternalLink className="h-3 w-3 text-ink-faint" />
              </a>

              <a
                href="http://localhost:8000/api/docs/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[12.5px] text-ink-secondary transition-colors hover:bg-surface-3/60 hover:text-ink"
              >
                <span className="flex items-center gap-2.5">
                  <Sliders className="h-3.5 w-3.5 text-ink-faint" />
                  API explorer
                </span>
                <ExternalLink className="h-3 w-3 text-ink-faint" />
              </a>

              <Link
                to="/architecture"
                onClick={() => setHqProfileOpen(false)}
                className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[12.5px] text-ink-secondary transition-colors hover:bg-surface-3/60 hover:text-ink"
              >
                <span className="flex items-center gap-2.5">
                  <Info className="h-3.5 w-3.5 text-ink-faint" />
                  System architecture
                </span>
                <ChevronRight className="h-3 w-3 text-ink-faint" />
              </Link>
            </div>

            <div className="flex items-center justify-between border-t border-line px-3 py-2.5">
              <button
                onClick={() => {
                  loadAlerts()
                  showToast('Re-synced live data with the telemetry backend')
                  setHqProfileOpen(false)
                }}
                className="u-btn u-btn-ghost u-btn-sm"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Re-sync
              </button>

              <button
                onClick={() => {
                  showToast('Signed out of operator session')
                  setHqProfileOpen(false)
                }}
                className="u-btn u-btn-ghost u-btn-sm hover:text-rose-600"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
