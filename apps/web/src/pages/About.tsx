import { useNavigate } from 'react-router-dom'
import { PublicNav, PublicFooter, usePublicTokens } from '../components/PublicShell'

export default function About() {
  const navigate = useNavigate()
  const { dark, BG, CARDBG, TX, TX2, GA, BD, WMK } = usePublicTokens()

  return (
    <div style={{ backgroundColor: BG, fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}>
      <PublicNav current="/about" />

      {/* Hero */}
      <div style={{ position: 'relative', textAlign: 'center', padding: '100px 24px 80px', overflow: 'hidden', borderBottom: `1px solid ${BD}` }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 'clamp(80px, 18vw, 220px)', fontFamily: "'Noto Nastaliq Urdu', serif", fontWeight: 700, color: WMK, pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap' }}>وکالت</div>
        {dark && <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(212,175,55,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, border: `1px solid ${GA}40`, backgroundColor: `${GA}12`, marginBottom: 24 }}>
            <span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: '0.06em' }}>OUR STORY</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 72px)', fontWeight: 900, color: TX, letterSpacing: '-0.04em', marginBottom: 20, lineHeight: 1.05 }}>
            Pakistan's Legal Future,<br />
            <span style={dark ? { backgroundImage: 'linear-gradient(135deg, #D4AF37, #F0D060)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : { color: '#7A5510' }}>
              Built on Intelligence.
            </span>
          </h1>
          <p style={{ fontSize: 17, color: TX2, maxWidth: 580, margin: '0 auto', lineHeight: 1.75 }}>
            WakuLaw was founded in 2024 to bridge the gap between Pakistan's deep legal tradition and the power of modern AI — giving every advocate the edge of a senior partner.
          </p>
        </div>
      </div>

      {/* Mission + Vision */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        {[
          { icon: '⚖️', title: 'Our Mission', text: 'To democratize access to elite legal intelligence in Pakistan by equipping every advocate — from solo practitioners to top-tier firms — with AI-powered tools that were previously available only to the largest firms with the deepest pockets.' },
          { icon: '🔭', title: 'Our Vision', text: 'A Pakistan where every citizen can access excellent legal representation, where justice is not determined by resources but by the strength of facts — and where Pakistani law firms compete and win on the global stage.' },
        ].map((s) => (
          <div key={s.title} style={{ padding: '40px', borderRadius: 24, backgroundColor: CARDBG, border: `1px solid ${BD}`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: GA }} />
            <div style={{ fontSize: 40, marginBottom: 20 }}>{s.icon}</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: TX, marginBottom: 16, letterSpacing: '-0.02em' }}>{s.title}</h3>
            <p style={{ fontSize: 14, color: TX2, lineHeight: 1.8 }}>{s.text}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ backgroundColor: dark ? 'rgba(22,27,34,0.6)' : 'rgba(237,232,216,0.7)', borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}`, padding: '60px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, textAlign: 'center' }}>
          {[['2024', 'Founded'], ['50K+', 'Cases Analyzed'], ['3', 'Pakistan Offices'], ['94.2%', 'AI Accuracy']].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontSize: 40, fontWeight: 900, color: GA, letterSpacing: '-0.04em', marginBottom: 6 }}>{v}</div>
              <div style={{ fontSize: 13, color: TX2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 800, color: TX, letterSpacing: '-0.03em', marginBottom: 48, textAlign: 'center' }}>What we stand for</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { title: 'Transparency', icon: '🔍', desc: 'Our Explainable AI shows every factor behind each prediction. No black boxes — only clear, understandable reasoning.' },
            { title: 'Excellence', icon: '🏆', desc: "Trained on Pakistan's full legal corpus. Our AI is built specifically for Pakistani law, courts, and judicial patterns." },
            { title: 'Access', icon: '🤝', desc: 'Tiered pricing to serve solo advocates, boutique firms, and large corporations. Quality AI for every scale of practice.' },
          ].map((v) => (
            <div key={v.title} style={{ padding: '32px 28px', borderRadius: 20, backgroundColor: CARDBG, border: `1px solid ${BD}`, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{v.icon}</div>
              <h4 style={{ fontSize: 17, fontWeight: 800, color: TX, marginBottom: 12 }}>{v.title}</h4>
              <p style={{ fontSize: 13, color: TX2, lineHeight: 1.75 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '0 24px 100px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 40px', borderRadius: 28, backgroundColor: CARDBG, border: `1px solid ${GA}30`, boxShadow: dark ? `0 0 80px ${GA}10` : '0 20px 60px rgba(100,70,0,0.1)' }}>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 800, color: TX, marginBottom: 16 }}>Ready to transform your practice?</h2>
          <p style={{ fontSize: 15, color: TX2, marginBottom: 32 }}>Join Pakistan's leading AI legal platform.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => navigate('/find-lawyer')} style={{ backgroundColor: GA, color: dark ? '#0D1117' : '#FFFFFF', fontSize: 14, fontWeight: 700, padding: '12px 28px', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Find a Lawyer →
            </button>
            <button onClick={() => navigate('/contact')} style={{ fontSize: 14, color: TX2, padding: '12px 24px', borderRadius: 12, border: `1px solid ${BD}`, backgroundColor: 'transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Contact Us
            </button>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
