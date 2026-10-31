import { useCallback, useEffect, useState } from 'react'
import { CalendarClock, Mail, Phone, UserRound } from 'lucide-react'
import { errorMessage, listConsultationRequests, updateConsultationRequest, type LawyerConsultationRequest } from '../lib/api'
import ErrorAlert from '../components/ErrorAlert'
import { Badge, Card } from '../components/design'

export default function LawyerRequests({ embedded = false }: { embedded?: boolean } = {}) {
  const [items, setItems] = useState<LawyerConsultationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [error, setError] = useState('')
  const load = useCallback(() => {
    setLoading(true)
    listConsultationRequests().then(setItems).catch((reason) => setError(errorMessage(reason))).finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])
  const changeStatus = async (item: LawyerConsultationRequest, status: LawyerConsultationRequest['status']) => {
    setUpdating(item.id)
    try {
      const updated = await updateConsultationRequest(item.id, status)
      setItems((current) => current.map((entry) => entry.id === item.id ? updated : entry))
    } catch (reason) { setError(errorMessage(reason)) } finally { setUpdating(null) }
  }
  const pending = items.filter((item) => item.status === 'Requested')

  return <div className={`h-full space-y-5 overflow-auto ${embedded ? 'p-4 sm:p-6' : 'p-6'}`}>
    <header><h2 className={`${embedded ? 'text-xl' : 'text-2xl'} font-bold`}>Consultation Requests</h2><p className="mt-1 text-sm text-muted-foreground">People who book you from Find a Lawyer appear here automatically.</p></header>
    {error ? <ErrorAlert message={error} /> : null}
    <div className="grid gap-3 sm:grid-cols-2"><Card className="p-4"><p className="text-3xl font-bold">{loading ? '…' : pending.length}</p><p className="text-xs text-muted-foreground">Waiting for your response</p></Card><Card className="p-4"><p className="text-3xl font-bold">{loading ? '…' : items.length}</p><p className="text-xs text-muted-foreground">All consultation requests</p></Card></div>
    {loading ? <p className="py-10 text-center text-sm text-muted-foreground">Loading consultation requests…</p> : items.length === 0 ? <Card className="p-10 text-center"><UserRound size={28} className="mx-auto text-muted-foreground"/><h3 className="mt-3 font-semibold">No consultation requests yet</h3><p className="mt-1 text-sm text-muted-foreground">New bookings sent to your public lawyer profile will appear here.</p></Card> : <div className="grid gap-4 xl:grid-cols-2">{items.map((item) => <Card key={item.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{item.client_name}</h3><p className="mt-1 text-xs text-muted-foreground">Received {new Date(item.created_at).toLocaleString()}</p></div><Badge label={item.status}/></div><div className="mt-4 space-y-2 text-sm"><a className="flex items-center gap-2 hover:text-[#D4AF37]" href={`mailto:${item.client_email}`}><Mail size={15}/>{item.client_email}</a>{item.client_phone ? <a className="flex items-center gap-2 hover:text-[#D4AF37]" href={`tel:${item.client_phone}`}><Phone size={15}/>{item.client_phone}</a> : null}<p className="flex items-center gap-2"><CalendarClock size={15}/>{new Date(item.requested_at).toLocaleString()}</p></div>{item.notes ? <p className="mt-4 rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">{item.notes}</p> : null}<div className="mt-4 flex flex-wrap gap-2"><button disabled={updating === item.id} onClick={() => void changeStatus(item, 'Contacted')} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold disabled:opacity-50">Mark contacted</button><button disabled={updating === item.id} onClick={() => void changeStatus(item, 'Accepted')} className="rounded-lg bg-[#D4AF37] px-3 py-2 text-xs font-semibold text-black disabled:opacity-50">Accept</button><button disabled={updating === item.id} onClick={() => void changeStatus(item, 'Declined')} className="rounded-lg px-3 py-2 text-xs text-red-400 disabled:opacity-50">Decline</button></div></Card>)}</div>}
  </div>
}
