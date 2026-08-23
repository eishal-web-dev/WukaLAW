import { afterEach, describe, expect, it, vi } from 'vitest'
import { askQuestion } from '../api'

describe('askQuestion — conversation memory', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const ragResponse = {
    answer: 'Bail may be granted [C1].',
    confidence: 'high',
    validation_status: 'PASS',
    retrieved_chunks: [],
    pipeline_warnings: [],
    llm_provider: 'ollama',
  }

  it('given prior turns, it sends them as history to the RAG endpoint', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(ragResponse), { status: 200 }))

    const history = [
      { role: 'user' as const, content: 'was bail granted for a driving death' },
      { role: 'ai' as const, content: 'Bail depends on the offence [C1].' },
    ]
    await askQuestion('it was an accident', history)

    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string)
    expect(body.question).toBe('it was an accident')
    expect(body.history).toEqual(history)
  })

  it('reports the real provider from the response instead of a hardcoded label', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(ragResponse), { status: 200 }),
    )
    const res = await askQuestion('what is section 302')
    expect(res.model).toBe('ollama')
  })
})
