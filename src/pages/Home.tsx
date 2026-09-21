import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bus,
  Activity,
  Layers,
  AlertTriangle,
  Compass,
  ScanLine,
  Map as MapIcon,
  BarChart3,
  Radio,
  ShieldCheck,
  Cpu,
  Waypoints,
  Footprints,
  TrainFront,
  Zap,
  Gauge,
} from 'lucide-react'
import { ScrollProgressBar } from '../components/common/ScrollProgressBar'
import { ScrollReveal } from '../components/common/ScrollReveal'
import { UrbanSenseLogo, UrbanSenseMark } from '../components/common/UrbanSenseLogo'
import { MetricStrip } from '../components/common/MetricStrip'
import { SectionHeader } from '../components/common/SectionHeader'
import { LedIndicator } from '../components/common/Industrial'

const NAV_LINKS = [
  { label: 'Platform', to: '#platform' },
  { label: 'Intelligence', to: '/road-intelligence' },
  { label: 'Mobility', to: '/journey-planner' },
  { label: 'Fleet', to: '/live-fleet' },
  { label: 'About', to: '/about' },
]

const MODES = [
  { name: 'Ahmedabad Metro', code: 'GMRC', color: '#2563EB', note: 'Phase 1 & 2 corridors' },
  { name: 'Janmarg BRTS', code: 'AJL', color: '#EA580C', note: 'Dedicated busways' },
  { name: 'AMTS city bus', code: 'AMTS', color: '#4ADE80', note: 'Feeder network' },
  { name: 'GIFT EV shuttle', code: 'GIFT', color: '#2DD4BF', note: 'SEZ & smart towers' },
  { name: 'Suburban rail', code: 'WR', color: '#7C3AED', note: 'Kalupur · Sabarmati' },
  { name: 'Greenline electric', code: 'GGTSL', color: '#059669', note: 'Gandhinagar corridors' },
]



const MODULES = [
  { to: '/command-center', label: 'Command Center', desc: 'City operations console with live map and dispatch feed', icon: MapIcon, group: 'Operations' },
  { to: '/live-fleet', label: 'Live Fleet', desc: 'Vehicle telemetry, camera array health and inference state', icon: Bus, group: 'Operations' },
  { to: '/urban-map', label: 'Urban Map', desc: 'Layered spatial view of fleet, hazards and incidents', icon: Layers, group: 'Operations' },
  { to: '/road-intelligence', label: 'Road Intelligence', desc: 'Pavement condition, hazard distribution and repair queue', icon: Activity, group: 'Intelligence' },
  { to: '/traffic-analytics', label: 'Traffic Analytics', desc: 'Corridor speed, flow and delay patterns over time', icon: BarChart3, group: 'Intelligence' },
  { to: '/incident-center', label: 'Incident Center', desc: 'Detection triage, investigation dossiers and escalation', icon: AlertTriangle, group: 'Intelligence' },
  { to: '/journey-planner', label: 'Journey Planner', desc: 'Multimodal routing with departures, stops and AI answers', icon: Compass, group: 'Mobility' },
  { to: '/vehicle-tracking', label: 'Vehicle Tracking', desc: 'Live kinematics, next stop and connection quality', icon: ScanLine, group: 'Mobility' },
]

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative min-h-screen bg-surface-0 text-ink selection:bg-brand-500/30">
      <ScrollProgressBar />

      {/* ══ Navigation ═══════════════════════════════════════════════════ */}
      <header
        className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
          isScrolled ? 'border-line bg-surface-1/80 backdrop-blur-xl' : 'border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-6 px-5 lg:px-8">
          <Link to="/" className="shrink-0" aria-label="UrbanSense home">
            <UrbanSenseLogo size="md" subtext="Mobility OS" id="portal" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Sections">
            {NAV_LINKS.map(link =>
              link.to.startsWith('#') ? (
                <a
                  key={link.label}
                  href={link.to}
                  className="rounded-lg px-3 py-2 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-surface-3/60 hover:text-ink"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  className="rounded-lg px-3 py-2 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-surface-3/60 hover:text-ink"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-muted md:flex">
              <LedIndicator tone="mint" />
              Live platform
            </span>
            <span className="hidden h-4 w-px bg-[rgba(163,177,198,0.4)] md:block" aria-hidden="true" />
            <Link to="/command-center" className="u-btn u-btn-primary py-2 text-[12.5px]">
              Open dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ══ Hero ═════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1240px] px-5 pb-16 pt-12 lg:px-8 lg:pb-24 lg:pt-20">
          {/* Copy */}
          <ScrollReveal direction="up" delay={0} className="flex flex-col justify-center max-w-3xl">
            <div className="u-chip u-chip-brand mb-6 w-fit">
              <Radio className="h-3 w-3" />
              Urban intelligence platform
            </div>

            <h1 className="text-[38px] font-extrabold leading-[1.04] tracking-[-0.035em] text-ink u-emboss sm:text-[52px] lg:text-[62px]">
              See the city.
              <br />
              <span className="bg-gradient-to-r from-brand-500 to-[#ff7680] bg-clip-text text-transparent">
                Understand it
              </span>
              <br />
              in real time.
            </h1>

            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-ink-secondary">
              UrbanSense turns connected public transport into a continuously moving network of
              urban sensors — reading road condition, traffic and safety as the fleet goes about its
              daily routes.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/command-center" className="u-btn u-btn-primary px-4 py-2.5 text-[13.5px]">
                Explore UrbanSense
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/journey-planner" className="u-btn u-btn-outline px-4 py-2.5 text-[13.5px]">
                <Compass className="h-4 w-4" />
                Plan a journey
              </Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-x-6 gap-y-4 pt-6">
              {[
                { k: 'Cities covered', v: '3' },
                { k: 'Connected fleet', v: '248' },
                { k: 'Corridors watched', v: '64' },
              ].map(item => (
                <div key={item.k} className="rounded-lg bg-surface-3/60 px-3 py-2.5 shadow-recessed">
                  <dd className="u-num text-[22px] font-bold leading-none text-ink">{item.v}</dd>
                  <dt className="u-overline mt-1.5 normal-case tracking-[0.08em]">{item.k}</dt>
                </div>
              ))}
            </dl>
          </ScrollReveal>
        </div>
      </section>

      {/* ══ Telemetry band ═══════════════════════════════════════════════ */}
      <section className="border-y border-line bg-surface-1/40">
        <div className="mx-auto max-w-[1240px] px-5 py-10 lg:px-8">
          <ScrollReveal direction="up">
            <MetricStrip
              dense
              items={[
                { label: 'Connected transit fleet', value: '248', sublabel: 'Optical sensing vehicles', icon: Bus },
                { label: 'Vision events today', value: '12.8K', sublabel: 'On-vehicle AI inferences', icon: Activity },
                { label: 'Road hazards tracked', value: '327', sublabel: 'Awaiting municipal repair', icon: Layers },
                { label: 'Open incidents', value: '18', sublabel: 'In the operator queue', icon: AlertTriangle },
                { label: 'Detection confidence', value: '94.6%', sublabel: 'Network benchmark', icon: ShieldCheck },
              ]}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* ══ How the network works ════════════════════════════════════════ */}
      <section id="platform" className="mx-auto max-w-[1240px] px-5 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20">
          <ScrollReveal direction="up">
            <div className="lg:sticky lg:top-24">
              <SectionHeader
                size="lg"
                eyebrow="How it works"
                title="A sensing layer that rides with the city"
                description="No new roadside hardware. The fleet already drives every corridor — UrbanSense gives it eyes and a voice."
              />

              <div className="mt-8 space-y-3">
                {[
                  { icon: Cpu, label: 'On-vehicle AI', note: 'Inference runs on the bus, not in a data centre.' },
                  { icon: Waypoints, label: 'Continuous coverage', note: 'Every route becomes a monitored corridor.' },
                  { icon: Radio, label: 'Actionable stream', note: 'Only events and coordinates travel upstream.' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-brand-600 shadow-key">
                      <item.icon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-[13px] font-medium text-ink">{item.label}</p>
                      <p className="text-[12px] text-ink-muted">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={80}>
            <ol className="relative space-y-9 border-l border-line pl-8">
              {[
                {
                  n: '01',
                  title: 'Capture',
                  body: 'Front, rear and curb-facing cameras on connected buses record the street as the vehicle completes its route, with GPS locked to the road centreline.',
                },
                {
                  n: '02',
                  title: 'Understand',
                  body: 'On-vehicle models classify potholes, waterlogging, obstructions, congestion and safety events, attaching severity, confidence and position to each detection.',
                },
                {
                  n: '03',
                  title: 'Act',
                  body: 'Operators receive prioritised queues by corridor and zone — for repair crews, traffic enforcement and the journey planner that guides citizens.',
                },
              ].map(step => (
                <li key={step.n} className="relative">
                  <span className="absolute -left-[41px] flex h-5 w-5 items-center justify-center rounded-full bg-surface-2 shadow-key">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shadow-glow-accent" />
                  </span>
                  <span className="u-overline">{step.n}</span>
                  <h3 className="mt-1.5 text-[17px] font-semibold tracking-tight text-ink">{step.title}</h3>
                  <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-ink-secondary">{step.body}</p>
                </li>
              ))}
            </ol>
          </ScrollReveal>
        </div>
      </section>

      {/* ══ Module index ═════════════════════════════════════════════════ */}
      <section className="border-y border-line bg-surface-1/40">
        <div className="mx-auto max-w-[1240px] px-5 py-20 lg:px-8 lg:py-24">
          <ScrollReveal direction="up">
            <SectionHeader
              eyebrow="Platform modules"
              title="One workspace per decision"
              description="Each module opens a purpose-built surface — operations consoles for live response, analytical workspaces for planning."
              aside={
                <Link to="/command-center" className="u-btn u-btn-outline py-2 text-[12.5px]">
                  Open the console
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
          </ScrollReveal>

          <ScrollReveal direction="up" delay={60}>
            <div className="mt-10 grid gap-x-10 border-t border-line sm:grid-cols-2">
              {MODULES.map((mod, i) => {
                const Icon = mod.icon
                return (
                  <Link
                    key={mod.to}
                    to={mod.to}
                    className="group flex items-center gap-4 border-b border-line py-4 transition-colors"
                  >
                    <span className="u-num text-[11px] text-ink-faint">{String(i + 1).padStart(2, '0')}</span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-muted shadow-groove transition-all duration-200 ease-mech group-hover:rotate-6 group-hover:text-brand-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-ink">{mod.label}</span>
                      <span className="block truncate text-[12px] text-ink-muted">{mod.desc}</span>
                    </span>
                    <span className="u-overline hidden sm:block">{mod.group}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand-500" />
                  </Link>
                )
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══ Multimodal mobility ══════════════════════════════════════════ */}
      <section className="mx-auto max-w-[1240px] px-5 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal direction="up">
            <SectionHeader
              size="lg"
              eyebrow="Mobility"
              title="Multimodal journeys across the region"
              description="Metro, BRTS, AMTS, suburban rail, electric shuttles and walking, planned as one network with live departure data."
            />

            <div className="mt-8 flex flex-wrap gap-2">
              {MODES.map(m => (
                <span
                  key={m.code}
                  className="u-chip u-chip-slate rounded-lg px-2.5 py-1.5 text-[11px] shadow-key"
                >
                  <span className="u-dot" style={{ backgroundColor: m.color }} />
                  {m.name}
                </span>
              ))}
            </div>

            <Link
              to="/journey-planner"
              className="u-btn u-btn-primary mt-8 px-4 py-2.5 text-[13px]"
            >
              Plan a journey
              <ArrowRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>

          {/* Journey chain illustration */}
          <ScrollReveal direction="up" delay={80}>
            <div className="u-panel p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="u-overline">Thaltej → GIFT City</p>
                  <p className="u-num mt-1 text-[15px] font-bold text-ink">52 min · ₹42 · 1 transfer</p>
                </div>
                <span className="u-chip u-chip-mint">
                  <LedIndicator tone="mint" pulse={false} />
                  On time
                </span>
              </div>

              <ol className="mt-5 space-y-3.5">
                {[
                  { icon: Footprints, mode: 'Walk', detail: '4 min to Thaltej Metro', color: '#78716C' },
                  { icon: TrainFront, mode: 'Metro · Blue Line', detail: '18 min to Old High Court', color: '#2563EB' },
                  { icon: Bus, mode: 'BRTS · Route 18', detail: '22 min to Infocity', color: '#EA580C' },
                  { icon: Zap, mode: 'GIFT EV shuttle', detail: '6 min to Tower 2', color: '#2DD4BF' },
                ].map((leg, i) => (
                  <li key={leg.mode} className="relative flex items-start gap-3.5 pl-1">
                    <span className="relative flex flex-col items-center">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-xl border"
                        style={{ borderColor: `${leg.color}44`, backgroundColor: `${leg.color}18`, color: leg.color }}
                      >
                        <leg.icon className="h-4 w-4" />
                      </span>
                      {i < 3 && <span className="mt-1 h-6 w-px bg-line" aria-hidden="true" />}
                    </span>
                    <span className="min-w-0 pt-1">
                      <span className="block text-[13px] font-medium text-ink">{leg.mode}</span>
                      <span className="block text-[11.5px] text-ink-muted">{leg.detail}</span>
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                <span className="flex items-center gap-1.5 text-[11.5px] text-ink-muted">
                  <Waypoints className="h-3.5 w-3.5" /> Live vehicle tracking
                </span>
                <span className="flex items-center gap-1.5 text-[11.5px] text-ink-muted">
                  <Gauge className="h-3.5 w-3.5" /> Departure boards
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══ Closing statement ════════════════════════════════════════════ */}
      <section className="border-t border-line bg-surface-1/40">
        <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8 lg:py-20">
          <ScrollReveal direction="up">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div className="max-w-2xl">
                <div className="mb-5 flex items-center gap-3">
                  <UrbanSenseMark className="h-9 w-9" gradientId="closing" />
                  <span className="u-overline">UrbanSense</span>
                </div>
                <p className="text-[24px] font-semibold leading-[1.2] tracking-[-0.03em] text-ink sm:text-[30px]">
                  Real-time intelligence from the moving city.
                </p>
                <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-ink-secondary">
                  Built for municipal operations, transport authorities and the people who move through
                  the region every day.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/command-center" className="u-btn u-btn-primary px-4 py-2.5 text-[13.5px]">
                  Open command center
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/urban-map" className="u-btn u-btn-outline px-4 py-2.5 text-[13.5px]">
                  View the urban map
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══ Footer ═══════════════════════════════════════════════════════ */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-[1240px] px-5 py-10 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="max-w-xs">
              <UrbanSenseLogo size="md" subtext="Urban Intelligence OS" id="footer" />
              <p className="mt-3 text-[12px] leading-relaxed text-ink-muted">
                A connected-transit sensing platform for Ahmedabad, Gandhinagar and GIFT City.
              </p>
            </div>

            <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-[12.5px]" aria-label="Footer">
              {MODULES.map(m => (
                <Link key={m.to} to={m.to} className="text-ink-muted transition-colors hover:text-ink">
                  {m.label}
                </Link>
              ))}
              <Link to="/architecture" className="text-ink-muted transition-colors hover:text-ink">
                Architecture
              </Link>
              <Link to="/about" className="text-ink-muted transition-colors hover:text-ink">
                About platform
              </Link>
            </nav>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <p className="text-[11.5px] text-ink-faint">
              © 2026 UrbanSense · Connected urban intelligence for the Ahmedabad region
            </p>
            <span className="flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              <LedIndicator tone="mint" />
              All regional services operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
