import { PublicNav, PublicFooter, usePublicTokens } from '../components/PublicShell'

export default function Privacy() {
  const { dark, BG, TX, TX2, BD } = usePublicTokens()
  const CARD = dark ? "#0F1521" : "#FFFFFF";
  const sections = [
    { title: "Information We Collect", body: "We collect information you provide directly, including account credentials, case data, documents you upload, and communications. We also collect usage data, device information, and IP addresses through cookies and similar technologies." },
    { title: "How We Use Your Information", body: "We use your information solely to provide and improve WukaLAW services. Your case data and documents are never used to train our AI models. We do not sell your information to any third parties." },
    { title: "Data Security", body: "All data is encrypted using AES-256 at rest and TLS 1.3 in transit. We maintain SOC 2 Type II compliance, conduct regular penetration testing, and store all data on Pakistan-based servers." },
    { title: "Data Retention", body: "We retain your data for the duration of your subscription plus 30 days. Upon account deletion, all data is permanently purged within 72 hours. You may export your data at any time from account settings." },
    { title: "Your Rights", body: "You have the right to access, correct, export, and delete your personal data. You may also object to certain processing or restrict it. Contact privacy@wukalaw.com to exercise any of these rights." },
    { title: "Contact", body: "For privacy inquiries, contact our Data Protection Officer at privacy@wukalaw.com or by post at WukaLAW Inc., Suite 501, Dolmen City Mall, Clifton, Karachi 75600, Pakistan." },
  ];
  return (
    <div style={{ backgroundColor: BG, fontFamily: "Inter, sans-serif", minHeight: "100vh" }}>
      <PublicNav current="/privacy" />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", marginBottom: 12 }}>Privacy Policy</h1>
          <p style={{ fontSize: 14, color: TX2 }}>Last updated: July 1, 2024. Effective: July 1, 2024.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
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

