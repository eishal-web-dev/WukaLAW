import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import Spinner from './Spinner'

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Spinner label="Checking your session…" />
    </div>
  )
}

/** Wraps app pages: unauthenticated users are redirected to /login. */
export function ProtectedRoute() {
  const { token, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}

/** Wraps /login and /register: authenticated users go to /dashboard. */
export function GuestRoute() {
  const { token, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (token) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

/** Wraps admin-only pages: non-admins are redirected to /dashboard.
 * There is no self-service way to become an admin -- role is set
 * directly in the database (see apps/api/app/routers/admin.py). */
export function AdminRoute() {
  const { token, user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!token) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <Outlet />
}
