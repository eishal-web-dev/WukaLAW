import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Briefcase, FileText, Brain, Award, Lightbulb, AlertCircle,
  Sparkles, ArrowRight,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { listCases, listDocuments, errorMessage } from '../lib/api'
import type { Case } from '../lib/api'
import { useAuth } from '../lib/auth'
import { formatDate } from '../lib/format'
import { AREA_DATA } from '../lib/mock'
import { Btn, Card, KPICard, Badge, SectionHeader, CustomTooltip, G, B } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'

function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [cases, setCases] = useState<Case[]>([])
  const [caseTotal, setCaseTotal] = useState(0)
  const [docTotal, setDocTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([listCases(), listDocuments()])
      .then(([cs, docs]) => {
        if (cancelled) return
        setCases(cs.items)
        setCaseTotal(cs.total)
        setDocTotal(docs.total)
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const activeCases = cases.filter((c) => c.status === 'Active').length
  const firstName = (user?.name || 'Counsel').split(' ')[0]
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  const insights = [
    { icon: <Lightbulb size={14} />, text: 'Ask the AI assistant about any uploaded document — answers come with sources and confidence.', action: 'Open AI Chat', path: '/ai-chat' },
    { icon: <AlertCircle size={14} />, text: 'Upload case documents to build your searchable evidence library.', action: 'Upload', path: '/documents' },
    { icon: <Sparkles size={14} />, text: 'Find precedents similar to your matter with semantic search.', action: 'Explore', path: '/similar-cases' },
  ]

  const deadlines = cases
    .filter((c) => c.deadline)
    .map((c) => ({ ...c, days: daysUntil(c.deadline) ?? 0 }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 4)

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Good day, {firstName}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {today} · <span style={{ color: G }}>{activeCases} active case{activeCases === 1 ? '' : 's'}</span> in your workspace
          </p>
        </div>
        <Btn onClick={() => navigate('/cases')} icon={<Plus size={14} />}>New Case</Btn>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* KPI Cards — case/document counts are live */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard icon={<Briefcase size={18} />} label="Total Cases" value={loading ? '…' : String(caseTotal)} sub={`${activeCases} active`} />
        <KPICard icon={<FileText size={18} />} label="Documents" value={loading ? '…' : String(docTotal)} sub="Across all cases" />
        <KPICard icon={<Award size={18} />} label="Win Rate" value="78.4%" sub="Sample metric (preview)" />
        <KPICard icon={<Brain size={18} />} label="AI Accuracy" value="94.2%" sub="Sample metric (preview)" />
      </div>

      {/* Chart + Insights */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <SectionHeader
            title="Case Activity (sample)"
            action={
              <div className="flex gap-2">
                {['Filed', 'Closed'].map((l, i) => (
                  <div key={l} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: [G, B][i] }} />
                    {l}
                  </div>
                ))}
              </div>
            }
          />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={AREA_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="dash-grad-gold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={G} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={G} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dash-grad-blue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={B} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={B} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#B3B3B3', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#B3B3B3', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="filed" name="Filed" stroke={G} strokeWidth={2} fill="url(#dash-grad-gold)" />
              <Area type="monotone" dataKey="closed" name="Closed" stroke={B} strokeWidth={2} fill="url(#dash-grad-blue)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <SectionHeader title="Get Started" />
          <div className="space-y-4">
            {insights.map((ins, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-white/[0.05] hover:border-white/10 transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <div className="mt-0.5" style={{ color: G }}>{ins.icon}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ins.text}</p>
                </div>
                <button
                  onClick={() => navigate(ins.path)}
                  className="text-xs font-medium flex items-center gap-1 hover:gap-2 transition-all"
                  style={{ color: G }}
                >
                  {ins.action} <ArrowRight size={11} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Cases + Deadlines */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <SectionHeader title="Recent Cases" action={<Btn variant="ghost" size="sm" onClick={() => navigate('/cases')}>View all</Btn>} />
          {cases.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              {loading ? 'Loading cases…' : 'No cases yet. Create your first case to get started.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Case', 'Type', 'Status', 'Priority', 'Docs', 'Deadline'].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cases.slice(0, 5).map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors"
                      onClick={() => navigate(`/cases/${c.id}`)}
                    >
                      <td className="py-3 pr-4">
                        <div className="text-foreground text-xs font-medium truncate max-w-[160px]">{c.title}</div>
                        <div className="text-muted-foreground text-[10px]">{c.case_number}</div>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground text-xs">{c.case_type}</td>
                      <td className="py-3 pr-4"><Badge label={c.status} /></td>
                      <td className="py-3 pr-4"><Badge label={c.priority} /></td>
                      <td className="py-3 pr-4 text-muted-foreground text-xs">{c.num_documents}</td>
                      <td className="py-3 text-muted-foreground text-xs">{c.deadline ? formatDate(c.deadline) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <SectionHeader title="Upcoming Deadlines" />
          {deadlines.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No deadlines set.</p>
          ) : (
            <div className="space-y-3">
              {deadlines.map((d) => (
                <div
                  key={d.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer"
                  onClick={() => navigate(`/cases/${d.id}`)}
                >
                  <div className={`text-center rounded-lg p-1.5 flex-shrink-0 w-12 ${d.days <= 7 ? 'bg-red-500/10' : 'bg-white/[0.05]'}`}>
                    <div className={`text-lg font-bold leading-none ${d.days <= 7 ? 'text-red-400' : 'text-foreground'}`}>{d.days}</div>
                    <div className="text-[9px] text-muted-foreground">days</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">{d.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {d.case_type} · {d.deadline ? formatDate(d.deadline) : ''}
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: G }}>{d.case_number}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
