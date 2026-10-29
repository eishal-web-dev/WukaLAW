import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Calendar, FileText, User, Send, AlertCircle, RefreshCw, Sparkles, Clock, Trash2, Upload, Paperclip,
} from 'lucide-react'
import {
  getCase, listCaseDocuments, getCaseTimeline, updateCase, deleteDocument, errorMessage,
  uploadDocument, listEvidenceFiles, uploadEvidenceFile, downloadEvidenceFile, addCaseEvent,
} from '../lib/api'
import type { Case, DocumentMeta, TimelineEvent, EvidenceFile } from '../lib/api'
import { formatDate, excerpt } from '../lib/format'
import { Card, Badge, G } from '../components/design'
import Spinner from '../components/Spinner'
import ErrorAlert from '../components/ErrorAlert'

export default function ClientWorkspace() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [documents, setDocuments] = useState<DocumentMeta[]>([])
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [editingDescription, setEditingDescription] = useState(false)
  const [descriptionDraft, setDescriptionDraft] = useState('')
  const [descriptionError, setDescriptionError] = useState<string | null>(null)
  const [savingDescription, setSavingDescription] = useState(false)
  const [deletingDocumentId, setDeletingDocumentId] = useState<number | null>(null)
  const [evidence, setEvidence] = useState<EvidenceFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [eventDate, setEventDate] = useState('')
  const [eventText, setEventText] = useState('')

  const [input, setInput] = useState('')

  const load = useCallback(async () => {
    if (!caseId) return
    setLoading(true)
    setError(null)
    setNotFound(false)
    try {
      const [c, docs, timeline, evidenceResult] = await Promise.all([
        getCase(caseId),
        listCaseDocuments(caseId).catch(() => ({ items: [], total: 0 })),
        getCaseTimeline(caseId).catch(() => ({ events: [] })),
        listEvidenceFiles(Number(caseId)).catch(() => ({ items: [] })),
      ])
      setCaseData(c)
      setDescriptionDraft(c.description ?? '')
      setDocuments(docs.items)
      setEvents(timeline.events)
      setEvidence(evidenceResult.items)
    } catch (err) {
      const message = errorMessage(err)
      if (message.toLowerCase().includes('not found')) {
        setNotFound(true)
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }, [caseId])

  const removeDocument = async (document: DocumentMeta) => {
    if (!window.confirm(`Delete "${document.title}"? This removes it from your case and AI search. This cannot be undone.`)) return
    setDeletingDocumentId(document.id)
    setError(null)
    try {
      await deleteDocument(document.id)
      await load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setDeletingDocumentId(null)
    }
  }

  useEffect(() => {
    void load()
  }, [load])

  const submitQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    const question = input.trim()
    if (!question || !caseId) return
    navigate('/ai-chat', { state: { caseId: Number(caseId), initialQuestion: question } })
  }

  const uploadCaseFile = async (file: File, kind: 'document' | 'evidence') => {
    if (!caseId) return
    setUploading(true); setError(null)
    try {
      if (kind === 'document') await uploadDocument(file, undefined, Number(caseId))
      else await uploadEvidenceFile(Number(caseId), file)
      await load()
    } catch (err) { setError(errorMessage(err)) } finally { setUploading(false) }
  }

  const saveEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!caseId || !eventDate || !eventText.trim()) return
    try {
      await addCaseEvent(caseId, { date: eventDate, text: eventText.trim(), document_id: null })
      setEventDate(''); setEventText(''); await load()
    } catch (err) { setError(errorMessage(err)) }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Spinner label="Loading case…" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle size={28} className="mx-auto mb-3 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground mb-1">Case not found</h2>
          <p className="text-sm text-muted-foreground mb-5">
            This case doesn't exist, or isn't assigned to your account.
          </p>
          <button onClick={() => navigate('/client/cases')} className="text-sm font-semibold" style={{ color: G }}>
            Back to My Cases
          </button>
        </Card>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle size={28} className="mx-auto mb-3 text-red-400" />
          <h2 className="text-base font-semibold text-foreground mb-1">Couldn't load this case</h2>
          <p className="text-sm text-muted-foreground mb-5">{error}</p>
          <button
            onClick={() => void load()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white mx-auto"
            style={{ background: G }}
          >
            <RefreshCw size={14} /> Try again
          </button>
        </Card>
      </div>
    )
  }

  const latestEvent = [...events].sort((a, b) => (a.date < b.date ? 1 : -1))[0]
  const upcoming = events.filter((e) => e.date >= new Date().toISOString().slice(0, 10))
  const completed = events.filter((e) => e.date < new Date().toISOString().slice(0, 10))

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/client/cases')} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft size={13} /> Back to My Cases
      </button>

      {/* 1. Case title and status */}
      <div>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground">{caseData.case_number}</span>
          <Badge label={caseData.status} />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{caseData.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{caseData.case_type}</p>
      </div>

      {/* 2. What is happening with your case? */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-foreground mb-2">What's happening with your case?</h2>
        {editingDescription ? (
          <form onSubmit={async (e) => {
            e.preventDefault()
            if (!caseId) return
            setSavingDescription(true)
            setDescriptionError(null)
            try { setCaseData(await updateCase(caseId, { description: descriptionDraft })); setEditingDescription(false) }
            catch (err) { setDescriptionError(errorMessage(err)) }
            finally { setSavingDescription(false) }
          }} className="space-y-2">
            <textarea aria-label="Case description" maxLength={5000} rows={5} value={descriptionDraft} onChange={(e) => setDescriptionDraft(e.target.value)} className="w-full rounded-lg border border-border bg-background p-2 text-sm" />
            {descriptionError && <ErrorAlert message={descriptionError} />}
            <button disabled={savingDescription} className="rounded-lg px-3 py-2 text-xs font-semibold text-black" style={{ background: G }}>{savingDescription ? 'Saving…' : 'Save description'}</button>
            <button type="button" onClick={() => setEditingDescription(false)} className="ml-3 text-xs text-muted-foreground">Cancel</button>
          </form>
        ) : <>
        {caseData.description ? (
          <p className="text-sm text-muted-foreground leading-relaxed">{caseData.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No description has been added to this case yet.</p>
        )}
        <button type="button" onClick={() => setEditingDescription(true)} className="mt-3 text-xs underline" style={{ color: G }}>Edit my case description</button>
        </>}
        {latestEvent && (
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Most recent update: {excerpt(latestEvent.text, 220)}
          </p>
        )}
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* 3. Next important date */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={15} style={{ color: G }} />
            <span className="text-sm font-bold text-foreground">Next Important Date</span>
          </div>
          {caseData.deadline ? (
            <p className="text-lg font-semibold text-foreground">{formatDate(caseData.deadline)}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming deadline is on record for this case.</p>
          )}
        </Card>

        {/* 6. Assigned lawyer */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <User size={15} style={{ color: G }} />
            <span className="text-sm font-bold text-foreground">Your Lawyer</span>
          </div>
          <p className="text-lg font-semibold text-foreground">{caseData.lawyer_name || 'Not yet assigned'}</p>
        </Card>
      </div>

      {/* 5. Simple timeline */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Clock size={15} style={{ color: G }} /> Case Timeline
        </h2>
        <form onSubmit={saveEvent} className="mb-5 grid gap-2 sm:grid-cols-[150px_1fr_auto]">
          <input aria-label="Event date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input aria-label="Timeline update" value={eventText} onChange={(e) => setEventText(e.target.value)} placeholder="Add a dated case update…" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <button disabled={!eventDate || !eventText.trim()} className="rounded-lg px-4 py-2 text-sm font-semibold text-black disabled:opacity-50" style={{ background: G }}>Add</button>
        </form>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No dated events have been found in this case's documents yet.</p>
        ) : (
          <div className="relative pl-5">
            <div className="absolute left-1.5 top-1 bottom-1 w-px bg-border" />
            {[...upcoming.sort((a, b) => (a.date < b.date ? -1 : 1)), ...completed.sort((a, b) => (a.date < b.date ? 1 : -1))]
              .slice(0, 8)
              .map((ev, i) => (
                <div key={i} className="relative mb-4 last:mb-0">
                  <div
                    className="absolute -left-3.5 top-1 w-2 h-2 rounded-full"
                    style={{ background: upcoming.includes(ev) ? G : 'var(--muted-foreground)' }}
                  />
                  <div className="text-xs text-muted-foreground">{ev.date_text || formatDate(ev.date)}</div>
                  <div className="text-sm text-foreground">{excerpt(ev.text, 160)}</div>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* 7. Relevant documents */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">Documents ({documents.length})</span>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-black" style={{ background: G }}><Upload size={14}/>{uploading ? 'Uploading…' : 'Upload document'}<input aria-label="Upload case document" type="file" className="sr-only" disabled={uploading} accept=".pdf,.txt,.docx,.png,.jpg,.jpeg,.webp,.tif,.tiff" onChange={(e) => { const file=e.target.files?.[0]; if (file) void uploadCaseFile(file, 'document'); e.currentTarget.value='' }}/></label>
        </div>
        {documents.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No documents have been added to this case yet.</p>
        ) : (
          documents.map((d) => (
            <div
              key={d.id}
              className="w-full text-left flex items-center gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-sidebar-accent transition-colors"
            >
              <button onClick={() => navigate(`/documents/${d.id}`)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                <FileText size={15} className="text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-foreground truncate">{d.title}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(d.created_at)}</div>
                </div>
              </button>
              <button
                type="button"
                title="Delete document"
                aria-label={`Delete ${d.title}`}
                disabled={deletingDocumentId === d.id}
                onClick={() => void removeDocument(d)}
                className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3"><span className="text-sm font-bold text-foreground">Evidence ({evidence.length})</span><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold"><Paperclip size={14}/>Add evidence<input aria-label="Upload case evidence" type="file" className="sr-only" disabled={uploading} onChange={(e) => { const file=e.target.files?.[0]; if (file) void uploadCaseFile(file, 'evidence'); e.currentTarget.value='' }}/></label></div>
        {evidence.length === 0 ? <p className="p-5 text-sm text-muted-foreground">No evidence files have been added yet.</p> : evidence.map((item) => <button key={item.id} type="button" onClick={() => void downloadEvidenceFile(Number(caseId), item)} className="flex w-full items-center gap-3 border-b border-border px-5 py-3 text-left last:border-0 hover:bg-sidebar-accent"><Paperclip size={15} className="text-muted-foreground"/><span className="min-w-0 flex-1 truncate text-sm">{item.filename}</span><span className="text-xs text-muted-foreground">Download</span></button>)}
      </Card>

      {/* 8. Ask AI about this case */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Sparkles size={15} style={{ color: G }} />
          <span className="text-sm font-bold text-foreground">Ask AI about this case</span>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-muted-foreground">Your question will open the full AI Assistant with this case already selected. The conversation will use the case description, documents, evidence, timeline and deadlines available to the assistant.</p>
          <form onSubmit={submitQuestion} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this case…"
              className="flex-1 px-3.5 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground outline-none focus:border-primary/40"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-2.5 rounded-xl text-white disabled:opacity-40"
              style={{ background: G }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </Card>
    </div>
  )
}
