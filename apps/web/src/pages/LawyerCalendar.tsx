import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { createCalendarEvent, deleteCalendarEvent, errorMessage, listCalendarEvents, listCases, listHearings, type CalendarEvent, type Case, type Hearing } from '../lib/api'

const field = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground'
const isoLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

export default function LawyerCalendar() {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [hearings, setHearings] = useState<Hearing[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', starts_at: isoLocal(new Date()), ends_at: '', event_type: 'Meeting', location: '', notes: '', case_id: '' })
  const load = async () => {
    try { const [e, h, c] = await Promise.all([listCalendarEvents(), listHearings(), listCases()]); setEvents(e); setHearings(h); setCases(c.items); setError('') }
    catch (err) { setError(errorMessage(err)) }
  }
  useEffect(() => { void load() }, [])
  const dated = useMemo(() => [
    ...events.map(e => ({ id: `e${e.id}`, date: e.starts_at, title: e.title, type: e.event_type, caseNumber: e.case_number, eventId: e.id })),
    ...hearings.filter(h => h.status !== 'Cancelled').map(h => ({ id: `h${h.id}`, date: h.scheduled_at, title: h.title, type: 'Hearing', caseNumber: h.case_number, eventId: null })),
  ], [events, hearings])
  const firstDay = month.getDay(); const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = Array.from({ length: 42 }, (_, i) => i - firstDay + 1)
  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCalendarEvent({ title: form.title, starts_at: new Date(form.starts_at).toISOString(), ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null, event_type: form.event_type, location: form.location, notes: form.notes, case_id: form.case_id ? Number(form.case_id) : null })
      setOpen(false); setForm({ ...form, title: '', location: '', notes: '' }); await load()
    } catch (err) { setError(errorMessage(err)) }
  }
  return <div className="p-6 space-y-5 overflow-auto h-full">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-foreground">Calendar</h1><p className="text-sm text-muted-foreground">Hearings and lawyer-created events in one schedule.</p></div><button onClick={() => setOpen(!open)} className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black flex items-center gap-2"><Plus size={15}/>Add event</button></div>
    {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
    {open && <form onSubmit={save} className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-3">
      <input required className={field} placeholder="Event title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
      <input required type="datetime-local" className={field} value={form.starts_at} onChange={e=>setForm({...form,starts_at:e.target.value})}/>
      <input type="datetime-local" className={field} value={form.ends_at} onChange={e=>setForm({...form,ends_at:e.target.value})}/>
      <select className={field} value={form.case_id} onChange={e=>setForm({...form,case_id:e.target.value})}><option value="">No case</option>{cases.map(c=><option key={c.id} value={c.id}>{c.case_number} — {c.title}</option>)}</select>
      <select className={field} value={form.event_type} onChange={e=>setForm({...form,event_type:e.target.value})}>{['Meeting','Deadline','Filing','Consultation','Personal'].map(x=><option key={x}>{x}</option>)}</select>
      <input className={field} placeholder="Location or video link" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/>
      <textarea className={`${field} md:col-span-2`} placeholder="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/><button className="rounded-lg bg-[#D4AF37] px-4 py-2 font-semibold text-black">Save event</button>
    </form>}
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border"><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}><ChevronLeft/></button><h2 className="font-bold">{month.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</h2><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}><ChevronRight/></button></div>
      <div className="grid grid-cols-7 border-b border-border">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><div key={d} className="p-2 text-center text-xs text-muted-foreground">{d}</div>)}</div>
      <div className="grid grid-cols-7">{cells.map((day,i)=>{ const inMonth=day>0&&day<=days; const items=inMonth?dated.filter(x=>{const d=new Date(x.date);return d.getFullYear()===month.getFullYear()&&d.getMonth()===month.getMonth()&&d.getDate()===day}):[]; return <div key={i} className="min-h-24 border-b border-r border-border/50 p-1.5"><span className={inMonth?'text-xs':'text-xs opacity-0'}>{day}</span>{items.map(x=><div key={x.id} className={`mt-1 rounded px-1.5 py-1 text-[10px] ${x.type==='Hearing'?'bg-purple-500/20 text-purple-300':'bg-[#D4AF37]/15 text-[#D4AF37]'}`} title={`${x.caseNumber||''} ${x.title}`}><div className="flex gap-1"><span className="truncate flex-1">{new Date(x.date).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} {x.title}</span>{x.eventId&&<button aria-label="Delete event" onClick={async()=>{await deleteCalendarEvent(x.eventId!);await load()}}><Trash2 size={10}/></button>}</div></div>)}</div>})}</div>
    </div>
    {!dated.length && <div className="text-center text-muted-foreground py-8"><CalendarDays className="mx-auto mb-2"/>No events yet. Add your first deadline, meeting, or consultation.</div>}
  </div>
}
