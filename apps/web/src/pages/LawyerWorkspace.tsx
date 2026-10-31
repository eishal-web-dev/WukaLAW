import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Brain, Calendar, FileText, FolderOpen, Gavel, ListTodo, Upload } from 'lucide-react'
import UploadZone from '../components/UploadZone'
import { errorMessage, getCaseTimeline, listCaseDocuments, listCases, listHearings, listLawyerTasks, type Case, type DocumentMeta, type Hearing, type LawyerTask, type TimelineEvent } from '../lib/api'

type Tab = 'overview' | 'documents' | 'timeline' | 'work'

export default function LawyerWorkspace({ embedded = false }: { embedded?: boolean } = {}) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedCaseId = Number(searchParams.get('caseId'))
  const [cases, setCases] = useState<Case[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [docs, setDocs] = useState<DocumentMeta[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [tasks, setTasks] = useState<LawyerTask[]>([])
  const [hearings, setHearings] = useState<Hearing[]>([])
  const [tab, setTab] = useState<Tab>('overview')
  const [error, setError] = useState('')
  const [loadingCases, setLoadingCases] = useState(true)
  const [loadingWorkspace, setLoadingWorkspace] = useState(false)

  useEffect(() => {
    let cancelled = false
    listCases().then((response) => {
      if (cancelled) return
      setCases(response.items)
      setSelected((response.items.find((item) => item.id === requestedCaseId) ?? response.items[0])?.id ?? null)
    }).catch((reason) => { if (!cancelled) setError(errorMessage(reason)) })
      .finally(() => { if (!cancelled) setLoadingCases(false) })
    return () => { cancelled = true }
  }, [requestedCaseId])

  const loadWorkspace = useCallback(async (caseId: number) => {
    setLoadingWorkspace(true)
    setError('')
    const [documentResult, timelineResult, taskResult, hearingResult] = await Promise.allSettled([
      listCaseDocuments(caseId), getCaseTimeline(caseId), listLawyerTasks(), listHearings(),
    ])
    // Panels load independently: an optional task/hearing error must not hide case documents.
    if (documentResult.status === 'fulfilled') setDocs(documentResult.value.items)
    else { setDocs([]); setError(`Documents could not be loaded: ${errorMessage(documentResult.reason)}`) }
    setTimeline(timelineResult.status === 'fulfilled' ? timelineResult.value.events : [])
    setTasks(taskResult.status === 'fulfilled' ? taskResult.value.filter((item) => item.case_id === caseId) : [])
    setHearings(hearingResult.status === 'fulfilled' ? hearingResult.value.filter((item) => item.case_id === caseId) : [])
    setLoadingWorkspace(false)
  }, [])

  useEffect(() => { if (selected) void loadWorkspace(selected) }, [selected, loadWorkspace])
  const item = cases.find((caseItem) => caseItem.id === selected)
  const selectCase = (caseId: number) => {
    setSelected(caseId)
    const next = new URLSearchParams(searchParams)
    next.set('view', 'workspace'); next.set('caseId', String(caseId)); setSearchParams(next, { replace: true })
  }

  return <div className={`${embedded ? 'h-full' : 'min-h-full md:h-full'} flex flex-col md:flex-row md:overflow-hidden`}>
    <aside className="w-full border-b border-border bg-card/50 p-3 md:w-72 md:shrink-0 md:overflow-auto md:border-b-0 md:border-r">
      <h2 className="px-2 py-3 text-lg font-bold">Case Workspace</h2>
      <div className="flex gap-2 overflow-x-auto pb-1 md:block">{cases.map((caseItem) => <button key={caseItem.id} onClick={() => selectCase(caseItem.id)} className={`min-w-[220px] rounded-lg border p-3 text-left md:mb-2 md:w-full md:min-w-0 ${selected === caseItem.id ? 'border-[#D4AF37]/50 bg-[#D4AF37]/10' : 'border-transparent hover:bg-white/5'}`}><p className="text-xs text-[#D4AF37]">{caseItem.case_number}</p><p className="mt-1 truncate text-sm font-semibold">{caseItem.title}</p><p className="mt-1 text-xs text-muted-foreground">{caseItem.status} · {caseItem.num_documents} document(s)</p></button>)}{!cases.length && !loadingCases ? <p className="p-3 text-sm text-muted-foreground">Create or claim a case to use the workspace.</p> : null}</div>
    </aside>
    <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6">
      {error ? <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div> : null}
      {!item ? <div className="grid min-h-64 place-items-center text-muted-foreground"><FolderOpen size={38} /></div> : <>
        <header className="flex flex-wrap justify-between gap-4"><div><p className="text-sm text-[#D4AF37]">{item.case_number}</p><h2 className="text-2xl font-bold">{item.title}</h2><p className="mt-1 text-sm text-muted-foreground">{item.case_type} · {item.status} · {item.priority} priority</p></div><div className="flex flex-wrap gap-2"><button onClick={() => navigate(`/cases/${item.id}`)} className="rounded-lg border border-border px-3 py-2 text-sm">Edit case</button><button onClick={() => setTab('documents')} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"><FileText size={15} />View documents</button><button onClick={() => navigate('/ai-chat', { state: { caseId: item.id } })} className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-3 py-2 text-sm font-semibold text-black"><Brain size={15} />Ask AI</button></div></header>
        <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-border">{(['overview', 'documents', 'timeline', 'work'] as Tab[]).map((name) => <button key={name} onClick={() => setTab(name)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm capitalize ${tab === name ? 'border-[#D4AF37] text-foreground' : 'border-transparent text-muted-foreground'}`}>{name}{name === 'documents' ? ` (${docs.length})` : ''}</button>)}</nav>
        {loadingWorkspace ? <p className="py-10 text-muted-foreground">Loading case workspace…</p> : <div className="py-5">
          {tab === 'overview' ? <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[[FileText, 'Documents', docs.length], [Calendar, 'Dated events', timeline.length], [ListTodo, 'Open tasks', tasks.filter((task) => task.status !== 'Done').length], [Gavel, 'Hearings', hearings.length]].map(([Icon, label, value]) => { const I = Icon as typeof FileText; return <button key={String(label)} onClick={() => label === 'Documents' && setTab('documents')} className="rounded-xl border border-border bg-card p-4 text-left hover:border-[#D4AF37]/40"><I size={17} className="text-[#D4AF37]" /><p className="mt-2 text-2xl font-bold">{String(value)}</p><p className="text-xs text-muted-foreground">{String(label)}</p></button> })}</div>
            <section className="rounded-xl border border-border bg-card p-5"><h3 className="mb-2 font-bold">Case description</h3><p className="whitespace-pre-wrap text-sm text-muted-foreground">{item.description || 'No case description has been recorded yet.'}</p></section>
            <section className="rounded-xl border border-border bg-card p-5"><h3 className="mb-2 font-bold">Next deadline</h3><p className="text-sm">{item.deadline ? new Date(item.deadline).toLocaleDateString() : 'No deadline recorded.'}</p></section>
            <section className="rounded-xl border border-border bg-card p-5"><div className="mb-3 flex items-center justify-between"><div><h3 className="font-bold">Recent documents</h3><p className="text-xs text-muted-foreground">Documents attached to this case</p></div><button onClick={() => setTab('documents')} className="text-xs font-semibold text-[#D4AF37]">View all</button></div>{docs.length ? <div className="grid gap-2 sm:grid-cols-2">{docs.slice(0, 4).map((doc) => <button key={doc.id} onClick={() => navigate(`/documents/${doc.id}`)} className="flex items-center gap-3 rounded-lg border border-border p-3 text-left hover:border-[#D4AF37]/40"><FileText size={16} className="shrink-0 text-[#D4AF37]" /><span className="min-w-0"><span className="block truncate text-sm font-semibold">{doc.title}</span><span className="block truncate text-xs text-muted-foreground">{doc.filename}</span></span></button>)}</div> : <p className="text-sm text-muted-foreground">No documents have been attached to this case yet.</p>}</section>
          </div> : null}
          {tab === 'documents' ? <div className="space-y-5"><section className="rounded-xl border border-border bg-card p-4"><div className="mb-3 flex items-center gap-2"><Upload size={17} className="text-[#D4AF37]" /><h3 className="font-bold">Add documents to this case</h3></div><UploadZone caseId={item.id} onUploaded={() => void loadWorkspace(item.id)} /></section><section><div className="mb-3"><h3 className="font-bold">Case documents</h3><p className="text-xs text-muted-foreground">{docs.length} document{docs.length === 1 ? '' : 's'} linked to {item.case_number}</p></div><div className="grid gap-3 md:grid-cols-2">{docs.map((doc) => <button key={doc.id} onClick={() => navigate(`/documents/${doc.id}`)} className="rounded-xl border border-border bg-card p-4 text-left hover:border-[#D4AF37]/40"><FileText size={17} className="text-[#D4AF37]" /><h3 className="mt-2 font-semibold">{doc.title}</h3><p className="mt-1 truncate text-xs text-muted-foreground">{doc.filename}</p><p className="mt-2 text-xs text-muted-foreground">{doc.num_chunks} searchable chunk(s) · Open document →</p></button>)}{!docs.length ? <p className="text-muted-foreground">No documents linked to this case. Upload the first document above.</p> : null}</div></section></div> : null}
          {tab === 'timeline' ? <div className="space-y-3">{timeline.map((event, index) => <div key={`${event.document_id}-${index}`} className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-[#D4AF37]">{event.date_text}</p><p className="mt-1 text-sm">{event.text}</p><button onClick={() => navigate(`/documents/${event.document_id}`)} className="mt-2 text-xs text-muted-foreground">Source: {event.document_title}</button></div>)}{!timeline.length ? <p className="text-muted-foreground">No dated events extracted from the linked documents.</p> : null}</div> : null}
          {tab === 'work' ? <div className="grid gap-4 lg:grid-cols-2"><section><div className="mb-3 flex justify-between"><h3 className="font-bold">Tasks</h3><button onClick={() => navigate('/tasks')} className="text-xs text-[#D4AF37]">Open board</button></div>{tasks.map((task) => <div key={task.id} className="mb-2 rounded-lg border border-border bg-card p-3"><p className="text-sm font-semibold">{task.title}</p><p className="mt-1 text-xs text-muted-foreground">{task.status} · {task.priority}{task.due_at ? ` · due ${new Date(task.due_at).toLocaleDateString()}` : ''}</p></div>)}</section><section><div className="mb-3 flex justify-between"><h3 className="font-bold">Hearings</h3><button onClick={() => navigate('/hearings')} className="text-xs text-[#D4AF37]">Manage hearings</button></div>{hearings.map((hearing) => <div key={hearing.id} className="mb-2 rounded-lg border border-border bg-card p-3"><p className="text-sm font-semibold">{hearing.title}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(hearing.scheduled_at).toLocaleString()} · {hearing.court}</p></div>)}</section></div> : null}
        </div>}
      </>}
    </main>
  </div>
}
