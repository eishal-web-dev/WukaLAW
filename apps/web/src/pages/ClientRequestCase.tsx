import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Check, CheckCircle2, FilePlus2, Mail, UserRound } from 'lucide-react'
import { errorMessage, listPublicLawyers, requestCase } from '../lib/api'
import type { PublicLawyer } from '../lib/api'
import { Card, G } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'

const CASE_TYPES = ['Civil', 'Criminal', 'Family', 'Property', 'Corporate', 'Labour', 'Tax', 'Constitutional', 'Other']
const TAGS: Record<string, string[]> = {
  Family: ['Divorce / Khula', 'Dower / Mehr', 'Dowry recovery', 'Maintenance', 'Child custody'],
  Civil: ['Money dispute', 'Contract', 'Recovery claim', 'Injunction', 'Damages'],
  Criminal: ['Bail', 'FIR', 'Trial', 'Appeal', 'Cybercrime'],
  Property: ['Ownership', 'Possession', 'Inheritance', 'Tenancy', 'Land dispute'],
  Corporate: ['Company dispute', 'Shareholders', 'Compliance', 'Commercial contract'],
  Labour: ['Employment', 'Unpaid wages', 'Termination', 'Workplace dispute'],
  Tax: ['Income tax', 'Sales tax', 'Notice', 'Appeal'],
  Constitutional: ['Fundamental rights', 'Writ petition', 'Public authority'],
  Other: ['Urgent', 'Advice needed', 'Court matter'],
}

export default function ClientRequestCase() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [caseType, setCaseType] = useState(CASE_TYPES[0])
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [lawyers, setLawyers] = useState<PublicLawyer[]>([])
  const [selectedLawyerId, setSelectedLawyerId] = useState<number | null>(null)
  const [custom, setCustom] = useState(false)
  const [lawyerEmail, setLawyerEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loadingLawyers, setLoadingLawyers] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<{ caseNumber: string; lawyer: string } | null>(null)

  useEffect(() => {
    listPublicLawyers().then(items => setLawyers(items.filter(item => item.accepting_consultations))).catch(err => setError(errorMessage(err))).finally(() => setLoadingLawyers(false))
  }, [])
  useEffect(() => { setTags([]); setSelectedLawyerId(null) }, [caseType])

  const matchingLawyers = useMemo(() => {
    const terms = [caseType, ...tags].map(item => item.toLowerCase())
    const score = (lawyer: PublicLawyer) => terms.filter(term => lawyer.specialization.toLowerCase().includes(term.split(' ')[0])).length
    return [...lawyers].sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name))
  }, [caseType, tags, lawyers])
  const chosen = lawyers.find(item => item.id === selectedLawyerId)
  const hasLawyer = custom ? /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lawyerEmail.trim()) : selectedLawyerId !== null
  const canSubmit = title.trim().length >= 3 && description.trim().length >= 10 && tags.length > 0 && hasLawyer && !submitting
  const toggleTag = (tag: string) => setTags(current => current.includes(tag) ? current.filter(item => item !== tag) : [...current, tag].slice(0, 8))

  const submit = async () => {
    if (!canSubmit) return
    setSubmitting(true); setError(null)
    try {
      const result = await requestCase({
        title: title.trim(), case_type: caseType, description: description.trim(), tags,
        ...(custom ? { lawyer_email: lawyerEmail.trim() } : { lawyer_id: selectedLawyerId! }),
      })
      setSubmitted({ caseNumber: result.case_number, lawyer: result.requested_lawyer_name || chosen?.name || lawyerEmail.trim() })
    } catch (err) { setError(errorMessage(err)) } finally { setSubmitting(false) }
  }

  if (submitted) return <div className="mx-auto max-w-lg p-6 sm:p-8"><Card className="space-y-3 p-8 text-center"><CheckCircle2 size={34} className="mx-auto text-emerald-400"/><h2 className="text-lg font-bold">Case request sent</h2><p className="text-sm text-muted-foreground">Your case <span className="font-mono" style={{ color: G }}>{submitted.caseNumber}</span> was sent to <b className="text-foreground">{submitted.lawyer}</b>. It will show “Waiting for lawyer” until they accept it.</p><button onClick={() => navigate('/client/cases')} className="mt-2 rounded-xl px-4 py-2 text-sm font-semibold text-black" style={{ background: G }}>View My Cases</button></Card></div>

  return <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6 lg:p-8">
    <header><div className="flex items-center gap-2"><FilePlus2 size={19} style={{ color: G }}/><h1 className="text-xl font-bold">Start a New Case</h1></div><p className="mt-2 text-sm text-muted-foreground">Add your matter, choose the issues involved, then invite one lawyer to work with you.</p></header>
    {error && <ErrorAlert message={error}/>}
    <Card className="space-y-5 p-5">
      <div><label htmlFor="request-title" className="mb-1.5 block text-xs font-semibold text-muted-foreground">Case title</label><input id="request-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Recovery of unpaid dower" className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm"/></div>
      <div><label htmlFor="request-type" className="mb-1.5 block text-xs font-semibold text-muted-foreground">Case category</label><select id="request-type" value={caseType} onChange={e => setCaseType(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm">{CASE_TYPES.map(item => <option key={item}>{item}</option>)}</select></div>
      <div><p className="mb-2 text-xs font-semibold text-muted-foreground">Choose relevant tags *</p><div className="flex flex-wrap gap-2">{TAGS[caseType].map(tag => <button type="button" key={tag} onClick={() => toggleTag(tag)} className={`rounded-full border px-3 py-1.5 text-xs ${tags.includes(tag) ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-border text-muted-foreground'}`}>{tags.includes(tag) && <Check size={12} className="mr-1 inline"/>}{tag}</button>)}</div></div>
      <div><label htmlFor="request-description" className="mb-1.5 block text-xs font-semibold text-muted-foreground">What is the case about?</label><textarea id="request-description" value={description} onChange={e => setDescription(e.target.value)} rows={6} placeholder="Include the important dates, what happened, what the other side says, and what result you need." className="w-full resize-y rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm"/>{description.trim().length > 0 && description.trim().length < 10 && <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-400"><AlertCircle size={12}/>Please add a few more details.</div>}</div>
    </Card>
    <Card className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold">Choose a lawyer</h2><p className="mt-1 text-xs text-muted-foreground">Lawyers matching {caseType} and your selected tags appear first.</p></div><button type="button" onClick={() => { setCustom(value => !value); setSelectedLawyerId(null) }} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold"><Mail size={13} className="mr-1.5 inline"/>{custom ? 'Choose from WukaLAW' : 'Add a lawyer by email'}</button></div>
      {custom ? <div className="mt-4"><label htmlFor="lawyer-email" className="mb-1.5 block text-xs font-semibold text-muted-foreground">Registered lawyer email</label><input id="lawyer-email" type="email" value={lawyerEmail} onChange={e => setLawyerEmail(e.target.value)} placeholder="lawyer@example.com" className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm"/><p className="mt-2 text-xs text-muted-foreground">For privacy, the lawyer must already have a WukaLAW lawyer account.</p></div> : loadingLawyers ? <p className="py-8 text-center text-sm text-muted-foreground">Loading lawyers…</p> : <div className="mt-4 grid gap-3 sm:grid-cols-2">{matchingLawyers.map(lawyer => <button type="button" key={lawyer.id} onClick={() => setSelectedLawyerId(lawyer.id)} className={`flex items-center gap-3 rounded-xl border p-3 text-left ${selectedLawyerId === lawyer.id ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-border'}`}>{lawyer.profile_image ? <img src={lawyer.profile_image} alt="" className="h-11 w-11 rounded-full object-cover"/> : <span className="grid h-11 w-11 place-items-center rounded-full bg-muted"><UserRound size={19}/></span>}<span className="min-w-0 flex-1"><b className="block truncate text-sm">{lawyer.name}</b><span className="block truncate text-xs text-muted-foreground">{lawyer.specialization}{lawyer.city ? ` · ${lawyer.city}` : ''}</span></span>{selectedLawyerId === lawyer.id && <CheckCircle2 size={18} style={{ color: G }}/>}</button>)}{!matchingLawyers.length && <p className="text-sm text-muted-foreground">No lawyers are currently accepting requests.</p>}</div>}
    </Card>
    <button type="button" onClick={() => void submit()} disabled={!canSubmit} className="w-full rounded-xl py-3 font-semibold text-black disabled:opacity-40" style={{ background: G }}>{submitting ? 'Sending request…' : 'Send Case Request to Lawyer'}</button>
  </div>
}
