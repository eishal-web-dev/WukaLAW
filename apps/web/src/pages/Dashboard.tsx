import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listDocuments, errorMessage } from '../lib/api'
import type { DocumentMeta } from '../lib/api'
import { getQuestionsAsked } from '../lib/session'
import { formatBytes, formatDate } from '../lib/format'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'
import ErrorAlert from '../components/ErrorAlert'
import EmptyState from '../components/EmptyState'

interface StatCardProps {
  label: string
  value: string
  hint: string
}

function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-card border border-line bg-ink-900 p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-neutral-100">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{hint}</p>
    </div>
  )
}

export default function Dashboard() {
  const [documents, setDocuments] = useState<DocumentMeta[] | null>(null)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listDocuments()
      .then((res) => {
        if (cancelled) return
        setDocuments(res.items)
        setTotal(res.total)
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [])

  const chunksIndexed =
    documents?.reduce((sum, doc) => sum + doc.num_chunks, 0) ?? 0
  const recent = documents
    ? [...documents]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 5)
    : []

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your legal document workspace."
        actions={
          <Link
            to="/upload"
            className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-light"
          >
            Upload Document
          </Link>
        }
      />

      {error && (
        <div className="mb-6">
          <ErrorAlert message={error} />
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Documents"
          value={documents ? String(total) : '—'}
          hint="Total uploaded documents"
        />
        <StatCard
          label="Chunks indexed"
          value={documents ? String(chunksIndexed) : '—'}
          hint="Searchable text segments"
        />
        <StatCard
          label="Questions asked"
          value={String(getQuestionsAsked())}
          hint="This session"
        />
      </div>

      {/* Recent documents */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-100">
            Recent documents
          </h2>
          <Link
            to="/documents"
            className="text-sm font-medium text-gold hover:text-gold-light"
          >
            View all →
          </Link>
        </div>

        {!documents && !error && <Spinner label="Loading documents…" />}

        {documents && documents.length === 0 && (
          <EmptyState
            icon="☰"
            title="No documents yet"
            description="Upload your first legal document to start summarizing and asking questions."
            action={
              <Link
                to="/upload"
                className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-light"
              >
                Upload a document
              </Link>
            }
          />
        )}

        {recent.length > 0 && (
          <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-ink-900">
            {recent.map((doc) => (
              <li key={doc.id}>
                <Link
                  to={`/documents/${doc.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 transition-colors hover:bg-ink-850"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-100">
                      {doc.title}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {doc.filename} · {formatBytes(doc.size_bytes)} ·{' '}
                      {doc.num_chunks} chunks
                    </p>
                  </div>
                  <span className="text-xs text-neutral-500">
                    {formatDate(doc.created_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
