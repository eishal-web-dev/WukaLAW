import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { portalForRole, portalHome } from '../lib/portals'
import type { Portal } from '../lib/portals'
import Spinner from './Spinner'

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Spinner label="Checking your session…" />
    </div>
  )
}

/** Shared account pages still require an authenticated session. */
export function ProtectedRoute() {
  const { token, loading } = useAuth()
  const { pathname } = useLocation()
  if (loading) return <FullScreenLoader />
  if (!token) {
    const portal = /^\/admin(?:\/|$)/.test(pathname) ? 'admin' : /^\/client(?:\/|$)/.test(pathname) ? 'client' : null
    return <Navigate to={portal ? `/login?portal=${portal}` : '/login'} replace />
  }
  return <Outlet />
}

/** A restored session always opens its account's own portal. */
export function GuestRoute() {
  const { token, user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (token) return <Navigate to={portalHome(user?.role)} replace />
  return <Outlet />
}

/** Portal selection never changes the account's server-assigned role. */
export function PortalRoute({ portal }: { portal: Portal }) {
  const { token, user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!token) return <Navigate to={`/login?portal=${portal}`} replace />
  if (portalForRole(user?.role) !== portal) return <Navigate to={portalHome(user?.role)} replace />
  return <Outlet />
}

export function AdminRoute() {
  return <PortalRoute portal="admin" />
}
