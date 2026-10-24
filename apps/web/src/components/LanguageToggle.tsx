import { Languages } from 'lucide-react'
import { useI18n } from '../lib/i18n'

export default function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { language, toggleLanguage, t } = useI18n()
  const nextLabel = language === 'en' ? t('Switch to Urdu') : t('Switch to English')

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={nextLabel}
      title={nextLabel}
      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background/80 px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <Languages size={15} aria-hidden="true" />
      {!compact && <span>{language === 'en' ? 'اردو' : 'English'}</span>}
    </button>
  )
}

