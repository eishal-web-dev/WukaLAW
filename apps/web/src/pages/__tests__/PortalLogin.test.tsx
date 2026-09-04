import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Outlet } from 'react-router-dom'
import App from '../../App'
import { AuthProvider } from '../../lib/auth'
import { ThemeProvider } from '../../lib/theme'
import { getStoredToken, getStoredUser } from '../../lib/api'

vi.mock('../../components/FigmaAppShell', () => ({ default: () => <Outlet /> }))
vi.mock('../Dashboard', () => ({ default: () => <h1>Lawyer home</h1> }))
vi.mock('../AdminDashboard', () => ({ default: () => <h1>Admin home</h1> }))
vi.mock('../../figma/FigmaPortalPage', () => ({ default: () => <h1>Client home</h1> }))

beforeEach(() => { localStorage.clear() })
afterEach(() => { cleanup(); vi.restoreAllMocks() })

function open(path = '/login') {
  render(<MemoryRouter initialEntries={[path]}><ThemeProvider><AuthProvider><App /></AuthProvider></ThemeProvider></MemoryRouter>)
}

function response(role: string) {
  return new Response(JSON.stringify({ token: 'test-token', user: { id: 1, email: 'test@example.com', name: 'Portal User', role } }), { status: 200 })
}

function fillLogin() {
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'test@example.com' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } })
}

describe('Portal sign-in', () => {
  it('asks for a portal before signing in', () => {
    open()
    for (const name of ['Client', 'Lawyer', 'Admin']) expect(screen.getByRole('radio', { name })).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Choose a portal to continue' })).toBeDisabled()
  })

  it.each(['client', 'lawyer', 'admin'])('signs in a %s and opens their own portal', async (role) => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response(role))
    open()
    const label = role[0].toUpperCase() + role.slice(1)
    fireEvent.click(screen.getByRole('radio', { name: label }))
    fillLogin()
    fireEvent.click(screen.getByRole('button', { name: `Sign in as ${label}` }))
    expect(await screen.findByRole('heading', { name: `${label} home` })).toBeInTheDocument()
    const body = JSON.parse(fetch.mock.calls[0][1]?.body as string)
    expect(body).toEqual({ email: 'test@example.com', password: 'secret123', portal: role })
    expect(getStoredUser()?.role).toBe(role)
  })

  it('does not create a session after a portal mismatch', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ detail: 'Wrong portal for this account.' }), { status: 403 }))
    open('/login?portal=admin')
    expect(screen.getByRole('radio', { name: 'Admin' })).toBeChecked()
    expect(screen.queryByRole('button', { name: 'Create one' })).not.toBeInTheDocument()
    fillLogin()
    fireEvent.click(screen.getByRole('button', { name: 'Sign in as Admin' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Wrong portal for this account.')
    expect(getStoredToken()).toBeNull()
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
  })

  it('carries the chosen client portal into registration', () => {
    open()
    fireEvent.click(screen.getByRole('radio', { name: 'Client' }))
    fireEvent.click(screen.getByRole('button', { name: 'Create one' }))
    expect(screen.getByRole('radio', { name: 'Client' })).toBeChecked()
    expect(screen.queryByRole('radio', { name: 'Admin' })).not.toBeInTheDocument()
  })

  it.each(['client', 'lawyer'])('registers a %s and opens their portal', async (role) => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response(role))
    open(`/register?portal=${role}`)
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Portal User' } })
    fillLogin()
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))
    const label = role[0].toUpperCase() + role.slice(1)
    expect(await screen.findByRole('heading', { name: `${label} home` })).toBeInTheDocument()
    expect(JSON.parse(fetch.mock.calls[0][1]?.body as string).role).toBe(role)
  })

  it('ignores an admin signup query and offers only public account types', () => {
    open('/register?portal=admin')
    expect(screen.queryByRole('radio', { name: 'Admin' })).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Lawyer' })).toBeChecked()
  })

  it('returns a restored client session to its portal', async () => {
    // Seed a real stored session, then let AuthProvider validate it through /me.
    const { setAuthStorage } = await import('../../lib/api')
    const user = { id: 1, name: 'Client User', email: 'test@example.com', role: 'client' }
    setAuthStorage('test-token', user)
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(user), { status: 200 }))
    open('/login')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Client home' })).toBeInTheDocument())
  })
})
