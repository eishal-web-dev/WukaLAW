import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PublicNav, usePublicTokens } from '../components/PublicShell'

export default function LawyerProfile() {
  const navigate = useNavigate()
  const { dark, BG, CARDBG, TX, TX2, GA, BD } = usePublicTokens()

  const months = ['September', 'October', 'November', 'December', 'January']
  const days = [
    { num: 3, day: 'Mon' }, { num: 4, day: 'Tue' }, { num: 5, day: 'Wed' },
    { num: 6, day: 'Thu' }, { num: 7, day: 'Fri' }, { num: 8, day: 'Sat' }, { num: 9, day: 'Sun' },
  ]
  const times = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM']
  const [selMonth, setSelMonth] = useState(1)
  const [selDay, setSelDay] = useState(2)
  const [selTime, setSelTime] = useState(0)
  const [booked, setBooked] = useState(false)

  const lawyer = {
    name: 'Barrister Ahmad Raza',
    spec: 'Constitutional Law',
    rating: 4.9,
    img: 'https://images.unsplash.com/photo-1642522029686-5485ea7e6042?w=700&h=600&fit=crop&auto=format&crop=top',
    years: 18,
    clients: '340+',
    reviews: '4.9',
    rate: 15000,
  }

  if (booked) {
    return (
      <div style={{ backgroundColor: BG, fontFamily: 'Inter, sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>✓</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: TX, marginBottom: 12 }}>Appointment Confirmed!</h2>
          <p style={{ color: TX2, marginBottom: 8 }}>{lawyer.name}</p>
          <p style={{ color: GA, fontWeight: 700, marginBottom: 32 }}>
            {months[selMonth]}, {days[selDay].num} at {times[selTime]}
          </p>
          <button
            onClick={() => { setBooked(false); navigate('/find-lawyer') }}
            style={{ backgroundColor: GA, color: dark ? '#0D1117' : '#FFFFFF', padding: '12px 32px', borderRadius: 12, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            Back to Search
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: BG, fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}>
      <PublicNav />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>
        <button
          onClick={() => navigate('/find-lawyer')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: TX2, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'Inter, sans-serif', marginBottom: 28 }}
        >
          ← Back to Search
        </button>

        {/* Profile header */}
        <div style={{ borderRadius: 28, overflow: 'hidden', marginBottom: 24, boxShadow: dark ? '0 32px 80px rgba(0,0,0,0.6)' : '0 32px 60px rgba(100,70,0,0.18)', position: 'relative' }}>
          <div style={{ height: 300, position: 'relative' }}>
            <img src={lawyer.img} alt={lawyer.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(13,10,3,0.95) 100%)' }} />
            <div style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => navigate('/find-lawyer')} style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>←</button>
              <button style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
              </button>
            </div>
            <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: 26, fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: 4 }}>{lawyer.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{lawyer.spec}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={GA} stroke={GA} strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      <span style={{ fontSize: 14, fontWeight: 700, color: GA }}>{lawyer.rating}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    <svg key="chat" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
                    <svg key="phone" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
                    <svg key="video" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>,
                  ].map((icon, i) => (
                    <button key={i} style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
          {[['⏱', `${lawyer.years} years`, 'Experience'], ['👥', lawyer.clients, 'Clients'], ['⭐', lawyer.reviews, 'Reviews']].map(([icon, val, label]) => (
            <div key={label as string} style={{ padding: '18px 16px', borderRadius: 16, backgroundColor: CARDBG, border: `1px solid ${BD}`, textAlign: 'center' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: TX, marginBottom: 2 }}>{val}</div>
              <div style={{ fontSize: 11, color: TX2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Booking card */}
        <div style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: CARDBG, border: `1px solid ${BD}`, padding: '28px', marginBottom: 20, boxShadow: dark ? '0 12px 40px rgba(0,0,0,0.3)' : '0 12px 32px rgba(100,70,0,0.08)' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: TX, marginBottom: 14 }}>Select Date</div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {months.map((m, i) => (
                <button key={m} onClick={() => setSelMonth(i)} style={{ padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: `1px solid ${i === selMonth ? GA : BD}`, backgroundColor: i === selMonth ? GA : 'transparent', color: i === selMonth ? (dark ? '#0D1117' : '#FFFFFF') : TX2, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {m}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              {days.map((d, i) => (
                <button key={d.num} onClick={() => setSelDay(i)} style={{ flex: 1, padding: '12px 6px', borderRadius: 14, textAlign: 'center', border: `1px solid ${i === selDay ? GA : BD}`, backgroundColor: i === selDay ? GA : 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: 10, color: i === selDay ? (dark ? '#0D1117' : '#FFFFFF') : TX2, marginBottom: 4, fontWeight: 600 }}>{d.day}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: i === selDay ? (dark ? '#0D1117' : '#FFFFFF') : TX }}>{d.num}</div>
                  {i === selDay && <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: dark ? '#0D1117' : '#FFFFFF', margin: '4px auto 0' }} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: TX, marginBottom: 14 }}>Select Time</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {times.map((t, i) => (
                <button key={t} onClick={() => setSelTime(i)} style={{ padding: '10px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600, textAlign: 'center', border: `1px solid ${i === selTime ? GA : BD}`, backgroundColor: i === selTime ? `${GA}20` : 'transparent', color: i === selTime ? GA : TX2, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected slot summary */}
        <div style={{ padding: '14px 20px', borderRadius: 14, backgroundColor: `${GA}12`, border: `1px solid ${GA}30`, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 12, color: TX2 }}>Appointment: </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: TX }}>
              {months[selMonth]} {days[selDay].num} · {times[selTime]}
            </span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: GA }}>PKR {lawyer.rate.toLocaleString()}/hr</span>
        </div>

        <button
          onClick={() => setBooked(true)}
          style={{ width: '100%', padding: '18px', borderRadius: 16, backgroundColor: GA, color: dark ? '#0D1117' : '#FFFFFF', fontSize: 16, fontWeight: 800, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: `0 0 40px ${GA}50`, letterSpacing: '-0.01em' }}
        >
          Book Consultation — PKR {lawyer.rate.toLocaleString()}/hr
        </button>
      </div>
    </div>
  )
}
