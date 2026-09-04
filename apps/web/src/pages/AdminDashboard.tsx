import { useEffect, useState } from 'react'
import { Users, Briefcase, FileText, Activity } from 'lucide-react'
import { adminGetStats, adminListUsers, errorMessage } from '../lib/api'
import type { AdminStats, AdminUser } from '../lib/api'
import { Card, KPICard, Badge } from '../components/design'
import { formatDate } from '../lib/format'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([adminGetStats(), adminListUsers()])
      .then(([s, u]) => {
        if (cancelled) return
        setStats(s)
        setUsers(u)
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="p-8 space-y-7 overflow-y-auto h-full">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Platform Admin</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Real usage across every account on this deployment — every number below is a live count.
        </p>
      </div>

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <div className="py-16 flex justify-center">
          <Spinner label="Loading platform data…" />
        </div>
      ) : stats && !error ? (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <KPICard icon={<Users size={18} />} label="Total Users" value={String(stats?.total_users ?? 0)} color="#D4AF37" />
            <KPICard icon={<Briefcase size={18} />} label="Total Cases" value={String(stats?.total_cases ?? 0)} sub={`${stats?.active_cases ?? 0} active`} color="#8B5CF6" />
            <KPICard icon={<FileText size={18} />} label="Total Documents" value={String(stats?.total_documents ?? 0)} color="#3B82F6" />
            <KPICard icon={<Activity size={18} />} label="Active Cases" value={String(stats?.active_cases ?? 0)} color="#10B981" />
          </div>

          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-foreground">All Users ({users.length})</h3>
            </div>
            {users.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">No users yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Name', 'Email', 'Role', 'Cases', 'Documents', 'Joined'].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id} className={`border-b border-white/[0.03] ${i === users.length - 1 ? 'border-0' : ''}`}>
                        <td className="px-5 py-3 text-foreground font-medium">{u.name}</td>
                        <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-5 py-3">
                          <Badge label={u.role === 'admin' ? 'Admin' : 'Lawyer'} variant={u.role === 'admin' ? 'Active' : undefined} />
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{u.case_count}</td>
                        <td className="px-5 py-3 text-muted-foreground">{u.document_count}</td>
                        <td className="px-5 py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : null}
    </div>
  )
}
