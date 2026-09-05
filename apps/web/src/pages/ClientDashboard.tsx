import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, FileText, Bell, Calendar, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../lib/auth'
import {
  listCases, listDocuments, getNotificationUnreadCount, errorMessage,
} from '../lib/api'
import type { Case, DocumentMeta } from '../lib/api'
import { formatDate } from '../lib/format'
import { Card, KPICard, Badge, G, B } from '../components/design'
import Spinner from '../components/Spinner'

export default function ClientDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [cases, setCases] = useState<Case[] | null>(null)
  const [documents, setDocuments] = useState<DocumentMeta[] | null>(null)
  const [unread, setUnread] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [caseRes, docRes, notifRes] = await Promise.all([
        listCases(),
        listDocuments(),
        getNotificationUnreadCount(),
      ])
      setCases(caseRes.items)
      setDocuments(docRes.items)
      setUnread(notifRes.unread)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const firstName = (user?.name || 'there').split(' ')[0]
  const activeCases = (cases ?? []).filter((c) => c.status === 'Active').length
  const reviewCases = (cases ?? []).filter((c) => c.status === 'Review').length
  const closedCases = (cases ?? []).filter((c) => c.status === 'Closed').length
  const upcoming = (cases ?? [])
    .filter((c) => c.deadline)
    .sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1))
    .slice(0, 4)
  const latestCases = [...(cases ?? [])].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 3)
  const latestDocuments = [...(documents ?? [])].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 3)

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Spinner label="Loading your account…" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle size={28} className="mx-auto mb-3 text-red-400" />
          <h2 className="text-base font-semibold text-foreground mb-1">Couldn't load your dashboard</h2>
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

  const hasNoCases = (cases ?? []).length === 0;

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <div className="text-xs text-muted-foreground mb-1">Welcome back</div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{firstName}</h1>
        {user?.email && <div className="text-xs text-muted-foreground mt-1">{user.email}</div>}
      </div>

      {hasNoCases ? (
        <Card className="p-10 text-center">
          <Briefcase size={28} className="mx-auto mb-3 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground mb-1">No cases assigned yet</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Once your lawyer assigns a case to your account, it will show up here along with its documents and updates.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <KPICard icon={<Briefcase size={18} />} label="Active Cases" value={String(activeCases)} sub={`${(cases ?? []).length} total`} color={G} />
            <KPICard icon={<Calendar size={18} />} label="In Review" value={String(reviewCases)} color="#8B5CF6" />
            <KPICard icon={<Briefcase size={18} />} label="Closed" value={String(closedCases)} color="#6B7280" />
            <KPICard icon={<FileText size={18} />} label="Documents" value={String((documents ?? []).length)} color={B} />
            <KPICard icon={<Bell size={18} />} label="Unread Notifications" value={String(unread ?? 0)} color="#10B981" />
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-2 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <span className="font-bold text-foreground text-sm">Your Cases</span>
                <button
                  onClick={() => navigate('/client/cases')}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  View all <ArrowRight size={12} />
                </button>
              </div>
              {latestCases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/client/cases/${c.id}/workspace`)}
                  className="w-full text-left flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-sidebar-accent transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-mono">{c.case_number}</span>
                      <Badge label={c.status} />
                    </div>
                    <div className="font-semibold text-foreground text-sm truncate">{c.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {c.case_type}{c.lawyer_name ? ` · ${c.lawyer_name}` : ''}
                    </div>
                  </div>
                  {c.deadline && (
                    <div className="text-xs text-muted-foreground flex-shrink-0">{formatDate(c.deadline)}</div>
                  )}
                </button>
              ))}
            </Card>

            <div className="flex flex-col gap-4">
              <Card className="overflow-hidden">
                <div className="px-4 py-3 border-b border-border font-bold text-foreground text-sm">Upcoming Deadlines</div>
                {upcoming.length === 0 ? (
                  <p className="p-4 text-xs text-muted-foreground">No upcoming deadlines on your cases.</p>
                ) : (
                  <div className="p-3 flex flex-col gap-2">
                    {upcoming.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl">
                        <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: `${G}15` }}>
                          <Calendar size={14} style={{ color: G }} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-foreground truncate">{formatDate(c.deadline!)}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{c.case_number} · {c.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="overflow-hidden">
                <div className="px-4 py-3 border-b border-border font-bold text-foreground text-sm">Recent Documents</div>
                {latestDocuments.length === 0 ? (
                  <p className="p-4 text-xs text-muted-foreground">No documents yet.</p>
                ) : (
                  <div className="p-3 flex flex-col gap-2">
                    {latestDocuments.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => navigate(`/documents/${d.id}`)}
                        className="w-full text-left flex items-center gap-2.5 p-2 rounded-lg hover:bg-sidebar-accent"
                      >
                        <FileText size={14} className="text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-foreground truncate">{d.title}</div>
                          <div className="text-[10px] text-muted-foreground">{formatDate(d.created_at)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
