/**
 * Public (marketing) navigation and footer, ported from the Figma export.
 * These pages use inline styles with light/dark token pairs driven by the
 * shared ThemeProvider.
 */
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../lib/theme'

export interface PublicTokens {
  BG: string
  SURF: string
  CARDBG: string
  TX: string
  TX2: string
  GA: string
  BD: string
  NAVBG: string
  WMK: string
}

export function usePublicTokens(): PublicTokens & { dark: boolean; toggleDark: () => void } {
  const { dark, toggleDark } = useTheme()
  return {
    dark,
    toggleDark,
    BG: dark ? '#0D1117' : '#F8F4EC',
    SURF: dark ? '#161B22' : '#EDE8D8',
    CARDBG: dark ? '#1E2530' : '#FFFFFF',
    TX: dark ? '#FFFFFF' : '#1A1005',
    TX2: dark ? '#B3B3B3' : '#6B5533',
    GA: dark ? '#D4AF37' : '#8B6514',
    BD: dark ? 'rgba(255,255,255,0.07)' : 'rgba(60,30,0,0.09)',
    NAVBG: dark ? 'rgba(13,17,23,0.88)' : 'rgba(248,244,236,0.92)',
    WMK: dark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.04)',
  }
}

function LogoMark({ dark, GA }: { dark: boolean; GA: string }) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: GA,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={dark ? '#0D1117' : '#FFFFFF'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </div>
  )
}

export function PublicNav({ current }: { current?: string }) {
  const navigate = useNavigate()
  const { dark, toggleDark, TX, TX2, GA, BD, NAVBG } = usePublicTokens()
  const navLinks = [
    { label: 'Practice Areas', path: '/practice-areas' },
    { label: 'About', path: '/about' },
    { label: 'Case Studies', path: '/case-studies' },
    { label: 'Contact', path: '/contact' },
  ]
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${BD}`,
        backgroundColor: NAVBG,
        transition: 'background-color 0.3s',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <LogoMark dark={dark} GA={GA} />
          <span style={{ color: TX, fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em' }}>WakuLaw</span>
          <span
            style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 5,
              border: `1px solid ${GA}40`,
              backgroundColor: `${GA}12`,
              color: GA,
              fontWeight: 700,
              letterSpacing: '0.06em',
            }}
          >
            PK · AI
          </span>
        </button>
        <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {navLinks.map((nl) => (
            <button
              key={nl.label}
              onClick={() => navigate(nl.path)}
              style={{
                color: current === nl.path ? GA : TX2,
                fontSize: 14,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: current === nl.path ? 600 : 400,
                transition: 'color 0.15s',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {nl.label}
            </button>
          ))}
        </nav>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={toggleDark}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: `1px solid ${BD}`,
              backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: TX2,
            }}
          >
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{ color: TX2, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              backgroundColor: GA,
              color: dark ? '#0D1117' : '#FFFFFF',
              fontSize: 13,
              fontWeight: 700,
              padding: '8px 20px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  )
}

export function PublicFooter() {
  const navigate = useNavigate()
  const { dark, TX, TX2, GA, BD, SURF } = usePublicTokens()
  return (
    <footer style={{ borderTop: `1px solid ${BD}`, backgroundColor: SURF, padding: '48px 24px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                backgroundColor: GA,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={dark ? '#0D1117' : '#FFFFFF'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span style={{ color: TX, fontWeight: 800, fontSize: 16 }}>WakuLaw</span>
          </div>
          <p style={{ fontSize: 13, color: TX2, lineHeight: 1.7, maxWidth: 260 }}>
            Pakistan's premier AI legal intelligence platform. Serving advocates since 2024.
          </p>
        </div>
        {[
          { heading: 'Platform', links: [['AI Prediction', '/prediction'], ['Case Workspace', '/workspace'], ['Legal Search', '/similar-cases'], ['AI Assistant', '/ai-chat']] },
          { heading: 'Firm', links: [['Practice Areas', '/practice-areas'], ['Case Studies', '/case-studies'], ['About', '/about'], ['Contact', '/contact']] },
          { heading: 'Legal', links: [['Privacy Policy', '/'], ['Terms of Service', '/'], ['Security', '/'], ['Compliance', '/']] },
        ].map((col) => (
          <div key={col.heading}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TX, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              {col.heading}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.links.map(([label, path]) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  style={{ fontSize: 13, color: TX2, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif', padding: 0 }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          maxWidth: 1200,
          margin: '28px auto 0',
          paddingTop: 24,
          borderTop: `1px solid ${BD}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 12, color: TX2 }}>© 2024 WakuLaw Inc. · Karachi, Pakistan</span>
        <span style={{ fontSize: 12, color: TX2 }}>Built for Pakistan's legal community</span>
      </div>
    </footer>
  )
}

export function BrowserWindow({
  children,
  url = 'app.wakulaw.ai',
  className = '',
  style = {},
}: {
  children: React.ReactNode
  url?: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-2xl ${className}`}
      style={{ border: '1px solid rgba(255,255,255,0.09)', backgroundColor: '#1E2530', ...style }}
    >
      <div
        className="h-10 flex items-center px-4 gap-3 flex-shrink-0"
        style={{ backgroundColor: '#161B22', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF5F57' }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FEBC2E' }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#28C840' }} />
        </div>
        <div className="flex-1 flex justify-center">
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-md text-[11px]"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#B3B3B3', maxWidth: 240 }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#34D399' }} />
            {url}
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
