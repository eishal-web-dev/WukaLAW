import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthShellProps {
  heading: string
  subheading: string
  children: ReactNode
}

/**
 * Centered auth card on the landing page's navy background with the
 * dotted-grid texture and gold tile logo.
 */
export default function AuthShell({ heading, subheading, children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-navy-950 px-4 py-12 text-neutral-300">
      <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <Link
            to="/"
            aria-label="WakuLaw home"
            className="flex size-12 items-center justify-center rounded-xl bg-gold-bright text-2xl text-navy-950 transition-colors hover:bg-gold-light"
          >
            <span aria-hidden="true">⚖</span>
          </Link>
          <h1 className="mt-5 text-2xl font-black tracking-tight text-white">
            {heading}
          </h1>
          <p className="mt-1.5 text-sm text-neutral-400">{subheading}</p>
        </div>

        <div className="rounded-panel border border-white/10 bg-navy-900 p-7 shadow-xl shadow-black/40">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-neutral-600">
          Decision-support only — not legal advice.
        </p>
      </div>
    </div>
  )
}
