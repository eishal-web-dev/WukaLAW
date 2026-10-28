import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Star, Mail, Lock, Sun, Moon, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { errorMessage } from '../lib/api'
import { usePublicTokens } from '../components/PublicShell'
import { Avatar, Btn, Input } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'
import PortalSelector from '../components/PortalSelector'
import { portalHome, PORTAL_LABELS } from '../lib/portals'
import type { Portal } from '../lib/portals'
import { wukaIcon } from '../figma/assets'
import LanguageToggle from '../components/LanguageToggle'
import { useI18n } from '../lib/i18n'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [searchParams] = useSearchParams()
  const [portal, setPortal] = useState<Portal | null>(() => {
    const value = searchParams.get('portal')
    return value === 'client' || value === 'lawyer' ? value : null
  })
  const { dark, toggleDark, BG, SURF, TX, TX2, GA, BD } = usePublicTokens()
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!portal) {
      setError('Choose Client or Lawyer to continue.')
      return
    }
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setSubmitting(true)
    try {
      const user = await login(email.trim(), password, portal)
      navigate(portalHome(user.role), { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: BG, position: 'relative', fontFamily: 'Inter, sans-serif' }}>
      <div className="absolute end-5 top-5 z-10 flex gap-2">
        <LanguageToggle />
        <button onClick={toggleDark} aria-label={t('Toggle color theme')} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${BD}`, backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TX2 }}>{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
      </div>

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 border-r" style={{ backgroundColor: SURF, borderColor: BD }}>
        <button onClick={() => navigate('/')} className="flex items-center gap-3" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <img src={wukaIcon} alt="WukaLAW logo" className="w-10 h-10 object-contain" />
          <span style={{ color: TX, fontWeight: 700 }}>WukaLAW</span>
        </button>
        <div>
          <div className="flex mb-3 gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill={GA} color={GA} />
            ))}
          </div>
          <blockquote style={{ fontSize: 20, fontWeight: 500, color: TX, lineHeight: 1.6, marginBottom: 24 }}>
            "WukaLAW's explainable AI gives us the evidence trail we need to trust an answer before we act on it."
          </blockquote>
          <div className="flex items-center gap-3">
            <Avatar name="Legal Research Team" size="md" />
            <div>
              <div style={{ color: TX, fontWeight: 500 }}>Early access partner</div>
              <div style={{ color: TX2, fontSize: 14 }}>Pakistani legal research firm</div>
            </div>
          </div>
        </div>
        <div />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: BG }}>
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <img src={wukaIcon} alt="WukaLAW logo" className="w-10 h-10 object-contain" />
            <span style={{ color: TX, fontWeight: 700, fontSize: 18 }}>WukaLAW</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: TX, marginBottom: 4 }}>{t('Welcome back')}</h2>
          <p style={{ color: TX2, fontSize: 14, marginBottom: 32 }}>{t('Choose your portal, then sign in to your account.')}</p>

          <form onSubmit={submit} className="space-y-4">
            <PortalSelector value={portal} includeAdmin={false} onChange={(value) => {
              setPortal(value)
              setError(null)
            }} disabled={submitting} />
            {error && <ErrorAlert message={error} />}
            <div>
              <label htmlFor="login-email" style={{ fontSize: 12, fontWeight: 500, color: TX2, display: 'block', marginBottom: 6 }}>{t('Email address')}</label>
              <Input id="login-email" autoComplete="username" placeholder="you@example.com" value={email} onChange={setEmail} type="email" icon={<Mail size={14} />} required />
            </div>
            <div>
              <label htmlFor="login-password" style={{ fontSize: 12, fontWeight: 500, color: TX2, display: 'block', marginBottom: 6 }}>{t('Password')}</label>
              <Input
                id="login-password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={setPassword}
                type={showPassword ? 'text' : 'password'}
                icon={<Lock size={14} />}
                required
                endAction={(
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? t('Hide password') : t('Show password')}
                    aria-pressed={showPassword}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                )}
              />
            </div>
            <Btn type="submit" className="w-full justify-center" size="lg" disabled={submitting || !portal}>
              {submitting ? t('Signing in…') : portal ? `${t('Sign in as')} ${t(PORTAL_LABELS[portal])}` : t('Choose a portal to continue')}
            </Btn>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: TX2, marginTop: 32 }}>
            {t('No account?')}{' '}
            <button onClick={() => navigate(portal ? `/register?portal=${portal}` : '/register')} style={{ fontWeight: 500, color: GA, background: 'none', border: 'none', cursor: 'pointer' }}>
              {t('Create one')}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
