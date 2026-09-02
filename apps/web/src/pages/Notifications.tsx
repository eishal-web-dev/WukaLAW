import { useState } from 'react'
import { Sparkles, Briefcase, Settings } from 'lucide-react'
import { NOTIFICATIONS } from '../lib/mock'
import { Btn, Badge, G, B } from '../components/design'
import PreviewBanner from '../components/PreviewBanner'

export default function Notifications() {
  const [filter, setFilter] = useState('all')
  const [notifs, setNotifs] = useState(NOTIFICATIONS)
  const typeIcon: Record<string, React.ReactNode> = {
    ai: <Sparkles size={14} style={{ color: '#A78BFA' }} />,
    case: <Briefcase size={14} style={{ color: B }} />,
    system: <Settings size={14} className="text-muted-foreground" />,
  }
  const filtered = filter === 'all' ? notifs : notifs.filter((n) => n.type === filter)
  const unread = notifs.filter((n) => !n.read).length

  const markAllRead = () => setNotifs((ns) => ns.map((n) => ({ ...n, read: true })))
  const markRead = (id: number) => setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)))

  return (
    <div className="p-8 space-y-7 overflow-y-auto h-full">
      <PreviewBanner />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">{unread} unread notifications</p>
        </div>
        <Btn variant="secondary" size="sm" onClick={markAllRead} disabled={unread === 0}>Mark all read</Btn>
      </div>

      <div className="flex gap-2">
        {[{ id: 'all', label: 'All' }, { id: 'ai', label: 'AI Alerts' }, { id: 'case', label: 'Cases' }, { id: 'system', label: 'System' }].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.id ? 'text-[#0D1117]' : 'border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/[0.05]'}`}
            style={filter === f.id ? { backgroundColor: G } : {}}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((n) => (
          <button
            key={n.id}
            onClick={() => markRead(n.id)}
            className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer hover:border-white/10 w-full text-left ${!n.read ? 'border-white/[0.08]' : 'border-white/[0.04]'}`}
            style={{ backgroundColor: !n.read ? 'rgba(212,175,55,0.04)' : 'rgba(30,37,48,0.5)' }}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === 'ai' ? 'bg-purple-500/10' : n.type === 'case' ? 'bg-blue-500/10' : 'bg-white/[0.05]'}`}>
              {typeIcon[n.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: G }} />}
                    <div className="text-sm font-semibold text-foreground">{n.title}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.body}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{n.time}</span>
                  <Badge label={n.type === 'ai' ? 'AI Alert' : n.type === 'case' ? 'Case' : 'System'} variant={n.type} />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
