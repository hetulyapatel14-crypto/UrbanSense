import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ReactNode, useState, useEffect, useMemo, useRef } from 'react'
import {
  LayoutDashboard,
  Bus,
  Map,
  Layers,
  Activity,
  AlertTriangle,
  Compass,
  ScanLine,
  ArrowLeft,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Bell,
  BellOff,
  ChevronRight,
  Radar,
  FileText,
  Cpu,
  Info,
  CornerDownLeft,
} from 'lucide-react'
import { ClayBlobs } from '../components/common/ClayBlobs'
import { UrbanSenseLogo, UrbanSenseMark } from '../components/common/UrbanSenseLogo'
import { apiService } from '../services/api'

interface DashboardLayoutProps {
  children: ReactNode
}

interface NavItem {
  to: string
  icon: any
  label: string
  hint?: string
  badge?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const SECTIONS: NavSection[] = [
  {
    title: 'Operations',
    items: [
      { to: '/command-center', icon: LayoutDashboard, label: 'Command Center', hint: 'City operations console' },
      { to: '/live-fleet', icon: Bus, label: 'Live Fleet', hint: 'Vehicle telemetry' },
      { to: '/urban-map', icon: Map, label: 'Urban Map', hint: 'Spatial intelligence' },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { to: '/road-intelligence', icon: Layers, label: 'Road Intelligence', hint: 'Pavement condition' },
      { to: '/traffic-analytics', icon: Activity, label: 'Traffic Analytics', hint: 'Corridor flows' },
      { to: '/incident-center', icon: AlertTriangle, label: 'Incident Center', hint: 'Case queue' },
      { to: '/reports', icon: FileText, label: 'Reports', hint: 'Briefings & exports' },
    ],
  },
  {
    title: 'Mobility',
    items: [
      { to: '/journey-planner', icon: Compass, label: 'Journey Planner', hint: 'Multimodal routing', badge: 'AI' },
      { to: '/vehicle-tracking', icon: ScanLine, label: 'Vehicle Tracking', hint: 'Live kinematics' },
    ],
  },
  {
    title: 'Platform',
    items: [
      { to: '/architecture', icon: Cpu, label: 'Architecture', hint: 'System topology' },
      { to: '/about', icon: Info, label: 'About', hint: 'Platform vision' },
    ],
  },
]

/** Simple command palette over the module list (⌘K / Ctrl+K). */
const CommandPalette: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const flat = useMemo(() => SECTIONS.flatMap(s => s.items.map(i => ({ ...i, section: s.title }))), [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return flat
    return flat.filter(i => `${i.label} ${i.section} ${i.hint ?? ''}`.toLowerCase().includes(q))
  }, [flat, query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      const id = window.setTimeout(() => inputRef.current?.focus(), 30)
      return () => window.clearTimeout(id)
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9000] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-surface-0/70 backdrop-blur-sm animate-fade" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-label="Module search"
        className="u-glass relative z-10 w-full max-w-lg overflow-hidden animate-pop"
      >
        <span className="u-hair" aria-hidden="true" />
        <div className="flex items-center gap-2.5 border-b border-[rgba(163,177,198,0.35)] px-3.5 py-3">
          <Search className="h-4 w-4 text-ink-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
              if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
              if (e.key === 'Enter' && results[active]) { navigate(results[active].to); onClose() }
              if (e.key === 'Escape') onClose()
            }}
            placeholder="Search modules, layers and tools…"
            className="w-full bg-transparent font-mono text-[13px] text-ink placeholder:text-ink-faint/70 focus:outline-none"
          />
          <span className="u-chip u-chip-slate">ESC</span>
        </div>

        <div className="max-h-80 overflow-y-auto p-1.5 u-scroll">
          {results.length === 0 && <p className="px-3 py-6 text-center text-[12px] text-ink-muted">No module matches “{query}”.</p>}
          {results.map((item, idx) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                onMouseEnter={() => setActive(idx)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 ease-mech ${
                  idx === active ? 'bg-surface-2 shadow-key' : 'hover:bg-surface-3/50'
                }`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${idx === active ? 'bg-surface-0 shadow-groove text-brand-600' : 'bg-surface-3/70 text-ink-muted'}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-ink">{item.label}</span>
                  <span className="block truncate font-mono text-[10.5px] text-ink-faint">{item.hint}</span>
                </span>
                <span className="u-overline hidden sm:block">{item.section}</span>
                {idx === active && <CornerDownLeft className="h-3.5 w-3.5 text-brand-600" />}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('urbansense_sidebar_collapsed') === 'true')
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [clock, setClock] = useState(() => new Date())
  const [openIncidents, setOpenIncidents] = useState<number | null>(null)

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev
      localStorage.setItem('urbansense_sidebar_collapsed', String(next))
      return next
    })
  }

  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  // Live operations clock in the topbar
  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  // Global ⌘K / Ctrl+K module search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(o => !o)
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false)
        setIsMobileOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    apiService.getIncidents().then(data => {
      if (data && data.length > 0) setOpenIncidents(data.filter(i => i.status !== 'resolved').length)
    })
  }, [])

  const isItemActive = (to: string) =>
    location.pathname === to || (to === '/incident-center' && location.pathname.startsWith('/incident/'))

  const clockLabel = clock.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateLabel = clock.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })

  return (
    <div className="flex min-h-screen flex-col bg-surface-0 text-ink antialiased">
      <ClayBlobs />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      <div className="relative flex flex-1">
        {/* Mobile backdrop */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-surface-0/70 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ══ Navigation rail ══════════════════════════════════════════════ */}
        <aside
          aria-label="Primary navigation"
          className={`sticky top-0 z-40 flex h-screen flex-col border-r border-[rgba(163,177,198,0.35)] bg-surface-2/90 backdrop-blur-xl transition-[width,transform] duration-300 ease-mech select-none ${
            isCollapsed ? 'w-[68px]' : 'w-[248px]'
          } ${isMobileOpen ? 'fixed inset-y-0 left-0 z-50 flex w-[264px] max-w-[86vw] shadow-float' : 'hidden lg:flex'}`}
        >
          {/* Brand block */}
          <div className={`flex h-14 items-center border-b border-[rgba(163,177,198,0.35)] ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3.5'}`}>
            <Link to="/" className="min-w-0" aria-label="UrbanSense home">
              {isCollapsed ? (
                <UrbanSenseMark className="h-7 w-7" gradientId="rail-mark" />
              ) : (
                <UrbanSenseLogo size="md" subtext="Mobility OS" id="rail" />
              )}
            </Link>

            <button
              onClick={toggleSidebar}
              className="hidden h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-ink-faint shadow-key transition-all duration-150 ease-mech hover:text-ink active:translate-y-[1px] active:shadow-groove lg:flex"
              aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
              title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            >
              {isCollapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
            </button>

            <button
              onClick={() => setIsMobileOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-ink-faint shadow-key transition-all duration-150 ease-mech hover:text-ink active:translate-y-[1px] active:shadow-groove lg:hidden"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Grouped modules */}
          <nav className="u-scroll flex-1 space-y-5 overflow-y-auto px-2.5 py-3.5">
            {SECTIONS.map(section => (
              <div key={section.title}>
                {!isCollapsed && <div className="u-overline px-2.5 pb-1.5">{section.title}</div>}
                {isCollapsed && <div className="mx-auto mb-1.5 h-px w-5 bg-line" aria-hidden="true" />}

                <div className="space-y-0.5">
                  {section.items.map(item => {
                    const Icon = item.icon
                    const active = isItemActive(item.to)
                    const showBadge = item.badge === 'AI'

                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        title={isCollapsed ? item.label : undefined}
                        aria-current={active ? 'page' : undefined}
                        className={`u-nav-item group ${active ? 'u-nav-item-active' : ''} ${isCollapsed ? 'justify-center px-0 py-2.5' : ''}`}
                      >
                        {/* Sliding active indicator */}
                        <span
                          className={`absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-500 transition-all duration-300 ease-silk ${
                            active ? 'opacity-100' : 'scale-y-0 opacity-0'
                          }`}
                          aria-hidden="true"
                        />

                        <Icon
                          className={`u-nav-icon ${active ? 'text-brand-500' : 'text-ink-faint group-hover:text-ink-secondary'} ${isCollapsed ? 'mx-auto' : ''}`}
                        />

                        {!isCollapsed && (
                          <>
                            <span className="min-w-0 flex-1 truncate">{item.label}</span>
                            {showBadge && (
                              <span className="rounded border border-iris-200/70 bg-iris-50 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-iris-600 uppercase">
                                AI
                              </span>
                            )}
                            {active && !showBadge && <ChevronRight className="h-3.5 w-3.5 text-ink-faint" />}
                          </>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Rail footer — live network state */}
          <div className={`border-t border-line ${isCollapsed ? 'px-2 py-3' : 'px-3 py-3'}`}>
            {!isCollapsed ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between rounded-lg bg-surface-0 px-2.5 py-2 shadow-recessed">
                  <span className="flex items-center gap-2 text-[11px] font-medium text-ink-secondary">                  <span className="u-led" style={{ '--led-c': '#22c55e', '--led-glow': 'rgba(34,197,94,0.55)' } as React.CSSProperties} />
                  Telemetry stream
                  </span>
                  <span className="u-num text-[10.5px] font-semibold text-emerald-600">100%</span>
                </div>

                <Link
                  to="/"
                  className="u-btn u-btn-outline w-full py-1.5 text-[12px]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Public portal
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="u-led" title="Telemetry stream active" style={{ '--led-c': '#22c55e', '--led-glow': 'rgba(34,197,94,0.55)' } as React.CSSProperties} />
                <Link
                  to="/"
                  title="Public portal"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-ink-faint shadow-key transition-all duration-150 ease-mech hover:text-ink active:translate-y-[1px] active:shadow-groove"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* ══ Workspace ═══════════════════════════════════════════════════ */}
        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-surface-0">
          {/* Command topbar */}
          <div className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-[rgba(163,177,198,0.35)] bg-surface-1/85 px-3 backdrop-blur-xl sm:px-5">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="u-icon-btn lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
              </button>

              <span className="hidden items-center gap-2 text-[11.5px] text-ink-muted sm:flex">
                <Radar className="h-3.5 w-3.5 text-brand-500" />
                <span className="font-medium text-ink-secondary">Ahmedabad · Gandhinagar · GIFT City</span>
              </span>
              <span className="u-overline sm:hidden">UrbanSense</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaletteOpen(true)}
                className="u-btn u-btn-sm hidden md:inline-flex text-[11px]"
                aria-label="Search modules"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search modules</span>
                <kbd className="u-num rounded border border-line bg-surface-3 px-1.5 py-0.5 text-[10px] text-ink-faint">⌘K</kbd>
              </button>

              <button
                onClick={() => setPaletteOpen(true)}
                className="u-icon-btn md:hidden"
                aria-label="Search modules"
              >
                <Search className="h-4 w-4" />
              </button>

              <Link
                to="/incident-center"
                className="u-icon-btn relative"
                aria-label="Open incident queue"
                title="Open incident queue"
              >
                {openIncidents ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                {openIncidents ? (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-surface-1 bg-brand-500 px-1 font-mono text-[9px] font-bold text-white shadow-glow-accent">
                    {openIncidents}
                  </span>
                ) : null}
              </Link>

              <div className="hidden items-center gap-2 rounded-lg bg-surface-0 px-2.5 py-1.5 shadow-recessed sm:flex">
                <span className="live-dot" />
                <span className="u-num text-[11.5px] font-medium text-ink-secondary">{clockLabel}</span>
                <span className="text-[10.5px] text-ink-faint">{dateLabel}</span>
              </div>
            </div>
          </div>

          {/* Route content with shared page transition */}
          <div key={location.pathname} className="relative flex min-h-0 flex-1 animate-page-in flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
