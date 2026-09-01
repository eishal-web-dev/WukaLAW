import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, CheckCircle2, Settings, Sparkles, Trash2 } from 'lucide-react'
import type { NotificationType } from '../lib/api'
import { useNotifications } from '../lib/notifications'
import { formatRelativeTime } from '../lib/format'
import { Btn, Badge, G, B } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'

type NotificationFilter = 'all' | NotificationType

export default function Notifications() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markRead,
    markAllRead,
    remove,
  } = useNotifications()

  const typeIcon: Record<NotificationType, React.ReactNode> = {
    ai: <Sparkles size={14} style={{ color: '#A78BFA' }} />,
    case: <Briefcase size={14} style={{ color: B }} />,
    system: <Settings size={14} className="text-muted-foreground" />,
  }
  const filtered = filter === 'all'
    ? notifications
    : notifications.filter((notification) => notification.type === filter)

  const openNotification = async (id: number, read: boolean, actionUrl: string | null) => {
    if (!read) await markRead(id)
    if (actionUrl) navigate(actionUrl)
  }

  return (
    <div className="p-8 space-y-7 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
          </p>
        </div>
        <Btn
          variant="secondary"
          size="sm"
          disabled={unreadCount === 0 || loading}
          onClick={() => void markAllRead()}
        >
          Mark all read
        </Btn>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'All' },
          { id: 'ai', label: 'AI Alerts' },
          { id: 'case', label: 'Cases' },
          { id: 'system', label: 'System' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as NotificationFilter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === item.id ? 'text-[#0D1117]' : 'border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/[0.05]'}`}
            style={filter === item.id ? { backgroundColor: G } : {}}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {loading && notifications.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading notifications…</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center rounded-2xl border border-white/[0.05] text-sm text-muted-foreground">
            {filter === 'all' ? 'No notifications yet.' : `No ${filter} notifications.`}
          </div>
        )}
        {filtered.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start gap-2 p-4 rounded-2xl border transition-all hover:border-white/15 ${!notification.read ? 'border-white/[0.08]' : 'border-white/[0.04]'}`}
            style={{ backgroundColor: !notification.read ? 'rgba(212,175,55,0.04)' : 'rgba(30,37,48,0.5)' }}
          >
            <button
              type="button"
              onClick={() => void openNotification(
                notification.id,
                notification.read,
                notification.action_url,
              )}
              className="flex items-start gap-4 flex-1 min-w-0 text-left cursor-pointer"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${notification.type === 'ai' ? 'bg-purple-500/10' : notification.type === 'case' ? 'bg-blue-500/10' : 'bg-white/[0.05]'}`}>
                {typeIcon[notification.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: G }} />
                      )}
                      <div className="text-sm font-semibold text-foreground">{notification.title}</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notification.body}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(notification.created_at)}
                    </span>
                    <Badge
                      label={notification.type === 'ai' ? 'AI Alert' : notification.type === 'case' ? 'Case' : 'System'}
                      variant={notification.type}
                    />
                  </div>
                </div>
              </div>
            </button>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              {!notification.read && (
                <button
                  type="button"
                  title="Mark as read"
                  onClick={() => void markRead(notification.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
                >
                  <CheckCircle2 size={14} />
                </button>
              )}
              <button
                type="button"
                title="Delete notification"
                onClick={() => void remove(notification.id)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
