import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Camera,
  Cpu,
  Database,
  Map as MapIcon,
  ArrowDown,
  Zap,
  Server,
  Shield,
  ArrowRight,
  Satellite,
  Gauge,
} from 'lucide-react'
import ScrollProgressBar from '../components/common/ScrollProgressBar'
import { ScrollReveal } from '../components/common/ScrollReveal'
import { ClayBlobs } from '../components/common/ClayBlobs'
import { UrbanSenseLogo } from '../components/common/UrbanSenseLogo'
import { SectionHeader } from '../components/common/SectionHeader'

const LAYERS = [
  {
    n: '01',
    title: 'Mobile sensing',
    subtitle: 'Multi-perspective capture from moving transit vehicles',
    nodes: [
      { icon: Camera, label: 'Bus camera array', value: '5 synchronised HD lenses', note: 'Front · rear · left · right · cabin' },
      { icon: Satellite, label: 'GNSS receiver', value: '10 Hz positioning', note: 'Sub-metre urban precision' },
      { icon: Gauge, label: 'Vehicle telemetry', value: 'CAN-bus stream', note: 'Speed, heading, braking context' },
    ],
  },
  {
    n: '02',
    title: 'On-vehicle AI',
    subtitle: 'Inference runs on the vehicle, not in a data centre',
    groups: [
      {
        tone: 'text-brand-500',
        label: 'Object classification',
        items: ['Vehicles, auto-rickshaws, buses, trucks', 'Pedestrians in roadways and school zones', 'Traffic signals, signage and zebra crossings'],
      },
      {
        tone: 'text-rose-500',
        label: 'Road hazard detection',
        items: ['Pothole depth and surface disintegration', 'Waterlogging and drain overflow pooling', 'Missing physical lane dividers'],
      },
      {
        tone: 'text-iris-500',
        label: 'Advanced perception',
        items: ['Optical number plate recognition', 'Sudden deceleration and collision anomalies', 'Cross-vehicle trajectory association'],
      },
    ],
  },
  {
    n: '03',
    title: 'Data & telemetry hub',
    subtitle: 'High-throughput ingestion, spatial aggregation and analytics',
    nodes: [
      { icon: Server, label: 'Event ingestion', value: 'MQTT / gRPC', note: 'Live event messaging' },
      { icon: Database, label: 'Geospatial store', value: 'Spatial indexing', note: 'Corridor and zone geometry' },
      { icon: Cpu, label: 'Analytics engine', value: 'Flow prediction', note: 'Congestion and delay models' },
      { icon: Zap, label: 'Alert dispatcher', value: 'Push delivery', note: 'Operator notification' },
    ],
  },
  {
    n: '04',
    title: 'Operations surfaces',
    subtitle: 'Where authorities act on what the network observes',
    nodes: [
      { icon: MapIcon, label: 'Command canvas', value: 'Fleet & hazard layers', note: 'Live regional picture' },
      { icon: Zap, label: 'Traffic hub', value: 'Corridor density', note: 'Flow and delay metrics' },
      { icon: Shield, label: 'Incident control', value: 'Case escalation', note: 'Triage and evidence' },
      { icon: Database, label: 'Briefings', value: 'Daily synthesis', note: 'Signed civic reports' },
    ],
  },
]

const SPECS = [
  {
    title: 'Data transmission',
    rows: [
      ['Video processing', 'On-vehicle hardware'],
      ['Transmission mode', 'Event telemetry only'],
      ['Bandwidth savings', '~95% efficiency'],
      ['End-to-end latency', '< 1 second'],
    ],
  },
  {
    title: 'Inference stack',
    rows: [
      ['Object detection', 'YOLOv8 edge nano'],
      ['Plate recognition', 'Dual CNN OCR'],
      ['Mean precision', '94.6% mAP'],
      ['Processing rate', '30+ FPS on board'],
    ],
  },
  {
    title: 'Fleet scalability',
    rows: [
      ['Active fleet', '248 vehicles'],
      ['Network capacity', '10,000+ vehicles'],
      ['Daily events handled', '1,000,000+'],
      ['Deployment', 'Multi-region redundant'],
    ],
  },
]

export default function Architecture() {
  return (
    <div className="relative min-h-screen bg-surface-0 text-ink">
      <ClayBlobs variant="display" />
      <ScrollProgressBar />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-line bg-surface-1/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-5 py-3.5 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="u-icon-btn" aria-label="Back to home">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <UrbanSenseLogo size="sm" subtext="System architecture" id="arch" />
          </div>

          <Link to="/command-center" className="u-btn u-btn-primary u-btn-sm">
            Open dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1120px] px-5 py-14 lg:px-8 lg:py-20">
        {/* Hero */}
        <ScrollReveal direction="up">
          <SectionHeader
            size="lg"
            eyebrow="Technical specification"
            title="How UrbanSense works, end to end"
            description="Five moving parts: capture on the vehicle, understand it locally, aggregate it spatially, and surface it where decisions are made."
          />
        </ScrollReveal>

        {/* Layers */}
        <div className="mt-14 space-y-3">
          {LAYERS.map((layer, idx) => (
            <ScrollReveal key={layer.n} direction="up" delay={idx * 40}>
              <section className="u-panel overflow-hidden">
                <span className="u-hair" aria-hidden="true" />

                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
                  <div className="flex items-baseline gap-4">
                    <span className="u-num text-[12px] text-brand-600">{layer.n}</span>
                    <div>
                      <h2 className="u-h2">{layer.title}</h2>
                      <p className="mt-1 text-[12px] text-ink-muted">{layer.subtitle}</p>
                    </div>
                  </div>
                </div>

                {layer.nodes && (
                  <div className="grid grid-cols-1 divide-line/70 sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
                    {layer.nodes.map(node => (
                      <div key={node.label} className="border-t border-line/70 px-4 py-4 sm:border-t-0 lg:first:border-t-0">
                        <node.icon className="h-4 w-4 text-ink-muted" />
                        <p className="mt-3 text-[13px] font-medium text-ink">{node.label}</p>
                        <p className="u-num mt-1 text-[11.5px] text-brand-600">{node.value}</p>
                        <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">{node.note}</p>
                      </div>
                    ))}
                  </div>
                )}

                {layer.groups && (
                  <>
                    <div className="grid grid-cols-1 divide-line/70 md:grid-cols-3 md:divide-x">
                      {layer.groups.map(group => (
                        <div key={group.label} className="border-t border-line/70 px-4 py-4 md:border-t-0">
                          <p className={`text-[12.5px] font-medium ${group.tone}`}>{group.label}</p>
                          <ul className="mt-3 space-y-2">
                            {group.items.map(item => (
                              <li key={item} className="flex items-start gap-2.5 text-[12px] leading-relaxed text-ink-secondary">
                                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-line bg-brand-50/40 px-4 py-3.5 sm:px-5">
                      <p className="text-[12.5px] font-medium text-ink">Why inference runs on the vehicle</p>
                      <p className="mt-1.5 max-w-3xl text-[12px] leading-relaxed text-ink-secondary">
                        Processing frames on board removes over <strong className="text-brand-600">95%</strong> of
                        bandwidth cost — only structured telemetry and small evidence crops leave the bus — and keeps
                        response time inside <strong className="text-brand-600">50 ms</strong>.
                      </p>
                    </div>
                  </>
                )}
              </section>

              {idx < LAYERS.length - 1 && (
                <div className="flex justify-center py-2" aria-hidden="true">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface-2 text-ink-faint">
                    <ArrowDown className="h-3.5 w-3.5" />
                  </span>
                </div>
              )}
            </ScrollReveal>
          ))}
        </div>

        {/* Specs */}
        <ScrollReveal direction="up">
          <div className="mt-16">
            <SectionHeader eyebrow="Reference" title="Operational specification" />
          </div>
        </ScrollReveal>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {SPECS.map(spec => (
            <ScrollReveal key={spec.title} direction="up" delay={40}>
              <section className="u-panel p-4">
                <h3 className="u-overline">{spec.title}</h3>
                <dl className="mt-3 divide-y divide-line/70 border-t border-line/70">
                  {spec.rows.map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-3 py-2.5">
                      <dt className="text-[12px] text-ink-muted">{k}</dt>
                      <dd className="u-num text-[12px] font-medium text-ink-secondary">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </ScrollReveal>
          ))}
        </div>

        {/* CTA */}
        <ScrollReveal direction="up">
          <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-10">
            <p className="max-w-xl text-[15px] leading-relaxed text-ink-secondary">
              The architecture is live today across the Ahmedabad region — inspect it in the operations console.
            </p>
            <Link to="/command-center" className="u-btn u-btn-primary px-4 py-2.5 text-[13.5px]">
              Open command center
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-3 px-5 py-8 lg:px-8">
          <p className="text-[11.5px] text-ink-faint">© 2026 UrbanSense · Urban intelligence platform</p>
          <div className="flex items-center gap-5 text-[12px]">
            <Link to="/about" className="text-ink-muted transition-colors hover:text-ink">
              About
            </Link>
            <Link to="/reports" className="text-ink-muted transition-colors hover:text-ink">
              Reports
            </Link>
            <Link to="/" className="text-ink-muted transition-colors hover:text-ink">
              Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
