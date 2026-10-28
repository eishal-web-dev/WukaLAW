import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, Calendar, Check, Mail, MapPin, Search, UserRound } from 'lucide-react'
import { PublicFooter, PublicNav } from './PublicPages'
import {
  errorMessage,
  getPublicLawyer,
  listPublicLawyers,
  requestConsultation,
  submitPublicContact,
  type PublicLawyer,
} from '../lib/api'

type PublicProps = { navigate: (page: string) => void; dark: boolean; toggleDark: () => void }

function PublicFrame({ children, navigate, dark, toggleDark, current }: PublicProps & { children: React.ReactNode; current: string }) {
  return (
    <div className={dark ? 'min-h-screen bg-[#07090F] text-white' : 'min-h-screen bg-[#F8F4EC] text-[#1A1005]'}>
      <PublicNav navigate={navigate} dark={dark} toggleDark={toggleDark} current={current} />
      {children}
      <PublicFooter navigate={navigate} dark={dark} />
    </div>
  )
}

const fieldClass = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#D4AF37]/70'

export function LiveContactPage(props: PublicProps) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setState('sending'); setError('')
    try {
      const result = await submitPublicContact(form)
      setState('sent')
      setForm({ name: '', email: '', subject: '', message: '' })
      if (!result.email_delivered) {
        setError('Your message was saved, but email delivery is not configured on the server yet.')
      }
    } catch (err) {
      setState('idle'); setError(errorMessage(err))
    }
  }

  return (
    <PublicFrame {...props} current="contact">
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="mb-8 text-center">
          <Mail className="mx-auto mb-4 text-[#D4AF37]" />
          <h1 className="text-3xl font-black sm:text-5xl">Contact WukaLAW</h1>
          <p className="mt-3 text-sm opacity-70 sm:text-base">Send us a message. It will be delivered to the WukaLAW team.</p>
        </div>
        <form onSubmit={submit} className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl sm:grid-cols-2 sm:p-8">
          <label className="text-sm">Name<input required minLength={2} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={fieldClass + ' mt-2'} /></label>
          <label className="text-sm">Email<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={fieldClass + ' mt-2'} /></label>
          <label className="text-sm sm:col-span-2">Subject<input required minLength={2} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className={fieldClass + ' mt-2'} /></label>
          <label className="text-sm sm:col-span-2">Message<textarea required minLength={10} rows={7} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className={fieldClass + ' mt-2 resize-y'} /></label>
          {state === 'sent' && <p className="text-sm text-emerald-400 sm:col-span-2">Your message has been received.</p>}
          {error && <p className="text-sm text-amber-400 sm:col-span-2">{error}</p>}
          <button disabled={state === 'sending'} className="min-h-12 rounded-xl bg-[#D4AF37] px-6 font-bold text-[#0D1117] disabled:opacity-50 sm:col-span-2">
            {state === 'sending' ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </main>
    </PublicFrame>
  )
}

const plans = [
  { name: 'Starter', description: 'For individual legal professionals', env: 'VITE_LEMONSQUEEZY_STARTER_URL', features: ['Case workspace', 'Documents and OCR', 'AI legal assistant'] },
  { name: 'Professional', description: 'For growing legal practices', env: 'VITE_LEMONSQUEEZY_PRO_URL', features: ['Everything in Starter', 'Similar-case research', 'Strategy and reports'] },
  { name: 'Firm', description: 'For legal teams and firms', env: 'VITE_LEMONSQUEEZY_FIRM_URL', features: ['Everything in Professional', 'Team workflows', 'Priority support'] },
]

export function LivePricingPage(props: PublicProps) {
  const env = import.meta.env as Record<string, string | undefined>
  return (
    <PublicFrame {...props} current="pricing">
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black sm:text-5xl">Choose your WukaLAW plan</h1>
          <p className="mt-3 opacity-70">Secure checkout is handled by Lemon Squeezy.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan, index) => {
            const checkout = env[plan.env] || env.VITE_LEMONSQUEEZY_CHECKOUT_URL
            return (
              <section key={plan.name} className={`flex flex-col rounded-3xl border p-6 ${index === 1 ? 'border-[#D4AF37] bg-[#D4AF37]/[0.06]' : 'border-white/10 bg-white/[0.03]'}`}>
                <h2 className="text-2xl font-black">{plan.name}</h2>
                <p className="mt-2 min-h-12 text-sm opacity-65">{plan.description}</p>
                <ul className="my-7 space-y-3">
                  {plan.features.map(feature => <li key={feature} className="flex gap-2 text-sm"><Check size={17} className="text-[#D4AF37]" />{feature}</li>)}
                </ul>
                <button
                  disabled={!checkout}
                  onClick={() => checkout && window.open(checkout, '_blank', 'noopener,noreferrer')}
                  className="mt-auto min-h-12 rounded-xl bg-[#D4AF37] px-5 font-bold text-[#0D1117] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {checkout ? 'Subscribe securely' : 'Checkout coming soon'}
                </button>
              </section>
            )
          })}
        </div>
      </main>
    </PublicFrame>
  )
}

function LawyerAvatar({ lawyer, large = false }: { lawyer: PublicLawyer; large?: boolean }) {
  const size = large ? 'h-40 w-40 text-4xl' : 'h-20 w-20 text-xl'
  if (lawyer.profile_image) return <img src={lawyer.profile_image} alt={lawyer.name} className={`${size} rounded-2xl object-cover`} />
  return <div className={`${size} grid place-items-center rounded-2xl bg-[#D4AF37] font-black text-[#0D1117]`}>{lawyer.name.split(' ').map(v => v[0]).join('').slice(0, 2)}</div>
}

export function LiveFindLawyerPage(props: PublicProps) {
  const [lawyers, setLawyers] = useState<PublicLawyer[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  useEffect(() => { listPublicLawyers().then(setLawyers).catch(err => setError(errorMessage(err))) }, [])
  const filtered = useMemo(() => {
    const value = query.toLowerCase().trim()
    return lawyers.filter(lawyer => !value || [lawyer.name, lawyer.specialization, lawyer.city, lawyer.lawyer_title].join(' ').toLowerCase().includes(value))
  }, [lawyers, query])

  return (
    <PublicFrame {...props} current="find-lawyer">
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="text-center">
          <UserRound className="mx-auto mb-4 text-[#D4AF37]" />
          <h1 className="text-3xl font-black sm:text-5xl">Find a WukaLAW lawyer</h1>
          <p className="mt-3 opacity-70">Only registered lawyer accounts are shown here. No demo profiles.</p>
        </div>
        <div className="relative mx-auto my-8 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" size={18} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, city or specialization" className={fieldClass + ' pl-11'} />
        </div>
        {error && <p className="rounded-xl bg-red-500/10 p-4 text-red-400">{error}</p>}
        {!error && filtered.length === 0 && <p className="py-16 text-center opacity-65">No registered lawyer profile matches this search.</p>}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(lawyer => (
            <article key={lawyer.id} className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <LawyerAvatar lawyer={lawyer} />
              <h2 className="mt-4 text-lg font-black">{lawyer.name}</h2>
              <p className="text-sm text-[#D4AF37]">{lawyer.lawyer_title || 'Lawyer'}</p>
              <p className="mt-2 text-sm opacity-70">{lawyer.specialization || 'General Practice'}</p>
              {lawyer.city && <p className="mt-2 flex items-center gap-1 text-xs opacity-60"><MapPin size={13}/>{lawyer.city}</p>}
              <button onClick={() => props.navigate(`lawyer-profile?id=${lawyer.id}`)} className="mt-5 min-h-11 rounded-xl border border-[#D4AF37]/50 font-bold text-[#D4AF37]">View profile</button>
            </article>
          ))}
        </div>
      </main>
    </PublicFrame>
  )
}

export function LiveLawyerProfilePage(props: PublicProps) {
  const id = Number(new URLSearchParams(window.location.search).get('id'))
  const [lawyer, setLawyer] = useState<PublicLawyer | null>(null)
  const [form, setForm] = useState({ client_name: '', client_email: '', client_phone: '', requested_at: '', notes: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState('')
  useEffect(() => {
    if (!Number.isInteger(id) || id < 1) { setError('Choose a lawyer from the directory first.'); return }
    getPublicLawyer(id).then(setLawyer).catch(err => setError(errorMessage(err)))
  }, [id])

  async function book(event: FormEvent) {
    event.preventDefault()
    if (!lawyer) return
    setStatus('sending'); setError('')
    try {
      await requestConsultation({ ...form, lawyer_id: lawyer.id, requested_at: new Date(form.requested_at).toISOString() })
      setStatus('sent')
    } catch (err) {
      setStatus('idle'); setError(errorMessage(err))
    }
  }

  return (
    <PublicFrame {...props} current="lawyer-profile">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <button onClick={() => props.navigate('find-lawyer')} className="mb-6 flex min-h-11 items-center gap-2 opacity-70"><ArrowLeft size={17}/>Back to lawyers</button>
        {error && !lawyer && <p className="rounded-xl bg-red-500/10 p-4 text-red-400">{error}</p>}
        {lawyer && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <LawyerAvatar lawyer={lawyer} large />
              <h1 className="mt-5 text-3xl font-black">{lawyer.name}</h1>
              <p className="text-[#D4AF37]">{lawyer.lawyer_title || 'Lawyer'}</p>
              <p className="mt-4 opacity-75">{lawyer.lawyer_bio || 'This lawyer has not added a professional biography yet.'}</p>
              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div><dt className="opacity-55">Specialization</dt><dd className="font-bold">{lawyer.specialization || 'General Practice'}</dd></div>
                <div><dt className="opacity-55">Experience</dt><dd className="font-bold">{lawyer.years_experience} years</dd></div>
                <div><dt className="opacity-55">City</dt><dd className="font-bold">{lawyer.city || 'Not provided'}</dd></div>
                <div><dt className="opacity-55">Consultation</dt><dd className="font-bold">{lawyer.consultation_fee ? `PKR ${lawyer.consultation_fee.toLocaleString()}` : 'Ask lawyer'}</dd></div>
              </dl>
            </section>
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="mb-5 flex items-center gap-2"><Calendar className="text-[#D4AF37]"/><h2 className="text-xl font-black">Request a consultation</h2></div>
              {!lawyer.accepting_consultations ? <p className="opacity-65">This lawyer is not accepting consultation requests right now.</p> : status === 'sent' ? (
                <div className="py-12 text-center"><Check className="mx-auto mb-3 text-emerald-400" size={34}/><h3 className="text-xl font-bold">Request sent</h3><p className="mt-2 opacity-65">The lawyer has received your consultation request and can contact you using the details provided.</p></div>
              ) : (
                <form onSubmit={book} className="grid gap-4">
                  <input required placeholder="Your name" value={form.client_name} onChange={e => setForm({...form, client_name:e.target.value})} className={fieldClass}/>
                  <input required type="email" placeholder="Your email" value={form.client_email} onChange={e => setForm({...form, client_email:e.target.value})} className={fieldClass}/>
                  <input placeholder="Phone number" value={form.client_phone} onChange={e => setForm({...form, client_phone:e.target.value})} className={fieldClass}/>
                  <label className="text-sm">Preferred date and time<input required type="datetime-local" value={form.requested_at} onChange={e => setForm({...form, requested_at:e.target.value})} className={fieldClass + ' mt-2'}/></label>
                  <textarea rows={4} placeholder="Briefly describe what you need help with" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} className={fieldClass}/>
                  {error && <p className="text-sm text-red-400">{error}</p>}
                  <button disabled={status === 'sending'} className="min-h-12 rounded-xl bg-[#D4AF37] font-bold text-[#0D1117] disabled:opacity-50">{status === 'sending' ? 'Sending…' : 'Send consultation request'}</button>
                </form>
              )}
            </section>
          </div>
        )}
      </main>
    </PublicFrame>
  )
}
