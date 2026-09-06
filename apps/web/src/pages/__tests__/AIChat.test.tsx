import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AIChat from '../AIChat'
import * as api from '../../lib/api'
import type { Case } from '../../lib/api'

vi.mock('../../lib/api', () => ({
  askQuestion: vi.fn(),
  askCaseQuestion: vi.fn(),
  listCases: vi.fn(),
  errorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

let mockUser: { name: string; role: string } | null = { name: 'Test User', role: 'lawyer' }
vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ user: mockUser }),
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
  mockUser = { name: 'Test User', role: 'lawyer' }
})

function renderChat() {
  return render(
    <MemoryRouter>
      <AIChat />
    </MemoryRouter>,
  )
}

describe('AIChat', () => {
  it('a lawyer sees no case selector and uses the general askQuestion()', async () => {
    renderChat()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()

    vi.mocked(api.askQuestion).mockResolvedValue({
      answer: 'General answer.', confidence: { level: 'high', reason: 'x' }, sources: [], model: 'ollama',
    })
    fireEvent.change(screen.getByPlaceholderText(/Ask about your uploaded documents/i), { target: { value: 'Hello?' } })
    fireEvent.click(screen.getByRole('button', { name: '' }))

    await waitFor(() => expect(screen.getByText('General answer.')).toBeInTheDocument())
    expect(api.askQuestion).toHaveBeenCalled()
    expect(api.askCaseQuestion).not.toHaveBeenCalled()
  })

  it('a client sees a genuine empty state when they have no cases, input disabled', async () => {
    mockUser = { name: 'Test Client', role: 'client' }
    vi.mocked(api.listCases).mockResolvedValue({ items: [], total: 0 })

    renderChat()
    await waitFor(() => {
      expect(screen.getByText(/No cases assigned yet/i)).toBeInTheDocument()
    })
    expect(screen.getByPlaceholderText(/No cases assigned yet/i)).toBeDisabled()
  })

  it('a client sees a case selector and questions are answered via the case-scoped askCaseQuestion()', async () => {
    mockUser = { name: 'Test Client', role: 'client' }
    vi.mocked(api.listCases).mockResolvedValue({
      items: [makeCase({ id: 5, case_number: 'WK-2026-005', title: 'Rent Dispute' })],
      total: 1,
    })
    vi.mocked(api.askCaseQuestion).mockResolvedValue({
      answer: 'Case-specific answer.', confidence: { level: 'medium', reason: 'x' }, sources: [], model: 'extractive',
    })

    renderChat()
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument())

    fireEvent.change(screen.getByPlaceholderText(/Ask about your uploaded documents/i), { target: { value: 'What is my case about?' } })
    fireEvent.click(screen.getByRole('button', { name: '' }))

    await waitFor(() => expect(screen.getByText('Case-specific answer.')).toBeInTheDocument())
    expect(api.askCaseQuestion).toHaveBeenCalledWith('What is my case about?', 5)
    expect(api.askQuestion).not.toHaveBeenCalled()
  })

  it('shows an animated loading indicator, not a frozen-looking static one, while waiting for a response', async () => {
    vi.mocked(api.askQuestion).mockReturnValue(new Promise(() => {})) // never resolves
    renderChat()

    fireEvent.change(screen.getByPlaceholderText(/Ask about your uploaded documents/i), { target: { value: 'Hello?' } })
    fireEvent.click(screen.getByRole('button', { name: '' }))

    await waitFor(() => {
      expect(screen.getByText(/Analyzing your documents/i)).toBeInTheDocument()
    })
    const dots = document.querySelectorAll('[style*="wk-chat-dot"]')
    expect(dots.length).toBe(3)
  })
})
