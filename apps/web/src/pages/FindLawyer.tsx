import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PublicNav, PublicFooter, usePublicTokens } from '../components/PublicShell'

export default function FindLawyer() {
  const navigate = useNavigate()
  const { dark, BG, CARDBG, TX, TX2, GA, BD } = usePublicTokens()
  const [search, setSearch] = useState('')
  const [area, setArea] = useState('All')
  const [city, setCity] = useState('All')
  const areas = ['All', 'Constitutional', 'Corporate', 'IP', 'Criminal', 'Real Estate', 'Family', 'Tax']
  const cities = ['All', 'Karachi', 'Lahore', 'Islamabad']

  const lawyers = [
    { id: 1, name: 'Barrister Ahmad Raza', role: 'Managing Partner', spec: 'Constitutional Law', city: 'Karachi', area: 'Constitutional', img: 'https://images.unsplash.com/photo-1642522029686-5485ea7e6042?w=400&h=500&fit=crop&auto=format', cases: 340, rating: 4.9, years: 18, rate: 15000, available: true },
    { id: 2, name: 'Adv. Zara Sheikh', role: 'Senior Partner', spec: 'Corporate & IP', city: 'Lahore', area: 'Corporate', img: 'https://images.unsplash.com/photo-1758518727888-ffa196002e59?w=400&h=500&fit=crop&auto=format', cases: 210, rating: 4.8, years: 12, rate: 12000, available: true },
    { id: 3, name: 'Omar Malik SC', role: 'Senior Counsel', spec: 'Criminal Defence', city: 'Islamabad', area: 'Criminal', img: 'https://images.unsplash.com/photo-1771244678811-50c22f17c791?w=400&h=500&fit=crop&auto=format', cases: 155, rating: 4.7, years: 15, rate: 18000, available: false },
    { id: 4, name: 'Barrister Ayesha Mirza', role: 'Partner', spec: 'Family & Personal Law', city: 'Karachi', area: 'Family', img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=500&fit=crop&auto=format&crop=face', cases: 198, rating: 4.9, years: 14, rate: 10000, available: true },
    { id: 5, name: 'Adv. Tariq Hussain', role: 'Senior Associate', spec: 'Real Estate & Property', city: 'Lahore', area: 'Real Estate', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop&auto=format', cases: 167, rating: 4.6, years: 10, rate: 9000, available: true },
    { id: 6, name: 'Dr. Farrukh Nawaz', role: 'Tax Counsel', spec: 'Taxation & Revenue', city: 'Islamabad', area: 'Tax', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&auto=format', cases: 89, rating: 4.5, years: 20, rate: 14000, available: true },
  ]

  const filtered = lawyers.filter(
    (l) =>
      (area === 'All' || l.area === area) &&
      (city === 'All' || l.city === city) &&
      (l.name.toLowerCase().includes(search.toLowerCase()) || l.spec.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div style={{ backgroundColor: BG, fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}>
      <PublicNav />

      {/* Hero search */}
      <div style={{ padding: '64px 24px 48px', textAlign: 'center', borderBottom: `1px solid ${BD}` }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, color: TX, letterSpacing: '-0.04em', marginBottom: 12 }}>Find Your Legal Expert</h1>
        <p style={{ fontSize: 15, color: TX2, marginBottom: 36 }}>Pakistan's top advocates — rated, reviewed, and bookable instantly.</p>
        <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto 28px' }}>
          <svg style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TX2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or specialization..."
            style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: 14, border: `1px solid ${BD}`, backgroundColor: CARDBG, color: TX, fontSize: 15, outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
          {areas.map((a) => (
            <button key={a} onClick={() => setArea(a)} style={{ padding: '6px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', border: `1px solid ${area === a ? GA : BD}`, backgroundColor: area === a ? GA : 'transparent', color: area === a ? (dark ? '#0D1117' : '#FFFFFF') : TX2, transition: 'all 0.2s' }}>
              {a}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {cities.map((c) => (
            <button key={c} onClick={() => setCity(c)} style={{ padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', border: `1px solid ${BD}`, backgroundColor: city === c ? (dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)') : 'transparent', color: city === c ? TX : TX2 }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Lawyer grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ fontSize: 13, color: TX2, marginBottom: 24 }}>{filtered.length} advocates found</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {filtered.map((l) => (
            <div
              key={l.id}
              onClick={() => navigate('/lawyer-profile')}
              style={{ borderRadius: 24, overflow: 'hidden', border: `1px solid ${BD}`, backgroundColor: CARDBG, cursor: 'pointer', transition: 'transform 0.25s, box-shadow 0.25s', boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 24px rgba(100,70,0,0.08)', position: 'relative' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = dark ? '0 24px 60px rgba(0,0,0,0.6)' : '0 24px 48px rgba(100,70,0,0.18)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = dark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 24px rgba(100,70,0,0.08)'
              }}
            >
              <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 3, display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, backgroundColor: l.available ? 'rgba(52,211,153,0.9)' : 'rgba(107,114,128,0.8)', backdropFilter: 'blur(8px)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'white' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'white' }}>{l.available ? 'Available' : 'Busy'}</span>
              </div>
              <div style={{ height: 260, overflow: 'hidden', position: 'relative' }}>
                <img src={l.img} alt={l.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, background: dark ? 'linear-gradient(to top, #1E2530, transparent)' : 'linear-gradient(to top, #FFFFFF, transparent)' }} />
              </div>
              <div style={{ padding: '14px 18px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: TX }}>{l.name}</span>
                  <div style={{ width: 15, height: 15, borderRadius: '50%', backgroundColor: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#0D1117" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: GA, fontWeight: 600, marginBottom: 1 }}>{l.role}</div>
                <div style={{ fontSize: 12, color: TX2, marginBottom: 14 }}>{l.spec} · {l.city}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill={GA} stroke={GA} strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      <span style={{ fontSize: 12, fontWeight: 700, color: TX }}>{l.rating}</span>
                    </div>
                    <span style={{ fontSize: 11, color: TX2 }}>{l.cases} cases</span>
                    <span style={{ fontSize: 11, color: TX2 }}>{l.years}y exp</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: TX }}>PKR {l.rate.toLocaleString()}</span>
                    <span style={{ fontSize: 11, color: TX2 }}>/hr</span>
                  </div>
                  <button style={{ padding: '8px 16px', borderRadius: 10, backgroundColor: GA, color: dark ? '#0D1117' : '#FFFFFF', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
