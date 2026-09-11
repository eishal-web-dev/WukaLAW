import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Profile from '../Profile'
import * as api from '../../lib/api'

vi.mock('../../lib/api', () => ({
  getMe: vi.fn(),
  listCases: vi.fn(),
  listDocuments: vi.fn(),
  errorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ user: null, logout: vi.fn() }),
}))

afterEach(cleanup)

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(api.listCases).mockResolvedValue({ items: [], total: 3 })
  vi.mocked(api.listDocuments).mockResolvedValue({ items: [], total: 7 })
})

function renderProfile() {
  return render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>,
  )
}

describe('Profile', () => {
  it('shows the real role and account creation date, not just name/email/ID', async () => {
    vi.mocked(api.getMe).mockResolvedValue({
      id: 17, name: 'Test Client', email: 'client@example.com',
      role: 'client', created_at: '2026-03-15T00:00:00Z',
    })

    renderProfile()

    await waitFor(() => expect(screen.getAllByText('Test Client').length).toBeGreaterThan(0))
    expect(screen.getAllByText('Client').length).toBeGreaterThan(0)
    expect(screen.getByText(/Mar/)).toBeInTheDocument()
  })

  it('shows real case and document counts', async () => {
    vi.mocked(api.getMe).mockResolvedValue({
      id: 1, name: 'Test Lawyer', email: 'lawyer@example.com',
      role: 'lawyer', created_at: '2026-01-01T00:00:00Z',
    })

    renderProfile()

    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument())
    expect(screen.getByText('7')).toBeInTheDocument()
  })
})
