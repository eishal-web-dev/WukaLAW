import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import LanguageToggle from '../components/LanguageToggle'
import { I18nProvider, useI18n } from './i18n'

function Example() {
  const { t } = useI18n()
  return <><LanguageToggle /><span>{t('Dashboard')}</span></>
}

describe('English and Urdu localization', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.lang = 'en'
    document.documentElement.dir = 'ltr'
  })

  it('switches the interface to Urdu, RTL, and persists the choice', async () => {
    render(<I18nProvider><Example /></I18nProvider>)

    fireEvent.click(screen.getByRole('button', { name: 'Switch to Urdu' }))

    expect(screen.getByText('ڈیش بورڈ')).toBeInTheDocument()
    await waitFor(() => expect(document.documentElement).toHaveAttribute('dir', 'rtl'))
    expect(document.documentElement).toHaveAttribute('lang', 'ur')
    expect(window.localStorage.getItem('wukalaw-language')).toBe('ur')
    expect(screen.getByRole('button', { name: 'انگریزی میں تبدیل کریں' })).toBeInTheDocument()
  })
})
