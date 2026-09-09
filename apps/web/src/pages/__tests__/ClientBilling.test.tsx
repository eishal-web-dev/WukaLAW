import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ClientBilling from '../ClientBilling'

describe('ClientBilling', () => {
  it('shows a clean, truthful "not available yet" state', () => {
    render(<ClientBilling />)
    expect(screen.getByText('Billing is not available yet')).toBeInTheDocument()
  })

  it('never shows a fake plan, balance, or invoice', () => {
    render(<ClientBilling />)
    expect(screen.queryByText(/\$\d/)).not.toBeInTheDocument()
    expect(screen.queryByText(/PKR \d/)).not.toBeInTheDocument()
    expect(screen.queryByText(/invoice/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/plan/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/paid/i)).not.toBeInTheDocument()
  })
})
