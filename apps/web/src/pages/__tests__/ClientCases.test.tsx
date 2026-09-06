import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ClientCases from '../ClientCases'
import * as api from '../../lib/api'
import type { Case } from '../../lib/api'

vi.mock('../../lib/api', () => ({
  listCases: vi.fn(),
  errorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

function makeCase(overrides: Partial<Case>): Case {
  return {
    id: 1,
    case_number: 'WK-2026-001',
    title: 'Default Case',
    case_type: 'Civil',
    status: 'Active',
    priority: 'Medium',
    description: null,
    deadline: null,
    num_documents: 0,
    created_at: '2026-01-01T00:00:00Z',
    client_id: 17,
    client_name: 'Test Client',
    lawyer_name: null,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

function renderCases() {
  return render(
    <MemoryRouter>
      <ClientCases />
    </MemoryRouter>,
  )
}

describe('ClientCases', () => {
  it('shows a loading state while fetching', () => {
    vi.mocked(api.listCases).mockReturnValue(new Promise(() => {}))
    renderCases()
    expect(screen.getByText(/Loading your cases/i)).toBeInTheDocument()
  })

  it('shows a genuine empty state when no cases are assigned', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [], total: 0 })
    renderCases()
    await waitFor(() => {
      expect(screen.getByText(/No cases assigned yet/i)).toBeInTheDocument()
    })
  })

  it('shows an error state with a working retry button', async () => {
    vi.mocked(api.listCases).mockRejectedValue(new Error('Server unavailable'))
    renderCases()
    await waitFor(() => {
      expect(screen.getByText(/Couldn't load your cases/i)).toBeInTheDocument()
    })
    expect(screen.getByText('Server unavailable')).toBeInTheDocument()

    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({ title: 'Recovered Case' })], total: 1 })
    fireEvent.click(screen.getByRole('button', { name: /Try again/i }))
    await waitFor(() => {
      expect(screen.getByText('Recovered Case')).toBeInTheDocument()
    })
  })

  it('filters cases by search term', async () => {
    vi.mocked(api.listCases).mockResolvedValue({
      items: [
        makeCase({ id: 1, title: 'Property Dispute', case_number: 'WK-2026-001' }),
        makeCase({ id: 2, title: 'Contract Breach', case_number: 'WK-2026-002' }),
      ],
      total: 2,
    })
    renderCases()
    await waitFor(() => expect(screen.getByText('Property Dispute')).toBeInTheDocument())

    fireEvent.change(screen.getByPlaceholderText('Search cases…'), { target: { value: 'Contract' } })
    expect(screen.queryByText('Property Dispute')).not.toBeInTheDocument()
    expect(screen.getByText('Contract Breach')).toBeInTheDocument()
  })

  it('filters cases by status tab', async () => {
    vi.mocked(api.listCases).mockResolvedValue({
      items: [
        makeCase({ id: 1, title: 'Active One', status: 'Active' }),
        makeCase({ id: 2, title: 'Closed One', status: 'Closed' }),
      ],
      total: 2,
    })
    renderCases()
    await waitFor(() => expect(screen.getByText('Active One')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Closed' }))
    expect(screen.queryByText('Active One')).not.toBeInTheDocument()
    expect(screen.getByText('Closed One')).toBeInTheDocument()
  })

  it('never shows fabricated win-probability or fake case data', async () => {
    vi.mocked(api.listCases).mockResolvedValue({
      items: [makeCase({ title: 'Real Case', lawyer_name: 'Adv. Ali Raza' })],
      total: 1,
    })
    renderCases()
    await waitFor(() => expect(screen.getByText('Real Case')).toBeInTheDocument())

    expect(screen.getByText('Adv. Ali Raza')).toBeInTheDocument()
    expect(screen.queryByText(/win/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/WL-2024/)).not.toBeInTheDocument()
    expect(screen.queryByText('Sarah Chen')).not.toBeInTheDocument()
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
  })
})
