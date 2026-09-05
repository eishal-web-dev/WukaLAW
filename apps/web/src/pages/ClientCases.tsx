import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Search, FileText, Calendar, RefreshCw, AlertCircle, ChevronRight } from 'lucide-react'
import { listCases, errorMessage } from '../lib/api'
import type { Case, CaseStatus } from '../lib/api'
import { formatDate } from '../lib/format'
import { Card, Badge, Input, G } from '../components/design'
import Spinner from '../components/Spinner'

const TABS: (CaseStatus | 'All')[] = ['All', 'Active', 'Review', 'On Hold', 'Closed']

export default function ClientCases() {
  const navigate = useNavigate()
  const [cases, setCases] = useState<Case[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<(typeof TABS)[number]>('All')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listCases()
      setCases(res.items)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Spinner label="Loading your cases…" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle size={28} className="mx-auto mb-3 text-red-400" />
          <h2 className="text-base font-semibold text-foreground mb-1">Couldn't load your cases</h2>
          <p className="text-sm text-muted-foreground mb-5">{error}</p>
          <button
            onClick={() => void load()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: G }}
          >
            <RefreshCw size={14} /> Try again
          </button>
        </Card>
      </div>
    )
  }

  const items = cases ?? []
  const filtered = items.filter(
    (c) =>
      (filter === 'All' || c.status === filter) &&
      (c.title.toLowerCase().includes(search.toLowerCase()) || c.case_number.toLowerCase().includes(search.toLowerCase())),
  )
  const activeCount = items.filter((c) => c.status === 'Active').length

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">My Cases</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {items.length} total case{items.length === 1 ? '' : 's'} · {activeCount} active
        </p>
      </div>

      {items.length === 0 ? (
        <Card className="p-10 text-center">
          <Briefcase size={28} className="mx-auto mb-3 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground mb-1">No cases assigned yet</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Once your lawyer assigns a case to your account, it will appear here.
          </p>
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Input placeholder="Search cases…" value={search} onChange={setSearch} icon={<Search size={13} />} className="flex-1 max-w-xs" />
            <div className="flex gap-1 bg-card border border-border rounded-xl p-1 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                  style={filter === t ? { background: G, color: '#0D1117' } : { color: 'var(--muted-foreground)' }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">No cases match your search or filter.</Card>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/client/cases/${c.id}/workspace`)}
                  className="w-full text-left bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">{c.case_number}</span>
                        <Badge label={c.status} />
                        <Badge label={c.priority} />
                      </div>
                      <h3 className="font-bold text-foreground text-base mb-2 truncate">{c.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span>{c.case_type}</span>
                        {c.lawyer_name && <span>{c.lawyer_name}</span>}
                        <span className="flex items-center gap-1">
                          <FileText size={11} />
                          {c.num_documents} doc{c.num_documents === 1 ? '' : 's'}
                        </span>
                        {c.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            Due {formatDate(c.deadline)}
                          </span>
                        )}
                        <span>Opened {formatDate(c.created_at)}</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
