import { ChangeEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Hash, LogOut, Mail, RefreshCw, Save } from 'lucide-react'
import {
  errorMessage, getMe, getPublicLawyer, listCases, listDocuments, updateLawyerProfile,
  type LawyerProfilePayload, type PublicLawyer, type User,
} from '../lib/api'
import { useAuth } from '../lib/auth'
import { formatDate } from '../lib/format'
import { Badge, Btn, Card, G, SectionHeader } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'

const emptyProfile: LawyerProfilePayload = {
  profile_image: null,
  lawyer_title: '',
  specialization: '',
  city: '',
  years_experience: 0,
  consultation_fee: 0,
  lawyer_bio: '',
  accepting_consultations: true,
}

export default function Profile() {
  const navigate = useNavigate()
  const { user: cachedUser, logout } = useAuth()
  const [user, setUser] = useState<User | null>(cachedUser)
  const [lawyer, setLawyer] = useState<PublicLawyer | null>(null)
  const [profile, setProfile] = useState<LawyerProfilePayload>(emptyProfile)
  const [caseCount, setCaseCount] = useState<number | null>(null)
  const [docCount, setDocCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    getMe().then(async me => {
      if (cancelled) return
      setUser(me)
      if (me.role === 'lawyer') {
        const publicProfile = await getPublicLawyer(me.id)
        if (cancelled) return
        setLawyer(publicProfile)
        setProfile({
          profile_image: publicProfile.profile_image,
          lawyer_title: publicProfile.lawyer_title,
          specialization: publicProfile.specialization,
          city: publicProfile.city,
          years_experience: publicProfile.years_experience,
          consultation_fee: publicProfile.consultation_fee,
          lawyer_bio: publicProfile.lawyer_bio,
          accepting_consultations: publicProfile.accepting_consultations,
        })
      }
    }).catch(err => !cancelled && setError(errorMessage(err)))
    Promise.all([listCases(), listDocuments()]).then(([cs, docs]) => {
      if (!cancelled) { setCaseCount(cs.total); setDocCount(docs.total) }
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [])

  const name = user?.name || 'WukaLAW User'
  const initials = name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Choose an image file.'); return }
    if (file.size > 1_500_000) { setError('Profile photo must be 1.5 MB or smaller.'); return }
    const reader = new FileReader()
    reader.onload = () => setProfile(current => ({ ...current, profile_image: String(reader.result) }))
    reader.readAsDataURL(file)
  }

  async function saveProfile() {
    setSaving(true); setSaved(false); setError(null)
    try {
      const result = await updateLawyerProfile(profile)
      setLawyer(result); setSaved(true)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const inputClass = 'w-full rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50'

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
      {error && <ErrorAlert message={error} />}

      <Card className="p-4 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="relative h-20 w-20 flex-shrink-0">
            {profile.profile_image ? <img src={profile.profile_image} alt={name} className="h-20 w-20 rounded-2xl object-cover" /> : (
              <div className="grid h-20 w-20 place-items-center rounded-2xl text-3xl font-bold text-[#0D1117]" style={{ backgroundColor: G }}>{initials}</div>
            )}
            {user?.role === 'lawyer' && <label className="absolute -bottom-2 -right-2 grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-border bg-background text-foreground shadow-lg" title="Upload profile photo">
              <Camera size={15}/><input type="file" accept="image/*" className="hidden" onChange={handlePhoto}/>
            </label>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">{name}</h2>
              <Badge label={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member'} variant="Active" />
            </div>
            <div className="mb-3 text-sm text-muted-foreground">WukaLAW · AI Legal Intelligence</div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Mail size={13}/>{user?.email ?? '—'}</span>
              <span className="flex items-center gap-1.5"><Hash size={13}/>Account ID {user?.id ?? '—'}</span>
            </div>
          </div>
          <Btn variant="danger" icon={<LogOut size={14}/>} onClick={handleLogout}>Sign Out</Btn>
        </div>
      </Card>

      {user?.role === 'lawyer' && (
        <Card className="p-4 sm:p-6">
          <SectionHeader title="Public lawyer profile" />
          <p className="mb-5 text-xs leading-relaxed text-muted-foreground">These details and your uploaded photo appear on the public Find a Lawyer page. Only information you save here is published.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs text-muted-foreground">Professional title<input value={profile.lawyer_title} onChange={e => setProfile({...profile, lawyer_title:e.target.value})} className={inputClass + ' mt-2'} placeholder="Advocate, Barrister, Partner…"/></label>
            <label className="text-xs text-muted-foreground">Specialization<input value={profile.specialization} onChange={e => setProfile({...profile, specialization:e.target.value})} className={inputClass + ' mt-2'} placeholder="Family law, corporate law…"/></label>
            <label className="text-xs text-muted-foreground">City<input value={profile.city} onChange={e => setProfile({...profile, city:e.target.value})} className={inputClass + ' mt-2'} placeholder="Peshawar"/></label>
            <label className="text-xs text-muted-foreground">Years of experience<input type="number" min={0} max={80} value={profile.years_experience} onChange={e => setProfile({...profile, years_experience:Number(e.target.value)})} className={inputClass + ' mt-2'}/></label>
            <label className="text-xs text-muted-foreground">Consultation fee (PKR)<input type="number" min={0} value={profile.consultation_fee} onChange={e => setProfile({...profile, consultation_fee:Number(e.target.value)})} className={inputClass + ' mt-2'}/></label>
            <label className="flex items-center gap-3 self-end rounded-xl border border-border px-3 py-3 text-sm text-foreground"><input type="checkbox" checked={profile.accepting_consultations} onChange={e => setProfile({...profile, accepting_consultations:e.target.checked})}/>Accept consultation requests</label>
            <label className="text-xs text-muted-foreground sm:col-span-2">Professional biography<textarea rows={5} value={profile.lawyer_bio} onChange={e => setProfile({...profile, lawyer_bio:e.target.value})} className={inputClass + ' mt-2 resize-y'} placeholder="Describe your practice, qualifications and experience."/></label>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Btn icon={<Save size={14}/>} onClick={() => void saveProfile()} disabled={saving}>{saving ? 'Saving…' : 'Save public profile'}</Btn>
            {saved && <span className="text-xs text-emerald-400">Profile saved and published.</span>}
            {lawyer && <button onClick={() => navigate(`/lawyer-profile?id=${lawyer.id}`)} className="text-xs font-semibold text-primary">View public profile</button>}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[[caseCount === null ? '…' : String(caseCount), 'Cases'], [docCount === null ? '…' : String(docCount), 'Documents']].map(([value, label]) => (
          <Card key={label} className="p-4 text-center"><div className="mb-1 text-2xl font-bold" style={{ color: G }}>{value}</div><div className="text-xs text-muted-foreground">{label}</div></Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <SectionHeader title="Account" />
          <div className="space-y-3 text-sm">
            {[['Name', name], ['Email', user?.email ?? '—'], ['User ID', user?.id !== undefined ? String(user.id) : '—'], ['Role', user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '—'], ['Member Since', user?.created_at ? formatDate(user.created_at) : '—']].map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4 text-xs"><span className="text-muted-foreground">{key}</span><span className="text-right font-medium text-foreground">{value}</span></div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <SectionHeader title="Session" />
          <p className="mb-4 text-xs leading-relaxed text-muted-foreground">You are signed in with a bearer token stored in this browser. Signing out clears the session from this device.</p>
          <div className="flex flex-wrap gap-2">
            <Btn variant="secondary" size="sm" icon={<RefreshCw size={12}/>} onClick={() => window.location.reload()}>Refresh Session</Btn>
            <Btn variant="danger" size="sm" icon={<LogOut size={12}/>} onClick={handleLogout}>Sign Out</Btn>
          </div>
        </Card>
      </div>
    </div>
  )
}
