import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import FigmaAppShell from './FigmaAppShell'

vi.mock('../lib/auth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Mobile Client', email: 'client@example.com', role: 'client' },
    logout: vi.fn(),
  }),
}))
vi.mock('../lib/notifications', () => ({ useNotifications: () => ({ unreadCount: 2 }) }))
vi.mock('../lib/theme', () => ({ useTheme: () => ({ dark: true, toggleDark: vi.fn() }) }))

function renderShell() {
  render(
    <MemoryRouter initialEntries={['/client']}>
      <Routes>
        <Route element={<FigmaAppShell />}>
          <Route path="/client" element={<h1>Client dashboard</h1>} />
          <Route path="/client/cases" element={<h1>Client cases</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('mobile portal navigation', () => {
  it('opens as an accessible drawer and closes after navigation', async () => {
    renderShell()

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }))
    const drawer = screen.getByRole('dialog', { name: 'Navigation menu' })
    expect(drawer).toBeInTheDocument()

    fireEvent.click(within(drawer).getByRole('button', { name: 'My Cases' }))
    expect(await screen.findByRole('heading', { name: 'Client cases' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: 'Navigation menu' })).not.toBeInTheDocument()
  })

  it('closes the drawer with Escape', () => {
    renderShell()
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Navigation menu' })).not.toBeInTheDocument()
  })
})

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
