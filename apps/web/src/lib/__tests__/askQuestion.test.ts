import { afterEach, describe, expect, it, vi } from 'vitest'
import { askQuestion, setAuthStorage } from '../api'

describe('askQuestion — authenticated document API', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  const askResponse = {
    answer: 'Bail may be granted [C1].',
    confidence: { level: 'high', reason: 'Relevant passages found.' },
    sources: [],
    model: 'ollama/qwen2.5:3b',
  }

  it('sends the question to /api/v1/ask with the signed-in user token', async () => {
    setAuthStorage('real-token', {
      id: 1,
      email: 'lawyer@example.com',
      name: 'Lawyer',
      role: 'lawyer',
      created_at: '2026-01-01T00:00:00Z',
    })
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(askResponse), { status: 200 }))

    await askQuestion('Was bail granted?')

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/ask', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        Authorization: 'Bearer real-token',
        'Content-Type': 'application/json',
      }),
    }))
    expect(JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string)).toEqual({
      question: 'Was bail granted?',
    })
  })

  it('reports the real provider from the response instead of a hardcoded label', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(askResponse), { status: 200 }),
    )
    const res = await askQuestion('what is section 302')
    expect(res.model).toBe('ollama/qwen2.5:3b')
  })
})
