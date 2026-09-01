import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { PublicNav, PublicFooter, usePublicTokens } from '../components/PublicShell'

export default function Features() {
  const navigate = useNavigate()
  const { dark, BG, TX, TX2, GA, BD } = usePublicTokens()
  const CARD = dark ? "#0F1521" : "#FFFFFF";
  const features = [
    { icon: "🧠", title: "AI Court Outcome Prediction", desc: "94.2% accuracy on Pakistani court outcomes. Trained on 200,000+ Supreme Court, High Court and district court judgments since 2010.", tag: "Core AI" },
    { icon: "🔍", title: "Semantic Case Search", desc: "Find precedents instantly across 15 million+ cases using natural language queries. No legal keyword memorization required.", tag: "Search" },
    { icon: "📋", title: "Automated Document Drafting", desc: "Generate petitions, affidavits, legal memos and briefs in seconds. AI-powered templates built on Pakistani legal standards.", tag: "Documents" },
    { icon: "⚖️", title: "Timeline Intelligence", desc: "Visual case timeline with AI-generated milestone predictions, deadline alerts and procedural guidance at every step.", tag: "Case Management" },
    { icon: "🎯", title: "Evidence Analysis Engine", desc: "Upload exhibits, photos, contracts and witness statements. AI extracts key arguments, contradiction flags and strength scoring.", tag: "Evidence" },
    { icon: "📊", title: "AI Strategy Assistant", desc: "Real-time strategic guidance based on judge preferences, opposing counsel history, court precedent and case-specific risk factors.", tag: "Strategy" },
    { icon: "🔗", title: "Similar Case Matching", desc: "Instant identification of analogous cases with outcome data, argument similarity scores and key distinguishing factors.", tag: "Research" },
    { icon: "🛡️", title: "Explainable AI Decisions", desc: "Every prediction comes with a full breakdown of contributing factors, precedent citations, and confidence intervals.", tag: "Transparency" },
    { icon: "👥", title: "Team Collaboration", desc: "Multi-user workspaces with role-based access, real-time comments, task assignments and audit trails for entire legal teams.", tag: "Collaboration" },
  ];
  return (
    <div style={{ backgroundColor: BG, fontFamily: "Inter, sans-serif", minHeight: "100vh" }}>
      <PublicNav current="/features" />
      {/* Hero */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px 64px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 99, border: `1px solid ${GA}40`, background: `${GA}10`, marginBottom: 24 }}>
          <Sparkles size={12} color={GA} /><span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: "0.06em" }}>FEATURES</span>
        </div>
        <h1 style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 20 }}>
          Everything your practice needs.<br />
          <span style={{ color: GA }}>Powered by AI.</span>
        </h1>
        <p style={{ fontSize: 17, color: TX2, maxWidth: 560, margin: "0 auto 48px", lineHeight: 1.75 }}>
          WukaLAW brings the full power of artificial intelligence to every stage of the legal process — from research to courtroom strategy.
        </p>
      </div>
      {/* Feature grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 96px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 16, padding: 28, transition: "transform 0.2s, box-shadow 0.2s", cursor: "default" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 24px 60px rgba(0,0,0,0.25)`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: GA, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{f.tag}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: TX, marginBottom: 10, letterSpacing: "-0.01em" }}>{f.title}</div>
              <p style={{ fontSize: 13.5, color: TX2, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      {/* CTA */}
      <div style={{ background: dark ? "#0F1521" : "#EDE8DF", borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}`, padding: "80px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, color: TX, letterSpacing: "-0.03em", marginBottom: 16 }}>Ready to transform your practice?</h2>
        <p style={{ fontSize: 16, color: TX2, marginBottom: 32 }}>Join 2,400+ Pakistani lawyers already using WukaLAW.</p>
        <button onClick={() => navigate('/register')} style={{ background: `linear-gradient(135deg,${GA},${GA}CC)`, color: "#fff", fontSize: 15, fontWeight: 700, padding: "14px 36px", borderRadius: 10, border: "none", cursor: "pointer", boxShadow: `0 8px 32px ${GA}40` }}>
          Start Free Trial
        </button>
      </div>
      <PublicFooter />
    </div>
  );
}

