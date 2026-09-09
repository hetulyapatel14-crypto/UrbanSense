import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bus,
  Map,
  Brain,
  Radio,
  Shield,
  Camera,
  Activity,
  Database,
  Zap,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { ScrollProgressBar } from '../components/common/ScrollProgressBar'
import { AnimatedCounter } from '../components/common/AnimatedCounter'
import { ScrollReveal } from '../components/common/ScrollReveal'
import { InteractiveGlowCard } from '../components/common/InteractiveGlowCard'

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 relative selection:bg-blue-100 selection:text-blue-900">
      {/* Top Scroll Progress Indicator */}
      <ScrollProgressBar />

      {/* Header / Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3'
            : 'bg-white/80 backdrop-blur-sm border-b border-slate-200/50 py-4'
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-sm text-white group-hover:scale-105 transition-transform duration-300">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                  UrbanSense
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                  GovTech AI
                </span>
              </div>
            </Link>

            {/* Header CTA */}
            <Link
              to="/command-center"
              className="btn-primary group flex items-center space-x-2 text-sm px-5 py-2.5 shadow-sm"
            >
              <span>Main Dashboard</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-24 overflow-hidden bg-tech-grid bg-ambient-mesh">
        {/* Subtle Ambient Floating Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-400/10 via-indigo-400/10 to-cyan-400/10 blur-3xl pointer-events-none rounded-full" />

        <div className="container mx-auto px-6 relative z-10">
          <ScrollReveal direction="up" delay={0}>
            <div className="max-w-4xl mx-auto text-center mb-16">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 backdrop-blur-xs border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6 shadow-2xs hover:shadow-xs transition-all duration-300 hover:scale-[1.02]">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <span>Ahmedabad Unified Multimodal Mobility & Edge AI Platform</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight text-slate-900">
                SMART URBAN INTELLIGENCE &<br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  MULTIMODAL MOBILITY PLANNER
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto font-normal">
                Seamlessly unify <strong>Ahmedabad Metro</strong>, <strong>Janmarg BRTS</strong>, and <strong>AMTS Feeder Buses</strong> with real-time passenger routing, delay alerts, and AI urban sensing.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/journey-planner"
                  className="btn-primary group text-base px-8 py-3.5 shadow-md shadow-blue-500/20 flex items-center gap-2.5"
                >
                  <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Open Smart Journey Planner</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </Link>
                <Link
                  to="/command-center"
                  className="btn-secondary text-base px-8 py-3.5 hover:border-slate-300 hover:shadow-sm"
                >
                  Launch Command Center
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Hero Visual Card */}
          <ScrollReveal direction="up" delay={150}>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 max-w-5xl mx-auto shadow-card hover:shadow-card-hover transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Visual sub-card 1 */}
                <div className="text-center p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:bg-white hover:shadow-xs transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">BUS CAMERAS</div>
                  <div className="text-2xl font-black text-slate-900">5 HD Feeds</div>
                  <div className="text-xs text-slate-500 mt-1">Front, Rear, Perimeter</div>
                </div>

                {/* Visual sub-card 2 */}
                <div className="text-center p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:bg-white hover:shadow-xs transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mx-auto mb-3 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">EDGE AI ENGINE</div>
                  <div className="text-2xl font-black text-slate-900">&lt;50ms Latency</div>
                  <div className="text-xs text-slate-500 mt-1">On-vehicle inference</div>
                </div>

                {/* Visual sub-card 3 */}
                <div className="text-center p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:bg-white hover:shadow-xs transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                    <Database className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">CITY INTELLIGENCE</div>
                  <div className="text-2xl font-black text-slate-900">95% Bandwidth Saved</div>
                  <div className="text-xs text-slate-500 mt-1">Event-driven telemetry</div>
                </div>
              </div>

              {/* Pipeline Flow */}
              <div className="bg-slate-50/90 rounded-2xl border border-slate-200 p-6">
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold">
                  <div className="flex items-center space-x-2 text-slate-800 bg-white px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all">
                    <Bus className="w-4 h-4 text-blue-600" />
                    <span>Public Bus Fleet</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-400 animate-pulse hidden sm:block" />
                  <div className="flex items-center space-x-2 text-slate-800 bg-white px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all">
                    <Camera className="w-4 h-4 text-indigo-600" />
                    <span>HD Multi-Angle Vision</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-indigo-400 animate-pulse hidden sm:block" />
                  <div className="flex items-center space-x-2 text-slate-800 bg-white px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-2xs hover:border-cyan-300 hover:shadow-xs transition-all">
                    <Brain className="w-4 h-4 text-cyan-600" />
                    <span>On-Board Edge AI</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-cyan-400 animate-pulse hidden sm:block" />
                  <div className="flex items-center space-x-2 text-slate-800 bg-white px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all">
                    <Map className="w-4 h-4 text-emerald-600" />
                    <span>Command Center</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Live Statistics */}
      <section className="py-16 bg-white border-y border-slate-200/80 relative">
        <div className="container mx-auto px-6">
          <ScrollReveal direction="up" delay={0}>
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                REAL-TIME URBAN INTELLIGENCE
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base">
                Live sensing metrics aggregated across all active mobile sensing units.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {/* Stat 1 */}
            <ScrollReveal direction="up" delay={50}>
              <div className="stat-card text-center group">
                <div className="text-3xl lg:text-4xl font-black text-blue-600 mb-1 tracking-tight">
                  <AnimatedCounter value="248" />
                </div>
                <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">ACTIVE BUSES</div>
                <div className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.4% today
                </div>
              </div>
            </ScrollReveal>

            {/* Stat 2 */}
            <ScrollReveal direction="up" delay={100}>
              <div className="stat-card text-center group">
                <div className="text-3xl lg:text-4xl font-black text-indigo-600 mb-1 tracking-tight">
                  <AnimatedCounter value="12,846" />
                </div>
                <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">AI DETECTIONS</div>
                <div className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8.2% today
                </div>
              </div>
            </ScrollReveal>

            {/* Stat 3 */}
            <ScrollReveal direction="up" delay={150}>
              <div className="stat-card text-center group">
                <div className="text-3xl lg:text-4xl font-black text-amber-600 mb-1 tracking-tight">
                  <AnimatedCounter value="327" />
                </div>
                <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">ROAD HAZARDS</div>
                <div className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5.1% today
                </div>
              </div>
            </ScrollReveal>

            {/* Stat 4 */}
            <ScrollReveal direction="up" delay={200}>
              <div className="stat-card text-center group">
                <div className="text-3xl lg:text-4xl font-black text-rose-600 mb-1 tracking-tight">
                  <AnimatedCounter value="18" />
                </div>
                <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">OPEN INCIDENTS</div>
                <div className="inline-flex items-center text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  4 critical
                </div>
              </div>
            </ScrollReveal>

            {/* Stat 5 */}
            <ScrollReveal direction="up" delay={250}>
              <div className="stat-card text-center group col-span-2 md:col-span-1">
                <div className="text-3xl lg:text-4xl font-black text-emerald-600 mb-1 tracking-tight">
                  <AnimatedCounter value="94.6%" />
                </div>
                <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">CONFIDENCE</div>
                <div className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +1.2% accuracy
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50 bg-ambient-mesh">
        <div className="container mx-auto px-6">
          <ScrollReveal direction="up" delay={0}>
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
                Workflow
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-4 tracking-tight">HOW IT WORKS</h2>
              <p className="text-slate-600 text-base md:text-lg max-w-xl mx-auto font-normal">
                From on-bus optical capture to civic resolution in milliseconds
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Step 1 */}
            <ScrollReveal direction="up" delay={50}>
              <InteractiveGlowCard className="p-6 text-center group h-full">
                <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-4 font-black text-xl shadow-xs group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:scale-105">
                  01
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">CAPTURE</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Multiple bus-mounted cameras continuously monitor road surface and traffic lanes.
                </p>
              </InteractiveGlowCard>
            </ScrollReveal>

            {/* Step 2 */}
            <ScrollReveal direction="up" delay={100}>
              <InteractiveGlowCard className="p-6 text-center group h-full">
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-4 font-black text-xl shadow-xs group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 group-hover:scale-105">
                  02
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">EDGE AI</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Computer vision models instantly detect potholes, congestion, and anomalies locally on each bus.
                </p>
              </InteractiveGlowCard>
            </ScrollReveal>

            {/* Step 3 */}
            <ScrollReveal direction="up" delay={150}>
              <InteractiveGlowCard className="p-6 text-center group h-full">
                <div className="bg-cyan-50 border border-cyan-200 text-cyan-700 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-4 font-black text-xl shadow-xs group-hover:bg-cyan-600 group-hover:text-white transition-all duration-300 group-hover:scale-105">
                  03
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">INTELLIGENCE</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Events are enriched with precise GPS, speed telemetry, confidence rating, and ANPR plate data.
                </p>
              </InteractiveGlowCard>
            </ScrollReveal>

            {/* Step 4 */}
            <ScrollReveal direction="up" delay={200}>
              <InteractiveGlowCard className="p-6 text-center group h-full">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-4 font-black text-xl shadow-xs group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 group-hover:scale-105">
                  04
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">DISPATCH</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Municipal teams and traffic control receive verified, actionable alerts for immediate resolution.
                </p>
              </InteractiveGlowCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* AI Capabilities */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="container mx-auto px-6">
          <ScrollReveal direction="up" delay={0}>
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 shadow-2xs">
                Edge Vision Models
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-4 tracking-tight">AI CAPABILITIES</h2>
              <p className="text-slate-600 text-base md:text-lg max-w-xl mx-auto font-normal">
                Comprehensive city-wide intelligence running autonomously at the edge
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <ScrollReveal direction="up" delay={50}>
              <InteractiveGlowCard className="p-6 group h-full">
                <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200/70 flex items-center justify-center mb-4 text-rose-600 group-hover:scale-110 transition-transform duration-300 shadow-2xs">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">
                  Road Hazard Detection
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Automatically detects potholes, asphalt cracking, waterlogging, and missing manhole covers.
                </p>
              </InteractiveGlowCard>
            </ScrollReveal>

            {/* Feature 2 */}
            <ScrollReveal direction="up" delay={100}>
              <InteractiveGlowCard className="p-6 group h-full">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-center mb-4 text-blue-600 group-hover:scale-110 transition-transform duration-300 shadow-2xs">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Traffic Intelligence
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Detects, classifies, and counts vehicles in real-time to compute congestion indices per corridor.
                </p>
              </InteractiveGlowCard>
            </ScrollReveal>

            {/* Feature 3 */}
            <ScrollReveal direction="up" delay={150}>
              <InteractiveGlowCard className="p-6 group h-full">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center mb-4 text-emerald-600 group-hover:scale-110 transition-transform duration-300 shadow-2xs">
                  <Map className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                  Infrastructure Monitoring
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Flags damaged dividers, worn zebra crossings, occluded road signs, and street lighting issues.
                </p>
              </InteractiveGlowCard>
            </ScrollReveal>

            {/* Feature 4 */}
            <ScrollReveal direction="up" delay={200}>
              <InteractiveGlowCard className="p-6 group h-full">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center mb-4 text-amber-600 group-hover:scale-110 transition-transform duration-300 shadow-2xs">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                  Pedestrian Safety
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Monitors school zones and heavy pedestrian crossings to prevent accidents and protect vulnerable citizens.
                </p>
              </InteractiveGlowCard>
            </ScrollReveal>

            {/* Feature 5 */}
            <ScrollReveal direction="up" delay={250}>
              <InteractiveGlowCard className="p-6 group h-full">
                <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200/70 flex items-center justify-center mb-4 text-rose-600 group-hover:scale-110 transition-transform duration-300 shadow-2xs">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">
                  Incident Detection
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Instant identification of vehicle breakdowns, accidents, hit-and-run occurrences, and lane violations.
                </p>
              </InteractiveGlowCard>
            </ScrollReveal>

            {/* Feature 6 */}
            <ScrollReveal direction="up" delay={300}>
              <InteractiveGlowCard className="p-6 group h-full">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200/70 flex items-center justify-center mb-4 text-purple-600 group-hover:scale-110 transition-transform duration-300 shadow-2xs">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                  ANPR Tracking
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Optical character recognition for vehicle license plates, tracking movement histories across buses.
                </p>
              </InteractiveGlowCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Visual Product Section - Simulated Camera Feed in Light Executive Frame */}
      <section className="py-20 bg-slate-50 bg-tech-grid">
        <div className="container mx-auto px-6">
          <ScrollReveal direction="up" delay={0}>
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
                  Live Simulation
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-4 tracking-tight">EDGE AI IN ACTION</h2>
                <p className="text-slate-600 text-base md:text-lg font-normal">Real-time computer vision inference executed directly on-bus</p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
                <div className="bg-slate-50/90 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-2xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>BUS-104 | Front Wide Lens | Edge Stream Active</span>
                  </div>
                </div>

                <div className="p-6 bg-slate-100/80">
                  <div className="aspect-video bg-gradient-to-tr from-slate-800 to-slate-900 rounded-xl flex items-center justify-center relative overflow-hidden shadow-inner border border-slate-700/50">
                    <div className="text-center">
                      <Camera className="w-14 h-14 text-slate-500 mx-auto mb-2 opacity-60 animate-float-slow" />
                      <div className="text-slate-400 text-sm font-medium">Urban Road Scenario (Simulated Live Feed)</div>
                    </div>

                    {/* High contrast overlay tags with pulse beacons */}
                    <div className="absolute top-8 left-12 border border-cyan-400/90 bg-cyan-950/70 backdrop-blur-xs px-2.5 py-1 rounded text-xs shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                      <span className="text-cyan-300 font-bold">CAR 92%</span>
                    </div>
                    <div className="absolute top-24 right-20 border border-emerald-400/90 bg-emerald-950/70 backdrop-blur-xs px-2.5 py-1 rounded text-xs shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-emerald-300 font-bold">PEDESTRIAN 96%</span>
                    </div>
                    <div className="absolute bottom-16 left-32 border border-rose-400/90 bg-rose-950/70 backdrop-blur-xs px-2.5 py-1 rounded text-xs shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                      <span className="text-rose-300 font-bold">POTHOLE 89%</span>
                    </div>
                    <div className="absolute top-12 right-48 border border-amber-400/90 bg-amber-950/70 backdrop-blur-xs px-2.5 py-1 rounded text-xs shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      <span className="text-amber-300 font-bold">SIGN POST 94%</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white border-t border-slate-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                      <div className="text-xs font-bold text-slate-500 mb-1">OBJECTS DETECTED</div>
                      <div className="text-2xl font-black text-blue-600">14 Targets</div>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-rose-200 hover:bg-rose-50/30 transition-colors">
                      <div className="text-xs font-bold text-slate-500 mb-1">ROAD HAZARDS</div>
                      <div className="text-2xl font-black text-rose-600">2 Flagged</div>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors">
                      <div className="text-xs font-bold text-slate-500 mb-1">INFERENCE STATUS</div>
                      <div className="text-2xl font-black text-emerald-600">32 FPS</div>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors">
                      <div className="text-xs font-bold text-slate-500 mb-1">GPS COORDINATES</div>
                      <div className="text-sm font-bold text-slate-900 mt-1">23.0225° N, 72.5714° E</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-b from-white via-blue-50/40 to-blue-50/80 border-t border-slate-200/80 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <ScrollReveal direction="up" delay={0}>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
              ONE FLEET. THOUSANDS OF EYES.<br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                A SAFER, SMARTER CITY.
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed font-normal">
              Turn existing public transport infrastructure into an automated, moving civic intelligence system.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/command-center"
                className="btn-primary group text-base px-8 py-3.5 shadow-md shadow-blue-500/20"
              >
                <span>Launch Command Center</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/architecture"
                className="btn-secondary text-base px-8 py-3.5"
              >
                View System Architecture
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 bg-white">
        <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© 2026 UrbanSense. Smart City Intelligence Platform. Powered by Edge AI.</p>
        </div>
      </footer>
    </div>
  )
}
