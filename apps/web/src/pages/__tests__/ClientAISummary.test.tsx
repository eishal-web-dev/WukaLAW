import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import ClientAISummary from '../ClientAISummary'
import * as api from '../../lib/api'
import type { Case, DocumentMeta } from '../../lib/api'

vi.mock('../../lib/api', () => ({
  listCases: vi.fn(),
  listCaseDocuments: vi.fn(),
  summarizeDocument: vi.fn(),
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

describe('ClientAISummary', () => {
  it('shows a genuine empty state when the client has no cases', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [], total: 0 })
    render(<ClientAISummary />)
    await waitFor(() => {
      expect(screen.getByText(/No cases assigned yet/i)).toBeInTheDocument()
    })
  })

  it('shows an honest empty state when the selected case has no documents', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({})], total: 1 })
    vi.mocked(api.listCaseDocuments).mockResolvedValue({ items: [], total: 0 })
    render(<ClientAISummary />)
    await waitFor(() => {
      expect(screen.getByText(/No documents in this case yet/i)).toBeInTheDocument()
    })
  })

  it('generates a real summary via summarizeDocument and displays the real result', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({})], total: 1 })
    vi.mocked(api.listCaseDocuments).mockResolvedValue({ items: [makeDoc({})], total: 1 })
    vi.mocked(api.summarizeDocument).mockResolvedValue({
      document_id: 1,
      summary: {
        short_summary: 'This contract establishes a service agreement between two parties.',
        main_issue: 'Breach of the payment terms clause.',
        outcome: 'Not yet resolved.',
        key_facts: ['Signed on Jan 2, 2026', 'Payment due within 30 days'],
        legal_points: ['Section 12 governs late payment penalties'],
      },
    })

    render(<ClientAISummary />)
    await waitFor(() => expect(screen.getByText('Signed Contract')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /Generate Summary/i }))

    await waitFor(() => {
      expect(screen.getByText(/service agreement between two parties/i)).toBeInTheDocument()
    })
    expect(api.summarizeDocument).toHaveBeenCalledWith(1)
    expect(screen.getByText('Breach of the payment terms clause.')).toBeInTheDocument()
    expect(screen.getByText('Signed on Jan 2, 2026')).toBeInTheDocument()
    expect(screen.getByText('Section 12 governs late payment penalties')).toBeInTheDocument()
  })

  it('shows a real error if summary generation fails, no fake fallback content', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({})], total: 1 })
    vi.mocked(api.listCaseDocuments).mockResolvedValue({ items: [makeDoc({})], total: 1 })
    vi.mocked(api.summarizeDocument).mockRejectedValue(new Error('AI service unavailable'))

    render(<ClientAISummary />)
    await waitFor(() => expect(screen.getByText('Signed Contract')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /Generate Summary/i }))

    await waitFor(() => {
      expect(screen.getByText('AI service unavailable')).toBeInTheDocument()
    })
  })
})
