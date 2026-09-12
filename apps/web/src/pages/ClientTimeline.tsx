import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  CalendarClock, FileText, FolderOpen, Plus, Pencil, Trash2, Download, Check, X, HelpCircle,
} from 'lucide-react'
import {
  listCases, getCaseTimeline, listTimelineEntries, createTimelineEntry,
  updateTimelineEntry, deleteTimelineEntry, errorMessage,
} from '../lib/api'
import type { Case, TimelineEvent, CaseTimelineEntry } from '../lib/api'
import { Card, G } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'

/**
 * Guided question templates by case type. Answering these creates real,
 * persisted timeline entries (source='guided') rather than just decorative
 * prompts -- each answer is a genuine POST to /timeline-entries. Keyed by
 * a loose case_type match rather than an exact string, so 'Family',
 * 'Family Law', 'Divorce' etc. all pick up the same relevant questions.
 */
interface GuidedQuestion {
  id: string
  label: string
  kind: 'date' | 'tags'
  options?: string[]
}

const FAMILY_QUESTIONS: GuidedQuestion[] = [
  { id: 'married', label: 'When did you get married?', kind: 'date' },
  { id: 'children', label: 'Do you have children together?', kind: 'tags', options: ['Yes', 'No'] },
  { id: 'separated', label: 'When did you separate?', kind: 'date' },
  { id: 'filed', label: 'When did you file for divorce?', kind: 'date' },
]

function guidedQuestionsFor(caseType: string): GuidedQuestion[] {
  const t = caseType.toLowerCase()
  if (t.includes('family') || t.includes('divorce')) return FAMILY_QUESTIONS
  return []
}

type MergedItem =
  | { kind: 'extracted'; date: string; text: string; documentId: number; documentTitle: string }
  | { kind: 'entry'; entry: CaseTimelineEntry }

export default function ClientTimeline() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCaseId = searchParams.get('case')

  const [cases, setCases] = useState<Case[] | null>(null)
  const [casesError, setCasesError] = useState<string | null>(null)

  const [events, setEvents] = useState<TimelineEvent[] | null>(null)
  const [entries, setEntries] = useState<CaseTimelineEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showAddForm, setShowAddForm] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [saving, setSaving] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editDate, setEditDate] = useState('')
  const [editTitle, setEditTitle] = useState('')

  const [guidedAnswers, setGuidedAnswers] = useState<Record<string, string>>({})
  const [dismissedGuided, setDismissedGuided] = useState(false)

  useEffect(() => {
    let cancelled = false
    listCases()
      .then((res) => {
        if (!cancelled) setCases(res.items)
      })
      .catch((err) => {
        if (!cancelled) {
          setCases([])
          setCasesError(errorMessage(err))
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const loadCaseData = (caseId: string) => {
    setLoading(true)
    setError(null)
    setEvents(null)
    setEntries([])
    setDismissedGuided(false)
    Promise.all([getCaseTimeline(caseId), listTimelineEntries(caseId)])
      .then(([timelineRes, entriesRes]) => {
        setEvents(timelineRes.events)
        setEntries(entriesRes)
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!selectedCaseId) return
    loadCaseData(selectedCaseId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCaseId])

  const selectedCase = cases?.find((c) => String(c.id) === selectedCaseId)
  const guidedQuestions = selectedCase ? guidedQuestionsFor(selectedCase.case_type) : []
  const alreadyAnsweredIds = new Set(entries.filter((e) => e.source === 'guided').map((e) => e.title))
  const unansweredGuided = guidedQuestions.filter((q) => !alreadyAnsweredIds.has(q.label))

  const merged: MergedItem[] = useMemo(() => {
    const fromExtracted: MergedItem[] = (events ?? []).map((ev) => ({
      kind: 'extracted',
      date: ev.date,
      text: ev.text,
      documentId: ev.document_id,
      documentTitle: ev.document_title,
    }))
    const fromEntries: MergedItem[] = entries.map((entry) => ({ kind: 'entry', entry }))
    return [...fromExtracted, ...fromEntries].sort((a, b) => {
      const da = a.kind === 'extracted' ? a.date : a.entry.date
      const db_ = b.kind === 'extracted' ? b.date : b.entry.date
      return da.localeCompare(db_)
    })
  }, [events, entries])

  const submitGuided = async (question: GuidedQuestion, value: string) => {
    if (!selectedCaseId || !value) return
    try {
      const entry = await createTimelineEntry(selectedCaseId, { date: value, title: question.label, source: 'guided' })
      setEntries((prev) => [...prev, entry])
      setGuidedAnswers((prev) => ({ ...prev, [question.id]: value }))
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const submitCustom = async () => {
    if (!selectedCaseId || !newDate.trim() || !newTitle.trim() || saving) return
    setSaving(true)
    try {
      const entry = await createTimelineEntry(selectedCaseId, { date: newDate.trim(), title: newTitle.trim(), source: 'custom' })
      setEntries((prev) => [...prev, entry])
      setNewDate('')
      setNewTitle('')
      setShowAddForm(false)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (entry: CaseTimelineEntry) => {
    setEditingId(entry.id)
    setEditDate(entry.date)
    setEditTitle(entry.title)
  }

  const saveEdit = async (entry: CaseTimelineEntry) => {
    if (!selectedCaseId) return
    try {
      const updated = await updateTimelineEntry(selectedCaseId, entry.id, { date: editDate, title: editTitle })
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? updated : e)))
      setEditingId(null)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const removeEntry = async (entry: CaseTimelineEntry) => {
    if (!selectedCaseId) return
    try {
      await deleteTimelineEntry(selectedCaseId, entry.id)
      setEntries((prev) => prev.filter((e) => e.id !== entry.id))
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const downloadTimeline = () => {
    if (!selectedCase) return
    const lines = [
      `TIMELINE — ${selectedCase.case_number} · ${selectedCase.title}`,
      '='.repeat(40),
      '',
      ...merged.map((item) =>
        item.kind === 'extracted'
          ? `${item.date} — ${item.text} (from ${item.documentTitle})`
          : `${item.entry.date} — ${item.entry.title}`,
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = `${selectedCase.case_number}-timeline.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Case Timeline</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            What happened, and when — from your documents and what you add
          </p>
        </div>
        <div className="flex items-center gap-2">
          {cases && cases.length > 0 && (
            <select
              value={selectedCaseId ?? ''}
              onChange={(e) => {
                const id = e.target.value
                setSearchParams(id ? { case: id } : {})
              }}
              className="rounded-xl border border-border bg-muted/40 text-foreground text-sm px-3 py-2 focus:outline-none focus:border-primary/50"
            >
              <option value="">Select a case…</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.case_number} — {c.title}
                </option>
              ))}
            </select>
          )}
          {selectedCase && merged.length > 0 && (
            <button
              onClick={downloadTimeline}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: G }}
            >
              <Download size={13} /> Download
            </button>
          )}
        </div>
      </div>

      {casesError && <ErrorAlert message={casesError} />}

      {cases === null && !casesError && (
        <div className="flex justify-center py-16">
          <Spinner label="Loading your cases…" />
        </div>
      )}

      {cases !== null && cases.length === 0 && !casesError && (
        <Card className="p-10 text-center space-y-3">
          <FolderOpen size={28} className="mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No cases have been assigned to your account yet.</p>
        </Card>
      )}

      {cases !== null && cases.length > 0 && !selectedCaseId && (
        <Card className="p-10 text-center space-y-3">
          <CalendarClock size={28} className="mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Select a case above to see and build its timeline.</p>
        </Card>
      )}

      {selectedCaseId && loading && (
        <div className="flex justify-center py-16">
          <Spinner label="Loading timeline…" />
        </div>
      )}

      {selectedCaseId && error && <ErrorAlert message={error} />}

      {selectedCaseId && !loading && (
        <>
          {unansweredGuided.length > 0 && !dismissedGuided && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle size={16} style={{ color: G }} />
                <span className="text-sm font-bold text-foreground">Answer a few quick questions</span>
                <button
                  onClick={() => setDismissedGuided(true)}
                  className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                >
                  Skip
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                These help build an accurate timeline for a {selectedCase?.case_type.toLowerCase()} case. Answer any that apply.
              </p>
              <div className="space-y-3">
                {unansweredGuided.map((q) => (
                  <div key={q.id} className="flex items-center justify-between gap-3 flex-wrap">
                    <span className="text-sm text-foreground">{q.label}</span>
                    {q.kind === 'date' ? (
                      <input
                        type="date"
                        value={guidedAnswers[q.id] ?? ''}
                        onChange={(e) => void submitGuided(q, e.target.value)}
                        className="px-3 py-1.5 text-xs bg-card border border-border rounded-lg text-foreground outline-none focus:border-primary/40"
                      />
                    ) : (
                      <div className="flex gap-2">
                        {q.options?.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => void submitGuided(q, opt)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {merged.length === 0 ? (
            <Card className="p-10 text-center space-y-2">
              <CalendarClock size={28} className="mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No timeline events yet — none were found in this case's documents, and none have been added.
              </p>
            </Card>
          ) : (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-white/[0.08]" />
              <ol className="space-y-2 list-none">
                {merged.map((item, i) => {
                  const date = item.kind === 'extracted' ? item.date : item.entry.date
                  const isEditing = item.kind === 'entry' && editingId === item.entry.id
                  return (
                    <li key={i} className="flex gap-5 pl-14 relative group">
                      <div
                        className="absolute left-4 top-4 w-4 h-4 rounded-full border-2 border-[#0D1117] flex-shrink-0"
                        style={{ backgroundColor: date >= today ? G : '#6B7280' }}
                      />
                      <Card className="flex-1 p-4">
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="px-2 py-1 text-xs bg-card border border-border rounded-lg text-foreground outline-none"
                            />
                            <input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="flex-1 min-w-[150px] px-2 py-1 text-xs bg-card border border-border rounded-lg text-foreground outline-none"
                            />
                            <button onClick={() => void saveEdit(item.entry)} className="text-emerald-400"><Check size={14} /></button>
                            <button onClick={() => setEditingId(null)} className="text-muted-foreground"><X size={14} /></button>
                          </div>
                        ) : (
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border"
                                style={{ color: G, borderColor: 'rgba(212,175,55,0.25)', backgroundColor: 'rgba(212,175,55,0.08)' }}
                              >
                                {date}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{date >= today ? 'Upcoming' : 'Completed'}</span>
                              {item.kind === 'entry' && (
                                <span className="text-[10px] text-muted-foreground">
                                  {item.entry.source === 'guided' ? '· From your answers' : '· Added by you'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm text-foreground leading-relaxed">
                                {item.kind === 'extracted' ? item.text : item.entry.title}
                              </p>
                              {item.kind === 'entry' && (
                                <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startEdit(item.entry)} className="text-muted-foreground hover:text-foreground"><Pencil size={12} /></button>
                                  <button onClick={() => void removeEntry(item.entry)} className="text-muted-foreground hover:text-red-400"><Trash2 size={12} /></button>
                                </div>
                              )}
                            </div>
                            {item.kind === 'extracted' && (
                              <Link
                                to={`/documents/${item.documentId}`}
                                className="inline-flex items-center gap-1.5 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <FileText size={11} style={{ color: G }} />
                                {item.documentTitle}
                              </Link>
                            )}
                          </div>
                        )}
                      </Card>
                    </li>
                  )
                })}
              </ol>
            </div>
          )}

          {showAddForm ? (
            <Card className="p-4 flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="px-3 py-2 text-sm bg-card border border-border rounded-xl text-foreground outline-none focus:border-primary/40"
              />
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What happened?"
                className="flex-1 min-w-[180px] px-3 py-2 text-sm bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground outline-none focus:border-primary/40"
              />
              <button
                onClick={() => void submitCustom()}
                disabled={saving || !newDate.trim() || !newTitle.trim()}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: G }}
              >
                Add
              </button>
              <button onClick={() => setShowAddForm(false)} className="text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            </Card>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/30 transition-all text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              <Plus size={15} /> Add a custom event
            </button>
          )}
        </>
      )}
    </div>
  )
}
