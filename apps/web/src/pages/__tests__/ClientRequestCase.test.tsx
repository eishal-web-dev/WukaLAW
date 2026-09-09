import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ClientRequestCase from '../ClientRequestCase'
import * as api from '../../lib/api'

vi.mock('../../lib/api', () => ({
  requestCase: vi.fn(),
  errorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function renderPage() {
  return render(
    <MemoryRouter>
      <ClientRequestCase />
    </MemoryRouter>,
  )
}

describe('ClientRequestCase', () => {
  it('disables submit until title and a sufficiently detailed description are entered', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /Submit Request/i })).toBeDisabled()

    fireEvent.change(screen.getByLabelText(/Short title/i), { target: { value: 'My issue' } })
    expect(screen.getByRole('button', { name: /Submit Request/i })).toBeDisabled()

    fireEvent.change(screen.getByLabelText(/What's happening/i), {
      target: { value: 'A landlord dispute over my deposit that has gone on for months.' },
    })
    expect(screen.getByRole('button', { name: /Submit Request/i })).not.toBeDisabled()
  })

  it('submits a real request via requestCase() and shows the real returned case number', async () => {
    vi.mocked(api.requestCase).mockResolvedValue({
      id: 9, case_number: 'WL-2026-004', title: 'My issue', case_type: 'Civil',
      status: 'Review', priority: 'Medium', description: 'desc', deadline: null,
      num_documents: 0, created_at: '2026-01-01T00:00:00Z',
      client_id: 17, client_name: 'Test Client', lawyer_name: null,
    })

    renderPage()
    fireEvent.change(screen.getByLabelText(/Short title/i), { target: { value: 'My issue' } })
    fireEvent.change(screen.getByLabelText(/What's happening/i), {
      target: { value: 'A landlord dispute over my deposit that has gone on for months.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }))

    await waitFor(() => {
      expect(screen.getByText('WL-2026-004')).toBeInTheDocument()
    })
    expect(api.requestCase).toHaveBeenCalledWith({
      title: 'My issue',
      case_type: 'Civil',
      description: 'A landlord dispute over my deposit that has gone on for months.',
    })
  })

  it('shows a real error and does not fake success if submission fails', async () => {
    vi.mocked(api.requestCase).mockRejectedValue(new Error('Server unavailable'))

    renderPage()
    fireEvent.change(screen.getByLabelText(/Short title/i), { target: { value: 'My issue' } })
    fireEvent.change(screen.getByLabelText(/What's happening/i), {
      target: { value: 'A landlord dispute over my deposit that has gone on for months.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }))

    await waitFor(() => {
      expect(screen.getByText('Server unavailable')).toBeInTheDocument()
    })
    expect(screen.queryByText(/Request submitted/i)).not.toBeInTheDocument()
  })
})
