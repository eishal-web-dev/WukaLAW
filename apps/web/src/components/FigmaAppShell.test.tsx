import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import FigmaAppShell from './FigmaAppShell'

vi.mock('../lib/auth', () => ({
  useAuth: () => ({
    user: { name: 'Portal User', role: 'client' },
    logout: vi.fn(),
  }),
}))

vi.mock('../lib/notifications', () => ({
  useNotifications: () => ({ unreadCount: 0 }),
}))

vi.mock('../lib/theme', () => ({
  useTheme: () => ({ dark: false, toggleDark: vi.fn() }),
}))

describe('FigmaAppShell', () => {
  it('provides one vertical scroll viewport for every portal route', () => {
    render(
      <MemoryRouter initialEntries={['/client']}>
        <Routes>
          <Route element={<FigmaAppShell />}>
            <Route path="/client" element={<div>Client dashboard content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const viewport = screen.getByTestId('portal-scroll-viewport')
    expect(viewport).toHaveClass('min-h-0', 'overflow-y-auto', 'overflow-x-hidden')
    expect(viewport).toContainElement(screen.getByText('Client dashboard content'))
  })
})
