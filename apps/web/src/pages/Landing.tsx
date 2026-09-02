import { useNavigate } from 'react-router-dom'
import {
  Brain, BookOpen, Search, Layers, Users, Star, Check, ArrowRight,
  ArrowUpRight, Send, Sparkles,
} from 'lucide-react'
import { PublicNav, PublicFooter, BrowserWindow, usePublicTokens } from '../components/PublicShell'
import { CASES } from '../lib/mock'

export default function Landing() {
  const navigate = useNavigate()
  const { dark, BG, CARDBG, TX, TX2, GA, BD, WMK } = usePublicTokens()

  const btnPrimary: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    backgroundColor: GA, color: dark ? '#0D1117' : '#FFFFFF',
    fontSize: 14, fontWeight: 700, padding: '13px 28px',
    borderRadius: 12, border: 'none', cursor: 'pointer',
    boxShadow: `0 0 32px ${GA}50`, fontFamily: 'Inter, sans-serif',
  }
  const btnSecondary: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    fontSize: 14, color: TX2, background: 'none',
    border: `1px solid ${BD}`, padding: '12px 24px',
    borderRadius: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
  }

  return (
    <div style={{ backgroundColor: BG, fontFamily: 'Inter, sans-serif', overflowX: 'hidden', transition: 'background-color 0.3s, color 0.3s' }}>
      <style>{`
        @keyframes wk-float  { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-14px)} }
        @keyframes wk-glow   { 0%,100%{opacity:0.35} 50%{opacity:0.7} }
        @keyframes wk-marquee{ 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes wk-fade-up{ from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes wk-urdu-drift { 0%,100%{transform:translateY(0) rotate(3deg)} 50%{transform:translateY(-8px) rotate(2deg)} }
        @keyframes wk-urdu-drift2 { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-12px) rotate(-3deg)} }
        .wkf  { animation: wk-float  7s ease-in-out infinite; }
        .wkg  { animation: wk-glow   4s ease-in-out infinite; }
        .wkm  { animation: wk-marquee 30s linear infinite; }
        .wkfu { animation: wk-fade-up 0.7s ease-out both; }
        .wk-urdu1 { animation: wk-urdu-drift  10s ease-in-out infinite; }
        .wk-urdu2 { animation: wk-urdu-drift2 13s ease-in-out infinite; }
        .wk-urdu3 { animation: wk-urdu-drift  8s ease-in-out infinite 1s; }
        .wk-card-hover { transition: transform 0.3s, box-shadow 0.3s; }
        .wk-card-hover:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 32px 80px rgba(0,0,0,0.3) !important; }
      `}</style>

      {/* Ambient orbs (dark only) */}
      {dark && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div className="wkg" style={{ position: 'absolute', top: '-15%', right: '-5%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 65%)', filter: 'blur(80px)' }} />
          <div className="wkg" style={{ position: 'absolute', bottom: '5%', left: '-10%', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,0.13) 0%, transparent 65%)', filter: 'blur(100px)', animationDelay: '2s' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        </div>
      )}
      {!dark && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'radial-gradient(circle, rgba(139,101,20,0.08) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
      )}

      <PublicNav />

      {/* ══ HERO ══ */}
      <section style={{ position: 'relative', zIndex: 1, padding: '40px 24px 80px' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center', fontSize: 'min(22vw, 260px)', fontWeight: 900, color: WMK, lineHeight: 0.85, letterSpacing: '-0.05em', pointerEvents: 'none', userSelect: 'none', overflow: 'hidden', zIndex: 0 }}>
          WAKULAW
        </div>

        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', userSelect: 'none', overflow: 'hidden', zIndex: 0 }}>
          <div className="wk-urdu1" style={{ position: 'absolute', top: '6%', right: '-1%', fontSize: 'clamp(80px, 11vw, 150px)', fontFamily: "'Noto Nastaliq Urdu', serif", fontWeight: 700, color: WMK, lineHeight: 1, direction: 'rtl', filter: 'blur(0.3px)' }}>وکالت</div>
          <div className="wk-urdu2" style={{ position: 'absolute', top: '42%', left: '-2%', fontSize: 'clamp(60px, 9vw, 118px)', fontFamily: "'Noto Nastaliq Urdu', serif", fontWeight: 700, color: WMK, lineHeight: 1, direction: 'rtl', filter: 'blur(0.3px)' }}>وکیل</div>
          <div className="wk-urdu3" style={{ position: 'absolute', bottom: '10%', right: '4%', fontSize: 'clamp(50px, 7.5vw, 105px)', fontFamily: "'Noto Nastaliq Urdu', serif", fontWeight: 700, color: WMK, lineHeight: 1, direction: 'rtl', filter: 'blur(0.3px)' }}>عدالت</div>
          <div className="wk-urdu1" style={{ position: 'absolute', top: '20%', left: '1%', fontSize: 'clamp(34px, 5vw, 68px)', fontFamily: "'Noto Nastaliq Urdu', serif", fontWeight: 400, color: WMK, lineHeight: 1, direction: 'rtl', filter: 'blur(0.8px)', opacity: 0.7 }}>انصاف</div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'flex-start' }}>
            {/* Left — text */}
            <div className="wkfu">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, border: `1px solid ${GA}40`, backgroundColor: `${GA}12`, marginBottom: 32 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#34D399' }} />
                <span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: '0.06em' }}>PAKISTAN'S PREMIER AI LEGAL PLATFORM</span>
              </div>

              <h1 style={{ fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 900, color: TX, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 24 }}>
                Your Legal Partner<br />
                <span
                  style={dark
                    ? { backgroundImage: 'linear-gradient(135deg, #D4AF37 0%, #F0D060 45%, #D4AF37 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'block' }
                    : { color: '#7A5510', fontStyle: 'italic', display: 'block' }}
                >
                  In Every Situation.
                </span>
              </h1>

              <p style={{ fontSize: 16, color: TX2, lineHeight: 1.8, maxWidth: 440 }}>
                From Pakistan's Supreme Court to High Courts nationwide — WakuLaw combines decades of legal expertise with AI intelligence to deliver outcomes that matter.
              </p>
            </div>

            {/* Right — image */}
            <div className="wkf" style={{ paddingTop: 35, position: 'relative' }}>
              <div className="wkg" style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '70%', borderRadius: '50%', background: `radial-gradient(ellipse, ${GA}40 0%, transparent 70%)`, filter: 'blur(50px)', zIndex: 0 }} />
              <div style={{ position: 'relative', zIndex: 1, borderRadius: 24, overflow: 'hidden', border: `1px solid ${BD}`, boxShadow: dark ? `0 32px 80px rgba(0,0,0,0.6), 0 0 60px ${GA}18` : '0 32px 60px rgba(100,70,0,0.18)' }}>
                <img
                  src="https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=680&h=680&fit=crop&auto=format&crop=center"
                  alt="Lady Justice — symbol of law"
                  style={{ width: '100%', height: 320, objectFit: 'cover', objectPosition: 'center 10%', display: 'block', filter: dark ? 'brightness(0.88) contrast(1.05)' : 'brightness(1.02)' }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: `linear-gradient(to top, ${dark ? '#0D1117' : '#F8F4EC'}, transparent)` }} />
              </div>
              <div style={{ position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 10, zIndex: 2 }}>
                {[{ label: 'Top Advocate 2024', sub: 'Pakistan Bar' }, { label: 'AI Legal Pioneer', sub: 'LegalTech PK' }].map((b) => (
                  <div key={b.label} style={{ textAlign: 'center', padding: '7px 12px', borderRadius: 10, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', backgroundColor: dark ? 'rgba(22,27,34,0.92)' : 'rgba(255,255,255,0.92)', border: `1px solid ${GA}40`, boxShadow: `0 0 20px ${GA}20`, whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: GA }}>{b.label}</div>
                    <div style={{ fontSize: 8, color: TX2, marginTop: 1 }}>{b.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderTop: `1px solid ${BD}`, paddingTop: 24 }}>
            {[['30+', 'Years Combined\nExpertise'], ['12K+', 'Cases\nResolved'], ['95%', 'Client\nApproval'], ['200+', 'Law\nFirms']].map(([v, l], i) => (
              <div key={v} style={{ textAlign: 'center', paddingRight: i < 3 ? 12 : 0, borderRight: i < 3 ? `1px solid ${BD}` : 'none', paddingLeft: i > 0 ? 12 : 0 }}>
                <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.04em', color: GA, lineHeight: 1, marginBottom: 6 }}>{v}</div>
                <div style={{ fontSize: 11, color: TX2, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{l}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 14, marginTop: 50, justifyContent: 'center' }}>
            <button onClick={() => navigate('/register')} style={{ ...btnPrimary, padding: '14px 32px' }}>
              Get Started
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <button onClick={() => navigate('/login')} style={{ ...btnSecondary, padding: '14px 28px' }}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ══ TICKER ══ */}
      <section style={{ position: 'relative', zIndex: 1, padding: '72px 0 56px', overflow: 'hidden', borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}`, backgroundColor: dark ? 'rgba(22,27,34,0.4)' : 'rgba(237,232,216,0.6)' }}>
        <div style={{ marginBottom: 22, textAlign: 'center', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: TX2, fontWeight: 700, opacity: 0.7 }}>
          Trusted by Pakistan's leading law firms & corporations
        </div>
        <div style={{ overflow: 'hidden', maskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)' }}>
          <div className="wkm" style={{ display: 'flex', gap: 72, flexShrink: 0, whiteSpace: 'nowrap' }}>
            {['Cornelius Lane & Mufti', 'Orr Dignam & Co.', 'Surridge & Beecheno', 'Mohsin Tayebaly & Co.', 'RIAA Barker Gillette', 'Rizvi Isa Afridi & Angell', 'Hassan & Hassan', 'Khilji & Co.', 'Axis Law Chambers', 'Ibrahim & Ibrahim']
              .concat(['Cornelius Lane & Mufti', 'Orr Dignam & Co.', 'Surridge & Beecheno', 'Mohsin Tayebaly & Co.', 'RIAA Barker Gillette', 'Rizvi Isa Afridi & Angell', 'Hassan & Hassan', 'Khilji & Co.', 'Axis Law Chambers', 'Ibrahim & Ibrahim'])
              .map((firm, i) => (
                <span key={i} style={{ fontSize: 14, fontWeight: 600, color: TX2, opacity: 0.5 }}>{firm}</span>
              ))}
          </div>
        </div>
      </section>

      {/* ══ AI Prediction section ══ */}
      <section style={{ position: 'relative', zIndex: 1, padding: '120px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, border: `1px solid ${GA}40`, backgroundColor: `${GA}12`, marginBottom: 28 }}>
              <Brain size={12} color={GA} />
              <span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: '0.06em' }}>AI COURT PREDICTION</span>
            </div>
            <h2 style={{ fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 800, color: TX, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}>
              Know the verdict<br />before you enter court.
            </h2>
            <p style={{ fontSize: 15, color: TX2, lineHeight: 1.75, marginBottom: 36, maxWidth: 380 }}>
              AI trained on Pakistan's Supreme Court, High Courts, and district court rulings delivers outcome predictions your clients can trust.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
              {[['Pakistan Supreme Court precedents', '#34D399'], ['Judge behavioral pattern analysis', dark ? '#4F8EF7' : '#3070D0'], ['Evidence strength confidence scoring', GA]].map(([l, c]) => (
                <div key={String(l)} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: `${c}20`, border: `1px solid ${c}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={11} color={String(c)} />
                  </div>
                  <span style={{ fontSize: 14, color: TX2 }}>{l}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/prediction')} style={btnPrimary}>
              Explore AI Prediction <ArrowRight size={14} />
            </button>
          </div>

          {/* Mockup */}
          <div className="wkf" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: -40, background: `radial-gradient(ellipse at 60% 40%, ${GA}18 0%, transparent 65%)`, filter: 'blur(50px)' }} />
            <BrowserWindow url="app.wakulaw.ai/prediction" style={{ position: 'relative', boxShadow: dark ? `0 40px 100px rgba(0,0,0,0.7), 0 0 60px ${GA}15` : '0 40px 80px rgba(100,70,0,0.15)' }}>
              <div style={{ padding: 28, backgroundColor: dark ? undefined : '#FAFAF6' }}>
                <div style={{ display: 'flex', gap: 24, marginBottom: 28 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 10px' }}>
                      <svg viewBox="0 0 100 100" style={{ width: '100%', transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r="40" fill="none" stroke={dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'} strokeWidth="9" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke={GA} strokeWidth="9" strokeDasharray="206 251" strokeLinecap="round" />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: TX }}>82%</div>
                        <div style={{ fontSize: 10, color: TX2 }}>win</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontWeight: 700 }}>
                      <ArrowUpRight size={12} /> +6% this week
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: TX, marginBottom: 12 }}>Outcome Scenarios</div>
                    {[['Full Win + Damages', 48, '#34D399'], ['Partial Win', 34, GA], ['Settlement', 12, dark ? '#4F8EF7' : '#3070D0'], ['Adverse', 6, '#F87171']].map(([l, v, c]) => (
                      <div key={String(l)} style={{ marginBottom: 9 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: TX2 }}>{l}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: String(c) }}>{v}%</span>
                        </div>
                        <div style={{ height: 4, backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', borderRadius: 4 }}>
                          <div style={{ height: '100%', width: `${Number(v) * 1.6}%`, backgroundColor: String(c), borderRadius: 4 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ borderRadius: 12, overflow: 'hidden', height: 100, position: 'relative' }}>
                  <img src="https://images.unsplash.com/photo-1618771623063-6c3faa854a61?w=900&h=550&fit=crop&auto=format" alt="Judge's gavel and law book" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: dark ? 'brightness(0.7)' : 'brightness(1)' }} />
                  <div style={{ position: 'absolute', inset: 0, background: dark ? 'linear-gradient(90deg, rgba(13,17,23,0.8), transparent)' : 'linear-gradient(90deg, rgba(255,255,255,0.7), transparent)', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: TX }}>Pakistan Supreme Court</div>
                      <div style={{ fontSize: 10, color: TX2 }}>50K+ precedents analyzed</div>
                    </div>
                  </div>
                </div>
              </div>
            </BrowserWindow>
          </div>
        </div>
      </section>

      {/* ══ Legal library image + overlay ══ */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', boxShadow: dark ? '0 40px 100px rgba(0,0,0,0.8)' : '0 40px 80px rgba(100,70,0,0.18)' }}>
            <img src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1100&h=600&fit=crop&auto=format" alt="Legal library with law books" style={{ width: '100%', height: 480, objectFit: 'cover', display: 'block', filter: dark ? 'brightness(0.4)' : 'brightness(0.65)' }} />
            <div style={{ position: 'absolute', inset: 0, background: dark ? 'linear-gradient(135deg, rgba(13,17,23,0.85) 0%, rgba(13,17,23,0.4) 60%, transparent 100%)' : 'linear-gradient(135deg, rgba(248,244,236,0.9) 0%, rgba(248,244,236,0.5) 50%, transparent 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 72px' }}>
              <div style={{ maxWidth: 520 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, border: `1px solid ${GA}40`, backgroundColor: `${GA}15`, marginBottom: 24 }}>
                  <BookOpen size={12} color={GA} />
                  <span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: '0.06em' }}>50,000+ LEGAL PRECEDENTS</span>
                </div>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: TX, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}>
                  Every judgment.<br />Every precedent.<br />Instantly searchable.
                </h2>
                <p style={{ fontSize: 15, color: TX2, lineHeight: 1.7, marginBottom: 36, maxWidth: 380 }}>
                  AI-powered semantic search across Pakistan's complete legal corpus — from 1947 to today.
                </p>
                <button onClick={() => navigate('/similar-cases')} style={btnPrimary}>
                  Search Legal Database <Search size={14} />
                </button>
              </div>
            </div>
            <div style={{ position: 'absolute', right: 48, top: '50%', transform: 'translateY(-50%)', width: 300 }}>
              <div style={{ borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', backgroundColor: dark ? 'rgba(22,27,34,0.92)' : 'rgba(255,255,255,0.92)', border: `1px solid ${BD}`, boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BD}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Search size={12} color={GA} />
                  <span style={{ fontSize: 11, color: TX2 }}>patent infringement prior art...</span>
                </div>
                {[{ title: 'PLD 2022 SC 445', sim: '91%', c: '#34D399' }, { title: '2019 SCMR 1834', sim: '84%', c: GA }, { title: 'PLD 2018 Lah 203', sim: '79%', c: dark ? '#4F8EF7' : '#3070D0' }].map((r) => (
                  <div key={r.title} style={{ padding: '12px 16px', borderBottom: `1px solid ${BD}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: TX }}>{r.title}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: r.c }}>{r.sim}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Workspace mockup ══ */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, border: `1px solid ${dark ? '#4F8EF7' : '#3070D0'}40`, backgroundColor: dark ? 'rgba(79,142,247,0.1)' : 'rgba(48,112,208,0.08)', marginBottom: 22 }}>
              <Layers size={12} color={dark ? '#4F8EF7' : '#3070D0'} />
              <span style={{ fontSize: 11, color: dark ? '#4F8EF7' : '#3070D0', fontWeight: 700, letterSpacing: '0.06em' }}>CASE WORKSPACE</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: TX, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              Every dimension of a case,<br />in one command center.
            </h2>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: dark ? 'radial-gradient(ellipse at 50% 0%, rgba(79,142,247,0.15) 0%, transparent 60%)' : `radial-gradient(ellipse at 50% 0%, ${GA}10 0%, transparent 60%)`, filter: 'blur(60px)', zIndex: 0 }} />
            <BrowserWindow url="app.wakulaw.ai/workspace/WL-2024-003" style={{ position: 'relative', zIndex: 1, boxShadow: dark ? '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)' : '0 40px 80px rgba(100,70,0,0.18)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 240px', height: 420, backgroundColor: dark ? undefined : '#FAFAF6' }}>
                <div style={{ borderRight: `1px solid ${BD}`, padding: '14px 10px' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: TX2, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 8, opacity: 0.6 }}>Cases</div>
                  {CASES.map((c, i) => (
                    <div key={c.id} style={{ padding: '8px 8px', borderRadius: 9, marginBottom: 2, backgroundColor: i === 2 ? `${GA}14` : 'transparent', border: `1px solid ${i === 2 ? `${GA}30` : 'transparent'}` }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: i === 2 ? TX : TX2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                      <div style={{ fontSize: 9, color: i === 2 ? GA : TX2, marginTop: 2, opacity: i === 2 ? 1 : 0.6 }}>{c.id}</div>
                    </div>
                  ))}
                </div>
                <div style={{ borderRight: `1px solid ${BD}`, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: TX }}>DataTech LLC IP Dispute</div>
                      <div style={{ fontSize: 11, color: TX2, marginTop: 3 }}>WL-2024-003 · Patent · Supreme Court</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 9, color: TX2 }}>Win Probability</div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: GA }}>82%</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                    {['Overview', 'AI Summary', 'Prediction', 'Strategy'].map((t, i) => (
                      <div key={t} style={{ padding: '4px 9px', borderRadius: 6, fontSize: 10, fontWeight: 600, backgroundColor: i === 2 ? GA : dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)', color: i === 2 ? (dark ? '#0D1117' : '#fff') : TX2 }}>{t}</div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    {[['Evidence Strength', 85, '#34D399'], ['Precedent Match', 72, dark ? '#4F8EF7' : '#3070D0'], ['Judge Alignment', 68, '#A78BFA'], ['Documentation', 94, '#34D399']].map(([l, v, c]) => (
                      <div key={String(l)} style={{ padding: '10px 12px', borderRadius: 10, backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)', border: `1px solid ${BD}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 10, color: TX2 }}>{l}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: String(c) }}>{v}%</span>
                        </div>
                        <div style={{ height: 3, backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)', borderRadius: 3 }}>
                          <div style={{ height: '100%', width: `${v}%`, backgroundColor: String(c), borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: 10, backgroundColor: `${GA}10`, border: `1px solid ${GA}30`, fontSize: 10, color: TX2, lineHeight: 1.5 }}>
                    <span style={{ color: GA, fontWeight: 700 }}>AI: </span>File Daubert motion to limit opposing expert. Lead with functional novelty — avoid Alice challenge.
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '14px 12px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: GA, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Sparkles size={10} />AI Assistant
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'hidden' }}>
                    <div style={{ padding: '8px 10px', borderRadius: 10, backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${BD}`, fontSize: 10, color: TX2, lineHeight: 1.5 }}>
                      Win probability <strong style={{ color: GA }}>82%</strong> after expert report filed. Judge Wells has ruled against SW patents 3/7 times.
                    </div>
                    <div style={{ padding: '8px 10px', borderRadius: 10, backgroundColor: `${GA}18`, border: `1px solid ${GA}35`, fontSize: 10, color: TX, lineHeight: 1.5 }}>
                      Draft Daubert motion outline.
                    </div>
                    <div style={{ padding: '8px 10px', borderRadius: 10, backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${BD}`, fontSize: 10, color: TX2, lineHeight: 1.5 }}>
                      Drafting motion... limiting Dr. Kovacs to compression algorithm scope only... <span style={{ color: GA }}>●●●</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                    <div style={{ flex: 1, height: 28, borderRadius: 8, backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)', border: `1px solid ${BD}` }} />
                    <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: GA, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Send size={10} color={dark ? '#0D1117' : '#fff'} />
                    </div>
                  </div>
                </div>
              </div>
            </BrowserWindow>
          </div>
        </div>
      </section>

      {/* ══ TEAM ══ */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80, alignItems: 'start' }}>
            <div style={{ paddingTop: 20 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, border: `1px solid ${GA}40`, backgroundColor: `${GA}12`, marginBottom: 28 }}>
                <Users size={12} color={GA} />
                <span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: '0.06em' }}>OUR LEGAL EXPERTS</span>
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: TX, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24 }}>
                Powerful success,<br />driven by strategy<br />&amp; experience.
              </h2>
              <p style={{ fontSize: 15, color: TX2, lineHeight: 1.75, marginBottom: 36 }}>
                Our senior advocates have appeared before Pakistan's Supreme Court, Federal Shariat Court, and all four High Courts.
              </p>
              <button onClick={() => navigate('/find-lawyer')} style={btnPrimary}>
                Schedule Consultation <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { name: 'Barrister Ahmad Raza', role: 'Managing Partner', spec: 'Constitutional Law', img: 'https://images.unsplash.com/photo-1642522029686-5485ea7e6042?w=400&h=500&fit=crop&auto=format', cases: 340, rating: 4.9, years: 18 },
                { name: 'Adv. Zara Sheikh', role: 'Senior Partner', spec: 'Corporate & IP', img: 'https://images.unsplash.com/photo-1758518727888-ffa196002e59?w=400&h=500&fit=crop&auto=format', cases: 210, rating: 4.8, years: 12 },
                { name: 'Omar Malik SC', role: 'Senior Counsel', spec: 'Criminal Defence', img: 'https://images.unsplash.com/photo-1771244678811-50c22f17c791?w=400&h=500&fit=crop&auto=format', cases: 155, rating: 4.7, years: 15 },
              ].map((a) => (
                <div
                  key={a.name}
                  className="wk-card-hover"
                  style={{ borderRadius: 24, overflow: 'hidden', border: `1px solid ${BD}`, marginTop: a.spec === 'Corporate & IP' ? 32 : 0, backgroundColor: dark ? '#1E2530' : '#FFFFFF', boxShadow: dark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 40px rgba(100,70,0,0.12)', cursor: 'pointer', position: 'relative' }}
                  onClick={() => navigate('/lawyer-profile')}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: GA, zIndex: 2 }} />
                  <div style={{ height: 280, overflow: 'hidden', position: 'relative' }}>
                    <img src={a.img} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: dark ? 'linear-gradient(to top, #1E2530, transparent)' : 'linear-gradient(to top, #FFFFFF, transparent)' }} />
                  </div>
                  <div style={{ padding: '16px 20px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: TX }}>{a.name}</span>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0D1117" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: GA, fontWeight: 600, marginBottom: 2 }}>{a.role}</div>
                    <div style={{ fontSize: 12, color: TX2, marginBottom: 14 }}>{a.spec}</div>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={TX2} strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                        <span style={{ fontSize: 12, color: TX2 }}>{a.cases}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill={GA} stroke={GA} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        <span style={{ fontSize: 12, color: TX2 }}>{a.rating}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={TX2} strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        <span style={{ fontSize: 12, color: TX2 }}>{a.years}y</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/lawyer-profile')}
                      style={{ width: '100%', padding: '10px', borderRadius: 10, backgroundColor: `${GA}15`, color: GA, fontSize: 13, fontWeight: 700, border: `1px solid ${GA}35`, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                    >
                      View Profile →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section style={{ position: 'relative', zIndex: 1, borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}`, backgroundColor: dark ? 'rgba(22,27,34,0.6)' : 'rgba(237,232,216,0.7)', padding: '80px 24px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', userSelect: 'none', overflow: 'hidden', zIndex: 0 }}>
          <div className="wk-urdu2" style={{ position: 'absolute', bottom: '-20%', left: '50%', transform: 'translateX(-50%)', fontSize: 'clamp(100px, 20vw, 240px)', fontFamily: "'Noto Nastaliq Urdu', serif", fontWeight: 700, color: WMK, lineHeight: 1, direction: 'rtl', whiteSpace: 'nowrap' }}>
            قانون
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, position: 'relative', zIndex: 1 }}>
          {[
            { value: '94.2%', label: 'AI Prediction Accuracy', sub: 'Verified by 50K+ cases' },
            { value: '30+', label: 'Years Combined Expertise', sub: 'Supreme & High Courts' },
            { value: '12K+', label: 'Legal Matters Resolved', sub: 'Across Pakistan' },
            { value: '95%', label: 'Client Approval Rate', sub: 'Post-case surveys' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center', padding: '20px' }}>
              <div
                style={dark
                  ? { fontSize: 48, fontWeight: 900, letterSpacing: '-0.05em', backgroundImage: 'linear-gradient(135deg, #D4AF37, #F0D060)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 }
                  : { fontSize: 48, fontWeight: 900, letterSpacing: '-0.05em', color: '#7A5510', marginBottom: 8 }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: TX, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: TX2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section style={{ position: 'relative', zIndex: 1, padding: '120px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 800, color: TX, letterSpacing: '-0.03em' }}>
              Pakistan's top attorneys trust WakuLaw.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { name: 'Justice (R) Fakhruddin', role: 'Former Supreme Court Judge, Karachi', text: "The AI prediction model's accuracy on constitutional matters is exceptional. WakuLaw represents the future of Pakistani legal practice.", avatar: 'FG', color: GA },
              { name: 'Barrister Ayesha Mirza', role: 'Managing Partner, Mirza Law Associates', text: 'As a woman in Pakistani law, having AI-backed data on judicial patterns has transformed how we prepare our cases before the High Court.', avatar: 'AM', color: dark ? '#4F8EF7' : '#3070D0' },
              { name: 'Advocate Tariq Hussain', role: 'Senior Counsel, Lahore Bar', text: 'The similar case search found a Lahore High Court ruling from 2019 that our opponent had no idea about. That precedent won us the case.', avatar: 'TH', color: '#A78BFA' },
            ].map((t) => (
              <div key={t.name} className="wk-card-hover" style={{ padding: '32px', borderRadius: 24, backgroundColor: dark ? CARDBG : '#FFFFFF', border: `1px solid ${BD}`, boxShadow: dark ? '0 20px 60px rgba(0,0,0,0.3)' : '0 20px 40px rgba(100,70,0,0.08)' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill={GA} color={GA} />
                  ))}
                </div>
                <p style={{ fontSize: 14, color: TX2, lineHeight: 1.75, marginBottom: 28, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: dark ? '#0D1117' : '#FFFFFF', backgroundColor: t.color, flexShrink: 0 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: TX }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: TX2, marginTop: 2 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ position: 'relative', borderRadius: 32, overflow: 'hidden', minHeight: 420, display: 'flex', alignItems: 'center' }}>
            <img src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1100&h=600&fit=crop&auto=format" alt="Legal library" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3) saturate(0.7)' }} />
            <div style={{ position: 'absolute', inset: 0, background: dark ? 'linear-gradient(135deg, rgba(13,17,23,0.92), rgba(13,17,23,0.6))' : 'linear-gradient(135deg, rgba(26,16,5,0.9), rgba(26,16,5,0.6))' }} />
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 80% 50%, ${GA}20 0%, transparent 60%)` }} />
            <div style={{ position: 'absolute', right: -100, top: '50%', transform: 'translateY(-50%)', width: 500, height: 500, borderRadius: '50%', border: `1px solid ${GA}20`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: -60, top: '50%', transform: 'translateY(-50%)', width: 350, height: 350, borderRadius: '50%', border: `1px solid ${GA}30`, pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1, padding: '64px 72px', maxWidth: 600 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, backgroundColor: `${GA}20`, marginBottom: 28 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#34D399' }} />
                <span style={{ fontSize: 11, color: '#34D399', fontWeight: 700 }}>Free consultation — No obligation</span>
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.04em', lineHeight: 1.08, marginBottom: 20 }}>
                Your legal partner<br />in every situation.
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', marginBottom: 44, lineHeight: 1.7 }}>
                From Karachi to Islamabad — let Pakistan's most advanced AI legal platform work for you.
              </p>
              <div style={{ display: 'flex', gap: 16 }}>
                <button onClick={() => navigate('/register')} style={{ ...btnPrimary, boxShadow: `0 0 60px ${GA}60` }}>
                  Get Started <ArrowRight size={15} />
                </button>
                <button onClick={() => navigate('/login')} style={{ ...btnSecondary, color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
