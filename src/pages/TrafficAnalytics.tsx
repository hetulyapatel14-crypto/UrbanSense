import DashboardLayout from '../layouts/DashboardLayout'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Clock, AlertCircle } from 'lucide-react'
import HeaderActions from '../components/HeaderActions'


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
      <header className="bg-white border-b border-slate-200/90 px-6 py-4 shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Traffic Flow & Density Analytics</h1>
            <p className="text-xs text-slate-500 mt-0.5">Real-time edge vehicle counting, congestion indices, and public corridor delays</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Real-Time Feed
            </span>
            <HeaderActions />
          </div>
        </div>
      </header>


      <div className="flex-1 overflow-auto p-6 bg-slate-50">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">VEHICLES SENSED</div>
            <div className="text-3xl font-extrabold text-blue-600">48,294</div>
            <div className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 mt-2 w-fit">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8.4% today
            </div>
          </div>

          <div className="stat-card">
            <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">AVG FLEET SPEED</div>
            <div className="text-3xl font-extrabold text-emerald-600">34 km/h</div>
            <div className="text-xs text-slate-500 mt-2 font-medium">
              City-wide average velocity
            </div>
          </div>

          <div className="stat-card">
            <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">CONGESTION INDEX</div>
            <div className="text-3xl font-extrabold text-amber-600">67%</div>
            <div className="flex items-center text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 mt-2 w-fit">
              <AlertCircle className="w-3 h-3 mr-1" />
              Elevated peak traffic
            </div>
          </div>

          <div className="stat-card">
            <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">AVG CORRIDOR DELAY</div>
            <div className="text-3xl font-extrabold text-rose-600">11 min</div>
            <div className="flex items-center text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60 mt-2 w-fit">
              <Clock className="w-3 h-3 mr-1" />
              +3m vs normal
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Hourly Traffic */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card">
            <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase mb-4">HOURLY TRAFFIC DENSITY (TODAY)</h2>
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
                <Line type="monotone" dataKey="vehicles" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Vehicle Classification */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card">
            <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase mb-4">VEHICLE CLASSIFICATION BREAKDOWN</h2>
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

          {/* Congestion by Zone */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card">
            <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase mb-4">CONGESTION BY MAJOR CORRIDORS</h2>
            <div className="space-y-4">
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
                      className={`h-2 rounded-full ${
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

          {/* Average Route Delay */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card">
            <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase mb-4">AVERAGE PUBLIC BUS ROUTE DELAY</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={routeDelays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="route" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 700 }}
                />
                <Bar dataKey="avgDelay" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Congested Areas */}
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-card mb-6">
          <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/60 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase">BOTTLENECK ZONES RANKING</h2>
            <span className="text-xs font-semibold text-slate-500">Live Congestion Density</span>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {congestionZones.map((zone, index) => (
                <div key={zone.area} className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/70 hover:border-blue-300 transition-colors">
                  <div className="text-2xl font-extrabold text-blue-600 mb-1">#{index + 1}</div>
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
        </div>

        {/* Vehicle Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {vehicleTypes.map(type => (
            <div key={type.name} className="stat-card">
              <div className="text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">{type.name}</div>
              <div className="text-2xl font-extrabold mb-1" style={{ color: type.color }}>
                {type.value.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {((type.value / 48294) * 100).toFixed(1)}% of detected total
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
