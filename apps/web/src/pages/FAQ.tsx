import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { PublicNav, PublicFooter, usePublicTokens } from '../components/PublicShell'

export default function FAQ() {
  const navigate = useNavigate()
  const { dark, BG, TX, TX2, GA, BD } = usePublicTokens()
  const [open, setOpen] = useState<number | null>(0);
  const CARD = dark ? "#0F1521" : "#FFFFFF";
  const faqs = [
    { q: "How accurate is WukaLAW's court outcome prediction?", a: "Our AI achieves 94.2% accuracy across verified historical Pakistani court cases (2010-2024), trained on over 200,000 judgments from the Supreme Court, four High Courts, Federal Shariat Court, and district courts across all provinces." },
    { q: "Which courts and jurisdictions does WukaLAW cover?", a: "WukaLAW covers the Supreme Court of Pakistan, all four provincial High Courts (Lahore, Sindh, Islamabad, Peshawar), the Federal Shariat Court, and district courts across all provinces including AJK and Gilgit-Baltistan." },
    { q: "Is my client data secure and confidential?", a: "Absolutely. We employ AES-256 encryption at rest and TLS 1.3 in transit. Your data is stored on Pakistan-based servers, is never used to train our AI models, and is fully compliant with Pakistan's PECA regulations." },
    { q: "Can I try WukaLAW before committing to a subscription?", a: "Yes. We offer a 14-day free trial with full access to all features including AI prediction, case management, and document drafting. No credit card required." },
    { q: "Does WukaLAW work for all practice areas?", a: "Yes. WukaLAW supports all major practice areas including criminal, civil, commercial, constitutional, family, property, intellectual property, employment and tax law." },
    { q: "How does the AI Assistant handle confidential legal matters?", a: "The AI Assistant operates under strict confidentiality protocols. Conversations are encrypted, isolated per workspace, and never shared with third parties or used for model training." },
    { q: "What languages are supported?", a: "WukaLAW fully supports English and Urdu. Documents can be generated in both languages. Our AI understands mixed-language (Urdu-English) legal text common in Pakistani legal proceedings." },
    { q: "Can multiple lawyers in my firm use one account?", a: "Yes. Our Firm and Enterprise plans support multiple users with role-based access control, shared case libraries, team analytics, and administrative oversight features." },
    { q: "How do I migrate existing case files to WukaLAW?", a: "We offer a free migration service for Firm and Enterprise customers. Our team will help you import case files, documents, and client data from any existing system or format." },
    { q: "Is there a mobile app?", a: "A native iOS and Android app is currently in development and expected to launch Q3 2024. In the meantime, WukaLAW is fully responsive and works excellently in mobile browsers." },
  ];
  return (
    <div style={{ backgroundColor: BG, fontFamily: "Inter, sans-serif", minHeight: "100vh" }}>
      <PublicNav current="/faq" />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "96px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 99, border: `1px solid ${GA}40`, background: `${GA}10`, marginBottom: 24 }}>
            <HelpCircle size={12} color={GA} /><span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: "0.06em" }}>FAQ</span>
          </div>
          <h1 style={{ fontSize: "clamp(32px,4.5vw,56px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16 }}>Frequently Asked Questions</h1>
          <p style={{ fontSize: 16, color: TX2, lineHeight: 1.7 }}>Everything you need to know about WukaLAW. Can't find an answer? <button onClick={() => navigate('/contact')} style={{ color: GA, background: "none", border: "none", cursor: "pointer", fontWeight: 600, textDecoration: "underline" }}>Talk to our team.</button></p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, overflow: "hidden" }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 16 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: TX, letterSpacing: "-0.01em" }}>{f.q}</span>
                <div style={{ flexShrink: 0, transition: "transform 0.2s", transform: open === i ? "rotate(180deg)" : "none" }}><ChevronDown size={16} color={TX2} /></div>
              </button>
              {open === i && (
                <div style={{ padding: "0 24px 20px", fontSize: 14, color: TX2, lineHeight: 1.75 }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}

