import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import Dashboard from '../Dashboard'
import LawyerCalendar from '../LawyerCalendar'
import LawyerClients from '../LawyerClients'
import * as api from '../../lib/api'

vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { name: 'Counsel' } }) }))
vi.mock('../../lib/notifications', () => ({ useNotifications: () => ({ unreadCount: 0 }) }))
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AreaChart: () => null,
  PieChart: () => null,
  Pie: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Area: () => null, XAxis: () => null, YAxis: () => null, CartesianGrid: () => null,
  Tooltip: () => null, Cell: () => null,
}))
vi.mock('../../lib/api', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../lib/api')>(),
  listCases: vi.fn(), listDocuments: vi.fn(), listCalendarEvents: vi.fn(), listHearings: vi.fn(),
  listLawyerClients: vi.fn(), createCalendarEvent: vi.fn(), deleteCalendarEvent: vi.fn(),
}))

const future = new Date(Date.now() + 7 * 86400000).toISOString()
const past = new Date(Date.now() - 7 * 86400000).toISOString()
const baseCase = { id: 1, case_number: 'WL-1', title: 'Real matter', case_type: 'Family', status: 'Currently Going On' as const, priority: 'High' as const, description: 'Facts', deadline: past, num_documents: 2, created_at: '2026-09-01T00:00:00Z', client_id: 5, client_name: 'A Client', lawyer_name: 'Counsel' }

afterEach(cleanup)
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(api.listCases).mockResolvedValue({ items: [baseCase], total: 1 })
  vi.mocked(api.listDocuments).mockResolvedValue({ items: [], total: 0 })
  vi.mocked(api.listCalendarEvents).mockResolvedValue([{ id: 2, case_id: 1, case_number: 'WL-1', case_title: 'Real matter', title: 'Future client meeting', starts_at: future, ends_at: null, event_type: 'Meeting', location: 'Office', notes: '', created_at: past }])
  vi.mocked(api.listHearings).mockResolvedValue([])
  vi.mocked(api.listLawyerClients).mockResolvedValue([{ id: 5, name: 'A Client', email: 'client@example.com', case_count: 1, active_case_count: 1, document_count: 2, last_case_at: '2026-09-01T00:00:00Z', cases: [baseCase] }])
})

describe('live lawyer portal pages', () => {
  it('shows future live schedule items without negative expired-day cards', async () => {
    render(<MemoryRouter><Dashboard/></MemoryRouter>)
    expect(await screen.findByText('Future client meeting')).toBeInTheDocument()
    expect(screen.queryByText(/^-\d+$/)).not.toBeInTheDocument()
    expect(screen.getByText('Upcoming Schedule')).toBeInTheDocument()
  })

  it('uses assigned client data instead of demo portfolio figures', async () => {
    render(<MemoryRouter initialEntries={['/clients']}><Routes><Route path="/clients" element={<LawyerClients/>}/></Routes></MemoryRouter>)
    expect(await screen.findByText('client@example.com')).toBeInTheDocument()
    expect(screen.queryByText('47')).not.toBeInTheDocument()
    expect(screen.queryByText(/PKR 9.3M/i)).not.toBeInTheDocument()
  })

  it('offers a selected-day agenda and clearly labelled event form', async () => {
    render(<MemoryRouter><LawyerCalendar/></MemoryRouter>)
    expect(await screen.findByText('Selected day')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Add event' }))
    expect(screen.getByRole('heading', { name: 'New calendar event' })).toBeInTheDocument()
    expect(screen.getByText('Related case')).toBeInTheDocument()
    await waitFor(() => expect(api.listCalendarEvents).toHaveBeenCalledOnce())
  })
})
