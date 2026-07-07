import type { Confidence } from '../lib/api'

const STYLES: Record<Confidence['level'], string> = {
  high: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  low: 'bg-red-500/10 text-red-400 border-red-500/30',
}

const LABELS: Record<Confidence['level'], string> = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence',
}

export default function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${STYLES[confidence.level]}`}
      >
        <span aria-hidden="true" className="text-[0.6rem]">
          ●
        </span>
        {LABELS[confidence.level]}
      </span>
      <span className="text-xs text-neutral-400">{confidence.reason}</span>
    </div>
  )
}
