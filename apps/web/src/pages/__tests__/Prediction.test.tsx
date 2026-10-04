import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import Prediction from '../Prediction'
import * as api from '../../lib/api'
import type { Case, CasePrediction } from '../../lib/api'

vi.mock('../../lib/api', () => ({
  listCases: vi.fn(),
  getCasePrediction: vi.fn(),
  errorMessage: (error: unknown) => error instanceof Error ? error.message : 'Something went wrong.',
}))

const cases: Case[] = [
  {
    id: 11, case_number: 'WL-2026-011', title: 'Custody matter', case_type: 'Family',
    status: 'Currently Going On', priority: 'High', description: 'Custody dispute', deadline: null,
    num_documents: 3, created_at: '2026-10-01T00:00:00Z', client_id: 31,
    client_name: 'Client One', lawyer_name: 'Lawyer',
  },
  {
    id: 22, case_number: 'WL-2026-022', title: 'Dower matter', case_type: 'Family',
    status: 'Started', priority: 'Medium', description: 'Dower recovery', deadline: null,
    num_documents: 2, created_at: '2026-10-02T00:00:00Z', client_id: 32,
    client_name: 'Client Two', lawyer_name: 'Lawyer',
  },
]

const assessment = (caseTitle: string): CasePrediction => ({
  available: true,
  assessment_type: 'procedural_guidance',
  assessment: `Assessment for ${caseTitle}`,
  generated_at: '2026-10-03T00:00:00Z',
  probability: null,
  factors: [],
  supporting_factors: [`Documents for ${caseTitle}`],
  disclaimer: 'Decision-support only.',
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(api.listCases).mockResolvedValue({ items: cases, total: cases.length })
  vi.mocked(api.getCasePrediction).mockImplementation(async (id) =>
    Number(id) === 11 ? assessment('Custody matter') : assessment('Dower matter'))
})

describe('lawyer court prediction', () => {
  it('requires one assigned case before requesting an assessment', async () => {
    render(<Prediction />)

    expect(await screen.findByText('Select a case to begin')).toBeInTheDocument()
    expect(api.getCasePrediction).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Case to assess'), { target: { value: '11' } })

    expect(await screen.findByText('Assessment for Custody matter')).toBeInTheDocument()
    expect(api.getCasePrediction).toHaveBeenCalledTimes(1)
    expect(api.getCasePrediction).toHaveBeenCalledWith(11)
  })

  it('clears the old result and requests only the newly selected case', async () => {
    render(<Prediction />)
    await screen.findByText('Select a case to begin')
    const selector = screen.getByLabelText('Case to assess')

    fireEvent.change(selector, { target: { value: '11' } })
    expect(await screen.findByText('Assessment for Custody matter')).toBeInTheDocument()

    fireEvent.change(selector, { target: { value: '22' } })
    await waitFor(() => expect(screen.queryByText('Assessment for Custody matter')).not.toBeInTheDocument())
    expect(await screen.findByText('Assessment for Dower matter')).toBeInTheDocument()
    expect(api.getCasePrediction).toHaveBeenLastCalledWith(22)
  })
})
