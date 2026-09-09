import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import ClientReportGenerator from '../ClientReportGenerator'
import * as api from '../../lib/api'
import type { Case } from '../../lib/api'

vi.mock('../../lib/api', () => ({
  listCases: vi.fn(),
  generateReport: vi.fn(),
  listCaseReports: vi.fn(),
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

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(api.listCaseReports).mockResolvedValue([])
})

describe('ClientReportGenerator', () => {
  it('shows a genuine empty state when the client has no cases', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [], total: 0 })
    render(<ClientReportGenerator />)
    await waitFor(() => {
      expect(screen.getByText(/No cases assigned yet/i)).toBeInTheDocument()
    })
  })

  it('generates a real report via generateReport() and shows the real result', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({})], total: 1 })
    vi.mocked(api.generateReport).mockResolvedValue({
      id: 5, case_id: 1, case_number: 'WK-2026-001', report_type: 'case_summary',
      title: 'Case Summary Report — WK-2026-001', created_at: '2026-06-01T00:00:00Z',
      content: 'CASE SUMMARY REPORT\n====\nCase: WK-2026-001 — Test Case',
    })

    render(<ClientReportGenerator />)
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /Generate Report/i }))

    await waitFor(() => {
      expect(screen.getByText('Case Summary Report — WK-2026-001')).toBeInTheDocument()
    })
    expect(api.generateReport).toHaveBeenCalledWith(1, 'case_summary')
    expect(screen.getByRole('button', { name: /Download/i })).toBeInTheDocument()
  })

  it('shows previously generated reports for the selected case', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({})], total: 1 })
    vi.mocked(api.listCaseReports).mockResolvedValue([
      { id: 1, case_id: 1, case_number: 'WK-2026-001', report_type: 'case_summary', title: 'Old Report', created_at: '2026-05-01T00:00:00Z' },
    ])

    render(<ClientReportGenerator />)
    await waitFor(() => {
      expect(screen.getByText('Old Report')).toBeInTheDocument()
    })
  })

  it('shows a real error, no fake report, if generation fails', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({})], total: 1 })
    vi.mocked(api.generateReport).mockRejectedValue(new Error('Server unavailable'))

    render(<ClientReportGenerator />)
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /Generate Report/i }))

    await waitFor(() => {
      expect(screen.getByText('Server unavailable')).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: /Download/i })).not.toBeInTheDocument()
  })
})
