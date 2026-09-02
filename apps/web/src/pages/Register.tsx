import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scale, User, Mail, Lock } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { errorMessage } from '../lib/api'
import { usePublicTokens } from '../components/PublicShell'
import { Btn, Input } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { dark, BG, CARDBG, TX, TX2, GA, BD } = usePublicTokens()
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
      await register(form.email.trim(), form.name.trim(), form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: BG, fontFamily: 'Inter, sans-serif' }}>
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 mb-8 justify-center w-full" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: GA }}>
            <Scale size={18} color={dark ? '#0D1117' : '#FFFFFF'} />
          </div>
          <span style={{ color: TX, fontWeight: 700, fontSize: 20 }}>WakuLaw</span>
        </button>
        <form
          onSubmit={submit}
          style={{ padding: 32, borderRadius: 20, backgroundColor: CARDBG, border: `1px solid ${BD}`, boxShadow: dark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 20px 40px rgba(100,70,0,0.08)' }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, color: TX, marginBottom: 4 }}>Create your account</h2>
          <p style={{ color: TX2, fontSize: 14, marginBottom: 24 }}>Start using WakuLaw's AI legal intelligence.</p>
          <div className="space-y-4">
            {error && <ErrorAlert message={error} />}
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: TX2, display: 'block', marginBottom: 6 }}>Full name</label>
              <Input placeholder="Alexandra Weiss" value={form.name} onChange={set('name')} icon={<User size={14} />} required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: TX2, display: 'block', marginBottom: 6 }}>Work email</label>
              <Input placeholder="you@lawfirm.com" value={form.email} onChange={set('email')} type="email" icon={<Mail size={14} />} required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: TX2, display: 'block', marginBottom: 6 }}>Password</label>
              <Input placeholder="At least 8 characters" value={form.password} onChange={set('password')} type="password" icon={<Lock size={14} />} required />
            </div>
          </div>
          <Btn type="submit" className="w-full justify-center mt-6" size="lg" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create Account'}
          </Btn>
          <p style={{ textAlign: 'center', fontSize: 14, color: TX2, marginTop: 20 }}>
            Already have an account?{' '}
            <button type="button" onClick={() => navigate('/login')} style={{ fontWeight: 500, color: GA, background: 'none', border: 'none', cursor: 'pointer' }}>
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
