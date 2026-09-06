import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Documents from '../Documents'
import * as api from '../../lib/api'
import type { DocumentMeta } from '../../lib/api'

const navigateMock = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => navigateMock }
})

vi.mock('../../lib/api', () => ({
  listDocuments: vi.fn(),
  errorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

let mockUser: { role: string } | null = null
vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ user: mockUser }),
}))

function makeDoc(overrides: Partial<DocumentMeta>): DocumentMeta {
  return {
    id: 1,
    filename: 'file.pdf',
    title: 'Test Document',
    size_bytes: 1000,
    num_chunks: 3,
    created_at: '2026-01-01T00:00:00Z',
    has_summary: false,
    ocr_used: false,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUser = null
})

function renderDocuments() {
  return render(
    <MemoryRouter>
      <Documents />
    </MemoryRouter>,
  )
}

describe('Documents (role-aware upload)', () => {
  it('shows the full unscoped upload zone for a lawyer', async () => {
    mockUser = { role: 'lawyer' }
    vi.mocked(api.listDocuments).mockResolvedValue({ items: [makeDoc({})], total: 1 })
    renderDocuments()
    await waitFor(() => expect(screen.getByText('Test Document')).toBeInTheDocument())

    expect(screen.getByText('Drop files here to upload')).toBeInTheDocument()
    expect(screen.queryByText(/Upload a document to one of your cases/i)).not.toBeInTheDocument()
  })

  it('shows a case-aware upload link (not the unscoped zone) for a client', async () => {
    mockUser = { role: 'client' }
    vi.mocked(api.listDocuments).mockResolvedValue({ items: [makeDoc({})], total: 1 })
    renderDocuments()
    await waitFor(() => expect(screen.getByText('Test Document')).toBeInTheDocument())

    expect(screen.queryByText('Drop files here to upload')).not.toBeInTheDocument()
    const link = screen.getByText(/Upload a document to one of your cases/i)
    expect(link).toBeInTheDocument()

    fireEvent.click(link)
    expect(navigateMock).toHaveBeenCalledWith('/client/upload')
  })
})
