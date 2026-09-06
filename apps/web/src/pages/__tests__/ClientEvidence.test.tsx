import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ClientEvidence from '../ClientEvidence'
import * as api from '../../lib/api'
import type { Case, DocumentMeta } from '../../lib/api'

vi.mock('../../lib/api', () => ({
  listCases: vi.fn(),
  listCaseDocuments: vi.fn(),
  errorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

function makeCase(overrides: Partial<Case>): Case {
  return {
    id: 1,
    case_number: 'WK-2026-001',
    title: 'Test Case',
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

function makeDoc(overrides: Partial<DocumentMeta>): DocumentMeta {
  return {
    id: 1,
    filename: 'file.pdf',
    title: 'Signed Contract',
    size_bytes: 1000,
    num_chunks: 3,
    created_at: '2026-01-02T00:00:00Z',
    has_summary: false,
    ocr_used: false,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

function renderEvidence() {
  return render(
    <MemoryRouter>
      <ClientEvidence />
    </MemoryRouter>,
  )
}

describe('ClientEvidence', () => {
  it('shows a genuine empty state when the client has no cases', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [], total: 0 })
    renderEvidence()
    await waitFor(() => {
      expect(screen.getByText(/No cases assigned yet/i)).toBeInTheDocument()
    })
  })

  it('shows a genuine empty state when the selected case has no documents', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({})], total: 1 })
    vi.mocked(api.listCaseDocuments).mockResolvedValue({ items: [], total: 0 })
    renderEvidence()
    await waitFor(() => {
      expect(screen.getByText(/No documents have been added to this case yet/i)).toBeInTheDocument()
    })
  })

  it('lets the client switch cases and reloads documents for the new case', async () => {
    const CASE_A = makeCase({ id: 1, case_number: 'WK-2026-001', title: 'Case A' })
    const CASE_B = makeCase({ id: 2, case_number: 'WK-2026-002', title: 'Case B' })
    vi.mocked(api.listCases).mockResolvedValue({ items: [CASE_A, CASE_B], total: 2 })
    vi.mocked(api.listCaseDocuments).mockImplementation(async (id) =>
      id === 1
        ? { items: [makeDoc({ id: 10, title: 'Doc for A' })], total: 1 }
        : { items: [makeDoc({ id: 20, title: 'Doc for B' })], total: 1 },
    )

    renderEvidence()
    await waitFor(() => expect(screen.getByText('Doc for A')).toBeInTheDocument())

    fireEvent.change(screen.getByDisplayValue(/WK-2026-001/), { target: { value: '2' } })
    await waitFor(() => expect(screen.getByText('Doc for B')).toBeInTheDocument())
    expect(screen.queryByText('Doc for A')).not.toBeInTheDocument()
  })

  it('never shows a fabricated strength score, admissibility percentage, or fake AI note', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({})], total: 1 })
    vi.mocked(api.listCaseDocuments).mockResolvedValue({ items: [makeDoc({})], total: 1 })

    renderEvidence()
    await waitFor(() => expect(screen.getByText('Signed Contract')).toBeInTheDocument())

    expect(screen.getByText(/isn't available for this document yet/i)).toBeInTheDocument()
    expect(screen.queryByText(/% strength/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Admissibility/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Dr\. Morse/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/WL-2024/)).not.toBeInTheDocument()
  })
})
