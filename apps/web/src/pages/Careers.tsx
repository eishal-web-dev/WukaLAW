import { Users } from 'lucide-react'
import { PublicNav, PublicFooter, usePublicTokens } from '../components/PublicShell'

export default function Careers() {
  const { dark, BG, TX, TX2, GA, BD } = usePublicTokens()
  const CARD = dark ? "#0F1521" : "#FFFFFF";
  const jobs = [
    { title: "Senior ML Engineer", dept: "Engineering", location: "Karachi / Remote", type: "Full-time" },
    { title: "Legal Data Scientist", dept: "AI Research", location: "Lahore / Remote", type: "Full-time" },
    { title: "Product Designer", dept: "Design", location: "Remote", type: "Full-time" },
    { title: "Full Stack Engineer (React/Node)", dept: "Engineering", location: "Karachi", type: "Full-time" },
    { title: "Legal Content Specialist", dept: "Content", location: "Remote", type: "Contract" },
    { title: "Enterprise Sales Manager", dept: "Sales", location: "Islamabad", type: "Full-time" },
  ];
  const perks = [
    { icon: "💰", title: "Competitive Pay", desc: "Top-of-market salaries in PKR + USD options" },
    { icon: "🏠", title: "Remote-first", desc: "Work from anywhere in Pakistan or globally" },
    { icon: "📚", title: "Learning Budget", desc: "PKR 200,000 annual learning allowance" },
    { icon: "🏥", title: "Health Coverage", desc: "Full family health insurance" },
    { icon: "🚀", title: "Equity", desc: "Employee stock options in a fast-growing startup" },
    { icon: "⏰", title: "Flexible Hours", desc: "Async-first culture, no fixed hours" },
  ];
  return (
    <div style={{ backgroundColor: BG, fontFamily: "Inter, sans-serif", minHeight: "100vh" }}>
      <PublicNav current="/careers" />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 99, border: `1px solid ${GA}40`, background: `${GA}10`, marginBottom: 24 }}>
            <Users size={12} color={GA} /><span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: "0.06em" }}>CAREERS</span>
          </div>
          <h1 style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 20 }}>Join the team building Pakistan's<br /><span style={{ color: GA }}>legal future.</span></h1>
          <p style={{ fontSize: 17, color: TX2, maxWidth: 520, margin: "0 auto", lineHeight: 1.75 }}>We're a small, ambitious team on a mission to make justice more accessible through AI. Come build with us.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 80 }}>
          {perks.map((pk, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{pk.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: TX, marginBottom: 6 }}>{pk.title}</div>
              <div style={{ fontSize: 13, color: TX2 }}>{pk.desc}</div>
            </div>
          ))}
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: TX, letterSpacing: "-0.02em", marginBottom: 24 }}>Open Positions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 80 }}>
          {jobs.map((j, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: TX, marginBottom: 4 }}>{j.title}</div>
                <div style={{ fontSize: 12, color: TX2 }}>{j.dept} · {j.location}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: `${GA}15`, color: GA, fontWeight: 600 }}>{j.type}</span>
                <button style={{ fontSize: 13, fontWeight: 700, color: GA, background: "none", border: `1px solid ${GA}40`, padding: "8px 16px", borderRadius: 8, cursor: "pointer" }}>Apply →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}

