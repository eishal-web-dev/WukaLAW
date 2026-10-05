import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import LawyerStrategy from '../LawyerStrategy'
import LawyerMessages from '../LawyerMessages'
import LawyerTeam from '../LawyerTeam'
import LawyerBilling from '../LawyerBilling'
import Reports from '../Reports'
import Analytics from '../Analytics'
import * as api from '../../lib/api'
import type { Case } from '../../lib/api'

vi.mock('recharts', () => ({ ResponsiveContainer: ({ children }: { children: unknown }) => children, PieChart: ({ children }: { children: unknown }) => children, Pie: ({ children }: { children: unknown }) => children, Cell: () => null, Tooltip: () => null }))
vi.mock('../../lib/api', () => ({
  listCases: vi.fn(), getCaseStrategy: vi.fn(), saveCaseStrategy: vi.fn(),
  listCaseMessages: vi.fn(), sendCaseMessage: vi.fn(), getStoredUser: vi.fn(),
  listTeamMembers: vi.fn(), addTeamMember: vi.fn(), removeTeamMember: vi.fn(), emailTeamMember: vi.fn(),
  getBillingProfile: vi.fn(), saveBillingProfile: vi.fn(),
  listMyReports: vi.fn(), generateReport: vi.fn(), getReport: vi.fn(),
  listLawyerTasks: vi.fn(), listHearings: vi.fn(),
  errorMessage: (error: unknown) => error instanceof Error ? error.message : 'Error',
}))

const caseItem: Case = { id: 7, case_number: 'WL-2026-007', title: 'Custody matter', case_type: 'Family', status: 'Currently Going On', priority: 'High', description: 'Facts', deadline: null, num_documents: 2, created_at: '2026-10-01T00:00:00Z', client_id: 9, client_name: 'Client', lawyer_name: 'Lawyer' }
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(api.listCases).mockResolvedValue({ items: [caseItem], total: 1 })
  vi.mocked(api.getStoredUser).mockReturnValue({ id: 1, name: 'Lawyer', email: 'lawyer@example.com', role: 'lawyer', created_at: '' })
  vi.mocked(api.listLawyerTasks).mockResolvedValue([]); vi.mocked(api.listHearings).mockResolvedValue([]); vi.mocked(api.listMyReports).mockResolvedValue([])
})

describe('live lawyer operations pages', () => {
  it('loads and saves a strategy for the selected case', async () => {
    vi.mocked(api.getCaseStrategy).mockResolvedValue({ id: null, case_id: 7, case_number: 'WL-2026-007', case_title: 'Custody matter', objective: '', case_theory: '', strengths: [], risks: [], next_actions: [], updated_at: null })
    vi.mocked(api.saveCaseStrategy).mockImplementation(async (_id, value) => ({ id: 1, case_id: 7, case_number: 'WL-2026-007', case_title: 'Custody matter', ...value, updated_at: '2026-10-03T00:00:00Z' }))
    render(<LawyerStrategy/>); fireEvent.change(await screen.findByLabelText('Strategy case'), { target: { value: '7' } }); fireEvent.change(await screen.findByPlaceholderText(/What result/), { target: { value: 'Protect custody' } }); fireEvent.click(screen.getByRole('button', { name: 'Save strategy' }))
    await waitFor(() => expect(api.saveCaseStrategy).toHaveBeenCalledWith(7, expect.objectContaining({ objective: 'Protect custody' })))
  })

  it('sends a case-linked client message', async () => {
    vi.mocked(api.listCaseMessages).mockResolvedValue([]); vi.mocked(api.sendCaseMessage).mockResolvedValue({ id: 1, case_id: 7, case_number: 'WL-2026-007', case_title: 'Custody matter', sender_id: 1, sender_name: 'Lawyer', sender_role: 'lawyer', body: 'Bring order', created_at: '2026-10-03T00:00:00Z' })
    render(<LawyerMessages/>); fireEvent.change(await screen.findByLabelText('Message case'), { target: { value: '7' } }); fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Bring order' } }); fireEvent.click(screen.getByLabelText('Send message'))
    expect(await screen.findByText('Bring order')).toBeInTheDocument()
  })

  it('adds a real team directory member', async () => {
    vi.mocked(api.listTeamMembers).mockResolvedValue([]); vi.mocked(api.addTeamMember).mockResolvedValue({ id: 2, name: 'Ayesha', email: 'a@example.com', role: 'Paralegal', notes: '', created_at: '' })
    render(<LawyerTeam/>); fireEvent.click(await screen.findByRole('button', { name: /Add member/i })); fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ayesha' } }); fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@example.com' } }); fireEvent.click(screen.getByRole('button', { name: 'Save member' }))
    await waitFor(() => expect(api.addTeamMember).toHaveBeenCalled())
  })

  it('emails a saved team member through the backend', async () => {
    const member = { id: 2, name: 'Ayesha', email: 'a@example.com', role: 'Paralegal', notes: '', created_at: '' }
    vi.mocked(api.listTeamMembers).mockResolvedValue([member]); vi.mocked(api.emailTeamMember).mockResolvedValue({ delivered: true, recipient: member.email, provider_message_id: 'email-1' })
    render(<LawyerTeam/>); fireEvent.click(await screen.findByRole('button', { name: 'Email member' })); fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Hearing update' } }); fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Please prepare the file.' } }); fireEvent.click(screen.getByRole('button', { name: 'Send email' }))
    expect(await screen.findByText('Email sent to a@example.com')).toBeInTheDocument()
  })

  it('shows actual billing usage and saves invoice defaults', async () => {
    const profile = { business_name: '', currency: 'PKR' as const, hourly_rate: 0, invoice_notes: '', plan: 'Workspace', payment_status: 'No payment provider configured', usage: { cases: 1, documents: 2, reports: 0 }, updated_at: null }
    vi.mocked(api.getBillingProfile).mockResolvedValue(profile); vi.mocked(api.saveBillingProfile).mockResolvedValue({ ...profile, business_name: 'Khan Law' })
    render(<LawyerBilling/>); expect(await screen.findByText('No payment provider configured. No fake card, invoice, charge, or renewal data is displayed.')).toBeInTheDocument(); fireEvent.change(screen.getByLabelText('Business or chamber name'), { target: { value: 'Khan Law' } }); fireEvent.click(screen.getByRole('button', { name: /Save settings/i })); await waitFor(() => expect(api.saveBillingProfile).toHaveBeenCalled())
  })

  it('generates a report for one selected case', async () => {
    vi.mocked(api.generateReport).mockResolvedValue({ id: 3, case_id: 7, case_number: 'WL-2026-007', report_type: 'case_summary', title: 'Case Summary', created_at: '', content: 'Real content' })
    render(<Reports generatorOnly/>); fireEvent.change(await screen.findByLabelText('Report case'), { target: { value: '7' } }); fireEvent.click(screen.getByRole('button', { name: 'Generate report' })); expect(await screen.findByText('Real content')).toBeInTheDocument()
  })

  it('uses live analytics and never displays fake win rate or revenue', async () => {
    render(<Analytics/>); expect(await screen.findByText('Assigned cases')).toBeInTheDocument(); expect(screen.queryByText(/78\.4%|847K/i)).not.toBeInTheDocument()
  })
})
