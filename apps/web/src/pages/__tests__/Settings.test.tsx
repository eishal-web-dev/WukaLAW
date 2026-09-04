import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Settings from '../Settings'
import * as api from '../../lib/api'

vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { name: 'Test Lawyer', email: 'test@example.com' } }) }))
vi.mock('../../lib/api', () => ({
  getNotificationPreferences: vi.fn(),
  updateNotificationPreferences: vi.fn(),
  errorMessage: (error: Error) => error.message,
}))

afterEach(cleanup)
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(api.getNotificationPreferences).mockResolvedValue({ in_app_enabled: true })
})

function openNotifications() {
  render(<Settings />)
  fireEvent.click(screen.getByRole('button', { name: 'Notifications' }))
  return screen.getByRole('switch', { name: 'In-app notifications' })
}

describe('Settings notification preferences', () => {
  it('persists a change and reloads the saved preference', async () => {
    vi.mocked(api.updateNotificationPreferences).mockResolvedValue({ in_app_enabled: false })
    const toggle = openNotifications()
    await waitFor(() => expect(toggle).toBeEnabled())
    expect(toggle).toBeChecked()
    fireEvent.click(toggle)
    await waitFor(() => expect(api.updateNotificationPreferences).toHaveBeenCalledWith(false))
    await waitFor(() => expect(toggle).toBeEnabled())
    expect(toggle).not.toBeChecked()
    cleanup()
    vi.mocked(api.getNotificationPreferences).mockResolvedValue({ in_app_enabled: false })
    const reloaded = openNotifications()
    await waitFor(() => expect(reloaded).toBeEnabled())
    expect(reloaded).not.toBeChecked()
  })

  it('rolls back a failed save and shows the error', async () => {
    vi.mocked(api.updateNotificationPreferences).mockRejectedValue(new Error('Save failed'))
    const toggle = openNotifications()
    await waitFor(() => expect(toggle).toBeEnabled())
    fireEvent.click(toggle)
    expect(await screen.findByRole('alert')).toHaveTextContent('Save failed')
    expect(toggle).toBeChecked()
    expect(toggle).toBeEnabled()
  })

  it('does not overwrite an unknown preference when loading fails', async () => {
    vi.mocked(api.getNotificationPreferences).mockRejectedValue(new Error('Load failed'))
    const toggle = openNotifications()
    expect(await screen.findByRole('alert')).toHaveTextContent('Load failed')
    expect(toggle).toBeDisabled()
    fireEvent.click(toggle)
    expect(api.updateNotificationPreferences).not.toHaveBeenCalled()
  })

  it('does not offer a working switch for unavailable security features', async () => {
    render(<Settings />)
    await screen.findByText('Test Lawyer')
    fireEvent.click(screen.getByRole('button', { name: 'Security' }))
    expect(screen.getByText(/Two-factor authentication is not enabled/)).toBeInTheDocument()
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })
})
