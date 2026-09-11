import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import ClientSimilarCases from '../ClientSimilarCases'
import * as api from '../../lib/api'
import type { Case } from '../../lib/api'

vi.mock('../../lib/api', () => ({
  listCases: vi.fn(),
  errorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

vi.mock('../../components/CasePathwayIntelligence', () => ({
  default: ({ caseId }: { caseId: number }) => <div>Pathway for case {caseId}</div>,
}))
vi.mock('../../components/CaseSimilarJudgments', () => ({
  default: ({ caseId }: { caseId: number }) => <div>Similar judgments for case {caseId}</div>,
}))

function makeCase(overrides: Partial<Case>): Case {
  return {
    id: 1, case_number: 'WK-2026-001', title: 'Test Case', case_type: 'Civil',
    status: 'Active', priority: 'Medium', description: null, deadline: null,
    num_documents: 2, created_at: '2026-01-01T00:00:00Z',
    client_id: 17, client_name: 'Test Client', lawyer_name: null,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ClientSimilarCases', () => {
  it('shows a genuine empty state when the client has no cases', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [], total: 0 })
    render(<ClientSimilarCases />)
    await waitFor(() => {
      expect(screen.getByText(/No cases assigned yet/i)).toBeInTheDocument()
    })
  })

  it('prompts to choose a case before showing any results', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({})], total: 1 })
    render(<ClientSimilarCases />)
    await waitFor(() => {
      expect(screen.getByText('Choose a case above')).toBeInTheDocument()
    })
    expect(screen.queryByText(/Pathway for case/)).not.toBeInTheDocument()
  })

  it('renders the real pathway and similar-judgments components once a case is chosen', async () => {
    vi.mocked(api.listCases).mockResolvedValue({
      items: [makeCase({ id: 9, case_number: 'WK-2026-009', title: 'Land Dispute' })],
      total: 1,
    })
    render(<ClientSimilarCases />)
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument())

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '9' } })

    await waitFor(() => {
      expect(screen.getByText('Pathway for case 9')).toBeInTheDocument()
    })
    expect(screen.getByText('Similar judgments for case 9')).toBeInTheDocument()
    expect(screen.getByText('WK-2026-009')).toBeInTheDocument()
  })
})
