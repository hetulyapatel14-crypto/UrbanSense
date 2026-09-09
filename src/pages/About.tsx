import { Link } from 'react-router-dom'
import { ArrowLeft, Radio, CheckCircle2, ArrowRight } from 'lucide-react'
import ScrollProgressBar from '../components/common/ScrollProgressBar'

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      <ScrollProgressBar />
      {/* Header */}
      <header className="border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-sm text-white">
                  <Radio className="w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">UrbanSense</span>
              </div>
            </div>

            <Link to="/command-center" className="btn-primary text-xs sm:text-sm px-5 py-2.5">
              Launch Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Platform Vision
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mt-3 mb-4">
              About UrbanSense
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Transforming conventional public transit fleets into real-time mobile urban sensing networks.
            </p>
          </div>

          <div className="space-y-8 text-base md:text-lg text-slate-700 leading-relaxed">
            <div className="card-luxury p-8">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">The Core Mission</h2>
              <p className="text-slate-600 leading-relaxed">
                UrbanSense is an AI-powered smart city intelligence platform that leverages everyday public transport buses as mobile sensing units for continuous, high-definition municipal observation.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                By equipping city bus fleets with high-definition optical lenses and Edge AI inferencing hardware, we create an automated, dynamically moving sensor web that detects pavement hazards, road congestion, civil infrastructure defects, and public safety occurrences in real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card-luxury p-7">
                <h2 className="text-xl font-extrabold text-slate-900 mb-3 tracking-tight">The Challenge</h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Modern metropolises face chronic difficulties in monitoring hundreds of kilometers of road networks. Traditional monitoring depends on static CCTV cameras with blind spots, expensive and infrequent manual inspections, and delayed citizen complaints after damages occur.
                </p>
              </div>

              <div className="card-luxury p-7 border-blue-200 bg-gradient-to-b from-white to-blue-50/40">
                <h2 className="text-xl font-extrabold text-slate-900 mb-3 tracking-tight">Our Solution</h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  UrbanSense mounts Edge AI perception computers directly onto existing buses. As buses drive their regular commuter routes, they continuously analyze road quality and safety incidents without human intervention, streaming only actionable metadata back to the command center.
                </p>
              </div>
            </div>

            <div className="card-luxury p-8">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-5 tracking-tight">Key Civic Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm font-semibold text-slate-800">
                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-time road hazard detection (potholes, cracks, pooling)</span>
                </div>
                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Traffic density analysis & corridor delay estimation</span>
                </div>
                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Infrastructure monitoring (signs, dividers, zebra crossings)</span>
                </div>
                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Incident detection (hit-and-run, lane obstruction)</span>
                </div>
                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Automated Number Plate Recognition (ANPR)</span>
                </div>
                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pedestrian & vulnerable road user school-zone tracking</span>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="card-luxury p-8">
              <h3 className="text-xl font-extrabold text-slate-900 mb-6 tracking-tight">Platform Technology Stack</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Frontend</div>
                  <div className="font-extrabold text-slate-900">React 18 & Vite</div>
                  <div className="text-xs text-slate-500 mt-1">TypeScript, Tailwind CSS</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Edge AI</div>
                  <div className="font-extrabold text-slate-900">YOLOv8 & CNNs</div>
                  <div className="text-xs text-slate-500 mt-1">Onboard Hardware Inference</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">GIS Mapping</div>
                  <div className="font-extrabold text-slate-900">Leaflet & OpenStreetMap</div>
                  <div className="text-xs text-slate-500 mt-1">High-Precision Geospatial</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Analytics</div>
                  <div className="font-extrabold text-slate-900">Recharts Engine</div>
                  <div className="text-xs text-slate-500 mt-1">Executive Live Dashboards</div>
                </div>
              </div>
            </div>

            <div className="text-center pt-6">
              <Link to="/command-center" className="btn-primary text-base px-8 py-3.5 shadow-md shadow-blue-500/20 inline-flex items-center gap-2">
                <span>Enter Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 bg-white mt-16">
        <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© 2026 UrbanSense. Smart City Intelligence Platform.</p>
        </div>
      </footer>
    </div>
  )
}
