import DashboardLayout from '../layouts/DashboardLayout'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Clock, Activity, Gauge, Car, Flame } from 'lucide-react'
import HeaderActions from '../components/HeaderActions'
import { PageHeader } from '../components/common/PageHeader'
import { KpiCard } from '../components/common/KpiCard'
import { PremiumPanel } from '../components/common/PremiumPanel'
import { AnimatedCounter } from '../components/common/AnimatedCounter'
import { ScrollReveal } from '../components/common/ScrollReveal'


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
  { name: 'Cars', value: 24850, color: '#2563eb' },
  { name: 'Buses', value: 3420, color: '#f59e0b' },
  { name: 'Trucks', value: 2180, color: '#ef4444' },
  { name: 'Two Wheelers', value: 15240, color: '#8b5cf6' },
  { name: 'Auto Rickshaws', value: 2604, color: '#10b981' },
]

const congestionZones = [
  { area: 'SG Highway', level: 89, status: 'Critical' },
  { area: 'Ashram Road', level: 78, status: 'High' },
  { area: 'Ring Road', level: 72, status: 'High' },
  { area: 'CG Road', level: 65, status: 'Medium' },
  { area: 'Naroda Road', level: 54, status: 'Medium' },
]

const routeDelays = [
  { route: 'Route 18', avgDelay: 14, status: 'High' },
  { route: 'Route 22', avgDelay: 11, status: 'Medium' },
  { route: 'Route 45', avgDelay: 9, status: 'Medium' },
  { route: 'Route 12', avgDelay: 7, status: 'Low' },
  { route: 'Route 8', avgDelay: 5, status: 'Low' },
]

export default function TrafficAnalytics() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Traffic Flow & Density Analytics"
        eyebrow="Traffic Intelligence"
        icon={Activity}
        live={{ label: 'Real-Time Feed', tone: 'blue' }}
        subtitle="Real-time edge vehicle counting, congestion indices, and public corridor delays"
        actions={<HeaderActions />}
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Statistics */}
        <ScrollReveal direction="up" delay={0}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Vehicles Sensed"
            value={<AnimatedCounter value="48,294" />}
            icon={Car}
            accent="blue"
            hint="Rolling 24h window"
            trend="+8.4% today"
            trendTone="positive"
            delay={0}
          />

          <KpiCard
            label="Avg Fleet Speed"
            value={<AnimatedCounter value="34 km/h" />}
            icon={Gauge}
            accent="emerald"
            hint="City-wide average velocity"
            trend="Steady"
            trendTone="positive"
            delay={70}
          />

          <KpiCard
            label="Congestion Index"
            value={<AnimatedCounter value="67%" />}
            icon={Flame}
            accent="amber"
            hint="Elevated peak traffic"
            trend="Elevated"
            trendTone="warning"
            delay={140}
          />

          <KpiCard
            label="Avg Corridor Delay"
            value={<AnimatedCounter value="11 min" />}
            icon={Clock}
            accent="rose"
            hint="Across instrumented corridors"
            trend="+3m vs normal"
            trendTone="critical"
            delay={210}
          />
        </div>
        </ScrollReveal>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Hourly Traffic */}
          <ScrollReveal direction="up" delay={40}>
          <div className="panel-premium hover-lift p-6 h-full">
            <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase mb-4">Hourly Traffic Density (Today)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={hourlyTraffic}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 700 }}
                  itemStyle={{ color: '#2563eb' }}
                />
                <Line
                  type="monotone"
                  dataKey="vehicles"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', r: 4 }}
                  activeDot={{ r: 7 }}
                  animationDuration={1400}
                  animationEasing="ease-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          </ScrollReveal>

          {/* Vehicle Classification */}
          <ScrollReveal direction="up" delay={90}>
          <div className="panel-premium hover-lift p-6 h-full">
            <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase mb-4">Vehicle Classification Breakdown</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={vehicleTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                  animationDuration={1200}
                  animationBegin={150}
                >
                  {vehicleTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          </ScrollReveal>

          {/* Congestion by Zone */}
          <ScrollReveal direction="up" delay={40}>
          <div className="panel-premium hover-lift p-6 h-full">
            <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase mb-4">Congestion by Major Corridors</h2>
            <div className="stagger-list space-y-4">
              {congestionZones.map(zone => (
                <div key={zone.area}>
                  <div className="flex items-center justify-between mb-1.5 text-xs font-semibold">
                    <span className="text-slate-800">{zone.area}</span>
                    <span className={`font-extrabold ${
                      zone.status === 'Critical' ? 'text-rose-600' :
                      zone.status === 'High' ? 'text-amber-600' : 'text-blue-600'
                    }`}>
                      {zone.level}% • {zone.status}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`bar-fill h-2 rounded-full ${
                        zone.status === 'Critical' ? 'bg-rose-500' :
                        zone.status === 'High' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${zone.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </ScrollReveal>

          {/* Average Route Delay */}
          <ScrollReveal direction="up" delay={90}>
          <div className="panel-premium hover-lift p-6 h-full">
            <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase mb-4">Average Public Bus Route Delay</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={routeDelays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="route" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 700 }}
                />
                <Bar dataKey="avgDelay" fill="#f59e0b" radius={[6, 6, 0, 0]} animationDuration={1300} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          </ScrollReveal>
        </div>

        {/* Top Congested Areas */}
        <ScrollReveal direction="up" delay={40}>
        <PremiumPanel
          className="mb-6"
          title="Bottleneck Zones Ranking"
          subtitle="Live congestion density across monitored corridors"
          icon={Flame}
          badge={
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 live-dot" />
              Live
            </span>
          }
        >
          <div className="relative">
            <div className="stagger-list grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {congestionZones.map((zone, index) => (
                <div key={zone.area} className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/70 hover:border-blue-300 hover:bg-white hover:shadow-card hover:-translate-y-1 transition-all duration-300 ease-silk cursor-default">
                  <div className="text-2xl font-black text-blue-600 mb-1 tabular-nums">#{index + 1}</div>
                  <div className="text-sm font-bold text-slate-900 mb-2 truncate">{zone.area}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Density</span>
                    <span className={`font-extrabold ${
                      zone.status === 'Critical' ? 'text-rose-600' :
                      zone.status === 'High' ? 'text-amber-600' : 'text-blue-600'
                    }`}>
                      {zone.level}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PremiumPanel>
        </ScrollReveal>

        {/* Vehicle Stats Grid */}
        <ScrollReveal direction="up" delay={40}>
        <div className="stagger-list grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {vehicleTypes.map(type => (
            <div
              key={type.name}
              className="stat-card accent-top sheen-sweep hover-lift"
            >
              <div className="text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">{type.name}</div>
              <div className="text-2xl font-black mb-1 tabular-nums" style={{ color: type.color }}>
                <AnimatedCounter value={type.value.toLocaleString()} />
              </div>
              <div className="text-xs text-slate-500 font-medium mb-2">
                {((type.value / 48294) * 100).toFixed(1)}% of detected total
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bar-fill h-1.5 rounded-full"
                  style={{ width: `${(type.value / 48294) * 100}%`, backgroundColor: type.color }}
                />
              </div>
            </div>
          ))}
        </div>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  )
}
