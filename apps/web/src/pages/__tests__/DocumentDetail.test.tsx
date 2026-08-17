import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import DocumentDetail from '../DocumentDetail'
import * as api from '../../lib/api'
import type { Document } from '../../lib/api'

vi.mock('../../lib/api', () => ({
  getDocument: vi.fn(),
  summarizeDocument: vi.fn(),
  getDocumentCitations: vi.fn(),
  errorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

const DOC: Document = {
  id: 7,
  filename: 'judgment.pdf',
  title: 'Supreme Court Judgment',
  size_bytes: 20480,
  num_chunks: 4,
  created_at: '2026-02-01T09:00:00Z',
  has_summary: false,
  ocr_used: false,
  text: 'Full extracted text…',
  summary: null,
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/documents/7']}>
      <Routes>
        <Route path="/documents/:id" element={<DocumentDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('DocumentDetail citations section', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.getDocument).mockResolvedValue(DOC)
  })

  describe('given a document with detected citations', () => {
    it('renders citations grouped by type with their context', async () => {
      vi.mocked(api.getDocumentCitations).mockResolvedValue({
        citations: [
          {
            type: 'statute',
            text: 'Section 12 of the Land Act 1998',
            context: 'The plaintiff relied on Section 12 of the Land Act 1998.',
          },
          {
            type: 'constitution',
            text: 'Article 26 of the Constitution',
            context: 'Protection from deprivation of property is guaranteed.',
          },
          {
            type: 'case_law',
            text: 'Mukasa v Attorney General [2019] UGSC 4',
            context: 'The court followed Mukasa v Attorney General.',
          },
        ],
      })

      renderDetail()

      expect(await screen.findByText('Statute')).toBeInTheDocument()
      expect(screen.getByText('Constitution')).toBeInTheDocument()
      expect(screen.getByText('Case Law')).toBeInTheDocument()

      expect(screen.getByText('Section 12 of the Land Act 1998')).toBeInTheDocument()
      expect(
        screen.getByText('The plaintiff relied on Section 12 of the Land Act 1998.'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Mukasa v Attorney General [2019] UGSC 4'),
      ).toBeInTheDocument()
      expect(api.getDocumentCitations).toHaveBeenCalledWith('7')
    })
  })

  describe('given a document with no citations', () => {
    it('shows the empty state', async () => {
      vi.mocked(api.getDocumentCitations).mockResolvedValue({ citations: [] })

      renderDetail()

      expect(await screen.findByText('No citations detected.')).toBeInTheDocument()
    })
  })
})
