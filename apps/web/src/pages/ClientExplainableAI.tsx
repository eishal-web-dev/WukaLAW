import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cpu, FileText, AlertTriangle } from 'lucide-react'
import { listCases, listCaseDocuments, getDocument, errorMessage } from '../lib/api'
import type { Case, DocumentMeta, Document } from '../lib/api'
import { Card, Badge, G } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'

/**
 * Client-facing Explainable AI page. There is no separate "explainability
 * engine" or confidence-scoring model for summaries in this codebase --
 * a Document.summary is just a stored JSON result with no generation
 * timestamp and no numeric confidence attached (unlike AI Chat answers,
 * which do have a real confidence level). This page is honest about that:
 * it explains a real summary using its real content, states plainly which
 * document it came from, and does not invent a confidence percentage,
 * generation date, or reasoning that isn't actually stored.
 */
export default function ClientExplainableAI() {
  const [cases, setCases] = useState<Case[]>([])
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null)
  const [docs, setDocs] = useState<DocumentMeta[]>([])
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null)
  const [document, setDocument] = useState<Document | null>(null)

  const [loadingCases, setLoadingCases] = useState(true)
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [loadingDoc, setLoadingDoc] = useState(false)
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
    setDocument(null)
    listCaseDocuments(selectedCaseId)
      .then((res) => {
        if (cancelled) return
        setDocs(res.items)
        const withSummary = res.items.find((d) => d.has_summary)
        if (withSummary) setSelectedDocId(withSummary.id)
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

  useEffect(() => {
    if (selectedDocId === null) return
    let cancelled = false
    setLoadingDoc(true)
    getDocument(selectedDocId)
      .then((res) => {
        if (!cancelled) setDocument(res)
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoadingDoc(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedDocId])

  const summarizedDocs = docs.filter((d) => d.has_summary)

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
          <Cpu size={28} className="mx-auto mb-3 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground mb-1">No cases assigned yet</h2>
          <p className="text-sm text-muted-foreground">
            Explainable AI shows the reasoning behind an AI result once one exists for your case.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Cpu size={18} style={{ color: G }} />
          <h1 className="text-xl font-bold text-foreground tracking-tight">Explainable AI</h1>
        </div>
        <select
          value={selectedCaseId ?? ''}
          onChange={(e) => setSelectedCaseId(Number(e.target.value))}
          className="text-sm px-3 py-2 rounded-xl border border-border bg-card text-foreground outline-none focus:border-primary/40"
        >
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.case_number} — {c.title}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorAlert message={error} />}

      {loadingDocs ? (
        <div className="py-16 flex justify-center"><Spinner label="Loading documents…" /></div>
      ) : summarizedDocs.length === 0 ? (
        <Card className="p-10 text-center space-y-3">
          <AlertTriangle size={28} className="mx-auto text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">No AI result to explain yet</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            None of this case's documents have an AI summary generated yet. Generate one from the{' '}
            <Link to="/client/ai-summary" className="underline" style={{ color: G }}>
              AI Summary
            </Link>{' '}
            page first.
          </p>
        </Card>
      ) : (
        <>
          <div>
            <label htmlFor="explain-doc-select" className="text-xs font-semibold text-muted-foreground mb-1.5 block">
              Which result do you want explained?
            </label>
            <select
              id="explain-doc-select"
              value={selectedDocId ?? ''}
              onChange={(e) => setSelectedDocId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground outline-none focus:border-primary/40"
            >
              {summarizedDocs.map((d) => (
                <option key={d.id} value={d.id}>
                  Summary of {d.title}
                </option>
              ))}
            </select>
          </div>

          {loadingDoc ? (
            <div className="py-10 flex justify-center"><Spinner label="Loading result…" /></div>
          ) : document?.summary ? (
            <div className="space-y-4">
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge label="AI Summary" />
                  <span className="text-xs text-muted-foreground">of {document.title}</span>
                </div>
                <h3 className="text-xs font-bold text-foreground mb-1">What's being explained</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{document.summary.short_summary}</p>
              </Card>

              <Card className="p-5">
                <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <FileText size={13} style={{ color: G }} /> Source
                </h3>
                <Link to={`/documents/${document.id}`} className="text-xs underline" style={{ color: G }}>
                  {document.title}
                </Link>
                <p className="text-xs text-muted-foreground mt-1">
                  This summary was generated from this document's full text — no other document contributed to it.
                </p>
              </Card>

              <Card className="p-5">
                <h3 className="text-xs font-bold text-foreground mb-2">Important Factors</h3>
                <p className="text-[11px] text-muted-foreground mb-2">Key facts the summary is built on:</p>
                <ul className="space-y-1 mb-3">
                  {document.summary.key_facts.map((f, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span style={{ color: G }}>•</span> {f}
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-muted-foreground mb-2">Legal points identified:</p>
                <ul className="space-y-1">
                  {document.summary.legal_points.map((p, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span style={{ color: G }}>•</span> {p}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-5">
                <h3 className="text-xs font-bold text-foreground mb-2">Limitations</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This summary is generated automatically from document text and may miss context or nuance a
                  lawyer would catch. It has not been assigned a numeric confidence score, and the exact date
                  it was generated is not currently tracked. Always verify against the original document.
                </p>
              </Card>
            </div>
          ) : (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              This document doesn't have a summary yet.
            </Card>
          )}
        </>
      )}
    </div>
  )
}
