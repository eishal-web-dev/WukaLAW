import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import {
  deleteNotification,
  errorMessage,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATIONS_CHANGED_EVENT,
} from './api'
import type { Notification } from './api'
import { useAuth } from './auth'

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  markRead: (id: number) => Promise<void>
  markAllRead: () => Promise<void>
  remove: (id: number) => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!token) {
      setNotifications([])
      setUnreadCount(0)
      setError(null)
      return
    }
    setLoading(true)
    try {
      const result = await listNotifications({ limit: 100 })
      setNotifications(result.items)
      setUnreadCount(result.unread)
      setError(null)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void refresh()
    if (!token) return

    const onChanged = () => void refresh()
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged)
    const interval = window.setInterval(() => void refresh(), 30_000)
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged)
      window.clearInterval(interval)
    }
  }, [refresh, token])

  const markRead = useCallback(async (id: number) => {
    const wasUnread = notifications.some((item) => item.id === id && !item.read)
    setNotifications((items) => items.map((item) => (
      item.id === id ? { ...item, read: true } : item
    )))
    if (wasUnread) setUnreadCount((count) => Math.max(0, count - 1))
    try {
      await markNotificationRead(id)
      setError(null)
    } catch (err) {
      setError(errorMessage(err))
      await refresh()
      throw err
    }
  }, [notifications, refresh])

  const markAllRead = useCallback(async () => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })))
    setUnreadCount(0)
    try {
      await markAllNotificationsRead()
      setError(null)
    } catch (err) {
      setError(errorMessage(err))
      await refresh()
      throw err
    }
  }, [refresh])

  const remove = useCallback(async (id: number) => {
    const removed = notifications.find((item) => item.id === id)
    setNotifications((items) => items.filter((item) => item.id !== id))
    if (removed && !removed.read) setUnreadCount((count) => Math.max(0, count - 1))
    try {
      await deleteNotification(id)
      setError(null)
    } catch (err) {
      setError(errorMessage(err))
      await refresh()
      throw err
    }
  }, [notifications, refresh])

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
    remove,
  }), [notifications, unreadCount, loading, error, refresh, markRead, markAllRead, remove])

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- context + hook intentionally live together
export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider')
  return context
}
