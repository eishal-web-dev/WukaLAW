import { useState } from 'react'
import { PublicNav, PublicFooter, usePublicTokens } from '../components/PublicShell'

export default function CaseStudies() {
  const { dark, BG, CARDBG, TX, TX2, GA, BD } = usePublicTokens()
  const [filter, setFilter] = useState('All')
  const categories = ['All', 'Constitutional', 'Corporate', 'IP', 'Criminal', 'Real Estate']

  const studies = [
    { id: 1, category: 'IP', title: 'DataTech LLC Patent Victory', outcome: 'Win', value: '$12M', duration: '14 months', ai: 82, desc: 'Successfully defended a landmark software patent infringement case before the Lahore High Court. AI analysis identified 3 overlooked precedents that formed the cornerstone of our winning argument.', year: 2024 },
    { id: 2, category: 'Constitutional', title: 'Fundamental Rights Petition', outcome: 'Win', value: 'N/A', duration: '8 months', ai: 91, desc: 'Secured constitutional relief for a media house facing unlawful censorship. The WakuLaw AI mapped 47 relevant SC judgments that established the precedent for our constitutional petition.', year: 2023 },
    { id: 3, category: 'Corporate', title: 'Cross-border M&A Defence', outcome: 'Settled', value: '$8.4M', duration: '6 months', ai: 74, desc: 'Navigated a complex cross-border merger dispute between a Pakistani conglomerate and a UAE investor, achieving a favorable settlement through AI-powered evidence analysis.', year: 2024 },
    { id: 4, category: 'Criminal', title: 'White-collar Fraud Acquittal', outcome: 'Win', value: 'N/A', duration: '22 months', ai: 68, desc: 'Achieved full acquittal in a high-profile financial fraud case at the Accountability Court. Document analysis by WakuLaw AI revealed exculpatory evidence buried in 3,000 pages of records.', year: 2023 },
    { id: 5, category: 'Real Estate', title: 'Karachi Property Restitution', outcome: 'Win', value: '$4.2M', duration: '11 months', ai: 88, desc: 'Recovered a prime commercial property in Karachi from an illegal occupant through strategic litigation backed by AI-driven title chain analysis spanning 60 years of records.', year: 2024 },
    { id: 6, category: 'Corporate', title: 'Startup IP Portfolio Defence', outcome: 'Win', value: '$2.1M', duration: '5 months', ai: 79, desc: "Protected a Pakistani fintech startup's IP portfolio from a well-funded competitor, leveraging AI precedent search to craft an aggressive but precise legal strategy.", year: 2023 },
  ]

  const filtered = filter === 'All' ? studies : studies.filter((s) => s.category === filter)

  return (
    <div style={{ backgroundColor: BG, fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}>
      <style>{`
        .wk-card-hover { transition: transform 0.3s, box-shadow 0.3s; }
        .wk-card-hover:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 32px 80px rgba(0,0,0,0.3) !important; }
      `}</style>
      <PublicNav current="/case-studies" />

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '80px 24px 60px', borderBottom: `1px solid ${BD}` }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, border: `1px solid ${GA}40`, backgroundColor: `${GA}12`, marginBottom: 24 }}>
          <span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: '0.06em' }}>CASE STUDIES</span>
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 900, color: TX, letterSpacing: '-0.04em', marginBottom: 16, lineHeight: 1.1 }}>
          Proven Results,<br />Powered by AI
        </h1>
        <p style={{ fontSize: 16, color: TX2, maxWidth: 500, margin: '0 auto' }}>
          Real cases, real outcomes. See how WakuLaw's AI intelligence delivered decisive results for our clients.
        </p>
      </div>

      {/* Filters */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 0' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              style={{ padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', border: `1px solid ${filter === c ? GA : BD}`, backgroundColor: filter === c ? GA : 'transparent', color: filter === c ? (dark ? '#0D1117' : '#FFFFFF') : TX2, transition: 'all 0.2s' }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          {filtered.map((s) => (
            <div key={s.id} className="wk-card-hover" style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: CARDBG, border: `1px solid ${BD}`, boxShadow: dark ? '0 12px 40px rgba(0,0,0,0.35)' : '0 12px 32px rgba(100,70,0,0.08)', cursor: 'pointer' }}>
              <div style={{ padding: '28px 28px 0', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, backgroundColor: `${GA}18`, color: GA, border: `1px solid ${GA}35` }}>{s.category}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: TX2 }}>AI Confidence</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.ai >= 80 ? '#34D399' : GA }}>{s.ai}%</div>
                  </div>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: TX, marginBottom: 10, lineHeight: 1.3, letterSpacing: '-0.02em' }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: TX2, lineHeight: 1.7, marginBottom: 20 }}>{s.desc}</p>
              </div>
              <div style={{ padding: '16px 28px 24px', borderTop: `1px solid ${BD}`, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[['Outcome', s.outcome, s.outcome === 'Win' ? '#34D399' : GA], ['Value', s.value, TX], ['Duration', s.duration, TX2]].map(([label, val, color]) => (
                  <div key={label as string}>
                    <div style={{ fontSize: 10, color: TX2, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: String(color) }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
