import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ClientUpload from '../ClientUpload'
import * as api from '../../lib/api'
import type { Case } from '../../lib/api'

vi.mock('../../lib/api', () => ({
  listCases: vi.fn(),
  uploadDocument: vi.fn(),
  errorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

function makeCase(overrides: Partial<Case>): Case {
  return {
    id: 1,
    case_number: 'WK-2026-001',
    title: 'Test Case',
    case_type: 'Civil',
    status: 'Active',
    priority: 'Medium',
    description: null,
    deadline: null,
    num_documents: 0,
    created_at: '2026-01-01T00:00:00Z',
    client_id: 17,
    client_name: 'Test Client',
    lawyer_name: null,
    ...overrides,
  }
}

function renderUpload() {
  return render(
    <MemoryRouter>
      <ClientUpload />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ClientUpload', () => {
  it('shows a genuine empty state when the client has no cases', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [], total: 0 })
    renderUpload()
    await waitFor(() => {
      expect(screen.getByText(/No cases to upload to yet/i)).toBeInTheDocument()
    })
  })

  it('shows an error state with retry if cases fail to load', async () => {
    vi.mocked(api.listCases).mockRejectedValue(new Error('Network down'))
    renderUpload()
    await waitFor(() => {
      expect(screen.getByText(/Couldn't load your cases/i)).toBeInTheDocument()
    })
    expect(screen.getByText('Network down')).toBeInTheDocument()
  })

  it('rejects an unsupported file type without calling the upload API', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({})], total: 1 })
    renderUpload()
    await waitFor(() => expect(screen.getByLabelText(/Which case is this for/i)).toBeInTheDocument())

    const input = document.getElementById('client-upload-input') as HTMLInputElement
    const badFile = new File(['data'], 'malware.exe', { type: 'application/x-msdownload' })
    fireEvent.change(input, { target: { files: [badFile] } })

    expect(await screen.findByText(/Only PDF and TXT files are supported/i)).toBeInTheDocument()
    expect(api.uploadDocument).not.toHaveBeenCalled()
  })

  it('stages a valid file, allows removing it before upload, and never calls the API for a removed file', async () => {
    vi.mocked(api.listCases).mockResolvedValue({ items: [makeCase({})], total: 1 })
    renderUpload()
    await waitFor(() => expect(screen.getByLabelText(/Which case is this for/i)).toBeInTheDocument())

    const input = document.getElementById('client-upload-input') as HTMLInputElement
    const goodFile = new File(['contents'], 'evidence.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [goodFile] } })

    expect(await screen.findByText('evidence.pdf')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Remove evidence.pdf/i }))

    expect(screen.queryByText('evidence.pdf')).not.toBeInTheDocument()
    expect(api.uploadDocument).not.toHaveBeenCalled()
  })

  it('uploads a real staged file to the selected case and shows completion', async () => {
    const CASE_A = makeCase({ id: 1, case_number: 'WK-2026-001', title: 'Case A' })
    vi.mocked(api.listCases).mockResolvedValue({ items: [CASE_A], total: 1 })
    vi.mocked(api.uploadDocument).mockImplementation(async (_file, onProgress) => {
      onProgress?.(100)
      return {
        id: 5, filename: 'evidence.pdf', title: 'evidence.pdf', size_bytes: 10,
        num_chunks: 1, created_at: '2026-01-01T00:00:00Z', has_summary: false, ocr_used: false, text: '', summary: null,
      }
    })

    renderUpload()
    await waitFor(() => expect(screen.getByLabelText(/Which case is this for/i)).toBeInTheDocument())

    const input = document.getElementById('client-upload-input') as HTMLInputElement
    fireEvent.change(input, { target: { files: [new File(['contents'], 'evidence.pdf', { type: 'application/pdf' })] } })
    await screen.findByText('evidence.pdf')

    fireEvent.click(screen.getByRole('button', { name: /Upload 1 file/i }))

    await waitFor(() => {
      expect(screen.getByText('Upload complete.')).toBeInTheDocument()
    })
    expect(api.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'evidence.pdf' }),
      expect.any(Function),
      1,
    )
  })
})
