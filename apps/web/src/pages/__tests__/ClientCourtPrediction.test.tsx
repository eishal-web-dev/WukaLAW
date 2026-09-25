import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ClientCourtPrediction from '../ClientCourtPrediction'
import * as api from '../../lib/api'
import type { Case } from '../../lib/api'

vi.mock('../../lib/api', () => ({
  listCases: vi.fn(),
  getCasePrediction: vi.fn(),
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
})

describe('ClientCourtPrediction', () => {
  it('shows a genuine empty state when the client has no cases', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [], total: 0 })
    render(<ClientCourtPrediction />)
    await waitFor(() => {
      expect(screen.getByText(/No cases assigned yet/i)).toBeInTheDocument()
    })
  })

  it('shows an honest "Not generated" state when no prediction exists, never a fake percentage', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({})], total: 1 })
    vi.mocked(api.getCasePrediction).mockResolvedValue({
      available: false,
      generated_at: null,
      probability: null,
      factors: [],
      disclaimer: 'Court outcome prediction has not been generated for this case.',
    })

    render(<ClientCourtPrediction />)
    await waitFor(() => {
      expect(screen.getByText('Not generated')).toBeInTheDocument()
    })
    expect(screen.getByText(/has not been generated/i)).toBeInTheDocument()

    // Explicitly never the old mock's fabricated content.
    expect(screen.queryByText(/85%/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Judge Wells/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Dr\. Morse/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/47 similar cases/i)).not.toBeInTheDocument()
  })

  it('renders a real prediction with real factors when one genuinely exists', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({})], total: 1 })
    vi.mocked(api.getCasePrediction).mockResolvedValue({
      available: true,
      generated_at: '2026-06-01T00:00:00Z',
      probability: 62,
      factors: [{ label: 'Strong documentary evidence', contribution: 10 }],
      disclaimer: 'This is an estimate, not legal advice.',
    })

    render(<ClientCourtPrediction />)
    await waitFor(() => {
      expect(screen.getByText('62%')).toBeInTheDocument()
    })
    expect(screen.getByText('Strong documentary evidence')).toBeInTheDocument()
    expect(screen.getByText('This is an estimate, not legal advice.')).toBeInTheDocument()
  })

  it('renders an evidence-grounded assessment without inventing a percentage', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({})], total: 1 })
    vi.mocked(api.getCasePrediction).mockResolvedValue({
      available: true,
      assessment_type: 'ai_scenario_analysis',
      model: 'fake/test',
      assessment: 'Your documents support the recorded chronology, but the opposing account is not available.',
      generated_at: '2026-09-25T00:00:00Z',
      probability: null,
      factors: [],
      supporting_factors: ['One verified document is available.'],
      missing_information: ['Add the opposing party response.'],
      readiness: true,
      disclaimer: 'Decision-support only. No win percentage is shown.',
    })

    render(<ClientCourtPrediction />)
    expect(await screen.findByText('Evidence-grounded assessment')).toBeInTheDocument()
    expect(screen.getByText(/documents support the recorded chronology/i)).toBeInTheDocument()
    expect(screen.getByText(/One verified document/i)).toBeInTheDocument()
    expect(screen.getByText(/Add the opposing party response/i)).toBeInTheDocument()
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
  })
})
