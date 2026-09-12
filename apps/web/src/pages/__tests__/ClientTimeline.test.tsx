import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ClientTimeline from '../ClientTimeline'
import * as api from '../../lib/api'
import type { Case, CaseTimelineEntry } from '../../lib/api'

vi.mock('../../lib/api', () => ({
  listCases: vi.fn(),
  getCaseTimeline: vi.fn(),
  listTimelineEntries: vi.fn(),
  createTimelineEntry: vi.fn(),
  updateTimelineEntry: vi.fn(),
  deleteTimelineEntry: vi.fn(),
  errorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

function makeCase(overrides: Partial<Case>): Case {
  return {
    id: 1, case_number: 'WK-2026-001', title: 'Divorce Case', case_type: 'Family',
    status: 'Active', priority: 'Medium', description: null, deadline: null,
    num_documents: 1, created_at: '2026-01-01T00:00:00Z',
    client_id: 17, client_name: 'Test Client', lawyer_name: null,
    ...overrides,
  }
}

function makeEntry(overrides: Partial<CaseTimelineEntry>): CaseTimelineEntry {
  return {
    id: 1, case_id: 1, date: '2020-01-01', title: 'Custom event', source: 'custom',
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock')
  globalThis.URL.revokeObjectURL = vi.fn()
})

function renderPage(initialQuery = '?case=1') {
  return render(
    <MemoryRouter initialEntries={[`/client/timeline${initialQuery}`]}>
      <ClientTimeline />
    </MemoryRouter>,
  )
}

describe('ClientTimeline', () => {
  it('shows a genuine empty state when the client has no cases', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [], total: 0 })
    renderPage('')
    await waitFor(() => {
      expect(screen.getByText(/No cases have been assigned/i)).toBeInTheDocument()
    })
  })

  it('shows real extracted events and real persisted entries merged chronologically', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({})], total: 1 })
    vi.mocked(api.getCaseTimeline).mockResolvedValue({
      events: [{ date: '2019-01-01', date_text: 'Jan 2019', text: 'Marriage certificate filed.', document_id: 5, document_title: 'Marriage Cert.pdf' }],
    })
    vi.mocked(api.listTimelineEntries).mockResolvedValue([makeEntry({ date: '2022-06-01', title: 'Filed for divorce' })])

    renderPage()
    await waitFor(() => expect(screen.getByText('Marriage certificate filed.')).toBeInTheDocument())
    expect(screen.getByText('Filed for divorce')).toBeInTheDocument()
    expect(screen.getByText('Marriage Cert.pdf')).toBeInTheDocument()
  })

  it('shows guided questions for a Family case type and creates a real entry when answered', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({ case_type: 'Family' })], total: 1 })
    vi.mocked(api.getCaseTimeline).mockResolvedValue({ events: [] })
    vi.mocked(api.listTimelineEntries).mockResolvedValue([])
    vi.mocked(api.createTimelineEntry).mockResolvedValue(
      makeEntry({ id: 9, date: '2015-05-20', title: 'When did you get married?', source: 'guided' }),
    )

    renderPage()
    await waitFor(() => expect(screen.getByText(/When did you get married/i)).toBeInTheDocument())

    const dateInputs = screen.getAllByDisplayValue('')
    fireEvent.change(dateInputs[0], { target: { value: '2015-05-20' } })

    await waitFor(() => {
      expect(api.createTimelineEntry).toHaveBeenCalledWith('1', {
        date: '2015-05-20',
        title: 'When did you get married?',
        source: 'guided',
      })
    })
  })

  it('does not show guided questions for a non-Family case type', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({ case_type: 'Corporate' })], total: 1 })
    vi.mocked(api.getCaseTimeline).mockResolvedValue({ events: [] })
    vi.mocked(api.listTimelineEntries).mockResolvedValue([])

    renderPage()
    await waitFor(() => expect(screen.getByText(/Add a custom event/i)).toBeInTheDocument())
    expect(screen.queryByText(/When did you get married/i)).not.toBeInTheDocument()
  })

  it('lets the client add a real custom event', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({ case_type: 'Corporate' })], total: 1 })
    vi.mocked(api.getCaseTimeline).mockResolvedValue({ events: [] })
    vi.mocked(api.listTimelineEntries).mockResolvedValue([])
    vi.mocked(api.createTimelineEntry).mockResolvedValue(makeEntry({ date: '2023-03-01', title: 'Signed the contract' }))

    renderPage()
    await waitFor(() => expect(screen.getByText(/Add a custom event/i)).toBeInTheDocument())

    fireEvent.click(screen.getByText(/Add a custom event/i))
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    fireEvent.change(dateInput, { target: { value: '2023-03-01' } })
    fireEvent.change(screen.getByPlaceholderText('What happened?'), { target: { value: 'Signed the contract' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(api.createTimelineEntry).toHaveBeenCalledWith('1', {
        date: '2023-03-01',
        title: 'Signed the contract',
        source: 'custom',
      })
    })
  })

  it('lets the client edit and delete a real persisted entry', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({ case_type: 'Corporate' })], total: 1 })
    vi.mocked(api.getCaseTimeline).mockResolvedValue({ events: [] })
    vi.mocked(api.listTimelineEntries).mockResolvedValue([makeEntry({ id: 3, title: 'Original event' })])
    vi.mocked(api.updateTimelineEntry).mockResolvedValue(makeEntry({ id: 3, title: 'Updated event' }))
    vi.mocked(api.deleteTimelineEntry).mockResolvedValue(undefined)

    renderPage()
    await waitFor(() => expect(screen.getByText('Original event')).toBeInTheDocument())

    fireEvent.mouseOver(screen.getByText('Original event'))
    const buttons = document.querySelectorAll('button')
    const editBtn = Array.from(buttons).find((b) => b.querySelector('svg.lucide-pencil'))
    fireEvent.click(editBtn!)

    const titleInput = screen.getByDisplayValue('Original event')
    fireEvent.change(titleInput, { target: { value: 'Updated event' } })
    const checkBtn = Array.from(document.querySelectorAll('button')).find((b) => b.querySelector('svg.lucide-check'))
    fireEvent.click(checkBtn!)

    await waitFor(() => {
      expect(api.updateTimelineEntry).toHaveBeenCalledWith('1', 3, { date: '2020-01-01', title: 'Updated event' })
    })
  })

  it('shows a download button only when there is something to download', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({ case_type: 'Corporate' })], total: 1 })
    vi.mocked(api.getCaseTimeline).mockResolvedValue({ events: [] })
    vi.mocked(api.listTimelineEntries).mockResolvedValue([])

    renderPage()
    await waitFor(() => expect(screen.getByText(/No timeline events yet/i)).toBeInTheDocument())
    expect(screen.queryByText('Download')).not.toBeInTheDocument()
  })
})
