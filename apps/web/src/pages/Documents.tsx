import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listDocuments, errorMessage } from '../lib/api'
import type { DocumentMeta } from '../lib/api'
import { formatBytes, formatDate } from '../lib/format'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'
import ErrorAlert from '../components/ErrorAlert'
import EmptyState from '../components/EmptyState'

export default function Documents() {
  const [documents, setDocuments] = useState<DocumentMeta[] | null>(null)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

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

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle={
          documents
            ? `${total} document${total === 1 ? '' : 's'} in your workspace.`
            : 'Your uploaded legal documents.'
        }
        actions={
          <Link
            to="/upload"
            className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-light"
          >
            Upload Document
          </Link>
        }
      />

      {error && <ErrorAlert message={error} />}
      {!documents && !error && <Spinner label="Loading documents…" />}

      {documents && documents.length === 0 && (
        <EmptyState
          icon="☰"
          title="No documents yet"
          description="Upload a court judgment or legal document to start summarizing, asking questions, and finding similar cases."
          action={
            <Link
              to="/upload"
              className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-light"
            >
              Upload your first document
            </Link>
          }
        />
      )}

      {documents && documents.length > 0 && (
        <div className="overflow-x-auto rounded-card border border-line bg-ink-900">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wider text-neutral-500">
                <th className="px-5 py-3.5 font-medium">Title</th>
                <th className="px-5 py-3.5 font-medium">Filename</th>
                <th className="px-5 py-3.5 font-medium">Size</th>
                <th className="px-5 py-3.5 font-medium">Chunks</th>
                <th className="px-5 py-3.5 font-medium">Uploaded</th>
                <th className="px-5 py-3.5 font-medium">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={() => navigate(`/documents/${doc.id}`)}
                  className="cursor-pointer transition-colors hover:bg-ink-850"
                >
                  <td className="max-w-[16rem] px-5 py-4">
                    <span className="block truncate font-medium text-neutral-100">
                      {doc.title}
                    </span>
                  </td>
                  <td className="max-w-[12rem] px-5 py-4">
                    <span className="block truncate text-neutral-400">
                      {doc.filename}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-neutral-400">
                    {formatBytes(doc.size_bytes)}
                  </td>
                  <td className="px-5 py-4 text-neutral-400">{doc.num_chunks}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-neutral-400">
                    {formatDate(doc.created_at)}
                  </td>
                  <td className="px-5 py-4">
                    {doc.has_summary ? (
                      <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-gold">
                        Ready
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
