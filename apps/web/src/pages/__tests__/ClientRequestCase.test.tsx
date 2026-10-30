import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ClientRequestCase from '../ClientRequestCase'
import * as api from '../../lib/api'

vi.mock('../../lib/api', () => ({
  requestCase: vi.fn(),
  listPublicLawyers: vi.fn(),
  errorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(api.listPublicLawyers).mockResolvedValue([{
    id: 4, name: 'Adv. Fatima Khan', email: 'fatima@example.com', profile_image: null,
    lawyer_title: 'Advocate', specialization: 'Civil and family law', city: 'Peshawar',
    years_experience: 8, consultation_fee: 5000, lawyer_bio: 'Family-law advocate.',
    education: 'LL.B', bar_council: 'KP Bar Council', license_number: 'KP-123',
    languages: 'Urdu, English', profile_complete: true, rating: 4.8, review_count: 12, accepting_consultations: true,
  }])
})

async function completeRequiredChoices() {
  fireEvent.click(screen.getByRole('button', { name: /Money dispute/i }))
  await waitFor(() => expect(screen.getByRole('button', { name: /Adv. Fatima Khan/i })).toBeInTheDocument())
  fireEvent.click(screen.getByRole('button', { name: /Adv. Fatima Khan/i }))
}

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
    expect(screen.getByRole('button', { name: /Send Case Request/i })).toBeDisabled()

    fireEvent.change(screen.getByLabelText(/Case title/i), { target: { value: 'My issue' } })
    expect(screen.getByRole('button', { name: /Send Case Request/i })).toBeDisabled()

    fireEvent.change(screen.getByLabelText(/What is the case about/i), {
      target: { value: 'A landlord dispute over my deposit that has gone on for months.' },
    })
    expect(screen.getByRole('button', { name: /Send Case Request/i })).toBeDisabled()
  })

  it('submits tags and the chosen lawyer and shows the real returned case number', async () => {
    vi.mocked(api.requestCase).mockResolvedValue({
      id: 9, case_number: 'WL-2026-004', title: 'My issue', case_type: 'Civil',
      status: 'Review', priority: 'Medium', description: 'desc', deadline: null,
      num_documents: 0, created_at: '2026-01-01T00:00:00Z',
      client_id: 17, client_name: 'Test Client', lawyer_name: null,
      requested_lawyer_id: 4, requested_lawyer_name: 'Adv. Fatima Khan', tags: ['Money dispute'], assignment_status: 'waiting',
    })

    renderPage()
    fireEvent.change(screen.getByLabelText(/Case title/i), { target: { value: 'My issue' } })
    fireEvent.change(screen.getByLabelText(/What is the case about/i), {
      target: { value: 'A landlord dispute over my deposit that has gone on for months.' },
    })
    await completeRequiredChoices()
    fireEvent.click(screen.getByRole('button', { name: /Send Case Request/i }))

    await waitFor(() => {
      expect(screen.getByText('WL-2026-004')).toBeInTheDocument()
    })
    expect(api.requestCase).toHaveBeenCalledWith({
      title: 'My issue',
      case_type: 'Civil',
      description: 'A landlord dispute over my deposit that has gone on for months.',
      tags: ['Money dispute'],
      lawyer_id: 4,
    })
  })

  it('shows a real error and does not fake success if submission fails', async () => {
    vi.mocked(api.requestCase).mockRejectedValue(new Error('Server unavailable'))

    renderPage()
    fireEvent.change(screen.getByLabelText(/Case title/i), { target: { value: 'My issue' } })
    fireEvent.change(screen.getByLabelText(/What is the case about/i), {
      target: { value: 'A landlord dispute over my deposit that has gone on for months.' },
    })
    await completeRequiredChoices()
    fireEvent.click(screen.getByRole('button', { name: /Send Case Request/i }))

    await waitFor(() => {
      expect(screen.getByText('Server unavailable')).toBeInTheDocument()
    })
    expect(screen.queryByText(/Case request sent/i)).not.toBeInTheDocument()
  })
})
