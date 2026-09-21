import { useMemo, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Activity, Car, Gauge, Flame, Clock, TrendingUp, TrendingDown, Filter } from 'lucide-react'
import HeaderActions from '../components/HeaderActions'
import { PageHeader } from '../components/common/PageHeader'
import { MetricStrip } from '../components/common/MetricStrip'
import { AnimatedCounter } from '../components/common/AnimatedCounter'
import { CHART, axisTick, gridProps, tooltipStyle } from '../components/common/chartTheme'

const hourlyTraffic = [
  { hour: '00:00', vehicles: 1200 },
  { hour: '03:00', vehicles: 450 },
  { hour: '06:00', vehicles: 3800 },
  { hour: '09:00', vehicles: 8500 },
  { hour: '12:00', vehicles: 7200 },
  { hour: '15:00', vehicles: 6800 },
  { hour: '18:00', vehicles: 9200 },
  { hour: '21:00', vehicles: 4500 },
]

const vehicleTypes = [
  { name: 'Cars', value: 24850, color: CHART.brand },
  { name: 'Buses', value: 3420, color: CHART.amber },
  { name: 'Trucks', value: 2180, color: CHART.rose },
  { name: 'Two wheelers', value: 15240, color: CHART.iris },
  { name: 'Auto rickshaws', value: 2604, color: CHART.emerald },
]

const congestionZones = [
  { area: 'SG Highway', level: 89, status: 'Critical', trend: 12 },
  { area: 'Ashram Road', level: 78, status: 'High', trend: 5 },
  { area: 'Ring Road', level: 72, status: 'High', trend: -3 },
  { area: 'CG Road', level: 65, status: 'Medium', trend: 2 },
  { area: 'Naroda Road', level: 54, status: 'Medium', trend: -8 },
]

const routeDelays = [
  { route: 'Rt 18', avgDelay: 14, status: 'High' },
  { route: 'Rt 22', avgDelay: 11, status: 'Medium' },
  { route: 'Rt 45', avgDelay: 9, status: 'Medium' },
  { route: 'Rt 12', avgDelay: 7, status: 'Low' },
  { route: 'Rt 8', avgDelay: 5, status: 'Low' },
]

type Focus = 'all' | 'critical'

export default function TrafficAnalytics() {
  const [focus, setFocus] = useState<Focus>('all')

  const visibleZones = useMemo(
    () => (focus === 'critical' ? congestionZones.filter(z => z.status === 'Critical' || z.status === 'High') : congestionZones),
    [focus]
  )

  const visibleDelays = useMemo(
    () => (focus === 'critical' ? routeDelays.filter(r => r.status !== 'Low') : routeDelays),
    [focus]
  )

  const meanCongestion = Math.round(visibleZones.reduce((sum, z) => sum + z.level, 0) / Math.max(visibleZones.length, 1))
  const meanDelay = (
    visibleDelays.reduce((sum, r) => sum + r.avgDelay, 0) / Math.max(visibleDelays.length, 1)
  ).toFixed(1)

  return (
    <DashboardLayout>
      <PageHeader
        title="Traffic Analytics"
        eyebrow="Mobility analytics · rolling 24h window"
        icon={Activity}
        live={{ label: 'Live counting active', tone: 'blue' }}
        subtitle="Vehicle counting, congestion indices and transit corridor delay patterns"
        actions={<HeaderActions />}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-ink-faint" />
            <span className="u-overline">Corridor focus</span>
            <div className="u-seg ml-1" role="group" aria-label="Corridor focus">
              <button
                onClick={() => setFocus('all')}
                aria-pressed={focus === 'all'}
                className={`u-seg-item ${focus === 'all' ? 'u-seg-item-active' : ''}`}
              >
                All corridors
              </button>
              <button
                onClick={() => setFocus('critical')}
                aria-pressed={focus === 'critical'}
                className={`u-seg-item ${focus === 'critical' ? 'u-seg-item-active' : ''}`}
              >
                Critical only
              </button>
            </div>
          </div>

          <span className="u-num text-[11.5px] text-ink-muted">
            {visibleZones.length} corridors · mean congestion {meanCongestion}% · mean delay {meanDelay} min
          </span>
        </div>
      </PageHeader>

      <div className="flex-1 space-y-4 overflow-auto p-4 sm:p-5">
        <MetricStrip
          dense
          items={[
            { label: 'Vehicles sensed', value: '48,294', sublabel: 'Rolling 24h window', icon: Car },
            { label: 'Mean fleet speed', value: '34 km/h', sublabel: 'City-wide average', icon: Gauge, valueTone: 'emerald' },
            { label: 'Congestion index', value: `${meanCongestion}%`, sublabel: 'Elevated at peak', icon: Flame, valueTone: 'amber' },
            { label: 'Corridor delay', value: `${meanDelay} min`, sublabel: 'Instrumented corridors', icon: Clock, valueTone: 'rose' },
            { label: 'Probes reporting', value: '236', sublabel: 'Sensing vehicles online', icon: Activity },
          ]}
        />

        {/* ── Volume + mix ──────────────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="u-panel p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="u-overline">Density over time</p>
                <h2 className="u-h3 mt-1">Hourly traffic volume — today</h2>
              </div>
              <span className="u-chip u-chip-brand">
                <span className="live-dot" />
                Streaming
              </span>
            </div>

            <div className="u-recharts">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={hourlyTraffic} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.brand} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={CHART.brand} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="hour" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="vehicles"
                    stroke={CHART.brand}
                    strokeWidth={2.2}
                    fill="url(#volumeGrad)"
                    animationDuration={1500}
                    animationEasing="ease-out"
                    dot={{ fill: CHART.brand, r: 2.5, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-3 divide-x divide-line/70 border-t border-line/70 pt-3">
              {[
                ['Peak hour', '18:00'],
                ['Peak volume', '9,200 / h'],
                ['Quiet hour', '03:00'],
              ].map(([k, v]) => (
                <div key={k} className="px-3 first:pl-0">
                  <p className="u-overline">{k}</p>
                  <p className="u-num mt-1 text-[17px] font-semibold text-ink">{v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="u-panel p-4 sm:p-5">
            <p className="u-overline">Fleet mix</p>
            <h2 className="u-h3 mt-1">Vehicle classification</h2>

            <div className="u-recharts relative mt-2 flex justify-center">
              <ResponsiveContainer width={168} height={168}>
                <PieChart>
                  <Pie
                    data={vehicleTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={79}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                    animationDuration={1100}
                  >
                    {vehicleTypes.map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="u-num text-[19px] font-semibold text-ink">48.3K</span>
                <span className="u-overline mt-0.5">sensed</span>
              </div>
            </div>

            <ul className="mt-3 space-y-2">
              {vehicleTypes.map(t => (
                <li key={t.name} className="flex items-center justify-between gap-3 text-[12px]">
                  <span className="flex items-center gap-2 text-ink-secondary">
                    <span className="u-dot" style={{ backgroundColor: t.color }} />
                    {t.name}
                  </span>
                  <span className="u-num font-medium text-ink">
                    <AnimatedCounter value={t.value.toLocaleString()} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Congestion + route delays ─────────────────────────────── */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="u-panel p-4 sm:p-5">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="u-overline">Live congestion</p>
                <h2 className="u-h3 mt-1">Corridor congestion index</h2>
              </div>
              <span className="u-chip u-chip-rose">{visibleZones.length} corridors</span>
            </div>

            <ul className="space-y-3.5">
              {visibleZones.map(zone => (
                <li key={zone.area}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-[12px]">
                    <span className="text-ink-secondary">{zone.area}</span>
                    <span className="flex items-center gap-2">
                      <span className={`u-num flex items-center gap-1 text-[11px] ${zone.trend > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {zone.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(zone.trend)}%
                      </span>
                      <span className="u-num font-medium text-ink">{zone.level}%</span>
                    </span>
                  </div>
                  <div className="u-progress">
                    <div
                      className={`h-full rounded-full transition-[width] duration-700 ease-silk ${
                        zone.status === 'Critical' ? 'bg-rose-400' : zone.status === 'High' ? 'bg-amber-400' : 'bg-brand-400'
                      }`}
                      style={{ width: `${zone.level}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="u-panel p-4 sm:p-5">
            <p className="u-overline">Transit impact</p>
            <h2 className="u-h3 mt-1">Average route delay</h2>

            <div className="u-recharts mt-4">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={visibleDelays} barSize={38} margin={{ top: 4, right: 6, left: -18, bottom: 0 }}>
                  <CartesianGrid {...gridProps} vertical={false} />
                  <XAxis dataKey="route" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="avgDelay" radius={[6, 6, 0, 0]} animationDuration={1200}>
                    {visibleDelays.map(entry => (
                      <Cell
                        key={entry.route}
                        fill={entry.status === 'High' ? CHART.rose : entry.status === 'Medium' ? CHART.amber : CHART.emerald}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ── Composition row ───────────────────────────────────────── */}
        <section className="u-panel p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="u-overline">Fleet composition</p>
              <h2 className="u-h3 mt-1">Vehicle type distribution — 24h window</h2>
            </div>
            <span className="u-num text-[11.5px] text-ink-muted">Total 48,294</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {vehicleTypes.map(type => {
              const share = (type.value / 48294) * 100
              return (
                <div key={type.name} className="rounded-xl border border-line bg-surface-2/60 px-3.5 py-3">
                  <div className="flex items-center justify-between">
                    <p className="u-overline truncate">{type.name}</p>
                    <span className="u-dot" style={{ backgroundColor: type.color }} />
                  </div>
                  <p className="u-num mt-2 text-[20px] font-semibold text-ink">
                    <AnimatedCounter value={type.value.toLocaleString()} />
                  </p>
                  <p className="u-meta mt-1">{share.toFixed(1)}% of total</p>
                  <div className="u-progress mt-2">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-silk"
                      style={{ width: `${share}%`, backgroundColor: type.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
