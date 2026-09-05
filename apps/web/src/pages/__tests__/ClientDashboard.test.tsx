import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ClientDashboard from '../ClientDashboard'
import * as api from '../../lib/api'
import type { Case, DocumentMeta } from '../../lib/api'

vi.mock('../../lib/api', () => ({
  listCases: vi.fn(),
  listDocuments: vi.fn(),
  getNotificationUnreadCount: vi.fn(),
  errorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ user: { id: 17, name: 'Test Client', email: 'client@example.com', role: 'client' } }),
}))

const CASE: Case = {
  id: 5,
  case_number: 'WK-2026-005',
  title: 'Property Dispute',
  case_type: 'Civil',
  status: 'Active',
  priority: 'Medium',
  description: null,
  deadline: '2026-12-01',
  num_documents: 3,
  created_at: '2026-06-01T00:00:00Z',
  client_id: 17,
  client_name: 'Test Client',
  lawyer_name: 'Adv. Fatima Khan',
}

const DOC: DocumentMeta = {
  id: 9,
  filename: 'contract.pdf',
  title: 'Signed Contract',
  size_bytes: 12345,
  num_chunks: 4,
  created_at: '2026-06-02T00:00:00Z',
  has_summary: true,
  ocr_used: false,
}

beforeEach(() => {
  vi.clearAllMocks()
})

function renderDashboard() {
  return render(
    <MemoryRouter>
      <ClientDashboard />
    </MemoryRouter>,
  )
}

describe('ClientDashboard', () => {
  it('shows a loading state while fetching', () => {
    vi.mocked(api.listCases).mockReturnValue(new Promise(() => {}))
    vi.mocked(api.listDocuments).mockReturnValue(new Promise(() => {}))
    vi.mocked(api.getNotificationUnreadCount).mockReturnValue(new Promise(() => {}))

    renderDashboard()
    expect(screen.getByText(/Loading your account/i)).toBeInTheDocument()
  })

  it('shows a genuine empty state for a client with no assigned cases', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [], total: 0 })
    vi.mocked(api.listDocuments).mockResolvedValue({ items: [], total: 0 })
    vi.mocked(api.getNotificationUnreadCount).mockResolvedValue({ unread: 0 })

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText(/No cases assigned yet/i)).toBeInTheDocument()
    })
    expect(screen.queryByText('Ahmed Hassan')).not.toBeInTheDocument()
    expect(screen.queryByText(/85%/)).not.toBeInTheDocument()
  })

  it('shows an error state with a working retry button on API failure', async () => {
    vi.mocked(api.listCases).mockRejectedValue(new Error('Network error'))
    vi.mocked(api.listDocuments).mockResolvedValue({ items: [], total: 0 })
    vi.mocked(api.getNotificationUnreadCount).mockResolvedValue({ unread: 0 })

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText(/Couldn't load your dashboard/i)).toBeInTheDocument()
    })
    expect(screen.getByText('Network error')).toBeInTheDocument()

    vi.mocked(api.listCases).mockResolvedValue({ items: [CASE], total: 1 })
    fireEvent.click(screen.getByRole('button', { name: /Try again/i }))

    await waitFor(() => {
      expect(screen.getByText('Property Dispute')).toBeInTheDocument()
    })
  })

  it('shows real case and document data, never fabricated statistics', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [CASE], total: 1 })
    vi.mocked(api.listDocuments).mockResolvedValue({ items: [DOC], total: 1 })
    vi.mocked(api.getNotificationUnreadCount).mockResolvedValue({ unread: 2 })

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Property Dispute')).toBeInTheDocument()
    })
    expect(screen.getByText('WK-2026-005')).toBeInTheDocument()
    expect(screen.getByText(/Adv. Fatima Khan/)).toBeInTheDocument()
    expect(screen.getByText('Signed Contract')).toBeInTheDocument()

    // Never any fabricated Figma-mock content.
    expect(screen.queryByText('Ahmed Hassan')).not.toBeInTheDocument()
    expect(screen.queryByText(/win probability/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/WL-2024/)).not.toBeInTheDocument()
    expect(screen.queryByText('Sarah Chen')).not.toBeInTheDocument()
  })
})
