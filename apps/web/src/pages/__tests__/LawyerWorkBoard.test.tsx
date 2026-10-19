import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import LawyerWorkBoard from '../LawyerWorkBoard'

vi.mock('../LawyerTasks', () => ({ default: () => <h2>Live tasks board</h2> }))
vi.mock('../LawyerHearings', () => ({ default: () => <h2>Live hearings board</h2> }))

function Location() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}{location.search}</output>
}

function open(path = '/tasks') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/tasks" element={<><LawyerWorkBoard /><Location /></>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('merged lawyer task and hearing board', () => {
  it('switches from tasks to hearings on the same page', () => {
    open()
    expect(screen.getByRole('heading', { name: 'Live tasks board' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Hearings' }))

    expect(screen.getByRole('heading', { name: 'Live hearings board' })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/tasks?view=hearings')
  })

  it('restores the hearings view from a deep link', () => {
    open('/tasks?view=hearings')
    expect(screen.getByRole('tab', { name: 'Hearings' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('heading', { name: 'Live hearings board' })).toBeInTheDocument()
  })
})
