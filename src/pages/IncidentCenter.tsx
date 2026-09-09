import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { Search, Filter } from 'lucide-react'
import { incidents as defaultIncidents } from '../data/incidents'
import { apiService } from '../services/api'
import { Link } from 'react-router-dom'
import HeaderActions from '../components/HeaderActions'

export default function IncidentCenter() {
  const [incidents, setIncidents] = useState(defaultIncidents)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')

  useEffect(() => {
    apiService.getIncidents().then(data => {
      if (data && data.length > 0) setIncidents(data)
    })
  }, [])

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter
    return matchesSearch && matchesStatus && matchesSeverity
  })

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-rose-700 bg-rose-50 border border-rose-200'
      case 'high': return 'text-amber-800 bg-amber-50 border border-amber-200'
      case 'medium': return 'text-blue-700 bg-blue-50 border border-blue-200'
      default: return 'text-slate-700 bg-slate-100 border border-slate-200'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return 'text-rose-700 bg-rose-50 border border-rose-200'
      case 'investigating': return 'text-amber-800 bg-amber-50 border border-amber-200'
      case 'assigned': return 'text-blue-700 bg-blue-50 border border-blue-200'
      case 'resolved': return 'text-emerald-700 bg-emerald-50 border border-emerald-200'
      default: return 'text-slate-700 bg-slate-100 border border-slate-200'
    }
  }

  return (
    <DashboardLayout>
      <header className="bg-white border-b border-slate-200/90 px-6 py-4 shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Incident Management Center</h1>
            <p className="text-xs text-slate-500 mt-0.5">Automated detection, investigation timeline, and civil enforcement escalation</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              {incidents.filter(i => i.severity === 'critical').length} Critical Escalations
            </span>
            <HeaderActions />
          </div>
        </div>
      </header>


      <div className="flex-1 overflow-auto p-6 bg-slate-50">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="stat-card">
            <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">TOTAL INCIDENTS</div>
            <div className="text-3xl font-extrabold text-blue-600">{incidents.length}</div>
            <div className="text-xs text-slate-500 mt-1">Logged today</div>
          </div>

          <div className="stat-card">
            <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">CRITICAL</div>
            <div className="text-3xl font-extrabold text-rose-600">
              {incidents.filter(i => i.severity === 'critical').length}
            </div>
            <div className="text-xs text-rose-700 mt-1 font-semibold">Immediate action</div>
          </div>

          <div className="stat-card">
            <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">HIGH PRIORITY</div>
            <div className="text-3xl font-extrabold text-amber-600">
              {incidents.filter(i => i.severity === 'high').length}
            </div>
            <div className="text-xs text-amber-700 mt-1 font-semibold">Enforcement alerted</div>
          </div>

          <div className="stat-card">
            <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">INVESTIGATING</div>
            <div className="text-3xl font-extrabold text-indigo-600">
              {incidents.filter(i => i.status === 'investigating').length}
            </div>
            <div className="text-xs text-slate-500 mt-1">Review in progress</div>
          </div>

          <div className="stat-card">
            <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">RESOLVED TODAY</div>
            <div className="text-3xl font-extrabold text-emerald-600">
              {incidents.filter(i => i.status === 'resolved').length}
            </div>
            <div className="text-xs text-emerald-700 mt-1 font-semibold">Cases closed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 mb-6 shadow-card">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search incidents by ID, type, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                </select>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="assigned">Assigned</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Incidents Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Incident ID</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Incident Type</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Detected By</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Confidence</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Action Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredIncidents.map(incident => (
                  <tr key={incident.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">
                      <Link to={`/incident/${incident.id}`} className="hover:underline">
                        {incident.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900">
                      {incident.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                      {incident.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to="/live-fleet" className="text-blue-600 hover:text-blue-800 font-semibold text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {incident.busId}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs font-mono">
                      {incident.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {incident.confidence}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${getSeverityBadge(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${getStatusBadge(incident.status)}`}>
                        {incident.status}
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
