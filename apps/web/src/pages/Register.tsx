import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Scale, User, Mail, Lock, Sun, Moon } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { errorMessage } from '../lib/api'
import { usePublicTokens } from '../components/PublicShell'
import { Btn, Input } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'
import PortalSelector from '../components/PortalSelector'
import { portalHome } from '../lib/portals'
import type { SignupRole } from '../lib/portals'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [searchParams] = useSearchParams()
  const [role, setRole] = useState<SignupRole>(() => searchParams.get('portal') === 'client' ? 'client' : 'lawyer')
  const { dark, toggleDark, BG, CARDBG, TX, TX2, GA, BD } = usePublicTokens()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.name.trim() || !form.email.trim()) {
      setError('Please fill in your name and email.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setSubmitting(true)
    try {
      const user = await register(form.email.trim(), form.name.trim(), form.password, role)
      navigate(portalHome(user.role), { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: BG, position: 'relative', fontFamily: 'Inter, sans-serif' }}>
      <button
        onClick={toggleDark}
        aria-label="Toggle theme"
        style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, width: 36, height: 36, borderRadius: 10, border: `1px solid ${BD}`, backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TX2 }}
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 mb-8 justify-center w-full" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: GA }}>
            <Scale size={18} color={dark ? '#0D1117' : '#FFFFFF'} />
          </div>
          <span style={{ color: TX, fontWeight: 700, fontSize: 20 }}>WukaLAW</span>
        </button>
        <form
          onSubmit={submit}
          style={{ padding: 32, borderRadius: 20, backgroundColor: CARDBG, border: `1px solid ${BD}`, boxShadow: dark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 20px 40px rgba(100,70,0,0.08)' }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, color: TX, marginBottom: 4 }}>Create your account</h2>
          <p style={{ color: TX2, fontSize: 14, marginBottom: 24 }}>Start using WukaLAW's explainable AI legal intelligence.</p>
          <div className="space-y-4">
            <PortalSelector value={role} onChange={(value) => { if (value !== 'admin') setRole(value) }} includeAdmin={false} disabled={submitting} />
            {error && <ErrorAlert message={error} />}
            <div>
              <label htmlFor="register-name" style={{ fontSize: 12, fontWeight: 500, color: TX2, display: 'block', marginBottom: 6 }}>Full name</label>
              <Input id="register-name" autoComplete="name" placeholder="Alexandra Weiss" value={form.name} onChange={set('name')} icon={<User size={14} />} required />
            </div>
            <div>
              <label htmlFor="register-email" style={{ fontSize: 12, fontWeight: 500, color: TX2, display: 'block', marginBottom: 6 }}>Email address</label>
              <Input id="register-email" autoComplete="email" placeholder="you@lawfirm.com" value={form.email} onChange={set('email')} type="email" icon={<Mail size={14} />} required />
            </div>
            <div>
              <label htmlFor="register-password" style={{ fontSize: 12, fontWeight: 500, color: TX2, display: 'block', marginBottom: 6 }}>Password</label>
              <Input id="register-password" autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={set('password')} type="password" icon={<Lock size={14} />} required />
            </div>
          </div>
          <Btn type="submit" className="w-full justify-center mt-6" size="lg" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create Account'}
          </Btn>
          <p style={{ textAlign: 'center', fontSize: 14, color: TX2, marginTop: 20 }}>
            Already have an account?{' '}
            <button type="button" onClick={() => navigate(`/login?portal=${role}`)} style={{ fontWeight: 500, color: GA, background: 'none', border: 'none', cursor: 'pointer' }}>
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
