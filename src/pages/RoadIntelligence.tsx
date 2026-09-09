import DashboardLayout from '../layouts/DashboardLayout'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { AlertTriangle, TrendingUp, MapPin } from 'lucide-react'
import HeaderActions from '../components/HeaderActions'


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
      <header className="bg-white border-b border-slate-200/90 px-6 py-4 shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Road Condition Intelligence</h1>
            <p className="text-xs text-slate-500 mt-0.5">Automated pavement defect detection, surface quality indices, and civil repair dispatching</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              24 Segments Prioritized
            </span>
            <HeaderActions />
          </div>
        </div>
      </header>


      <div className="flex-1 overflow-auto p-6 bg-slate-50">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">ROADS SCANNED</div>
            <div className="text-3xl font-extrabold text-blue-600">1,284 km</div>
            <div className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 mt-2 w-fit">
              <TrendingUp className="w-3 h-3 mr-1" />
              +45 km today
            </div>
          </div>

          <div className="stat-card">
            <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">HAZARDS DETECTED</div>
            <div className="text-3xl font-extrabold text-amber-600">327</div>
            <div className="flex items-center text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 mt-2 w-fit">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12 new today
            </div>
          </div>

          <div className="stat-card">
            <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">CRITICAL SEGMENTS</div>
            <div className="text-3xl font-extrabold text-rose-600">24</div>
            <div className="flex items-center text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60 mt-2 w-fit">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Needs civil repair
            </div>
          </div>

          <div className="stat-card">
            <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">REPAIR PRIORITY QUEUE</div>
            <div className="text-3xl font-extrabold text-indigo-600">86</div>
            <div className="text-xs text-slate-500 mt-2 font-medium">
              Road segments ranked
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Hazards Trend */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card">
            <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase mb-4">HAZARD DETECTION TREND</h2>
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
                <Line type="monotone" dataKey="hazards" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Hazards by Category */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card">
            <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase mb-4">HAZARDS BY CATEGORY</h2>
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

          {/* Detection Confidence */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card">
            <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase mb-4">DETECTION CONFIDENCE DISTRIBUTION</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 700 }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Hazards by Zone */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card">
            <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase mb-4">HAZARDS BY CITY ZONE</h2>
            <div className="space-y-3.5">
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
                    <div className={`${zone.color} h-2 rounded-full`} style={{ width: `${(zone.count / 89) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Maintenance Priority Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-card">
          <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/60 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase">MAINTENANCE PRIORITY DISPATCH</h2>
            <span className="text-xs font-bold text-slate-500">Sorted by Severity & Frequency</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
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
        </div>
      </div>
    </DashboardLayout>
  )
}
