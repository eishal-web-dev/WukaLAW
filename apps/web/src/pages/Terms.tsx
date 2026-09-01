import { PublicNav, PublicFooter, usePublicTokens } from '../components/PublicShell'

export default function Terms() {
  const { dark, BG, TX, TX2, BD } = usePublicTokens()
  const CARD = dark ? "#0F1521" : "#FFFFFF";
  const sections = [
    { title: "1. Acceptance of Terms", body: "By accessing or using WukaLAW, you agree to be bound by these Terms of Service. If you do not agree, you may not use the service. These terms govern your use of all WukaLAW products and services." },
    { title: "2. Use of Services", body: "WukaLAW is licensed for use by legal professionals. You agree not to use the service for any unlawful purpose, to reverse-engineer our AI models, or to resell the service without written authorization." },
    { title: "3. AI Predictions Disclaimer", body: "WukaLAW's AI predictions are informational tools, not legal advice. They are provided without warranty of accuracy. All legal decisions remain the sole responsibility of the licensed attorney of record." },
    { title: "4. Intellectual Property", body: "WukaLAW and its AI models, interfaces, and content are proprietary to WukaLAW Inc. Your case data and documents remain your property. You grant us a limited license to process them solely to provide the service." },
    { title: "5. Limitation of Liability", body: "To the maximum extent permitted by Pakistani law, WukaLAW's liability is limited to the amount you paid in the 3 months preceding any claim. We are not liable for indirect, incidental, or consequential damages." },
    { title: "6. Governing Law", body: "These terms are governed by the laws of Pakistan. Any disputes shall be subject to the exclusive jurisdiction of the courts of Karachi, Pakistan. You waive any objection to this jurisdiction." },
  ];
  return (
    <div style={{ backgroundColor: BG, fontFamily: "Inter, sans-serif", minHeight: "100vh" }}>
      <PublicNav current="/terms" />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", marginBottom: 12 }}>Terms of Service</h1>
          <p style={{ fontSize: 14, color: TX2 }}>Last updated: July 1, 2024. Effective: July 1, 2024.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {sections.map((s, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 14, padding: 28 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: TX, marginBottom: 12, letterSpacing: "-0.01em" }}>{s.title}</div>
              <p style={{ fontSize: 14, color: TX2, lineHeight: 1.8, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}

// ─── Auth Pages ───────────────────────────────────────────────────────────────
