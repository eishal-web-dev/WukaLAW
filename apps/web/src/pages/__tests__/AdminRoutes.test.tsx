import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'
import * as api from '../../lib/api'

const auth = vi.hoisted(() => ({
  token: 'test-token' as string | null,
  loading: false,
  user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'lawyer' },
  logout: vi.fn(),
}))
vi.mock('../../lib/auth', () => ({ useAuth: () => auth }))
vi.mock('../../lib/notifications', () => ({ useNotifications: () => ({ unreadCount: 0 }) }))
vi.mock('../../lib/theme', () => ({ useTheme: () => ({ dark: true, toggleDark: vi.fn() }) }))
vi.mock('../Dashboard', () => ({ default: () => <h1>Lawyer dashboard</h1> }))
vi.mock('../../figma/FigmaPortalPage', () => ({ default: ({ page }: { page: string }) => <h1>{page}</h1> }))
vi.mock('../Profile', () => ({ default: () => <h1>Shared profile</h1> }))
vi.mock('../Login', () => ({ default: () => <h1>Sign in</h1> }))
vi.mock('../../lib/api', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../lib/api')>(),
  adminGetStats: vi.fn(),
  adminListUsers: vi.fn(),
}))

afterEach(cleanup)
beforeEach(() => {
  vi.clearAllMocks()
  auth.token = 'test-token'
  auth.user.role = 'lawyer'
  vi.mocked(api.adminGetStats).mockResolvedValue({ total_users: 3, total_cases: 7, total_documents: 11, active_cases: 4 })
  vi.mocked(api.adminListUsers).mockResolvedValue([{
    id: 1, name: 'Live Account', email: 'live@example.com', role: 'lawyer',
    created_at: '2026-09-01T12:00:00Z', case_count: 7, document_count: 11,
  }])
})

function open(path: string) {
  render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}

describe('Admin route integration', () => {
  it.each(['/admin', '/admin/users', '/admin/security'])('denies a regular user at %s', async (path) => {
    open(path)
    expect(await screen.findByRole('heading', { name: 'Lawyer dashboard' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Admin' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Admin Panel' })).not.toBeInTheDocument()
    expect(api.adminGetStats).not.toHaveBeenCalled()
    expect(api.adminListUsers).not.toHaveBeenCalled()
  })

  it('redirects a signed-out user to login', async () => {
    auth.token = null
    open('/admin')
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(api.adminGetStats).not.toHaveBeenCalled()
  })

  it.each(['/admin', '/admin/users'])('loads real admin data at %s', async (path) => {
    auth.user.role = 'admin'
    open(path)
    expect(await screen.findByText('live@example.com')).toBeInTheDocument()
    expect(screen.getByText('All Users (1)')).toBeInTheDocument()
    expect(screen.getByText('Admin portal')).toBeInTheDocument()
    expect(api.adminGetStats).toHaveBeenCalledOnce()
    expect(api.adminListUsers).toHaveBeenCalledOnce()
  })

  it('shows a failed request without reporting empty counts as real data', async () => {
    auth.user.role = 'admin'
    vi.mocked(api.adminGetStats).mockRejectedValue(new Error('Admin request failed'))
    open('/admin')
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Admin request failed'))
    expect(screen.queryByText('Total Users')).not.toBeInTheDocument()
    expect(screen.queryByText('No users yet.')).not.toBeInTheDocument()
  })
})


describe('Separate account portals', () => {
  it.each(['/dashboard', '/clients', '/admin', '/admin/users'])('keeps clients out of %s', async (path) => {
    auth.user.role = 'client'
    open(path)
    expect(await screen.findByRole('heading', { name: 'cp-dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Client portal')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Admin' })).not.toBeInTheDocument()
    expect(api.adminGetStats).not.toHaveBeenCalled()
  })

  it('keeps lawyers out of the client portal', async () => {
    open('/client/cases')
    expect(await screen.findByRole('heading', { name: 'Lawyer dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Lawyer portal')).toBeInTheDocument()
  })

  it.each(['client', 'lawyer', 'admin'])('keeps the %s sidebar on shared pages', async (role) => {
    auth.user.role = role
    open('/profile')
    expect(await screen.findByRole('heading', { name: 'Shared profile' })).toBeInTheDocument()
    expect(screen.getByText(`${role[0].toUpperCase()}${role.slice(1)} portal`)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Client' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Admin' })).not.toBeInTheDocument()
  })

  it.each([
    ['client', 'cp-dashboard'], ['lawyer', 'Lawyer dashboard'], ['admin', 'Platform Admin'],
  ])('returns a signed-in %s to the right home from login', async (role, heading) => {
    auth.user.role = role
    open('/login')
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
    if (role === 'admin') await screen.findByText('live@example.com')
  })
})
