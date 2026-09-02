import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scale, Star, Mail, Lock, Sun, Moon } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { errorMessage } from '../lib/api'
import { usePublicTokens } from '../components/PublicShell'
import { Avatar, Btn, Input } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { dark, toggleDark, BG, SURF, TX, TX2, GA, BD } = usePublicTokens()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: BG, position: 'relative', fontFamily: 'Inter, sans-serif' }}>
      {/* Theme toggle */}
      <button
        onClick={toggleDark}
        style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, width: 36, height: 36, borderRadius: 10, border: `1px solid ${BD}`, backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TX2 }}
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 border-r" style={{ backgroundColor: SURF, borderColor: BD }}>
        <button onClick={() => navigate('/')} className="flex items-center gap-3" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: GA }}>
            <Scale size={16} color={dark ? '#0D1117' : '#FFFFFF'} />
          </div>
          <span style={{ color: TX, fontWeight: 700 }}>WakuLaw</span>
        </button>
        <div>
          <div className="flex mb-3 gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill={GA} color={GA} />
            ))}
          </div>
          <blockquote style={{ fontSize: 20, fontWeight: 500, color: TX, lineHeight: 1.6, marginBottom: 24 }}>
            "WakuLaw has given our firm a decisive edge. The AI predictions have been accurate in 91% of our cases this year."
          </blockquote>
          <div className="flex items-center gap-3">
            <Avatar name="Marcus Reid" size="md" />
            <div>
              <div style={{ color: TX, fontWeight: 500 }}>Dr. Marcus Reid</div>
              <div style={{ color: TX2, fontSize: 14 }}>Head of Legal Tech, Thornton Global</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[['94.2%', 'AI Accuracy'], ['50K+', 'Cases'], ['200+', 'Law Firms']].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontSize: 24, fontWeight: 700, color: GA }}>{v}</div>
              <div style={{ color: TX2, fontSize: 12, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: BG }}>
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: GA }}>
              <Scale size={16} color={dark ? '#0D1117' : '#FFFFFF'} />
            </div>
            <span style={{ color: TX, fontWeight: 700, fontSize: 18 }}>WakuLaw</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: TX, marginBottom: 4 }}>Welcome back</h2>
          <p style={{ color: TX2, fontSize: 14, marginBottom: 32 }}>Sign in to your WakuLaw account</p>

          <div className="space-y-4">
            {error && <ErrorAlert message={error} />}
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: TX2, display: 'block', marginBottom: 6 }}>Email address</label>
              <Input placeholder="you@lawfirm.com" value={email} onChange={setEmail} type="email" icon={<Mail size={14} />} required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: TX2, display: 'block', marginBottom: 6 }}>Password</label>
              <Input placeholder="••••••••" value={password} onChange={setPassword} type="password" icon={<Lock size={14} />} required />
            </div>
          </div>

          <Btn type="submit" className="w-full justify-center mt-6" size="lg" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in to WakuLaw'}
          </Btn>

          <p style={{ textAlign: 'center', fontSize: 14, color: TX2, marginTop: 32 }}>
            No account?{' '}
            <button type="button" onClick={() => navigate('/register')} style={{ fontWeight: 500, color: GA, background: 'none', border: 'none', cursor: 'pointer' }}>
              Create one
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
