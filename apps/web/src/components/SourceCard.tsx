import { Link } from 'react-router-dom'
import type { Source } from '../lib/api'
import { excerpt, formatScore } from '../lib/format'

/** A retrieved source chunk: document title, excerpt, and similarity score. */
export default function SourceCard({ source }: { source: Source }) {
  return (
    <article className="rounded-card border border-line bg-ink-850 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <Link
          to={`/documents/${source.document_id}`}
          className="text-sm font-semibold text-neutral-100 hover:text-gold"
        >
          {source.document_title}
        </Link>
        <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-gold">
          {formatScore(source.score)} match
        </span>
      </div>
      <p className="text-sm leading-relaxed text-neutral-400">
        {excerpt(source.text)}
      </p>
      <p className="mt-2 text-xs text-neutral-600">Chunk #{source.chunk_id}</p>
    </article>
  )
}
