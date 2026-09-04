import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import {
  errorMessage,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../lib/api'
import { Btn, Card, G } from '../components/design'
import PreviewBanner from '../components/PreviewBanner'
import ErrorAlert from '../components/ErrorAlert'

const Toggle = ({ on, toggle }: { on: boolean; toggle: () => void }) => (
  <button
    onClick={toggle}
    className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${on ? '' : 'bg-white/20'}`}
    style={on ? { backgroundColor: G } : {}}
  >
    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${on ? 'left-5' : 'left-0.5'}`} />
  </button>
)

export default function Settings() {
  const { user } = useAuth()
  const [section, setSection] = useState('general')
  const [notifications, setNotifications] = useState(true)
  const [notificationSaving, setNotificationSaving] = useState(false)
  const [notificationError, setNotificationError] = useState<string | null>(null)
  const [emailAlerts, setEmailAlerts] = useState(false)
  const [aiMemory, setAiMemory] = useState(true)
  const [autoAnalyze, setAutoAnalyze] = useState(true)
  const [similarAlerts, setSimilarAlerts] = useState(true)
  const [twoFactor, setTwoFactor] = useState(true)

  useEffect(() => {
    getNotificationPreferences()
      .then((preferences) => setNotifications(preferences.in_app_enabled))
      .catch((error) => setNotificationError(errorMessage(error)))
  }, [])

  const toggleNotifications = async () => {
    if (notificationSaving) return
    const next = !notifications
    setNotifications(next)
    setNotificationSaving(true)
    setNotificationError(null)
    try {
      await updateNotificationPreferences(next)
    } catch (error) {
      setNotifications(!next)
      setNotificationError(errorMessage(error))
    } finally {
      setNotificationSaving(false)
    }
  }

  const Toggle = ({ on, toggle }: { on: boolean; toggle: () => void }) => (
    <button
      onClick={toggle}
      className={`w-10 h-5 rounded-full transition-colors relative ${on ? '' : 'bg-white/20'}`}
      style={on ? { backgroundColor: G } : {}}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${on ? 'left-5' : 'left-0.5'}`} />
    </button>
  )

  interface SettingItem {
    label: string
    type: 'input' | 'select' | 'toggle'
    value: string | boolean
    toggle?: () => void
  }

  const sections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Account',
      items: [
        { label: 'Full Name', type: 'input', value: user?.name ?? '—' },
        { label: 'Email', type: 'input', value: user?.email ?? '—' },
        { label: 'Time Zone', type: 'select', value: 'PKT (UTC+5)' },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { label: 'In-app notifications', type: 'toggle', value: notifications, toggle: () => void toggleNotifications() },
        { label: 'Email alerts for deadlines', type: 'toggle', value: emailAlerts, toggle: () => setEmailAlerts(!emailAlerts) },
      ],
    },
    {
      title: 'AI Settings',
      items: [
        { label: 'AI Memory (case context retention)', type: 'toggle', value: aiMemory, toggle: () => setAiMemory(!aiMemory) },
        { label: 'Auto-analyze new documents', type: 'toggle', value: true, toggle: () => {} },
        { label: 'AI Model Version', type: 'select', value: 'v4.2 (Latest)' },
      ],
    },
    {
      title: 'Security',
      items: [
        { label: 'Two-factor authentication', type: 'toggle', value: twoFactor, toggle: () => setTwoFactor(!twoFactor) },
        { label: 'Session timeout', type: 'select', value: '4 hours' },
      ],
    },
  ]

  return (
    <div className="p-8 space-y-7 overflow-y-auto h-full">
      <PreviewBanner note="In-app notifications are saved. Other settings are preview-only." />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </div>

      {notificationError && <ErrorAlert message={notificationError} />}

      {sections.map((section) => (
        <Card key={section.title} className="overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06]" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {section.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-5 py-4">
                <div className="text-sm text-foreground">{item.label}</div>
                {item.type === 'toggle' ? (
                  <Toggle on={item.value as boolean} toggle={item.toggle ?? (() => {})} />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{item.value as string}</span>
                    <button className="text-xs px-2 py-1 border border-white/10 rounded-lg text-muted-foreground hover:text-foreground transition-colors">Edit</button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {section === 'notifications' && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Notifications</h3>
              <div className="space-y-1">
                {[
                  { label: 'In-app notifications', on: notifications, toggle: () => setNotifications((v) => !v) },
                  { label: 'Email alerts for deadlines', on: emailAlerts, toggle: () => setEmailAlerts((v) => !v) },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                    <span className="text-sm text-foreground">{item.label}</span>
                    <Toggle on={item.on} toggle={item.toggle} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {section === 'ai' && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">AI Preferences</h3>
              <div className="space-y-1">
                {[
                  { label: 'AI Memory (case context retention)', desc: 'Keep prior chat context within a case.', on: aiMemory, toggle: () => setAiMemory((v) => !v) },
                  { label: 'Auto-analyze new documents', desc: 'Summarize documents automatically after upload.', on: autoAnalyze, toggle: () => setAutoAnalyze((v) => !v) },
                  { label: 'Similar case alerts', desc: 'Notify when a newly filed case looks similar to yours.', on: similarAlerts, toggle: () => setSimilarAlerts((v) => !v) },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                    <div>
                      <div className="text-sm text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                    </div>
                    <Toggle on={item.on} toggle={item.toggle} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {section === 'security' && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Security</h3>
              <div className="space-y-1">
                <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                  <span className="text-sm text-foreground">Two-factor authentication</span>
                  <Toggle on={twoFactor} toggle={() => setTwoFactor((v) => !v)} />
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-foreground">Session timeout</span>
                  <span className="text-sm text-muted-foreground">4 hours</span>
                </div>
              </div>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Btn variant="secondary">Reset Defaults</Btn>
            <Btn>Save Changes</Btn>
          </div>
        </div>
      </div>
    </div>
  )
}
