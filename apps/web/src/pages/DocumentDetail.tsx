import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FileText, Sparkles, Scale, ListChecks, Target, BookMarked, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { getDocument, summarizeDocument, getDocumentCitations, reprocessDocument, errorMessage } from '../lib/api'
import type { Document, Citation, CitationType } from '../lib/api'
import { formatBytes, formatDate } from '../lib/format'
import { Btn, Card, Badge, G } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'
import Disclaimer from '../components/Disclaimer'

/** Citation groups, styled per the app palette (gold / blue / green). */
const CITATION_GROUPS: { type: CitationType; label: string; badgeClass: string }[] = [
  {
    type: 'statute',
    label: 'Statute',
    badgeClass: 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/25',
  },
  {
    type: 'constitution',
    label: 'Constitution',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    type: 'case_law',
    label: 'Case Law',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
]

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [doc, setDoc] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summarizing, setSummarizing] = useState(false)
  const [citations, setCitations] = useState<Citation[] | null>(null)
  const [citationsError, setCitationsError] = useState<string | null>(null)
  const [reprocessing, setReprocessing] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    getDocument(id)
      .then((d) => {
        if (!cancelled) setDoc(d)
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    getDocumentCitations(id)
      .then((res) => {
        if (!cancelled) setCitations(res.citations)
      })
      .catch((err) => {
        if (!cancelled) setCitationsError(errorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const generateSummary = async () => {
    if (!id || !doc) return
    setSummarizing(true)
    setError(null)
    try {
      const res = await summarizeDocument(id)
      setDoc({ ...doc, summary: res.summary, has_summary: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSummarizing(false)
    }
  }

  const readAgain = async () => {
    if (!id) return
    setReprocessing(true)
    setError(null)
    try {
      setDoc(await reprocessDocument(id))
      setCitations(null)
      const refreshed = await getDocumentCitations(id)
      setCitations(refreshed.citations)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setReprocessing(false)
    }
  }
  if (loading) {
    return (
      <div className="p-8 flex justify-center h-full items-center">
        <Spinner label="Loading documentâ€¦" />
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="p-8 space-y-4">
        <ErrorAlert message={error ?? 'Document not found.'} />
        <Btn variant="secondary" onClick={() => navigate('/documents')} icon={<ArrowLeft size={14} />}>
          Back to Documents
        </Btn>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-full">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} /> Back
      </button>

      {error && <ErrorAlert message={error} />}

      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-500/10">
            <FileText size={22} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{doc.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>{doc.filename}</span>
              <span>{formatBytes(doc.size_bytes)}</span>
              <span>{formatDate(doc.created_at)}</span>
              <Badge label={`${doc.num_chunks} chunks`} />
              {(doc.pages_ocrd ?? 0) > 0 && <Badge label="Scanned document" />}
              {doc.ocr_language && doc.ocr_language !== 'unknown' && <Badge label={doc.ocr_language === 'eng+urd' ? 'Urdu + English' : doc.ocr_language === 'urd' ? 'Urdu' : 'English'} />}
              {doc.ocr_quality && <Badge label={`OCR quality: ${doc.ocr_quality.replace('_', ' ')}`} />}
            </div>
          </div>
          <Btn onClick={generateSummary} disabled={summarizing} icon={<Sparkles size={14} />}>
            {summarizing ? 'Summarizingâ€¦' : doc.summary ? 'Regenerate Summary' : 'Generate Summary'}
          </Btn>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-foreground">Document understanding</div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge label={doc.extraction_method === 'native_pdf' ? 'Text PDF' : doc.extraction_method === 'hybrid' ? 'Mixed document' : doc.extraction_method === 'ocr' ? 'Scanned document' : 'Text document'} />
              {doc.ocr_language && doc.ocr_language !== 'unknown' && <Badge label={doc.ocr_language === 'eng+urd' ? 'Urdu + English' : doc.ocr_language === 'urd' ? 'Urdu' : 'English'} />}
              {doc.ocr_quality && <Badge label={`OCR quality: ${doc.ocr_quality.replace('_', ' ')}`} />}
              {doc.page_count != null && <Badge label={`${doc.page_count} page${doc.page_count === 1 ? '' : 's'}`} />}
              <Badge label={doc.indexing_status === 'indexed' ? 'Indexed for AI: yes' : 'Indexed for AI: no'} />
            </div>
            {doc.processing_status === 'ready_with_warning' || doc.processing_status === 'extraction_failed' ? (
              <p className="text-xs text-amber-300 mt-3">This document needs review. A clearer scan may improve AI answers.</p>
            ) : null}
          </div>
          {doc.can_reprocess && (
            <Btn variant="secondary" onClick={() => void readAgain()} disabled={reprocessing} icon={<RefreshCw size={14} className={reprocessing ? 'animate-spin' : ''} />}>
              {reprocessing ? 'Reading document…' : 'Read this document again'}
            </Btn>
          )}
        </div>
        <button onClick={() => setDetailsOpen((value) => !value)} className="mt-4 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
          {detailsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Processing details
        </button>
        {detailsOpen && (
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-muted-foreground">
            <div>Status: {doc.processing_status?.replaceAll('_', ' ') ?? 'ready'}</div>
            <div>Extraction: {doc.extraction_method?.replaceAll('_', ' ') ?? 'unknown'}</div>
            <div>OCR engine: {doc.ocr_engine ?? 'not used'}</div>
            <div>OCR confidence: {doc.ocr_confidence == null ? 'not reported' : `${Math.round(doc.ocr_confidence)}%`}</div>
          </div>
        )}
      </Card>
      {/* AI Summary */}
      {doc.summary && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color: G }} />
            <span className="text-sm font-semibold text-foreground">AI Summary</span>
          </div>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground leading-relaxed">{doc.summary.short_summary}</p>
          </Card>
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target size={14} style={{ color: G }} />
                <h4 className="text-sm font-semibold text-foreground">Main Issue</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{doc.summary.main_issue}</p>
              <div className="flex items-center gap-2 mt-5 mb-3">
                <Scale size={14} style={{ color: G }} />
                <h4 className="text-sm font-semibold text-foreground">Outcome</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{doc.summary.outcome}</p>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <ListChecks size={14} style={{ color: G }} />
                <h4 className="text-sm font-semibold text-foreground">Key Facts</h4>
              </div>
              <div className="space-y-2">
                {doc.summary.key_facts.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: '#34D399' }} />
                    {f}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-5 mb-3">
                <Scale size={14} style={{ color: G }} />
                <h4 className="text-sm font-semibold text-foreground">Legal Points</h4>
              </div>
              <div className="space-y-2">
                {doc.summary.legal_points.map((p) => (
                  <div key={p} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: G }} />
                    {p}
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <Disclaimer />
        </div>
      )}

      {/* Citations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookMarked size={16} style={{ color: G }} />
          <span className="text-sm font-semibold text-foreground">Citations</span>
        </div>
        {citationsError ? (
          <Card className="p-5 text-xs text-muted-foreground">
            Could not load citations: {citationsError}
          </Card>
        ) : citations === null ? (
          <Card className="p-5">
            <Spinner label="Detecting citationsâ€¦" />
          </Card>
        ) : citations.length === 0 ? (
          <Card className="p-5 text-sm text-muted-foreground">No citations detected.</Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4">
            {CITATION_GROUPS.map(({ type, label, badgeClass }) => {
              const group = citations.filter((c) => c.type === type)
              if (group.length === 0) return null
              return (
                <Card key={type} className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${badgeClass}`}
                    >
                      {label}
                    </span>
                    <span className="text-xs text-muted-foreground">{group.length}</span>
                  </div>
                  <div className="space-y-3">
                    {group.map((c, i) => (
                      <div key={`${c.text}-${i}`} className="text-xs leading-relaxed">
                        <div className="font-bold text-foreground">{c.text}</div>
                        {c.context && (
                          <p className="text-muted-foreground mt-0.5">{c.context}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Extracted text */}
      <Card className="p-5">
        <h4 className="text-sm font-semibold text-foreground mb-3">Extracted Text</h4>
        <pre className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans max-h-[480px] overflow-y-auto">
          {doc.text || 'No text extracted.'}
        </pre>
      </Card>
    </div>
  )
}
