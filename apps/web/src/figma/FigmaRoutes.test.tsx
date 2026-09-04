import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../lib/theme'
import FigmaPortalPage from './FigmaPortalPage'
import FigmaPublicPage, { type FigmaPublicPageName } from './FigmaPublicPage'

const PUBLIC_PAGES: FigmaPublicPageName[] = [
  'landing', 'about', 'practice-areas', 'case-studies', 'contact',
  'find-lawyer', 'lawyer-profile', 'pricing', 'features', 'solutions',
  'blog', 'faq', 'careers', 'privacy', 'terms',
]

const PORTAL_PAGES = [
  'lp-clients', 'lp-client-detail', 'lp-hearings', 'lp-calendar', 'lp-tasks',
  'lp-ai-strategy', 'lp-research', 'lp-strategy', 'lp-report-gen',
  'lp-messages', 'lp-team', 'lp-billing',
  'cp-dashboard', 'cp-cases', 'cp-search', 'cp-workspace', 'cp-upload',
  'cp-evidence', 'cp-ai-summary', 'cp-similar', 'cp-predictions',
  'cp-explainable', 'cp-report-gen', 'cp-downloads',
  'ap-dashboard', 'ap-users', 'ap-lawyers', 'ap-clients', 'ap-roles',
  'ap-ai-model', 'ap-datasets', 'ap-knowledge', 'ap-analytics', 'ap-audit',
  'ap-security', 'ap-api', 'ap-billing', 'ap-support', 'ap-cms',
  'ap-settings', 'ap-backup', 'ap-health', 'ap-reports',
]

afterEach(cleanup)

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
})

describe('Figma Make route integration', () => {
  it.each(PUBLIC_PAGES)('renders public page %s', (page) => {
    const { container } = render(
      <MemoryRouter>
        <ThemeProvider>
          <FigmaPublicPage page={page} />
        </ThemeProvider>
      </MemoryRouter>,
    )
    expect(container.firstElementChild).toBeTruthy()
  })

  it.each(PORTAL_PAGES)('renders portal page %s', (page) => {
    const { container } = render(
      <MemoryRouter>
        <FigmaPortalPage page={page} />
      </MemoryRouter>,
    )
    expect(container.firstElementChild).toBeTruthy()
  })
})
