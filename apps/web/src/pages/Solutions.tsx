import { useNavigate } from 'react-router-dom'
import { Check, Layers } from 'lucide-react'
import { PublicNav, PublicFooter, usePublicTokens } from '../components/PublicShell'

export default function Solutions() {
  const navigate = useNavigate()
  const { dark, BG, TX, TX2, GA, BD } = usePublicTokens()
  const CARD = dark ? "#0F1521" : "#FFFFFF";
  const solutions = [
    { title: "Solo Practitioners", icon: "👤", color: GA, desc: "AI-powered research, drafting and prediction tools that give a solo lawyer the horsepower of a full legal team. Level the playing field against large firms.", features: ["Instant case research","AI brief drafting","Outcome prediction","Client portal"] },
    { title: "Law Firms", icon: "🏛️", color: GA, desc: "Multi-user workspace with role-based access, shared case libraries, firm-wide analytics and white-label client portals. Built for firms of 5 to 500.", features: ["Team collaboration","Case analytics","Client management","Custom branding"] },
    { title: "Legal Departments", icon: "🏢", color: "#34D399", desc: "Streamline in-house legal operations with contract intelligence, matter tracking, spend analytics and seamless integration with your existing systems.", features: ["Matter tracking","Contract AI","Spend analytics","API integration"] },
    { title: "Law Schools & Academia", icon: "📚", color: "#F87171", desc: "Teach the future of law with live case databases, research tools and AI demonstrations. Special pricing for educational institutions.", features: ["Research library","Teaching tools","Student accounts","Academic pricing"] },
  ];
  return (
    <div style={{ backgroundColor: BG, fontFamily: "Inter, sans-serif", minHeight: "100vh" }}>
      <PublicNav current="/solutions" />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px 64px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 99, border: `1px solid ${GA}40`, background: `${GA}10`, marginBottom: 24 }}>
          <Layers size={12} color={GA} /><span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: "0.06em" }}>SOLUTIONS</span>
        </div>
        <h1 style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 20 }}>
          Built for every kind of<br /><span style={{ color: GA }}>legal professional.</span>
        </h1>
        <p style={{ fontSize: 17, color: TX2, maxWidth: 520, margin: "0 auto 64px", lineHeight: 1.75 }}>
          Whether you're a solo advocate or a 200-lawyer firm, WukaLAW has a workflow designed specifically for you.
        </p>
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 96px", display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 24 }}>
        {solutions.map((s, i) => (
          <div key={i} style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 20, padding: 36, transition: "transform 0.2s,box-shadow 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 24px 60px rgba(0,0,0,0.25)`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: TX, letterSpacing: "-0.02em", marginBottom: 12 }}>{s.title}</div>
            <p style={{ fontSize: 14, color: TX2, lineHeight: 1.75, marginBottom: 24 }}>{s.desc}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {s.features.map((f, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${s.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={10} color={s.color} />
                  </div>
                  <span style={{ fontSize: 13.5, color: TX2 }}>{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/register')} style={{ marginTop: 28, width: "100%", padding: "12px", background: `${s.color}15`, border: `1px solid ${s.color}30`, borderRadius: 10, color: s.color, fontSize: 13.5, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em" }}>
              Get started →
            </button>
          </div>
        ))}
      </div>
      <PublicFooter />
    </div>
  );
}

