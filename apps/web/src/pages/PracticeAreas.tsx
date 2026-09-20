import { useNavigate } from 'react-router-dom'
import { PublicNav, PublicFooter, usePublicTokens } from '../components/PublicShell'

export default function PracticeAreas() {
  const navigate = useNavigate()
  const { dark, BG, CARDBG, TX, TX2, GA, BD } = usePublicTokens()

  const areas = [
    { icon: '⚖️', title: 'Constitutional Law', desc: "Fundamental rights litigation, constitutional petitions, and judicial review before Pakistan's Supreme Court and High Courts.", count: '120+ cases' },
    { icon: '🏢', title: 'Corporate & Commercial', desc: 'Company formation, mergers & acquisitions, contract disputes, and regulatory compliance across all sectors.', count: '340+ cases' },
    { icon: '🛡️', title: 'Criminal Defence', desc: 'Expert criminal defence representation at trial courts, sessions courts, and appellate levels throughout Pakistan.', count: '85+ cases' },
    { icon: '💡', title: 'Intellectual Property', desc: 'Patent registration, trademark protection, copyright enforcement, and IP litigation under Pakistan IP laws.', count: '210+ cases' },
    { icon: '🏠', title: 'Real Estate & Property', desc: 'Property disputes, title verification, lease agreements, and land acquisition proceedings.', count: '190+ cases' },
    { icon: '👨‍👩‍👧', title: 'Family & Personal Law', desc: 'Divorce, custody, inheritance, and family court matters under Muslim Family Laws and general law.', count: '155+ cases' },
    { icon: '💰', title: 'Taxation & Revenue', desc: 'Tax planning, FBR disputes, tax tribunal representation, and customs & excise matters.', count: '98+ cases' },
    { icon: '⚡', title: 'Energy & Infrastructure', desc: 'Power sector agreements, infrastructure contracts, NEPRA proceedings, and regulatory matters.', count: '62+ cases' },
  ]

  return (
    <div style={{ backgroundColor: BG, fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}>
      <style>{`
        .wk-card-hover { transition: transform 0.3s, box-shadow 0.3s; }
        .wk-card-hover:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 32px 80px rgba(0,0,0,0.3) !important; }
      `}</style>
      <PublicNav current="/practice-areas" />

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '80px 24px 60px', borderBottom: `1px solid ${BD}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 'clamp(80px, 15vw, 180px)', fontFamily: "'Noto Nastaliq Urdu', serif", fontWeight: 700, color: dark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.04)', pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap', zIndex: 0 }}>قانون</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, border: `1px solid ${GA}40`, backgroundColor: `${GA}12`, marginBottom: 24 }}>
            <span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: '0.06em' }}>PRACTICE AREAS</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 900, color: TX, letterSpacing: '-0.04em', marginBottom: 16, lineHeight: 1.1 }}>
            Expertise Across<br />Every Domain of Law
          </h1>
          <p style={{ fontSize: 16, color: TX2, maxWidth: 520, margin: '0 auto' }}>
            From constitutional litigation to corporate counsel — our AI-enhanced practice covers Pakistan's full legal spectrum.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {areas.map((a) => (
            <div key={a.title} className="wk-card-hover" style={{ padding: '32px 28px', borderRadius: 20, backgroundColor: CARDBG, border: `1px solid ${BD}`, cursor: 'pointer', position: 'relative', overflow: 'hidden', boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 24px rgba(100,70,0,0.07)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: GA }} />
              <div style={{ fontSize: 36, marginBottom: 16 }}>{a.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: TX, marginBottom: 10, letterSpacing: '-0.02em' }}>{a.title}</h3>
              <p style={{ fontSize: 13, color: TX2, lineHeight: 1.7, marginBottom: 20 }}>{a.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: GA, fontWeight: 700, padding: '3px 10px', borderRadius: 20, backgroundColor: `${GA}12`, border: `1px solid ${GA}30` }}>{a.count}</span>
                <span style={{ fontSize: 13, color: GA, fontWeight: 600 }}>Learn more →</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div style={{ marginTop: 80, padding: '60px 48px', borderRadius: 28, background: dark ? 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(79,142,247,0.08))' : 'linear-gradient(135deg, rgba(139,101,20,0.1), rgba(237,232,216,0.5))', border: `1px solid ${GA}30`, textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 800, color: TX, marginBottom: 16, letterSpacing: '-0.03em' }}>Don't see your area? Let's talk.</h2>
          <p style={{ fontSize: 15, color: TX2, marginBottom: 36 }}>Our AI platform adapts to any legal matter across Pakistani law.</p>
          <button onClick={() => navigate('/contact')} style={{ backgroundColor: GA, color: dark ? '#0D1117' : '#FFFFFF', fontSize: 15, fontWeight: 700, padding: '14px 36px', borderRadius: 14, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Schedule Consultation →
          </button>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
