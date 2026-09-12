import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ClientSearch from '../ClientSearch'
import * as api from '../../lib/api'
import type { Case, DocumentMeta } from '../../lib/api'

vi.mock('../../lib/api', () => ({
  listCases: vi.fn(),
  listDocuments: vi.fn(),
  errorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

function makeCase(overrides: Partial<Case>): Case {
  return {
    id: 1, case_number: 'WK-2026-001', title: 'Property Dispute', case_type: 'Civil',
    status: 'Active', priority: 'Medium', description: null, deadline: null,
    num_documents: 1, created_at: '2026-01-01T00:00:00Z',
    client_id: 17, client_name: 'Test Client', lawyer_name: null,
    ...overrides,
  }
}

function makeDoc(overrides: Partial<DocumentMeta>): DocumentMeta {
  return {
    id: 1, filename: 'contract.pdf', title: 'Signed Contract', size_bytes: 1000,
    num_chunks: 3, created_at: '2026-01-02T00:00:00Z', has_summary: false, ocr_used: false,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

function renderPage() {
  return render(
    <MemoryRouter>
      <ClientSearch />
    </MemoryRouter>,
  )
}

describe('ClientSearch', () => {
  it('shows a prompt before anything is typed, no results', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({})], total: 1 })
    vi.mocked(api.listDocuments).mockResolvedValue({ items: [makeDoc({})], total: 1 })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/Search your cases and documents/i)).toBeInTheDocument()
    })
    expect(screen.queryByText('Property Dispute')).not.toBeInTheDocument()
  })

  it('returns real matching results for a real query', async () => {
    vi.mocked(api.listCases).mockResolvedValue({
      items: [makeCase({ title: 'Property Dispute' }), makeCase({ id: 2, title: 'Contract Breach' })],
      total: 2,
    })
    vi.mocked(api.listDocuments).mockResolvedValue({ items: [], total: 0 })
    renderPage()
    await waitFor(() => expect(screen.getByPlaceholderText(/Search your cases/i)).toBeInTheDocument())

    fireEvent.change(screen.getByPlaceholderText(/Search your cases/i), { target: { value: 'Property' } })

    await waitFor(() => {
      expect(screen.getByText('Property Dispute')).toBeInTheDocument()
    })
    expect(screen.queryByText('Contract Breach')).not.toBeInTheDocument()
  })

  it('shows a genuine "no results" state, never the same fabricated results for any query', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({})], total: 1 })
    vi.mocked(api.listDocuments).mockResolvedValue({ items: [], total: 0 })
    renderPage()
    await waitFor(() => expect(screen.getByPlaceholderText(/Search your cases/i)).toBeInTheDocument())

    fireEvent.change(screen.getByPlaceholderText(/Search your cases/i), { target: { value: 'nonexistent xyz' } })

    await waitFor(() => {
      expect(screen.getByText(/No results for/i)).toBeInTheDocument()
    })
    // Never the old mock's fabricated fixed results, regardless of query.
    expect(screen.queryByText(/82% win probability/i)).not.toBeInTheDocument()
    expect(screen.queryByText('DataTech LLC IP Dispute')).not.toBeInTheDocument()
    expect(screen.queryByText(/Dr\. Morse/i)).not.toBeInTheDocument()
  })
})
