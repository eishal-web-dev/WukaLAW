import { useState } from 'react'
import { PublicNav, PublicFooter, usePublicTokens } from '../components/PublicShell'

export default function Contact() {
  const { dark, BG, CARDBG, TX, TX2, GA, BD } = usePublicTokens()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }))
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10, border: `1px solid ${BD}`,
    backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', color: TX,
    fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  }

  return (
    <div style={{ backgroundColor: BG, fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}>
      <PublicNav current="/contact" />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, border: `1px solid ${GA}40`, backgroundColor: `${GA}12`, marginBottom: 20 }}>
            <span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: '0.06em' }}>GET IN TOUCH</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: TX, letterSpacing: '-0.04em', marginBottom: 12, lineHeight: 1.1 }}>Contact WakuLaw</h1>
          <p style={{ fontSize: 15, color: TX2, lineHeight: 1.7 }}>Have a question about our platform? We'd love to hear from you.</p>
        </div>

        <div style={{ padding: '40px', borderRadius: 24, backgroundColor: CARDBG, border: `1px solid ${BD}`, boxShadow: dark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 20px 40px rgba(100,70,0,0.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: TX2, display: 'block', marginBottom: 8 }}>Full Name</label>
              <input type="text" placeholder="Your name" value={form.name} onChange={(e) => set('name')(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: TX2, display: 'block', marginBottom: 8 }}>Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set('email')(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: TX2, display: 'block', marginBottom: 8 }}>Subject</label>
            <input type="text" placeholder="How can we help?" value={form.subject} onChange={(e) => set('subject')(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: TX2, display: 'block', marginBottom: 8 }}>Message</label>
            <textarea placeholder="Tell us more..." value={form.message} onChange={(e) => set('message')(e.target.value)} rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <button style={{ width: '100%', padding: '14px', borderRadius: 12, backgroundColor: GA, color: dark ? '#0D1117' : '#FFFFFF', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Send Message →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 32 }}>
          {[['Email', 'hello@wakulaw.pk'], ['WhatsApp', '+92 300 WAKULAW'], ['Response', 'Within 24 hours']].map(([l, v]) => (
            <div key={l} style={{ padding: '18px', borderRadius: 16, backgroundColor: CARDBG, border: `1px solid ${BD}`, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: TX2, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: GA }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
