import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/documents', label: 'Documents' },
  { to: '/ask', label: 'Ask AI' },
  { to: '/similar', label: 'Similar Cases' },
]

const STATS = [
  { value: '30+', label: ['Years Combined', 'Expertise'] },
  { value: '12K+', label: ['Cases', 'Resolved'] },
  { value: '95%', label: ['Client', 'Approval'] },
  { value: '200+', label: ['Law', 'Firms'] },
]

const FEATURES = [
  {
    icon: '⇪',
    title: 'Upload',
    description: 'Bring in court judgments and legal documents as .txt or .pdf.',
  },
  {
    icon: '☰',
    title: 'Summarize',
    description: 'Structured summaries: issue, key facts, legal points, outcome.',
  },
  {
    icon: '✦',
    title: 'Ask with sources',
    description:
      'Answers grounded only in your documents, with the exact source paragraphs.',
  },
  {
    icon: '≈',
    title: 'Similar cases',
    description:
      'Semantic search that surfaces the closest matching cases with scores.',
  },
]

/** Stroke-drawn scales-of-justice glyph for the hero visual. */
function ScalesGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 220"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* finial + pole */}
      <circle cx="100" cy="22" r="8" />
      <line x1="100" y1="30" x2="100" y2="184" />
      {/* crossbeam */}
      <line x1="32" y1="54" x2="168" y2="54" />
      {/* left pan */}
      <line x1="32" y1="54" x2="14" y2="100" />
      <line x1="32" y1="54" x2="50" y2="100" />
      <path d="M4 100a28 28 0 0 0 56 0Z" />
      {/* right pan */}
      <line x1="168" y1="54" x2="150" y2="100" />
      <line x1="168" y1="54" x2="186" y2="100" />
      <path d="M140 100a28 28 0 0 0 56 0Z" />
      {/* base */}
      <line x1="66" y1="184" x2="134" y2="184" />
      <line x1="54" y1="198" x2="146" y2="198" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="size-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function FloatingBadge({
  title,
  subtitle,
  className,
}: {
  title: string
  subtitle: string
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-navy-900 px-4 py-3 shadow-lg shadow-black/40 ${className ?? ''}`}
    >
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>
    </div>
  )
}

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-navy-950 text-neutral-300">
      {/* ── Top nav ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-navy-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gold-bright text-lg text-navy-950"
            >
              ⚖
            </span>
            <span className="truncate text-lg font-bold tracking-tight text-white">
              WakuLaw
            </span>
            <span className="hidden shrink-0 rounded-full border border-gold/40 bg-navy-900 px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide text-gold sm:inline-block">
              PK · AI
            </span>
          </div>

          <nav
            className="hidden items-center gap-6 lg:flex"
            aria-label="Landing navigation"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-neutral-400 transition-colors hover:text-white"
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              aria-label="Toggle theme (coming soon)"
              className="hidden size-9 items-center justify-center rounded-full border border-white/10 text-neutral-400 transition-colors hover:border-gold/40 hover:text-gold sm:flex"
            >
              <SunIcon />
            </button>
            {!user && (
              <Link
                to="/login"
                className="hidden text-sm font-medium text-neutral-400 transition-colors hover:text-white md:block"
              >
                Sign in
              </Link>
            )}
            <Link
              to="/dashboard"
              className="rounded-full bg-gold-bright px-5 py-2 text-sm font-bold text-navy-950 transition-colors hover:bg-gold-light"
            >
              Open App →
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 pt-16 pb-24 lg:grid-cols-2 lg:pt-24">
          {/* Left column */}
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-navy-900 px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-widest text-gold">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-emerald-400"
              />
              Pakistan's Premier AI Legal Platform
            </p>

            <h1 className="mt-7 text-6xl font-black leading-[1.02] tracking-tight sm:text-7xl">
              <span className="text-white">Your Legal</span>
              <br />
              <span className="text-white">Partner</span>
              <br />
              <span className="text-gold-bright">In Every</span>
              <br />
              <span className="text-gold-bright">Situation.</span>
            </h1>

            <p className="mt-7 max-w-prose text-base leading-relaxed text-neutral-300">
              From Pakistan's Supreme Court to High Courts nationwide — WakuLaw
              combines legal expertise with AI intelligence to deliver research
              outcomes that matter.
            </p>

            <div className="my-8 h-px w-full max-w-md bg-white/10" aria-hidden="true" />

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/upload"
                className="rounded-full bg-gold-bright px-7 py-3 text-sm font-bold text-navy-950 transition-colors hover:bg-gold-light"
              >
                Get Started →
              </Link>
              <Link
                to="/ask"
                className="rounded-full border border-white/15 bg-navy-900 px-7 py-3 text-sm font-semibold text-neutral-200 transition-colors hover:border-gold/40 hover:text-gold"
              >
                View Platform Demo
              </Link>
            </div>

            <p className="mt-6 text-xs text-neutral-500">
              Decision-support only — not legal advice.
            </p>
          </div>

          {/* Right column — visual card */}
          <div className="relative mx-auto mb-8 w-full max-w-md">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-navy-800 via-navy-900 to-navy-950">
              {/* soft lighting */}
              <div
                className="absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(ellipse_at_top,rgb(240_194_75/0.22),transparent_65%)]"
                aria-hidden="true"
              />
              <div className="dot-grid absolute inset-0 opacity-60" aria-hidden="true" />
              {/* scales */}
              <div className="absolute inset-0 flex items-center justify-center">
                <ScalesGlyph className="h-3/5 w-auto text-gold-bright drop-shadow-[0_0_35px_rgba(240,194,75,0.35)]" />
              </div>
              {/* floor glow */}
              <div
                className="absolute inset-x-8 bottom-10 h-16 rounded-full bg-gold/10 blur-2xl"
                aria-hidden="true"
              />
            </div>

            <FloatingBadge
              title="Top Advocate 2024"
              subtitle="Pakistan Bar"
              className="absolute -bottom-6 -left-3 sm:-left-6"
            />
            <FloatingBadge
              title="AI Legal Pioneer"
              subtitle="LegalTech PK"
              className="absolute -bottom-6 -right-3 sm:-right-6"
            />
          </div>
        </div>
      </section>

      {/* ── Lower section (watermark behind) ────────────────────────── */}
      <div className="relative overflow-hidden">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[22vw] font-black tracking-tight text-white/[0.025]"
        >
          WAKULAW
        </span>

        {/* Stats strip */}
        <section className="relative border-y border-white/5">
          <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
            {STATS.map((stat, index) => (
              <div
                key={stat.value}
                className={`px-6 py-10 text-center ${
                  index > 0 ? 'md:border-l md:border-white/10' : ''
                } ${index % 2 === 1 ? 'max-md:border-l max-md:border-white/10' : ''} ${
                  index >= 2 ? 'max-md:border-t max-md:border-white/10' : ''
                }`}
              >
                <p className="text-4xl font-black text-gold-bright sm:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm leading-snug text-neutral-400">
                  {stat.label[0]}
                  <br />
                  {stat.label[1]}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature cards */}
        <section className="relative mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="rounded-card border border-white/10 bg-navy-900 p-5 transition-colors hover:border-gold/40"
              >
                <span
                  aria-hidden="true"
                  className="mb-3 inline-flex size-9 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-base text-gold-bright"
                >
                  {feature.icon}
                </span>
                <h2 className="text-sm font-bold text-white">{feature.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-neutral-600">
        WakuLaw — a research prototype. Decision-support only — not legal
        advice. All AI outputs are advisory and may contain errors.
      </footer>
    </div>
  )
}
