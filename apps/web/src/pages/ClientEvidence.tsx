import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Sparkles, AlertCircle, RefreshCw, Upload, Download } from 'lucide-react'
import { listCases, listCaseDocuments, listEvidenceFiles, uploadEvidenceFile, downloadEvidenceFile, errorMessage } from '../lib/api'
import type { Case, DocumentMeta, EvidenceFile } from '../lib/api'
import { formatBytes, formatDate } from '../lib/format'
import { Card, Badge, G } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'

/**
 * Client-facing Evidence page. This shows the documents attached to a
 * client's case -- the same real data model the Lawyer Evidence page uses,
 * just framed in plain language for a client audience. There is no
 * evidence-strength scoring model anywhere in the database (only
 * User/Case/Document/Chunk exist), so this deliberately never invents a
 * percentage or "strength" rating -- it says plainly when that isn't
 * available, rather than making one up.
 */
export default function ClientEvidence() {
  const navigate = useNavigate()
  const [cases, setCases] = useState<Case[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [docs, setDocs] = useState<DocumentMeta[]>([])
  const [media, setMedia] = useState<EvidenceFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [loadingCases, setLoadingCases] = useState(true)
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listCases()
      .then((res) => {
        if (cancelled) return
        setCases(res.items)
        if (res.items.length > 0) setSelectedId(res.items[0].id)
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
    if (selectedId === null) return
    let cancelled = false
    setLoadingDocs(true)
    setDocs([])
    setMedia([])
    Promise.all([listCaseDocuments(selectedId), listEvidenceFiles(selectedId)])
      .then(([documents, files]) => {
        if (!cancelled) { setDocs(documents.items); setMedia(files.items) }
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
  }, [selectedId])

  const selected = cases.find((c) => c.id === selectedId) ?? null

  async function addEvidence(file: File) {
    if (selectedId === null) return
    setUploading(true)
    setError(null)
    try {
      await uploadEvidenceFile(selectedId, file)
      setMedia((await listEvidenceFiles(selectedId)).items)
    } catch (err) { setError(errorMessage(err)) }
    finally { setUploading(false) }
  }

  if (loadingCases) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Spinner label="Loading your cases…" />
      </div>
    )
  }

  if (error && cases.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle size={28} className="mx-auto mb-3 text-red-400" />
          <h2 className="text-base font-semibold text-foreground mb-1">Couldn't load your cases</h2>
          <p className="text-sm text-muted-foreground mb-5">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white mx-auto"
            style={{ background: G }}
          >
            <RefreshCw size={14} /> Try again
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Evidence</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {selected ? `Documents on file for ${selected.case_number} · ${selected.title}` : 'Select a case to review its evidence'}
          </p>
        </div>
        {cases.length > 0 && (
          <select
            value={selectedId ?? ''}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="rounded-xl border border-border bg-muted/40 text-foreground text-sm px-4 py-2.5 focus:outline-none focus:border-primary/50"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.case_number} — {c.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <ErrorAlert message={error} />}

      {selectedId !== null && <Card className="p-5 space-y-3">
        <h2 className="font-semibold text-foreground">Upload case evidence</h2>
        <p className="text-sm text-muted-foreground">Add photographs, screenshots, recordings, videos, PDFs, Word files or text files. Evidence files are private to this case and are not automatically analyzed by AI. Maximum 100 MB each.</p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-black" style={{ background: G }}>
          <Upload size={15} /> {uploading ? 'Uploading…' : 'Choose evidence file'}
          <input type="file" disabled={uploading} accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.txt,.mp3,.wav,.m4a,.ogg,.mp4,.mov,.webm" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) void addEvidence(file); e.target.value = '' }} />
        </label>
      </Card>}

      {media.length > 0 && <div className="space-y-2">
        <h2 className="font-semibold text-foreground">Evidence files</h2>
        {media.map((item) => <Card key={item.id} className="p-4 flex items-center justify-between gap-3">
          <div className="min-w-0"><p className="text-sm font-medium text-foreground truncate">{item.filename}</p><p className="text-xs text-muted-foreground">{formatBytes(item.size_bytes)} · {formatDate(item.created_at)}</p></div>
          <button type="button" aria-label={`Download ${item.filename}`} onClick={() => { if (selectedId !== null) void downloadEvidenceFile(selectedId, item).catch((err) => setError(errorMessage(err))) }} className="text-xs flex items-center gap-1 shrink-0" style={{ color: G }}><Download size={14} /> Download</button>
        </Card>)}
      </div>}

      {cases.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No cases assigned yet — evidence will appear here once you have a case with documents.
        </Card>
      ) : loadingDocs ? (
        <div className="py-10 flex justify-center"><Spinner label="Loading documents…" /></div>
      ) : docs.length === 0 && media.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No documents have been added to this case yet.
        </Card>
      ) : (
        <div className="space-y-3">
          {docs.map((item) => (
            <Card key={item.id} className="p-5">
              <button
                className="flex items-start gap-4 w-full text-left"
                onClick={() => navigate(`/documents/${item.id}`)}
              >
                <div className="p-2.5 rounded-xl flex-shrink-0" style={{ backgroundColor: `${G}15` }}>
                  <FileText size={16} style={{ color: G }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{item.title}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span>{formatBytes(item.size_bytes)}</span>
                    <span>Added {formatDate(item.created_at)}</span>
                    {item.has_summary ? (
                      <span className="flex items-center gap-1" style={{ color: G }}>
                        <Sparkles size={10} /> AI summary available
                      </span>
                    ) : (
                      <Badge label="Not yet summarized" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    A detailed strength or admissibility rating isn't available for this document yet.
                  </p>
                </div>
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
