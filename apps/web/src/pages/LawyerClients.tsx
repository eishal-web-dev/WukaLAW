import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Briefcase, FileText, Search, UserRound, Users } from 'lucide-react'
import { errorMessage, listLawyerClients, type LawyerClient } from '../lib/api'
import ErrorAlert from '../components/ErrorAlert'
import { Badge, Card, G } from '../components/design'

const inputClass = 'w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-3 text-sm text-foreground outline-none focus:border-[#D4AF37]/60'

export default function LawyerClients() {
  const navigate = useNavigate()
  const { clientId } = useParams()
  const [clients, setClients] = useState<LawyerClient[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    listLawyerClients()
      .then((items) => { if (!cancelled) setClients(items) })
      .catch((err) => { if (!cancelled) setError(errorMessage(err)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const selected = clientId ? clients.find((client) => client.id === Number(clientId)) : undefined
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    return value ? clients.filter((client) => `${client.name} ${client.email}`.toLowerCase().includes(value)) : clients
  }, [clients, query])
  const activeCases = clients.reduce((total, client) => total + client.active_case_count, 0)
  const documents = clients.reduce((total, client) => total + client.document_count, 0)

  if (clientId && !loading && !selected) {
    return <div className="grid h-full place-items-center p-6"><Card className="max-w-md p-8 text-center"><h1 className="text-xl font-bold">Client not found</h1><p className="mt-2 text-sm text-muted-foreground">This client is not connected to one of your assigned cases.</p><button className="mt-5 text-sm font-semibold" style={{ color: G }} onClick={() => navigate('/clients')}>Back to clients</button></Card></div>
  }

  if (selected) {
    return <div className="h-full overflow-auto p-6 space-y-5">
      <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" onClick={() => navigate('/clients')}><ArrowLeft size={16}/>All clients</button>
      <header className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#D4AF37]/15 text-lg font-bold text-[#D4AF37]">{selected.name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()}</div>
        <div className="min-w-0 flex-1"><h1 className="text-2xl font-bold text-foreground">{selected.name}</h1><p className="text-sm text-muted-foreground">{selected.email}</p></div>
        <div className="flex gap-5 text-center"><div><p className="text-xl font-bold">{selected.case_count}</p><p className="text-xs text-muted-foreground">Cases</p></div><div><p className="text-xl font-bold">{selected.document_count}</p><p className="text-xs text-muted-foreground">Documents</p></div></div>
      </header>
      <section><h2 className="mb-3 text-lg font-bold">Client cases</h2><div className="grid gap-3 lg:grid-cols-2">{selected.cases.map((item) => <button key={item.id} onClick={() => navigate(`/cases/${item.id}`)} className="rounded-xl border border-border bg-card p-4 text-left transition hover:border-[#D4AF37]/40"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-foreground">{item.title}</p><p className="mt-0.5 text-xs text-[#D4AF37]">{item.case_number}</p></div><Badge label={item.status}/></div><div className="mt-4 flex gap-4 text-xs text-muted-foreground"><span>{item.case_type}</span><span>{item.num_documents} document{item.num_documents === 1 ? '' : 's'}</span>{item.deadline ? <span>Due {new Date(item.deadline).toLocaleDateString()}</span> : null}</div></button>)}</div></section>
    </div>
  }

  return <div className="h-full overflow-auto p-6 space-y-5">
    <header><h1 className="text-2xl font-bold text-foreground">Client Management</h1><p className="mt-1 text-sm text-muted-foreground">Clients connected to cases assigned to you. Unclaimed requests stay in the intake queue.</p></header>
    {error ? <ErrorAlert message={error}/> : null}
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="p-4"><Users size={18} className="text-[#D4AF37]"/><p className="mt-3 text-3xl font-bold">{loading ? '…' : clients.length}</p><p className="text-xs text-muted-foreground">Assigned clients</p></Card>
      <Card className="p-4"><Briefcase size={18} className="text-emerald-400"/><p className="mt-3 text-3xl font-bold">{loading ? '…' : activeCases}</p><p className="text-xs text-muted-foreground">Active client cases</p></Card>
      <Card className="p-4"><FileText size={18} className="text-violet-400"/><p className="mt-3 text-3xl font-bold">{loading ? '…' : documents}</p><p className="text-xs text-muted-foreground">Case documents</p></Card>
    </div>
    <div className="relative max-w-xl"><Search size={16} className="absolute left-3 top-3 text-muted-foreground"/><input aria-label="Search clients" className={inputClass} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search clients by name or email"/></div>
    {loading ? <p className="py-10 text-center text-sm text-muted-foreground">Loading clients…</p> : filtered.length === 0 ? <Card className="p-10 text-center"><UserRound size={28} className="mx-auto text-muted-foreground"/><h2 className="mt-3 font-semibold">{query ? 'No matching client' : 'No assigned clients yet'}</h2><p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{query ? 'Try another name or email.' : 'When you claim a client request or receive an assigned matter, the client will appear here automatically.'}</p></Card> : <div className="overflow-hidden rounded-xl border border-border bg-card"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="px-4 py-3">Client</th><th className="px-4 py-3">Cases</th><th className="px-4 py-3">Active</th><th className="px-4 py-3">Documents</th><th className="px-4 py-3">Latest matter</th></tr></thead><tbody>{filtered.map((client) => <tr key={client.id} className="cursor-pointer border-b border-border/60 transition hover:bg-white/[0.03]" onClick={() => navigate(`/clients/${client.id}`)}><td className="px-4 py-3"><p className="font-semibold text-foreground">{client.name}</p><p className="text-xs text-muted-foreground">{client.email}</p></td><td className="px-4 py-3">{client.case_count}</td><td className="px-4 py-3">{client.active_case_count}</td><td className="px-4 py-3">{client.document_count}</td><td className="px-4 py-3 text-xs text-muted-foreground">{new Date(client.last_case_at).toLocaleDateString()}</td></tr>)}</tbody></table></div>}
  </div>
}
