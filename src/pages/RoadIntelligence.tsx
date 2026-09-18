import DashboardLayout from '../layouts/DashboardLayout'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { AlertTriangle, TrendingUp, MapPin, Route, Gauge, Wrench, ListOrdered } from 'lucide-react'
import HeaderActions from '../components/HeaderActions'
import { PageHeader } from '../components/common/PageHeader'
import { KpiCard } from '../components/common/KpiCard'
import { PremiumPanel } from '../components/common/PremiumPanel'
import { AnimatedCounter } from '../components/common/AnimatedCounter'
import { ScrollReveal } from '../components/common/ScrollReveal'


const hazardsByCategory = [
  { name: 'Potholes', value: 142, color: '#ef4444' },
  { name: 'Road Damage', value: 89, color: '#f59e0b' },
  { name: 'Waterlogging', value: 54, color: '#0284c7' },
  { name: 'Missing Dividers', value: 28, color: '#8b5cf6' },
  { name: 'Other Hazards', value: 14, color: '#64748b' },
]

const trendData = [
  { month: 'Jan', hazards: 245 },
  { month: 'Feb', hazards: 289 },
  { month: 'Mar', hazards: 312 },
  { month: 'Apr', hazards: 298 },
  { month: 'May', hazards: 327 },
]

const confidenceData = [
  { range: '90-100%', count: 248 },
  { range: '80-89%', count: 56 },
  { range: '70-79%', count: 18 },
  { range: '<70%', count: 5 },
]

const maintenancePriority = [
  { road: 'SG Highway, Sector 5-8', hazards: 18, severity: 'Critical', lastDetection: '2 hours ago', priority: 'HIGH' },
  { road: 'Ring Road, Junction 12-15', hazards: 14, severity: 'High', lastDetection: '4 hours ago', priority: 'HIGH' },
  { road: 'Ashram Road, Segment A', hazards: 12, severity: 'High', lastDetection: '6 hours ago', priority: 'MEDIUM' },
  { road: 'CG Road, Section 3-5', hazards: 9, severity: 'Medium', lastDetection: '8 hours ago', priority: 'MEDIUM' },
  { road: 'Naroda Road, Zone B', hazards: 7, severity: 'Medium', lastDetection: '12 hours ago', priority: 'LOW' },
]

export default function RoadIntelligence() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Road Condition Intelligence"
        eyebrow="Pavement Analytics"
        icon={Route}
        live={{ label: '24 Segments Prioritized', tone: 'amber' }}
        subtitle="Automated pavement defect detection, surface quality indices, and civil repair dispatching"
        actions={<HeaderActions />}
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Statistics */}
        <ScrollReveal direction="up" delay={0}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Roads Scanned"
            value={<AnimatedCounter value="1,284 km" />}
            icon={Route}
            accent="blue"
            hint="Network coverage"
            trend="+45 km today"
            trendTone="positive"
            delay={0}
          />

          <KpiCard
            label="Hazards Detected"
            value={<AnimatedCounter value="327" />}
            icon={AlertTriangle}
            accent="amber"
            hint="Surface defects logged"
            trend="+12 new today"
            trendTone="warning"
            delay={70}
          />

          <KpiCard
            label="Critical Segments"
            value={<AnimatedCounter value="24" />}
            icon={Wrench}
            accent="rose"
            hint="Needs civil repair"
            trend="Escalated"
            trendTone="critical"
            delay={140}
          />

          <KpiCard
            label="Repair Priority Queue"
            value={<AnimatedCounter value="86" />}
            icon={ListOrdered}
            accent="indigo"
            hint="Road segments ranked"
            trend="Ranked"
            trendTone="neutral"
            delay={210}
          />
        </div>
        </ScrollReveal>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Hazards Trend */}
          <ScrollReveal direction="up" delay={40}>
          <div className="panel-premium hover-lift p-6 h-full">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-blue-600 flex items-center justify-center shadow-2xs">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase">Hazard Detection Trend</h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 700 }}
                  itemStyle={{ color: '#2563eb' }}
                />
                <Line
                  type="monotone"
                  dataKey="hazards"
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

          {/* Hazards by Category */}
          <ScrollReveal direction="up" delay={90}>
          <div className="panel-premium hover-lift p-6 h-full">
            <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase mb-4">Hazards by Category</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={hazardsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                  animationDuration={1200}
                  animationBegin={150}
                >
                  {hazardsByCategory.map((entry, index) => (
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

          {/* Detection Confidence */}
          <ScrollReveal direction="up" delay={40}>
          <div className="panel-premium hover-lift p-6 h-full">
            <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase mb-4">Detection Confidence Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 700 }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} animationDuration={1300} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          </ScrollReveal>

          {/* Hazards by Zone */}
          <ScrollReveal direction="up" delay={90}>
          <div className="panel-premium hover-lift p-6 h-full">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shadow-2xs">
                <Gauge className="w-4 h-4" />
              </span>
              <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase">Hazards by City Zone</h2>
            </div>
            <div className="stagger-list space-y-3.5">
              {[
                { zone: 'Central Ahmedabad', count: 89, color: 'bg-rose-500' },
                { zone: 'West Ahmedabad', count: 76, color: 'bg-amber-500' },
                { zone: 'East Ahmedabad', count: 68, color: 'bg-blue-500' },
                { zone: 'North Ahmedabad', count: 54, color: 'bg-emerald-500' },
                { zone: 'South Ahmedabad', count: 40, color: 'bg-indigo-500' },
              ].map(zone => (
                <div key={zone.zone}>
                  <div className="flex items-center justify-between mb-1.5 text-xs font-semibold">
                    <span className="text-slate-700">{zone.zone}</span>
                    <span className="text-slate-900 font-extrabold">{zone.count} defects</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`${zone.color} bar-fill h-2 rounded-full`} style={{ width: `${(zone.count / 89) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </ScrollReveal>
        </div>

        {/* Maintenance Priority Table */}
        <ScrollReveal direction="up" delay={40}>
        <PremiumPanel
          flush
          title="Maintenance Priority Dispatch"
          subtitle="Sorted by severity and detection frequency"
          icon={Wrench}
          badge={
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
              {maintenancePriority.length} Segments
            </span>
          }
        >
          <div className="overflow-x-auto">
            <table className="premium-table w-full text-left">
              <thead className="bg-slate-50/80 border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Road Segment</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Defect Count</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Severity Level</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Detected</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Repair Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {maintenancePriority.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-slate-800">{item.road}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-xs">
                        {item.hazards} spots
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      <span className={`${
                        item.severity === 'Critical' ? 'text-rose-600' :
                        item.severity === 'High' ? 'text-amber-600' : 'text-blue-600'
                      }`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {item.lastDetection}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase ${
                        item.priority === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        item.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PremiumPanel>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  )
}
