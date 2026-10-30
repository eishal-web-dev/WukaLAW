import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ClientBilling from '../ClientBilling'
import * as api from '../../lib/api'

vi.mock('../../lib/api', () => ({ getAiSubscription: vi.fn(), errorMessage: (error: Error) => error.message }))

describe('ClientBilling', () => {
  it('shows real allowance and Lemon Squeezy subscription pricing', async () => {
    vi.mocked(api.getAiSubscription).mockResolvedValue({ status:'free', ai_tokens_used:40, free_token_limit:100, free_tokens_remaining:60, monthly_price:1500, currency:'PKR', checkout_url:'https://example.lemonsqueezy.com/buy/test' })
    render(<ClientBilling />)
    expect(await screen.findByText('60 tokens left')).toBeInTheDocument()
    expect(screen.getByText('PKR 1,500')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Subscribe with Lemon Squeezy/i })).toHaveAttribute('href','https://example.lemonsqueezy.com/buy/test')
  })

  it('does not pretend checkout works before deployment is configured', async () => {
    vi.mocked(api.getAiSubscription).mockResolvedValue({ status:'free', ai_tokens_used:100, free_token_limit:100, free_tokens_remaining:0, monthly_price:1500, currency:'PKR', checkout_url:null })
    render(<ClientBilling />)
    expect(await screen.findByText(/Checkout is not configured yet/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Subscribe/i })).not.toBeInTheDocument()
  })
})
