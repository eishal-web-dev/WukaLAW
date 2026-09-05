export type Portal = 'client' | 'lawyer' | 'admin'
export type SignupRole = Exclude<Portal, 'admin'>

export const PORTAL_LABELS: Record<Portal, string> = {
  client: 'Client',
  lawyer: 'Lawyer',
  admin: 'Admin',
}

export function isPortal(value: string | null | undefined): value is Portal {
  return value === 'client' || value === 'lawyer' || value === 'admin'
}

export function portalForRole(role: string | null | undefined): Portal {
  return isPortal(role) ? role : 'lawyer'
}

export function portalHome(role: string | null | undefined): string {
  return role === 'admin' ? '/admin' : role === 'client' ? '/client' : '/dashboard'
}
