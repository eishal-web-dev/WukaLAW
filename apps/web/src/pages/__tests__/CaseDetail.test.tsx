import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import CaseDetail from '../CaseDetail'
import * as api from '../../lib/api'
import type { Case, ContradictionsResponse } from '../../lib/api'

vi.mock('../../lib/api', () => ({
  getCase: vi.fn(),
  listCaseDocuments: vi.fn(),
  analyzeCaseContradictions: vi.fn(),
  uploadDocument: vi.fn(),
  errorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

const CASE: Case = {
  id: 3,
  case_number: 'WK-2026-003',
  title: 'Employment Dispute',
  case_type: 'Labour',
  status: 'Active',
  priority: 'Medium',
  description: null,
  deadline: null,
  num_documents: 2,
  created_at: '2026-01-15T00:00:00Z',
  client_id: null,
  client_name: null,
  lawyer_name: null,
}

const RESULT: ContradictionsResponse = {
  pairs: [
    {
      a: {
        document_id: 21,
        document_title: 'Witness Statement A.pdf',
        text: 'The meeting took place on 3 May 2025.',
      },
      b: {
        document_id: 22,
        document_title: 'Witness Statement B.pdf',
        text: 'No meeting occurred in May 2025.',
      },
      score: 0.82,
    },
  ],
  documents_analyzed: 2,
  disclaimer: 'Automated analysis — verify against the source documents.',
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => {
    resolve = r
  })
  return { promise, resolve }
}

function renderCaseDetail() {
  return render(
    <MemoryRouter initialEntries={['/cases/3']}>
      <Routes>
        <Route path="/cases/:id" element={<CaseDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CaseDetail contradictions analysis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.getCase).mockResolvedValue(CASE)
    vi.mocked(api.listCaseDocuments).mockResolvedValue({ items: [], total: 0 })
  })

  describe('given a case with conflicting documents', () => {
    it('shows an analyzing state after clicking the button, then renders conflict pairs', async () => {
      const analysis = deferred<ContradictionsResponse>()
      vi.mocked(api.analyzeCaseContradictions).mockReturnValue(analysis.promise)

      renderCaseDetail()

      const button = await screen.findByRole('button', { name: /Detect Contradictions/ })
      fireEvent.click(button)

      expect(
        await screen.findByText(/Analyzing statements across documents/),
      ).toBeInTheDocument()
      expect(api.analyzeCaseContradictions).toHaveBeenCalledWith('3')

      analysis.resolve(RESULT)

      expect(await screen.findByText('82% conflict')).toBeInTheDocument()
      expect(screen.getByText('The meeting took place on 3 May 2025.')).toBeInTheDocument()
      expect(screen.getByText('No meeting occurred in May 2025.')).toBeInTheDocument()

      const linkA = screen.getByRole('link', { name: /Witness Statement A\.pdf/ })
      expect(linkA).toHaveAttribute('href', '/documents/21')

      expect(
        screen.getByText('Automated analysis — verify against the source documents.'),
      ).toBeInTheDocument()
      // Analyzing state is gone once results are in.
      expect(screen.queryByText(/Analyzing statements across documents/)).not.toBeInTheDocument()
    })
  })

  describe('given a case where no contradictions are found', () => {
    it('shows the no-contradictions message', async () => {
      vi.mocked(api.analyzeCaseContradictions).mockResolvedValue({
        pairs: [],
        documents_analyzed: 3,
        disclaimer: 'Automated analysis — verify against the source documents.',
      })

      renderCaseDetail()

      fireEvent.click(await screen.findByRole('button', { name: /Detect Contradictions/ }))

      expect(
        await screen.findByText(
          "No clear contradictions detected across this case's documents.",
        ),
      ).toBeInTheDocument()
    })
  })
})
