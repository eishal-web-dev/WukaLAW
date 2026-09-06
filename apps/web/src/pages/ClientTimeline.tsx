import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CalendarClock, FileText, FolderOpen } from 'lucide-react'
import { listCases, getCaseTimeline, errorMessage } from '../lib/api'
import type { Case, TimelineEvent } from '../lib/api'
import { Card, G } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'

/**
 * Client-facing Timeline page. Same real data path as the Lawyer Timeline
 * page (getCaseTimeline -- dated events genuinely extracted from a case's
 * documents), reusing the identical honest empty/loading/error states,
 * with copy written for a client audience rather than a lawyer.
 */
export default function ClientTimeline() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCaseId = searchParams.get('case')

  const [cases, setCases] = useState<Case[] | null>(null)
  const [casesError, setCasesError] = useState<string | null>(null)

  const [events, setEvents] = useState<TimelineEvent[] | null>(null)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState<string | null>(null)

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

  useEffect(() => {
    if (!selectedCaseId) {
      setEvents(null)
      setEventsError(null)
      return
    }
    let cancelled = false
    setEventsLoading(true)
    setEventsError(null)
    setEvents(null)
    getCaseTimeline(selectedCaseId)
      .then((res) => {
        if (!cancelled) setEvents(res.events)
      })
      .catch((err) => {
        if (!cancelled) setEventsError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setEventsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedCaseId])

  const sortedEvents = useMemo(
    () => (events ? [...events].sort((a, b) => a.date.localeCompare(b.date)) : null),
    [events],
  )

  const selectedCase = cases?.find((c) => String(c.id) === selectedCaseId)
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Case Timeline</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real dated events found in your case's documents
          </p>
        </div>
        {cases && cases.length > 0 && (
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Case
            <select
              value={selectedCaseId ?? ''}
              onChange={(e) => {
                const id = e.target.value
                setSearchParams(id ? { case: id } : {})
              }}
              className="rounded-xl border border-border bg-muted/40 text-foreground text-sm px-3 py-2 focus:outline-none focus:border-primary/50 transition-colors"
            >
              <option value="">Select a case…</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.case_number} — {c.title}
                </option>
              ))}
            </select>
          </label>
        )}
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
          <p className="text-sm text-muted-foreground">
            No cases have been assigned to your account yet.
          </p>
        </Card>
      )}

      {cases !== null && cases.length > 0 && !selectedCaseId && (
        <Card className="p-10 text-center space-y-3">
          <CalendarClock size={28} className="mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Select a case above to see what's happened and what's coming up.
          </p>
        </Card>
      )}

      {selectedCaseId && eventsLoading && (
        <div className="flex justify-center py-16">
          <Spinner label="Loading timeline…" />
        </div>
      )}

      {selectedCaseId && eventsError && <ErrorAlert message={eventsError} />}

      {selectedCaseId && sortedEvents && sortedEvents.length === 0 && (
        <Card className="p-10 text-center space-y-2">
          <CalendarClock size={28} className="mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No dated events have been found in this case's documents yet.
          </p>
        </Card>
      )}

      {selectedCaseId && sortedEvents && sortedEvents.length > 0 && (
        <div>
          {selectedCase && (
            <div className="mb-4 text-xs text-muted-foreground">
              <span className="font-mono" style={{ color: G }}>
                {selectedCase.case_number}
              </span>{' '}
              · {sortedEvents.length} event{sortedEvents.length === 1 ? '' : 's'}
            </div>
          )}
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-white/[0.08]" />
            <ol className="space-y-2 list-none">
              {sortedEvents.map((ev, i) => (
                <li key={`${ev.document_id}-${ev.date}-${i}`} className="flex gap-5 pl-14 relative group">
                  <div
                    className="absolute left-4 top-4 w-4 h-4 rounded-full border-2 border-[#0D1117] flex-shrink-0"
                    style={{ backgroundColor: ev.date >= today ? G : '#6B7280' }}
                  />
                  <Card className="flex-1 p-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border"
                          style={{
                            color: G,
                            borderColor: 'rgba(212,175,55,0.25)',
                            backgroundColor: 'rgba(212,175,55,0.08)',
                          }}
                        >
                          {ev.date}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {ev.date >= today ? 'Upcoming' : 'Completed'}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{ev.text}</p>
                      <Link
                        to={`/documents/${ev.document_id}`}
                        className="inline-flex items-center gap-1.5 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <FileText size={11} style={{ color: G }} />
                        {ev.document_title}
                      </Link>
                    </div>
                  </Card>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
