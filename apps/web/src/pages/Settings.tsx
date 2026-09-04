import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import {
  errorMessage,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../lib/api'
import { Card, G } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'

const SECTIONS = [
  { id: 'general', label: 'General' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'ai', label: 'AI Preferences' },
  { id: 'security', label: 'Security' },
] as const

type Section = typeof SECTIONS[number]['id']

function Toggle({ label, on, toggle, disabled = false }: {
  label: string; on: boolean; toggle?: () => void; disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={on}
      disabled={disabled}
      onClick={toggle}
      className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 disabled:opacity-40 ${on ? '' : 'bg-muted-foreground/30'}`}
      style={on ? { backgroundColor: G } : {}}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${on ? 'left-5' : 'left-0.5'}`} />
    </button>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const [section, setSection] = useState<Section>('general')
  const [notifications, setNotifications] = useState(false)
  const [notificationLoading, setNotificationLoading] = useState(true)
  const [notificationLoaded, setNotificationLoaded] = useState(false)
  const [notificationSaving, setNotificationSaving] = useState(false)
  const [notificationError, setNotificationError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getNotificationPreferences()
      .then((preferences) => {
        if (cancelled) return
        setNotifications(preferences.in_app_enabled)
        setNotificationLoaded(true)
      })
      .catch((error) => { if (!cancelled) setNotificationError(errorMessage(error)) })
      .finally(() => { if (!cancelled) setNotificationLoading(false) })
    return () => { cancelled = true }
  }, [])

  const toggleNotifications = async () => {
    if (!notificationLoaded || notificationSaving) return
    const previous = notifications
    setNotifications(!previous)
    setNotificationSaving(true)
    setNotificationError(null)
    try {
      const preferences = await updateNotificationPreferences(!previous)
      setNotifications(preferences.in_app_enabled)
    } catch (error) {
      setNotifications(previous)
      setNotificationError(errorMessage(error))
    } finally {
      setNotificationSaving(false)
    }
  }

  return (
    <div className="p-8 space-y-7 overflow-y-auto h-full">
      <p className="text-sm text-muted-foreground">In-app notifications are saved automatically. Other preferences are not yet available.</p>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </div>

      {notificationError && <ErrorAlert message={notificationError} />}

      <div className="flex flex-col md:flex-row gap-6">
        <nav aria-label="Settings sections" className="md:w-48 flex-shrink-0 flex flex-col gap-1">
          {SECTIONS.map((item) => (
            <button
              type="button"
              key={item.id}
              aria-current={section === item.id ? 'page' : undefined}
              onClick={() => setSection(item.id)}
              className={`text-left text-sm px-4 py-3 rounded-lg ${section === item.id ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted/50'}`}
            >{item.label}</button>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          {section === 'general' && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">Account</h2>
              {[
                { label: 'Full Name', value: user?.name ?? '—' },
                { label: 'Email', value: user?.email ?? '—' },
              ].map((item) => (
                <div key={item.label} className="flex flex-wrap gap-3 items-center justify-between py-3 border-b border-border last:border-0">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <span className="text-sm text-muted-foreground break-all">{item.value}</span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground mt-4">Account editing is not yet available.</p>
            </Card>
          )}

          {section === 'notifications' && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">Notifications</h2>
              <div className="flex items-center justify-between gap-4 py-3 border-b border-border">
                <div>
                  <div className="text-sm text-foreground">In-app notifications</div>
                  <p className="text-xs text-muted-foreground mt-1" role="status">
                    {notificationLoading ? 'Loading preference…' : notificationSaving ? 'Saving…' : notificationLoaded ? 'Changes save automatically.' : 'Preference could not be loaded. Reload to try again.'}
                  </p>
                </div>
                <Toggle label="In-app notifications" on={notifications} toggle={() => void toggleNotifications()} disabled={!notificationLoaded || notificationSaving} />
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <div><div className="text-sm text-foreground">Email alerts for deadlines</div><p className="text-xs text-muted-foreground mt-1">Not yet available</p></div>
                <Toggle label="Email alerts for deadlines" on={false} disabled />
              </div>
            </Card>
          )}

          {section === 'ai' && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">AI Preferences</h2>
              <p className="text-xs text-muted-foreground mb-3">These preferences are not yet configurable.</p>
              {['AI Memory (case context retention)', 'Auto-analyze new documents', 'Similar case alerts'].map((label) => (
                <div key={label} className="text-sm text-foreground py-3 border-b border-border last:border-0">{label}</div>
              ))}
            </Card>
          )}

          {section === 'security' && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">Security</h2>
              <div className="text-sm text-foreground">Two-factor authentication</div>
              <p className="text-xs text-muted-foreground mt-1">Not yet available. Two-factor authentication is not enabled by this app.</p>
              <div className="text-sm text-foreground mt-5">Session timeout</div>
              <p className="text-xs text-muted-foreground mt-1">Managed by the server; not configurable here.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
