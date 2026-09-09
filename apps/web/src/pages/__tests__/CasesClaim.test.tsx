import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Cases from '../Cases'
import * as api from '../../lib/api'
import type { Case } from '../../lib/api'

vi.mock('../../lib/api', () => ({
  listCases: vi.fn(),
  createCase: vi.fn(),
  updateCase: vi.fn(),
  deleteCase: vi.fn(),
  claimCase: vi.fn(),
  errorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

function makeCase(overrides: Partial<Case>): Case {
  return {
    id: 1, case_number: 'WK-2026-001', title: 'Owned Case', case_type: 'Civil',
    status: 'Active', priority: 'Medium', description: null, deadline: null,
    num_documents: 0, created_at: '2026-01-01T00:00:00Z',
    client_id: null, client_name: null, lawyer_name: 'Adv. Test Lawyer',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

function renderCases() {
  return render(
    <MemoryRouter>
      <Cases />
    </MemoryRouter>,
  )
}

describe('Cases (Claim unassigned client requests)', () => {
  it('shows a "New Request" badge and Claim button for an unassigned case, not Edit/Delete', async () => {
    vi.mocked(api.listCases).mockResolvedValue({
      items: [makeCase({ id: 2, title: 'Client Request', lawyer_name: null })],
      total: 1,
    })

    renderCases()
    await waitFor(() => expect(screen.getByText('Client Request')).toBeInTheDocument())

    expect(screen.getByText('New Request')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Claim/i })).toBeInTheDocument()
    expect(screen.queryByTitle('Edit')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Delete')).not.toBeInTheDocument()
  })

  it('an owned case shows the normal Edit/Delete actions, no Claim button', async () => {
    vi.mocked(api.listCases).mockResolvedValue({
      items: [makeCase({ id: 1, title: 'Owned Case', lawyer_name: 'Adv. Test Lawyer' })],
      total: 1,
    })

    renderCases()
    await waitFor(() => expect(screen.getByText('Owned Case')).toBeInTheDocument())

    expect(screen.queryByText('New Request')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Claim/i })).not.toBeInTheDocument()
    expect(screen.getByTitle('Edit')).toBeInTheDocument()
  })

  it('clicking Claim calls the real claimCase() with the correct case ID and refreshes the list', async () => {
    vi.mocked(api.listCases)
      .mockResolvedValueOnce({ items: [makeCase({ id: 3, title: 'Pending Request', lawyer_name: null })], total: 1 })
      .mockResolvedValueOnce({ items: [makeCase({ id: 3, title: 'Pending Request', lawyer_name: 'Adv. Test Lawyer' })], total: 1 })
    vi.mocked(api.claimCase).mockResolvedValue(makeCase({ id: 3, title: 'Pending Request', lawyer_name: 'Adv. Test Lawyer' }))

    renderCases()
    await waitFor(() => expect(screen.getByText('Pending Request')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /Claim/i }))

    await waitFor(() => {
      expect(api.claimCase).toHaveBeenCalledWith(3)
    })
    await waitFor(() => {
      expect(screen.queryByText('New Request')).not.toBeInTheDocument()
    })
  })
})
