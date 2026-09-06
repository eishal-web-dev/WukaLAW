import { useEffect, useState } from 'react'
import { Sparkles, FileText, RefreshCw } from 'lucide-react'
import { listCases, listCaseDocuments, summarizeDocument, errorMessage } from '../lib/api'
import type { Case, DocumentMeta, Summary } from '../lib/api'
import { Card, Badge, G } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'

/**
 * Client-facing AI Summary page. Reuses the exact same real summarization
 * endpoint (summarizeDocument) already used by the Lawyer DocumentDetail
 * page -- a document's summary is either already generated and stored
 * (Document.summary), or generated fresh on request. There is no separate
 * "case summary" model, so this operates per-document, same as the real
 * data actually supports; nothing here is a static or invented summary.
 */
export default function ClientAISummary() {
  const [cases, setCases] = useState<Case[]>([])
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null)
  const [docs, setDocs] = useState<DocumentMeta[]>([])
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null)

  const [loadingCases, setLoadingCases] = useState(true)
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listCases()
      .then((res) => {
        if (cancelled) return
        setCases(res.items)
        if (res.items.length > 0) setSelectedCaseId(res.items[0].id)
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoadingCases(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (selectedCaseId === null) return
    let cancelled = false
    setLoadingDocs(true)
    setSelectedDocId(null)
    setSummary(null)
    listCaseDocuments(selectedCaseId)
      .then((res) => {
        if (cancelled) return
        setDocs(res.items)
        if (res.items.length > 0) setSelectedDocId(res.items[0].id)
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoadingDocs(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedCaseId])

  const generate = async () => {
    if (!selectedDocId) return
    setSummarizing(true)
    setError(null)
    try {
      const res = await summarizeDocument(selectedDocId)
      setSummary(res.summary)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSummarizing(false)
    }
  }

  const selectedDoc = docs.find((d) => d.id === selectedDocId) ?? null

  if (loadingCases) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Spinner label="Loading your cases…" />
      </div>
    )
  }

  if (cases.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Card className="p-8 max-w-md text-center">
          <Sparkles size={28} className="mx-auto mb-3 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground mb-1">No cases assigned yet</h2>
          <p className="text-sm text-muted-foreground">
            AI summaries will be available once a case with documents is assigned to your account.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles size={18} style={{ color: G }} />
        <h1 className="text-xl font-bold text-foreground tracking-tight">AI Summary</h1>
      </div>

      <Card className="p-5 space-y-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Case</label>
          <select
            value={selectedCaseId ?? ''}
            onChange={(e) => setSelectedCaseId(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground outline-none focus:border-primary/40"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.case_number} — {c.title}
              </option>
            ))}
          </select>
        </div>

        {loadingDocs ? (
          <div className="py-4 flex justify-center"><Spinner label="Loading documents…" /></div>
        ) : docs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No documents in this case yet.</p>
        ) : (
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Document</label>
            <select
              value={selectedDocId ?? ''}
              onChange={(e) => setSelectedDocId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground outline-none focus:border-primary/40"
            >
              {docs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </Card>

      {error && <ErrorAlert message={error} />}

      {selectedDoc && (
        <button
          onClick={() => void generate()}
          disabled={summarizing}
          className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: G }}
        >
          {summarizing ? (
            <>
              <RefreshCw size={14} className="animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Sparkles size={14} /> {selectedDoc.has_summary ? 'Regenerate Summary' : 'Generate Summary'}
            </>
          )}
        </button>
      )}

      {summarizing && (
        <Card className="p-6 flex items-center justify-center">
          <Spinner label="Reading the document and generating a real summary…" />
        </Card>
      )}

      {summary && !summarizing && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{selectedDoc?.title}</span>
              <Badge label="AI Generated" />
            </div>
            <p className="text-sm text-foreground leading-relaxed">{summary.short_summary}</p>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-xs font-bold text-foreground mb-2">Main Issue</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{summary.main_issue}</p>
            </Card>
            <Card className="p-5">
              <h3 className="text-xs font-bold text-foreground mb-2">Outcome</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{summary.outcome}</p>
            </Card>
          </div>

          {summary.key_facts.length > 0 && (
            <Card className="p-5">
              <h3 className="text-xs font-bold text-foreground mb-2">Key Facts</h3>
              <ul className="space-y-1.5">
                {summary.key_facts.map((f, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                    <span style={{ color: G }}>•</span> {f}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {summary.legal_points.length > 0 && (
            <Card className="p-5">
              <h3 className="text-xs font-bold text-foreground mb-2">Legal Points</h3>
              <ul className="space-y-1.5">
                {summary.legal_points.map((p, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                    <span style={{ color: G }}>•</span> {p}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
