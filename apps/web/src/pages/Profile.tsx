import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, LogOut, Hash, RefreshCw } from 'lucide-react'
import { getMe, listCases, listDocuments, errorMessage } from '../lib/api'
import type { User } from '../lib/api'
import { useAuth } from '../lib/auth'
import { formatDate } from '../lib/format'
import { Btn, Card, Badge, SectionHeader, G } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'

export default function Profile() {
  const navigate = useNavigate()
  const { user: cachedUser, logout } = useAuth()
  const [user, setUser] = useState<User | null>(cachedUser)
  const [caseCount, setCaseCount] = useState<number | null>(null)
  const [docCount, setDocCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getMe()
      .then((me) => {
        if (!cancelled) setUser(me)
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err))
      })
    Promise.all([listCases(), listDocuments()])
      .then(([cs, docs]) => {
        if (cancelled) return
        setCaseCount(cs.total)
        setDocCount(docs.total)
      })
      .catch(() => {
        // Counts are decorative here; header error is enough.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const name = user?.name || 'WakuLaw User'
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="p-8 space-y-7 overflow-y-auto h-full">
      <h1 className="text-2xl font-bold text-foreground">My Profile</h1>

      {error && <ErrorAlert message={error} />}

      {/* Profile header */}
      <Card className="p-6">
        <div className="flex items-start gap-5">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-[#0D1117] flex-shrink-0"
            style={{ backgroundColor: G }}
          >
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-foreground">{name}</h2>
              <Badge label={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member'} variant="Active" />
            </div>
            <div className="text-muted-foreground text-sm mb-3">WakuLaw · AI Legal Intelligence</div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Mail size={13} /> {user?.email ?? '—'}</span>
              <span className="flex items-center gap-1.5"><Hash size={13} /> Account ID {user?.id ?? '—'}</span>
            </div>
          </div>
          <Btn variant="danger" icon={<LogOut size={14} />} onClick={handleLogout}>
            Sign Out
          </Btn>
        </div>
      </Card>

      {/* Live stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          [caseCount === null ? '…' : String(caseCount), 'Cases'],
          [docCount === null ? '…' : String(docCount), 'Documents'],
        ].map(([v, l]) => (
          <Card key={l} className="p-4 text-center">
            <div className="text-2xl font-bold mb-1" style={{ color: G }}>{v}</div>
            <div className="text-xs text-muted-foreground">{l}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <SectionHeader title="Account" />
          <div className="space-y-3 text-sm">
            {[
              ['Name', name],
              ['Email', user?.email ?? '—'],
              ['User ID', user?.id !== undefined ? String(user.id) : '—'],
              ['Role', user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '—'],
              ['Member Since', user?.created_at ? formatDate(user.created_at) : '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{k}</span>
                <span className="text-foreground font-medium">{v}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <SectionHeader title="Session" />
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            You are signed in with a bearer token stored in this browser. Signing out clears the
            session from this device.
          </p>
          <div className="flex gap-2">
            <Btn variant="secondary" size="sm" icon={<RefreshCw size={12} />} onClick={() => window.location.reload()}>
              Refresh Session
            </Btn>
            <Btn variant="danger" size="sm" icon={<LogOut size={12} />} onClick={handleLogout}>
              Sign Out
            </Btn>
          </div>
        </Card>
      </div>
    </div>
  )
}
