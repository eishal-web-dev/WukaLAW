import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../lib/auth'
import { setAuthStorage } from '../../lib/api'
import { CPDashboardPageV2 } from '../../figma/ClientPortalPages'

beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Client dashboard identity', () => {
  it('shows the currently signed-in client instead of sample identity data', () => {
    setAuthStorage('test-token', {
      id: 17,
      name: 'Eishal Khan',
      email: 'eishal@example.com',
      role: 'client',
    })
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      id: 17,
      name: 'Eishal Khan',
      email: 'eishal@example.com',
      role: 'client',
    }), { status: 200 }))

    render(
      <AuthProvider>
        <CPDashboardPageV2 navigate={() => undefined} />
      </AuthProvider>,
    )

    expect(screen.getByRole('heading', { name: /Eishal Khan/ })).toBeInTheDocument()
    expect(screen.getByText('eishal@example.com')).toBeInTheDocument()
    expect(screen.queryByText('Ahmed Hassan')).not.toBeInTheDocument()
  })
})
