import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ClientWorkspace from '../ClientWorkspace'
import * as api from '../../lib/api'
import type { Case } from '../../lib/api'

vi.mock('../../lib/api', () => ({
  getCase: vi.fn(),
  listCaseDocuments: vi.fn(),
  getCaseTimeline: vi.fn(),
  askCaseQuestion: vi.fn(),
  errorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

const CASE: Case = {
  id: 7,
  case_number: 'WK-2026-007',
  title: 'Rent Dispute',
  case_type: 'Civil',
  status: 'Active',
  priority: 'Medium',
  description: 'A disagreement with a landlord over a security deposit.',
  deadline: '2026-12-15',
  num_documents: 1,
  created_at: '2026-05-01T00:00:00Z',
  client_id: 17,
  client_name: 'Test Client',
  lawyer_name: 'Adv. Bilal Ahmed',
}

function renderWorkspace(caseId = '7') {
  return render(
    <MemoryRouter initialEntries={[`/client/cases/${caseId}/workspace`]}>
      <Routes>
        <Route path="/client/cases/:caseId/workspace" element={<ClientWorkspace />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ClientWorkspace', () => {
  it('shows a loading state while fetching', () => {
    vi.mocked(api.getCase).mockReturnValue(new Promise(() => {}))
    vi.mocked(api.listCaseDocuments).mockReturnValue(new Promise(() => {}))
    vi.mocked(api.getCaseTimeline).mockReturnValue(new Promise(() => {}))

    renderWorkspace()
    expect(screen.getByText(/Loading case/i)).toBeInTheDocument()
  })

  it('shows a not-found state for a case the client cannot access', async () => {
    vi.mocked(api.getCase).mockRejectedValue(new Error('Case not found.'))
    vi.mocked(api.listCaseDocuments).mockResolvedValue({ items: [], total: 0 })
    vi.mocked(api.getCaseTimeline).mockResolvedValue({ events: [] })

    renderWorkspace()
    await waitFor(() => {
      expect(screen.getByText(/Case not found/i)).toBeInTheDocument()
    })
  })

  it('shows an error state with retry for a genuine API failure', async () => {
    vi.mocked(api.getCase).mockRejectedValue(new Error('Server error'))
    vi.mocked(api.listCaseDocuments).mockResolvedValue({ items: [], total: 0 })
    vi.mocked(api.getCaseTimeline).mockResolvedValue({ events: [] })

    renderWorkspace()
    await waitFor(() => {
      expect(screen.getByText(/Couldn't load this case/i)).toBeInTheDocument()
    })
    expect(screen.getByText('Server error')).toBeInTheDocument()
  })

  it('shows real case details, lawyer, and documents -- no fabricated content', async () => {
    vi.mocked(api.getCase).mockResolvedValue(CASE)
    vi.mocked(api.listCaseDocuments).mockResolvedValue({
      items: [{ id: 3, filename: 'lease.pdf', title: 'Lease Agreement', size_bytes: 1000, num_chunks: 2, created_at: '2026-05-02T00:00:00Z', has_summary: false, ocr_used: false }],
      total: 1,
    })
    vi.mocked(api.getCaseTimeline).mockResolvedValue({ events: [] })

    renderWorkspace()
    await waitFor(() => expect(screen.getByText('Rent Dispute')).toBeInTheDocument())

    expect(screen.getByText('WK-2026-007')).toBeInTheDocument()
    expect(screen.getByText('Adv. Bilal Ahmed')).toBeInTheDocument()
    expect(screen.getByText('Lease Agreement')).toBeInTheDocument()
    expect(screen.getByText(/security deposit/i)).toBeInTheDocument()

    // Never any fabricated AI-strategy chat content from the old mock.
    expect(screen.queryByText(/win probability/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Judge Wells/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Dr\. Morse/i)).not.toBeInTheDocument()
  })

  it('sends a real, case-scoped AI question and shows the real answer', async () => {
    vi.mocked(api.getCase).mockResolvedValue(CASE)
    vi.mocked(api.listCaseDocuments).mockResolvedValue({ items: [], total: 0 })
    vi.mocked(api.getCaseTimeline).mockResolvedValue({ events: [] })
    vi.mocked(api.askCaseQuestion).mockResolvedValue({
      answer: 'Your lease requires 30 days notice before deposit return.',
      confidence: { level: 'medium', reason: 'Based on 1 document in this case.' },
      sources: [],
      model: 'extractive',
    })

    renderWorkspace()
    await waitFor(() => expect(screen.getByText('Rent Dispute')).toBeInTheDocument())

    fireEvent.change(screen.getByPlaceholderText(/Ask a question about this case/i), {
      target: { value: 'How long until my deposit is returned?' },
    })
    fireEvent.click(screen.getByRole('button', { name: '' }))

    await waitFor(() => {
      expect(screen.getByText(/30 days notice/)).toBeInTheDocument()
    })

    // Confirms the case-scoped function was called with this case's real ID, not the general public endpoint.
    expect(api.askCaseQuestion).toHaveBeenCalledWith('How long until my deposit is returned?', 7)
  })
})
