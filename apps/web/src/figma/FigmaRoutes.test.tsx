import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../lib/theme'
import { AuthProvider } from '../lib/auth'
import { setAuthStorage } from '../lib/api'
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

/** Portal pages call useAuth() (e.g. CPDashboardPageV2 shows the real
 * signed-in identity), so every portal render needs a real AuthProvider
 * with a seeded, role-appropriate user -- not just MemoryRouter. Role is
 * inferred from the page's prefix (cp-/lp-/ap-) to match how each page is
 * actually reached in the real app, rather than using one fixed role for
 * every page regardless of which portal it belongs to. */
function roleForPage(page: string): 'client' | 'lawyer' | 'admin' {
  if (page.startsWith('cp-')) return 'client'
  if (page.startsWith('ap-')) return 'admin'
  return 'lawyer'
}

function testUserFor(role: 'client' | 'lawyer' | 'admin') {
  return { id: 17, name: 'Test User', email: 'test-user@example.com', role }
}

function renderPortal(page: string) {
  const user = testUserFor(roleForPage(page))
  setAuthStorage('test-token', user)
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(user), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  )

  return render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <FigmaPortalPage page={page} />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

beforeEach(() => {
  localStorage.clear()
})

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
    const { container } = renderPortal(page)
    expect(container.firstElementChild).toBeTruthy()
  })
})
