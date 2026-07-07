import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getDocument, summarizeDocument, errorMessage } from '../lib/api'
import type { Document, Summary } from '../lib/api'
import { formatBytes, formatDate } from '../lib/format'
import Spinner from '../components/Spinner'
import ErrorAlert from '../components/ErrorAlert'
import Disclaimer from '../components/Disclaimer'

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
        {title}
      </h3>
      {children}
    </section>
  )
}

function SummaryPanel({ summary }: { summary: Summary }) {
  return (
    <div className="space-y-5 rounded-card border border-line bg-ink-900 p-6">
      <SummarySection title="Main issue">
        <p className="text-sm leading-relaxed text-neutral-300">
          {summary.main_issue}
        </p>
      </SummarySection>

      <SummarySection title="Key facts">
        {summary.key_facts.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-neutral-300">
            {summary.key_facts.map((fact, i) => (
              <li key={i}>{fact}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">None identified.</p>
        )}
      </SummarySection>

      <SummarySection title="Legal points">
        {summary.legal_points.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-neutral-300">
            {summary.legal_points.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">None identified.</p>
        )}
      </SummarySection>

      <SummarySection title="Outcome">
        <p className="text-sm leading-relaxed text-neutral-300">
          {summary.outcome}
        </p>
      </SummarySection>

      <SummarySection title="Short summary">
        <p className="text-sm leading-relaxed text-neutral-300">
          {summary.short_summary}
        </p>
      </SummarySection>

      <Disclaimer />
    </div>
  )
}

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>()
  const [document, setDocument] = useState<Document | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [summarizing, setSummarizing] = useState(false)
  const [summarizeError, setSummarizeError] = useState<string | null>(null)
  const [textOpen, setTextOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setDocument(null)
    setLoadError(null)
    getDocument(id)
      .then((doc) => {
        if (!cancelled) setDocument(doc)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const handleSummarize = () => {
    if (!id || summarizing) return
    setSummarizing(true)
    setSummarizeError(null)
    summarizeDocument(id)
      .then((res) => {
        setDocument((prev) =>
          prev ? { ...prev, summary: res.summary, has_summary: true } : prev,
        )
      })
      .catch((err) => setSummarizeError(errorMessage(err)))
      .finally(() => setSummarizing(false))
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <ErrorAlert message={loadError} />
        <Link
          to="/documents"
          className="inline-block text-sm font-medium text-gold hover:text-gold-light"
        >
          ← Back to documents
        </Link>
      </div>
    )
  }

  if (!document) {
    return <Spinner label="Loading document…" />
  }

  return (
    <div>
      <Link
        to="/documents"
        className="mb-5 inline-block text-sm font-medium text-neutral-500 transition-colors hover:text-gold"
      >
        ← Back to documents
      </Link>

      {/* Title and meta */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-100">
            {document.title}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {document.filename} · {formatBytes(document.size_bytes)} ·{' '}
            {document.num_chunks} chunks · uploaded{' '}
            {formatDate(document.created_at)}
          </p>
        </div>
        {!document.summary && (
          <button
            type="button"
            onClick={handleSummarize}
            disabled={summarizing}
            className="rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {summarizing ? 'Generating summary…' : 'Generate Summary'}
          </button>
        )}
      </div>

      {summarizeError && (
        <div className="mb-6">
          <ErrorAlert message={summarizeError} />
        </div>
      )}

      {/* Summary */}
      <section className="mb-8">
        <h2 className="mb-4 text-base font-semibold text-neutral-100">Summary</h2>
        {document.summary ? (
          <SummaryPanel summary={document.summary} />
        ) : (
          <div className="rounded-card border border-dashed border-line bg-ink-900 px-6 py-10 text-center">
            {summarizing ? (
              <div className="flex justify-center">
                <Spinner label="Analyzing the document — this can take a little while…" />
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                No summary yet. Click{' '}
                <span className="font-medium text-neutral-300">
                  Generate Summary
                </span>{' '}
                to produce a structured overview of this document.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Full extracted text */}
      <section>
        <button
          type="button"
          onClick={() => setTextOpen((open) => !open)}
          aria-expanded={textOpen}
          className="flex w-full items-center justify-between rounded-card border border-line bg-ink-900 px-5 py-4 text-left transition-colors hover:border-gold/30"
        >
          <span className="text-base font-semibold text-neutral-100">
            Full extracted text
          </span>
          <span aria-hidden="true" className="text-sm text-neutral-500">
            {textOpen ? '▲ Hide' : '▼ Show'}
          </span>
        </button>
        {textOpen && (
          <div className="mt-2 max-h-[32rem] overflow-y-auto rounded-card border border-line bg-ink-900 p-6">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-400">
              {document.text}
            </pre>
          </div>
        )}
      </section>
    </div>
  )
}
