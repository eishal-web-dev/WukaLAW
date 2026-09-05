import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Timeline from '../Timeline'
import * as api from '../../lib/api'
import type { Case, TimelineEvent } from '../../lib/api'

vi.mock('../../lib/api', () => ({
  listCases: vi.fn(),
  getCaseTimeline: vi.fn(),
  errorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

const CASE: Case = {
  id: 1,
  case_number: 'WK-2026-001',
  title: 'Land Dispute',
  case_type: 'Civil',
  status: 'Active',
  priority: 'High',
  description: null,
  deadline: null,
  num_documents: 2,
  created_at: '2026-01-01T00:00:00Z',
  client_id: null,
  client_name: null,
  lawyer_name: null,
}

const EVENTS: TimelineEvent[] = [
  // Deliberately out of order — the page must render chronologically.
  {
    date: '2026-03-10',
    date_text: '10 March 2026',
    text: 'Hearing scheduled before the High Court',
    document_id: 12,
    document_title: 'Hearing Notice.pdf',
  },
  {
    date: '2025-11-02',
    date_text: '2nd November 2025',
    text: 'Contract signed by both parties',
    document_id: 11,
    document_title: 'Sale Agreement.pdf',
  },
]

function renderTimeline(initialEntry = '/timeline?case=1') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Timeline />
    </MemoryRouter>,
  )
}

describe('Timeline page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('given a case with dated documents', () => {
    it('shows a loading state while the timeline is being fetched', async () => {
      vi.mocked(api.listCases).mockResolvedValue({ items: [CASE], total: 1 })
      vi.mocked(api.getCaseTimeline).mockReturnValue(new Promise(() => {}))

      renderTimeline()

      expect(await screen.findByText('Loading timeline…')).toBeInTheDocument()
      expect(api.getCaseTimeline).toHaveBeenCalledWith('1')
    })

    it('renders events chronologically with source document links', async () => {
      vi.mocked(api.listCases).mockResolvedValue({ items: [CASE], total: 1 })
      vi.mocked(api.getCaseTimeline).mockResolvedValue({ events: EVENTS })

      renderTimeline()

      await screen.findByText('Contract signed by both parties')
      const items = screen.getAllByRole('listitem')
      expect(items).toHaveLength(2)
      // Earliest event first, even though the API returned it second.
      expect(items[0].textContent).toContain('Contract signed by both parties')
      expect(items[1].textContent).toContain('Hearing scheduled before the High Court')

      const link = screen.getByRole('link', { name: /Sale Agreement\.pdf/ })
      expect(link).toHaveAttribute('href', '/documents/11')
    })
  })

  describe('given a selected case with no dated events', () => {
    it('shows the empty state', async () => {
      vi.mocked(api.listCases).mockResolvedValue({ items: [CASE], total: 1 })
      vi.mocked(api.getCaseTimeline).mockResolvedValue({ events: [] })

      renderTimeline()

      expect(
        await screen.findByText(/No dated events found — upload documents with dates/),
      ).toBeInTheDocument()
    })
  })

  describe('given a user with no cases', () => {
    it('offers a link to the cases page', async () => {
      vi.mocked(api.listCases).mockResolvedValue({ items: [], total: 0 })

      renderTimeline('/timeline')

      const link = await screen.findByRole('link', { name: 'Go to Cases' })
      expect(link).toHaveAttribute('href', '/cases')
      expect(api.getCaseTimeline).not.toHaveBeenCalled()
    })
  })
})
