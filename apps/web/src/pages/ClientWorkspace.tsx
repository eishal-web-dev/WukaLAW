import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Calendar, FileText, User, Send, AlertCircle, RefreshCw, Sparkles, Clock,
} from 'lucide-react'
import {
  getCase, listCaseDocuments, getCaseTimeline, askCaseQuestion, errorMessage,
} from '../lib/api'
import type { Case, DocumentMeta, TimelineEvent, AskResponse } from '../lib/api'
import { formatDate, excerpt } from '../lib/format'
import { Card, Badge, G } from '../components/design'
import Spinner from '../components/Spinner'
import ErrorAlert from '../components/ErrorAlert'

interface ChatMessage {
  id: number
  role: 'user' | 'ai'
  text: string
  sources?: AskResponse['sources']
  confidenceReason?: string
}

export default function ClientWorkspace() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [documents, setDocuments] = useState<DocumentMeta[]>([])
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [asking, setAsking] = useState(false)
  const [askError, setAskError] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    if (!caseId) return
    setLoading(true)
    setError(null)
    setNotFound(false)
    try {
      const [c, docs, timeline] = await Promise.all([
        getCase(caseId),
        listCaseDocuments(caseId).catch(() => ({ items: [], total: 0 })),
        getCaseTimeline(caseId).catch(() => ({ events: [] })),
      ])
      setCaseData(c)
      setDocuments(docs.items)
      setEvents(timeline.events)
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

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView?.({ behavior: 'smooth' })
  }, [messages])

  const submitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    const question = input.trim()
    if (!question || asking || !caseId) return
    setAskError(null)
    setMessages((m) => [...m, { id: Date.now(), role: 'user', text: question }])
    setInput('')
    setAsking(true)
    try {
      const res = await askCaseQuestion(question, Number(caseId))
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, role: 'ai', text: res.answer, sources: res.sources, confidenceReason: res.confidence.reason },
      ])
    } catch (err) {
      setAskError(errorMessage(err))
    } finally {
      setAsking(false)
    }
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
        {caseData.description ? (
          <p className="text-sm text-muted-foreground leading-relaxed">{caseData.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No description has been added to this case yet.</p>
        )}
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
        </div>
        {documents.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No documents have been added to this case yet.</p>
        ) : (
          documents.map((d) => (
            <button
              key={d.id}
              onClick={() => navigate(`/documents/${d.id}`)}
              className="w-full text-left flex items-center gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-sidebar-accent transition-colors"
            >
              <FileText size={15} className="text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm text-foreground truncate">{d.title}</div>
                <div className="text-xs text-muted-foreground">{formatDate(d.created_at)}</div>
              </div>
            </button>
          ))
        )}
      </Card>

      {/* 8. Ask AI about this case */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Sparkles size={15} style={{ color: G }} />
          <span className="text-sm font-bold text-foreground">Ask AI about this case</span>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-muted-foreground">
            Answers are generated only from documents in this case. This is not legal advice.
          </p>
          {messages.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((m) => (
                <div key={m.id} className={m.role === 'user' ? 'text-right' : ''}>
                  <div
                    className={`inline-block max-w-[85%] text-left rounded-xl px-3.5 py-2.5 text-sm ${m.role === 'user' ? 'text-white' : 'text-foreground'}`}
                    style={{ background: m.role === 'user' ? G : 'var(--sidebar-accent)' }}
                  >
                    {m.text}
                    {m.confidenceReason && (
                      <div className="text-[10px] mt-1.5 opacity-70">{m.confidenceReason}</div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
          {askError && <ErrorAlert message={askError} />}
          <form onSubmit={submitQuestion} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this case…"
              disabled={asking}
              className="flex-1 px-3.5 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground outline-none focus:border-primary/40"
            />
            <button
              type="submit"
              disabled={asking || !input.trim()}
              className="px-4 py-2.5 rounded-xl text-white disabled:opacity-40"
              style={{ background: G }}
            >
              {asking ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </form>
        </div>
      </Card>
    </div>
  )
}
