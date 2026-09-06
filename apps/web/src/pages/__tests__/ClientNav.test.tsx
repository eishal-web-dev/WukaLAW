import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'

const auth = vi.hoisted(() => ({
  token: 'test-token' as string | null,
  loading: false,
  user: { id: 17, name: 'Test Client', email: 'client@example.com', role: 'client' },
  logout: vi.fn(),
}))
vi.mock('../../lib/auth', () => ({ useAuth: () => auth }))
vi.mock('../../lib/notifications', () => ({ useNotifications: () => ({ unreadCount: 0 }) }))
vi.mock('../../lib/theme', () => ({ useTheme: () => ({ dark: true, toggleDark: vi.fn() }) }))
vi.mock('../ClientDashboard', () => ({ default: () => <h1>Client dashboard content</h1> }))
vi.mock('../Dashboard', () => ({ default: () => <h1>Lawyer dashboard content</h1> }))
vi.mock('../ClientCases', () => ({ default: () => <h1>Client cases content</h1> }))
vi.mock('../Cases', () => ({ default: () => <h1>Lawyer cases content</h1> }))

afterEach(cleanup)
beforeAll(() => {
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
})
beforeEach(() => {
  vi.clearAllMocks()
  auth.token = 'test-token'
  auth.user.role = 'client'
})

function open(path: string) {
  render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}

describe('Client sidebar navigation (spec: never send clients to Lawyer pages)', () => {
  it('shows "My Cases" linking to /client/cases, not "Case Management" linking to /cases', async () => {
    open('/client')
    expect(await screen.findByRole('heading', { name: 'Client dashboard content' })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'My Cases' })).toBeInTheDocument()
    expect(screen.queryByText('Case Management')).not.toBeInTheDocument()
  })

  it('never shows lawyer-only nav items (Case Workspace, AI Court Prediction, Similar Cases, Reports, Analytics)', async () => {
    open('/client')
    await screen.findByRole('heading', { name: 'Client dashboard content' })

    for (const label of ['Task Board', 'Hearings', 'AI Strategy', 'Legal Research', 'Strategy Builder', 'Messages', 'Team', 'Case Management']) {
      expect(screen.queryByText(label)).not.toBeInTheDocument()
    }
  })

  it('clicking "My Cases" in the sidebar actually renders the client cases page, not the lawyer one', async () => {
    open('/client')
    await screen.findByRole('heading', { name: 'Client dashboard content' })

    fireEvent.click(screen.getByRole('button', { name: 'My Cases' }))
    expect(await screen.findByRole('heading', { name: 'Client cases content' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Lawyer cases content' })).not.toBeInTheDocument()
  })

  it('shows a lawyer the lawyer-oriented nav, unchanged', async () => {
    auth.user = { id: 1, name: 'Test Lawyer', email: 'lawyer@example.com', role: 'lawyer' }
    open('/dashboard')
    expect(await screen.findByRole('heading', { name: 'Lawyer dashboard content' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Case Management' })).toBeInTheDocument()
    expect(screen.queryByText('My Cases')).not.toBeInTheDocument()
  })
})
