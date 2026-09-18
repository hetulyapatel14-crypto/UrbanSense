import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { Search, Filter, AlertTriangle, Siren, ListChecks, SearchCheck, CheckCircle2, ClipboardList } from 'lucide-react'
import { incidents as defaultIncidents } from '../data/incidents'
import { apiService } from '../services/api'
import { Link } from 'react-router-dom'
import HeaderActions from '../components/HeaderActions'
import { PageHeader } from '../components/common/PageHeader'
import { KpiCard } from '../components/common/KpiCard'
import { PremiumPanel } from '../components/common/PremiumPanel'
import { AnimatedCounter } from '../components/common/AnimatedCounter'
import { ScrollReveal } from '../components/common/ScrollReveal'

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
      <PageHeader
        title="Incident Management Center"
        eyebrow="Enforcement"
        icon={AlertTriangle}
        live={{
          label: `${incidents.filter(i => i.severity === 'critical').length} Critical Escalations`,
          tone: 'rose'
        }}
        subtitle="Automated detection, investigation timeline, and civil enforcement escalation"
        actions={<HeaderActions />}
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Statistics */}
        <ScrollReveal direction="up" delay={0}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <KpiCard
            label="Total Incidents"
            value={<AnimatedCounter value={incidents.length} />}
            icon={ClipboardList}
            accent="blue"
            hint="Logged today"
            trend="Live feed"
            trendTone="neutral"
            delay={0}
          />

          <KpiCard
            label="Critical"
            value={<AnimatedCounter value={incidents.filter(i => i.severity === 'critical').length} />}
            icon={Siren}
            accent="rose"
            hint="Immediate action"
            trend="Escalated"
            trendTone="critical"
            delay={70}
          />

          <KpiCard
            label="High Priority"
            value={<AnimatedCounter value={incidents.filter(i => i.severity === 'high').length} />}
            icon={AlertTriangle}
            accent="amber"
            hint="Enforcement alerted"
            trend="Watchlist"
            trendTone="warning"
            delay={140}
          />

          <KpiCard
            label="Investigating"
            value={<AnimatedCounter value={incidents.filter(i => i.status === 'investigating').length} />}
            icon={SearchCheck}
            accent="indigo"
            hint="Review in progress"
            trend="Active"
            trendTone="neutral"
            delay={210}
          />

          <KpiCard
            label="Resolved Today"
            value={<AnimatedCounter value={incidents.filter(i => i.status === 'resolved').length} />}
            icon={CheckCircle2}
            accent="emerald"
            hint="Cases closed"
            trend="Closed"
            trendTone="positive"
            delay={280}
          />
        </div>
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal direction="up" delay={60}>
        <div className="panel-premium p-4 mb-6">
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
        </ScrollReveal>

        {/* Incidents Table */}
        <ScrollReveal direction="up" delay={100}>
        <PremiumPanel
          flush
          title="Incident Register"
          subtitle="Correlated edge detections awaiting enforcement action"
          icon={ListChecks}
          badge={
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
              {filteredIncidents.length} Records
            </span>
          }
        >
          <div className="overflow-x-auto">
            <table className="premium-table w-full text-left">
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
                  <tr key={incident.id} className="cursor-pointer">
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
        </PremiumPanel>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  )
}
