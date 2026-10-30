import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import LawyerCases from '../LawyerCases'

vi.mock('../Cases', () => ({
  default: ({ onOpenWorkspace }: { onOpenWorkspace?: (caseId: number) => void }) => (
    <button type="button" onClick={() => onOpenWorkspace?.(42)}>Open case 42</button>
  ),
}))
vi.mock('../LawyerWorkspace', () => ({ default: () => <h2>Selected case workspace</h2> }))

function Location() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}{location.search}</output>
}

function open(path = '/cases') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/cases" element={<><LawyerCases /><Location /></>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('merged lawyer cases page', () => {
  it('opens a case from the management view in the same workspace', () => {
    open()

    expect(screen.getByRole('heading', { name: 'Cases & Clients' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Open case 42' }))

    expect(screen.getByRole('heading', { name: 'Selected case workspace' })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/cases?view=workspace&caseId=42')
  })

  it('restores the workspace view from a deep link', () => {
    open('/cases?view=workspace&caseId=7')

    expect(screen.getByRole('tab', { name: 'Workspace' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('heading', { name: 'Selected case workspace' })).toBeInTheDocument()
  })
})
