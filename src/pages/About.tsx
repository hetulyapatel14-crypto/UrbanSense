import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  ArrowRight,
  Radio,
  Cpu,
  Map as MapIcon,
  BarChart3,
  Target,
  Lightbulb,
} from 'lucide-react'
import ScrollProgressBar from '../components/common/ScrollProgressBar'
import { ScrollReveal } from '../components/common/ScrollReveal'
import { ClayBlobs } from '../components/common/ClayBlobs'
import { UrbanSenseLogo } from '../components/common/UrbanSenseLogo'
import { SectionHeader } from '../components/common/SectionHeader'

const CAPABILITIES = [
  'Road hazard detection — potholes, cracking, standing water',
  'Traffic density analysis and corridor delay estimation',
  'Infrastructure monitoring — signage, dividers, crossings',
  'Incident detection — collision, obstruction, unsafe manoeuvres',
  'Automatic number plate recognition for enforcement',
  'Vulnerable road user tracking around school zones',
]

const STACK = [
  { label: 'Frontend', value: 'React 18 & Vite', note: 'TypeScript · Tailwind' },
  { label: 'On-vehicle AI', value: 'YOLOv8 & CNNs', note: 'Onboard inference' },
  { label: 'Mapping', value: 'Leaflet & OpenStreetMap', note: 'High-precision GIS' },
  { label: 'Analytics', value: 'Recharts engine', note: 'Live dashboards' },
]

export default function About() {
  return (
    <div className="relative min-h-screen bg-surface-0 text-ink">
      <ClayBlobs variant="display" />
      <ScrollProgressBar />

      <header className="sticky top-0 z-50 border-b border-line bg-surface-1/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-5 py-3.5 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="u-icon-btn" aria-label="Back to home">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <UrbanSenseLogo size="sm" subtext="Platform vision" id="about" />
          </div>

          <Link to="/command-center" className="u-btn u-btn-primary u-btn-sm">
            Open dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1120px] px-5 py-14 lg:px-8 lg:py-20">
        {/* Mission */}
        <ScrollReveal direction="up">
          <SectionHeader
            size="lg"
            eyebrow="About the platform"
            title="Public transport already covers the city. We gave it a way to observe."
          />
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-secondary">
            UrbanSense is an urban intelligence platform that turns everyday public transport vehicles into a
            continuously moving network of sensors. Each connected bus observes the streets it already drives, so the
            city gains coverage without installing new roadside hardware.
          </p>
        </ScrollReveal>

        {/* Challenge / solution */}
        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ScrollReveal direction="up">
            <div className="border-t border-line pt-6">
              <div className="flex items-center gap-2.5">
                <Target className="h-4 w-4 text-amber-500" />
                <h2 className="u-h3">The problem</h2>
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-secondary">
                Cities manage hundreds of kilometres of road with a mix of fixed cameras that leave blind spots,
                infrequent manual inspections, and citizen complaints that arrive after the damage is done. Coverage
                is uneven exactly where it matters most.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={60}>
            <div className="border-t border-brand-200/60 pt-6">
              <div className="flex items-center gap-2.5">
                <Lightbulb className="h-4 w-4 text-brand-500" />
                <h2 className="u-h3">The approach</h2>
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-secondary">
                Perception hardware rides on the fleet. As vehicles complete their normal routes, they assess road
                quality and safety conditions locally and stream only structured, actionable events upstream — where
                operators, engineers and enforcement teams can act on them.
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Capabilities */}
        <ScrollReveal direction="up">
          <section className="u-panel mt-14 overflow-hidden">
            <span className="u-hair" aria-hidden="true" />
            <div className="u-panel-head">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface-3 text-emerald-600">
                  <Radio className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h2 className="text-[13px] font-semibold text-ink">What the network observes</h2>
                  <p className="text-[11px] text-ink-muted">Six detection families running continuously</p>
                </div>
              </div>
            </div>

            <ul className="grid grid-cols-1 divide-line/70 sm:grid-cols-2">
              {CAPABILITIES.map(item => (
                <li
                  key={item}
                  className="flex items-start gap-3 border-t border-line/70 px-4 py-3.5 text-[13px] text-ink-secondary transition-colors hover:bg-surface-3/40 sm:px-5"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </ScrollReveal>

        {/* Stack */}
        <ScrollReveal direction="up">
          <div className="mt-14">
            <SectionHeader eyebrow="Under the hood" title="Platform technology" />
          </div>
        </ScrollReveal>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STACK.map((entry, i) => (
            <ScrollReveal key={entry.label} direction="up" delay={i * 40}>
              <div className="u-panel u-panel-hover p-4">
                <p className="u-overline">{entry.label}</p>
                <p className="mt-2 text-[13.5px] font-medium text-ink">{entry.value}</p>
                <p className="mt-1 text-[11.5px] text-ink-muted">{entry.note}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Coverage */}
        <ScrollReveal direction="up">
          <section className="mt-14 grid gap-8 border-t border-line pt-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <div className="flex items-center gap-2.5">
                <MapIcon className="h-4 w-4 text-brand-500" />
                <h2 className="u-h3">Coverage today</h2>
              </div>
              <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-ink-secondary">
                Live across Ahmedabad, Gandhinagar and GIFT City, covering the metro, BRTS, AMTS, suburban rail and
                electric shuttle corridors that carry the region every day.
              </p>

              <dl className="mt-6 grid grid-cols-3 gap-x-8 border-t border-line/70 pt-5">
                {[
                  ['Cities', '3'],
                  ['Fleet', '248'],
                  ['Corridors', '64'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dd className="u-num text-[22px] font-semibold text-ink">{v}</dd>
                    <dt className="mt-1 text-[11.5px] text-ink-muted">{k}</dt>
                  </div>
                ))}
              </dl>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link to="/urban-map" className="u-btn u-btn-outline px-4 py-2.5 text-[13px]">
                <MapIcon className="h-4 w-4" />
                View the map
              </Link>
              <Link to="/traffic-analytics" className="u-btn u-btn-primary px-4 py-2.5 text-[13px]">
                <BarChart3 className="h-4 w-4" />
                See traffic analytics
              </Link>
            </div>
          </section>
        </ScrollReveal>

        {/* Closing */}
        <ScrollReveal direction="up">
          <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-10">
            <p className="max-w-xl text-[15px] leading-relaxed text-ink-secondary">
              Learn how the sensing, inference and operations layers fit together.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link to="/architecture" className="u-btn u-btn-outline px-4 py-2.5 text-[13.5px]">
                <Cpu className="h-4 w-4" />
                System architecture
              </Link>
              <Link to="/command-center" className="u-btn u-btn-primary px-4 py-2.5 text-[13.5px]">
                Enter command center
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-3 px-5 py-8 lg:px-8">
          <p className="text-[11.5px] text-ink-faint">© 2026 UrbanSense · Urban intelligence platform</p>
          <span className="flex items-center gap-2 text-[11.5px] text-ink-muted">
            <span className="live-dot" />
            All regional services operational
          </span>
        </div>
      </footer>
    </div>
  )
}
