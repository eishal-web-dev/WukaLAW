import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ClientDownloads from '../ClientDownloads'
import * as api from '../../lib/api'

vi.mock('../../lib/api', () => ({
  listMyReports: vi.fn(),
  getReport: vi.fn(),
  errorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

beforeEach(() => {
  vi.clearAllMocks()
  global.URL.createObjectURL = vi.fn(() => 'blob:mock')
  global.URL.revokeObjectURL = vi.fn()
})

function renderPage() {
  return render(
    <MemoryRouter>
      <ClientDownloads />
    </MemoryRouter>,
  )
}

describe('ClientDownloads', () => {
  it('shows a genuine empty state when no reports have been generated', async () => {
    vi.mocked(api.listMyReports).mockResolvedValue([])
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/No reports yet/i)).toBeInTheDocument()
    })
  })

  it('shows an error state with retry on failure', async () => {
    vi.mocked(api.listMyReports).mockRejectedValue(new Error('Server down'))
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/Couldn't load your reports/i)).toBeInTheDocument()
    })
    expect(screen.getByText('Server down')).toBeInTheDocument()
  })

  it('lists real generated reports, never fabricated entries', async () => {
    vi.mocked(api.listMyReports).mockResolvedValue([
      { id: 1, case_id: 5, case_number: 'WK-2026-005', report_type: 'case_summary', title: 'Case Summary Report — WK-2026-005', created_at: '2026-06-01T00:00:00Z' },
    ])
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Case Summary Report — WK-2026-005')).toBeInTheDocument()
    })
    expect(screen.getByText('WK-2026-005')).toBeInTheDocument()

    // Never the old mock's fabricated content.
    expect(screen.queryByText(/WL-2024/)).not.toBeInTheDocument()
    expect(screen.queryByText('DataTech LLC IP Dispute')).not.toBeInTheDocument()
    expect(screen.queryByText(/2\.4 MB/)).not.toBeInTheDocument()
  })

  it('downloads a real report by fetching its full content via getReport()', async () => {
    vi.mocked(api.listMyReports).mockResolvedValue([
      { id: 1, case_id: 5, case_number: 'WK-2026-005', report_type: 'case_summary', title: 'Report Title', created_at: '2026-06-01T00:00:00Z' },
    ])
    vi.mocked(api.getReport).mockResolvedValue({
      id: 1, case_id: 5, case_number: 'WK-2026-005', report_type: 'case_summary',
      title: 'Report Title', created_at: '2026-06-01T00:00:00Z', content: 'real report content',
    })

    renderPage()
    await waitFor(() => expect(screen.getByText('Report Title')).toBeInTheDocument())

    fireEvent.click(screen.getByTitle('Download'))

    await waitFor(() => {
      expect(api.getReport).toHaveBeenCalledWith(1)
    })
  })
})
