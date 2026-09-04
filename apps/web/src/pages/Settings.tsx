import { useState } from 'react'
import { Settings as SettingsIcon, Bell, Sparkles, Shield } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { Btn, Card, G } from '../components/design'
import PreviewBanner from '../components/PreviewBanner'

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
  const [emailAlerts, setEmailAlerts] = useState(false)
  const [aiMemory, setAiMemory] = useState(true)
  const [autoAnalyze, setAutoAnalyze] = useState(true)
  const [similarAlerts, setSimilarAlerts] = useState(true)
  const [twoFactor, setTwoFactor] = useState(true)

  const sections = [
    { id: 'general', label: 'General', icon: <SettingsIcon size={14} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={14} /> },
    { id: 'ai', label: 'AI Preferences', icon: <Sparkles size={14} /> },
    { id: 'security', label: 'Security', icon: <Shield size={14} /> },
  ]

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-full">
      <PreviewBanner note="Settings are not persisted yet." />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="sm:w-44 flex-shrink-0 flex sm:flex-col gap-1 overflow-x-auto">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm font-medium transition-all whitespace-nowrap"
              style={section === s.id ? { background: `${G}22`, color: G } : { color: 'var(--muted-foreground)' }}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-4">
          {section === 'general' && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Account</h3>
              <div className="space-y-3">
                {[
                  ['Full Name', user?.name ?? '—'],
                  ['Email', user?.email ?? '—'],
                  ['User ID', user?.id !== undefined ? String(user.id) : '—'],
                  ['Time Zone', 'PKT (UTC+5)'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm text-foreground font-medium">{value}</span>
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
