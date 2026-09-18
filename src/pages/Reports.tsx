import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { FileText, Download, Calendar, TrendingUp, AlertTriangle, Activity, Sparkles, Archive } from 'lucide-react'
import { apiService } from '../services/api'
import HeaderActions from '../components/HeaderActions'
import { PageHeader } from '../components/common/PageHeader'
import { PremiumPanel } from '../components/common/PremiumPanel'
import { ScrollReveal } from '../components/common/ScrollReveal'

export default function Reports() {
  const [liveInsights, setLiveInsights] = useState<string[]>([])

  useEffect(() => {
    apiService.getAIInsights().then(insights => {
      if (insights && insights.length > 0) setLiveInsights(insights)
    })
  }, [])

  return (
    <DashboardLayout>
      <PageHeader
        title="Executive Reports & Intelligence Insights"
        eyebrow="AI Synthesis"
        icon={FileText}
        live={{ label: 'AI Daily Briefing Ready', tone: 'emerald' }}
        subtitle="Automated daily civic summaries, pavement degradation audits, and safety analytics"
        actions={<HeaderActions />}
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Quick Actions */}
        <ScrollReveal direction="up" delay={0}>
        <div className="stagger-list grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button className="panel-premium accent-top sheen-sweep p-6 hover:border-blue-300 hover:shadow-card-hover hover:-translate-y-1 text-left group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <div className="font-extrabold text-slate-900 text-base mb-1">Generate Custom Dossier</div>
            <div className="text-xs text-slate-500">Filter by sector, bus route, or time interval</div>
          </button>

          <button className="panel-premium accent-top sheen-sweep p-6 hover:border-emerald-300 hover:shadow-card-hover hover:-translate-y-1 text-left group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Download className="w-6 h-6" />
            </div>
            <div className="font-extrabold text-slate-900 text-base mb-1">Export Telemetry Data</div>
            <div className="text-xs text-slate-500">Download formatted CSV, GIS Shapefile, or PDF</div>
          </button>

          <button className="panel-premium accent-top sheen-sweep p-6 hover:border-indigo-300 hover:shadow-card-hover hover:-translate-y-1 text-left group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="font-extrabold text-slate-900 text-base mb-1">Schedule Automated Briefings</div>
            <div className="text-xs text-slate-500">Recurring daily emails to municipal engineers</div>
          </button>
        </div>
        </ScrollReveal>

        {/* Daily Intelligence */}
        <ScrollReveal direction="up" delay={60}>
        <div className="panel-premium p-6 mb-6">
          <div className="relative flex flex-wrap items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-2">
            <div>
              <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider block">Autonomous Synthesis</span>
              <h2 className="text-2xl font-extrabold text-clay-ink tracking-tight">Daily City Intelligence Brief</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot" />
                Live Synthesis
              </span>
              <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                September 8, 2026 • 06:00 to 15:30 Window
              </div>
            </div>
          </div>

          {liveInsights.length > 0 && (

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-5 mb-5 shadow-sm">
              <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Real-time Dynamic AI Correlated Insights</span>
              </div>
              <ul className="space-y-1.5 text-sm text-slate-700">
                {liveInsights.map((insight, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="relative stagger-list space-y-4">
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-5 hover:bg-white hover:shadow-card hover:-translate-y-0.5 hover:border-blue-200 transition-all duration-300 ease-silk">

              <div className="flex items-start space-x-3.5">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0 mt-0.5">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5">Traffic Patterns & Flow Density</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Traffic congestion increased by <span className="text-amber-600 font-bold">12%</span> along the SG Highway corridor between 08:00 and 10:00.
                    Peak density recorded at <span className="text-blue-700 font-bold">09:15 AM</span> with approximately <span className="text-blue-700 font-bold">8,500 vehicles/hour</span>.
                    Route 18 experienced maximum delays averaging <span className="text-rose-600 font-bold">14 minutes</span>.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-5 hover:bg-white hover:shadow-card hover:-translate-y-0.5 hover:border-blue-200 transition-all duration-300 ease-silk">
              <div className="flex items-start space-x-3.5">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5">Road Surface & Infrastructure Integrity</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    <span className="text-amber-700 font-bold">24 road segments</span> require civil maintenance based on repeated optical defect detections.
                    Critical repair needed on <span className="text-rose-600 font-bold">SG Highway Sector 5-8</span> (18 potholes flagged),
                    <span className="text-rose-600 font-bold"> Ring Road Junction 12-15</span> (14 hazards), and
                    <span className="text-amber-700 font-bold"> Ashram Road Segment A</span> (12 hazards).
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-5 hover:bg-white hover:shadow-card hover:-translate-y-0.5 hover:border-blue-200 transition-all duration-300 ease-silk">
              <div className="flex items-start space-x-3.5">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5">Pedestrian Safety & Crossings</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    <span className="text-emerald-700 font-bold">7 vulnerable pedestrian events</span> were detected in school zones during morning drop-off hours.
                    All events were logged with an average confidence rating of <span className="text-emerald-700 font-bold">93.2%</span>.
                    Zero collisions reported across all instrumented routes.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-5 hover:bg-white hover:shadow-card hover:-translate-y-0.5 hover:border-blue-200 transition-all duration-300 ease-silk">
              <div className="flex items-start space-x-3.5">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5">Sensor Fleet Telemetry & Edge AI Uptime</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    <span className="text-blue-700 font-bold">236 out of 248 buses</span> are actively streaming with edge inference active.
                    Total AI detections today: <span className="text-blue-700 font-bold">12,846 events</span>.
                    Overall camera feed availability sustained at <span className="text-emerald-700 font-bold">98.2%</span>.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-5 hover:bg-white hover:shadow-card hover:-translate-y-0.5 hover:border-blue-200 transition-all duration-300 ease-silk">
              <div className="flex items-start space-x-3.5">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-600 shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5">Critical Incident Summary</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    <span className="text-rose-600 font-bold">1 hit-and-run incident</span> recorded on SG Highway at 14:32.
                    License plate successfully resolved: <span className="text-blue-700 font-bold font-mono">GJ 01 XX 4821</span> with <span className="text-emerald-700 font-bold">96.4% confidence</span>.
                    Investigation dossier automatically assigned to Traffic Enforcement.
                  </p>
                </div>
              </div>            </div>
          </div>
        </div>
        </ScrollReveal>

        {/* Report Actions */}
        <ScrollReveal direction="up" delay={60}>
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button className="btn-primary flex items-center gap-2 text-sm px-6 py-2.5">
            <Download className="w-4 h-4" />
            <span>Download Intelligence PDF</span>
          </button>
          <button className="btn-secondary flex items-center gap-2 text-sm px-6 py-2.5">
            <Download className="w-4 h-4" />
            <span>Export CSV Dataset</span>
          </button>
          <button className="btn-secondary flex items-center gap-2 text-sm px-6 py-2.5">
            <FileText className="w-4 h-4" />
            <span>Dispatch to Municipal Leadership</span>
          </button>
        </div>
        </ScrollReveal>

        {/* Historical Reports */}
        <ScrollReveal direction="up" delay={60}>
        <PremiumPanel
          flush
          title="Historical City Intelligence Archives"
          subtitle="Signed briefs, audits and evidence dossiers"
          icon={Archive}
          badge={
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
              Past 30 Days
            </span>
          }
        >
          <div className="p-6 stagger-list space-y-3">
            {[
              { title: 'Daily Intelligence Report', date: 'September 7, 2026', type: 'Daily Brief' },
              { title: 'Weekly Corridor Congestion & Delay Summary', date: 'September 1-7, 2026', type: 'Weekly' },
              { title: 'Municipal Pavement Maintenance Priority Ranking', date: 'September 5, 2026', type: 'Civil Works' },
              { title: 'Incident Investigation Evidence Dossier', date: 'September 4, 2026', type: 'Enforcement' },
              { title: 'Monthly AI Performance & Sensor Uptime Audit', date: 'August 2026', type: 'Monthly' },
            ].map((report, index) => (
              <div key={index} className="group/row flex flex-wrap items-center justify-between p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl hover:bg-white hover:border-blue-200 hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 ease-silk cursor-pointer shadow-sm">
                <div className="flex items-center space-x-3.5">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{report.title}</div>
                    <div className="text-xs text-slate-500">{report.date}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
                    {report.type}
                  </span>
                  <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors press-scale">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </PremiumPanel>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  )
}
