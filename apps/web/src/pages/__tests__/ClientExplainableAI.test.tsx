import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ClientExplainableAI from '../ClientExplainableAI'
import * as api from '../../lib/api'
import type { Case, DocumentMeta, Document } from '../../lib/api'

vi.mock('../../lib/api', () => ({
  listCases: vi.fn(),
  listCaseDocuments: vi.fn(),
  getDocument: vi.fn(),
  errorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

function makeCase(overrides: Partial<Case>): Case {
  return {
    id: 1, case_number: 'WK-2026-001', title: 'Test Case', case_type: 'Civil',
    status: 'Active', priority: 'Medium', description: null, deadline: null,
    num_documents: 1, created_at: '2026-01-01T00:00:00Z',
    client_id: 17, client_name: 'Test Client', lawyer_name: null,
    ...overrides,
  }
}

function makeDocMeta(overrides: Partial<DocumentMeta>): DocumentMeta {
  return {
    id: 1, filename: 'contract.pdf', title: 'Signed Contract', size_bytes: 1000,
    num_chunks: 3, created_at: '2026-01-02T00:00:00Z', has_summary: true, ocr_used: false,
    ...overrides,
  }
}

function makeFullDoc(overrides: Partial<Document>): Document {
  return {
    ...makeDocMeta({}),
    text: 'full document text',
    summary: {
      short_summary: 'This contract establishes a service agreement.',
      main_issue: 'Breach of payment terms.',
      outcome: 'Not yet resolved.',
      key_facts: ['Signed Jan 2, 2026'],
      legal_points: ['Section 12 governs late payment'],
    },
    ...overrides,
  }
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ClientExplainableAI />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ClientExplainableAI', () => {
  it('shows a genuine empty state when the client has no cases', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [], total: 0 })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/No cases assigned yet/i)).toBeInTheDocument()
    })
  })

  it('shows an honest "no AI result yet" state when nothing has a summary', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({})], total: 1 })
    vi.mocked(api.listCaseDocuments).mockResolvedValue({
      items: [makeDocMeta({ has_summary: false })],
      total: 1,
    })

    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/No AI result to explain yet/i)).toBeInTheDocument()
    })
  })

  it('explains a real summary with its real content, no fabricated confidence or date', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({})], total: 1 })
    vi.mocked(api.listCaseDocuments).mockResolvedValue({ items: [makeDocMeta({})], total: 1 })
    vi.mocked(api.getDocument).mockResolvedValue(makeFullDoc({}))

    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/service agreement/i)).toBeInTheDocument()
    })
    expect(screen.getByText('Signed Jan 2, 2026')).toBeInTheDocument()
    expect(screen.getByText('Section 12 governs late payment')).toBeInTheDocument()
    expect(screen.getByText(/not currently tracked/i)).toBeInTheDocument()

    // Never a fabricated confidence percentage or invented judge/expert content.
    expect(screen.queryByText(/85%/)).not.toBeInTheDocument()
    expect(screen.queryByText(/confidence.*\d+%/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Judge Wells/i)).not.toBeInTheDocument()
  })
})
