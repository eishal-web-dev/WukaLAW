import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, Star, X } from 'lucide-react'
import { PublicNav, PublicFooter, usePublicTokens } from '../components/PublicShell'

export default function Pricing() {
  const navigate = useNavigate()
  const { dark, BG, CARDBG, TX, TX2, GA, BD } = usePublicTokens()
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(-1);

  const tiers = [
    {
      name: "Advocate",
      monthly: 5000,
      desc: "Solo practitioners starting their AI journey",
      recommended: false,
      features: [
        { label: "Active cases", value: "5" },
        { label: "AI court prediction", value: true },
        { label: "Case workspace", value: true },
        { label: "Document storage", value: "5 GB" },
        { label: "Email support", value: true },
        { label: "Similar case search", value: false },
        { label: "Team seats", value: false },
        { label: "API access", value: false },
        { label: "White-label", value: false },
      ],
    },
    {
      name: "Firm",
      monthly: 18000,
      desc: "Small to mid-size firms scaling with AI",
      recommended: true,
      features: [
        { label: "Active cases", value: "Unlimited" },
        { label: "AI court prediction", value: true },
        { label: "Case workspace", value: true },
        { label: "Document storage", value: "100 GB" },
        { label: "Priority support", value: true },
        { label: "Similar case search", value: true },
        { label: "Team seats", value: "5 seats" },
        { label: "API access", value: true },
        { label: "White-label", value: false },
      ],
    },
    {
      name: "Enterprise",
      monthly: null,
      desc: "Large firms and corporate legal departments",
      recommended: false,
      features: [
        { label: "Active cases", value: "Unlimited" },
        { label: "AI court prediction", value: true },
        { label: "Case workspace", value: true },
        { label: "Document storage", value: "Unlimited" },
        { label: "Dedicated CSM", value: true },
        { label: "Similar case search", value: true },
        { label: "Team seats", value: "Custom" },
        { label: "API access", value: true },
        { label: "White-label", value: true },
      ],
    },
  ];

  const faqs = [
    { q: "How accurate is WukaLAW's AI prediction?", a: "Our AI achieves 94.2% accuracy verified against historical Pakistani court cases spanning 2010–2024." },
    { q: "Is my client data secure?", a: "Zero-knowledge architecture. AES-256 + TLS 1.3. Your data is never used to train our models — ever." },
    { q: "Does it work for all Pakistani courts?", a: "Supreme Court, all 4 High Courts, Federal Shariat Court, and district courts across all provinces including AJK and GB." },
    { q: "How quickly can I get started?", a: "Most firms onboard in under 30 minutes. Solo practitioners self-serve in minutes with guided setup." },
    { q: "Can I import existing cases?", a: "Yes — PDF, DOCX, Excel/Sheets, CSV. Plus direct integrations with Clio, Thomson Reuters, and LexisNexis." },
    { q: "Is there a free trial?", a: "14-day free trial on all plans. No credit card required. Enterprise trials available with a demo call." },
  ];

  const price = (monthly: number | null) => {
    if (monthly === null) return "Custom";
    const v = annual ? Math.round(monthly * 0.8) : monthly;
    return `PKR ${v.toLocaleString()}`;
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: "Inter, sans-serif" }}>
      <PublicNav current="/pricing" />

      {/* Hero */}
      <section style={{ padding: "80px 24px 60px", textAlign: "center" as const }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 16px", borderRadius: 999, backgroundColor: `${GA}15`, marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: GA }} />
            <span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: "0.08em" }}>14-DAY FREE TRIAL · NO CREDIT CARD</span>
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", lineHeight: 1.08, marginBottom: 20 }}>Simple, transparent pricing</h1>
          <p style={{ fontSize: 18, color: TX2, marginBottom: 40, lineHeight: 1.6 }}>Start free, scale as you grow. Every plan includes full AI capabilities.</p>

          {/* Monthly/Annual Toggle */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "6px 6px 6px 16px", borderRadius: 999, border: `1px solid ${BD}`, backgroundColor: CARDBG }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: annual ? TX2 : TX }}>Monthly</span>
            <button onClick={() => setAnnual(a => !a)}
              style={{ width: 48, height: 26, borderRadius: 999, border: "none", cursor: "pointer", position: "relative", backgroundColor: annual ? GA : dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)", transition: "background-color 0.2s" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: "#FFFFFF", position: "absolute", top: 3, left: annual ? 25 : 3, transition: "left 0.2s" }} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: annual ? TX : TX2 }}>Annual</span>
            <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, backgroundColor: annual ? "rgba(52,211,153,0.15)" : dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", color: annual ? "#34D399" : TX2, fontWeight: 700 }}>Save 20%</span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, alignItems: "stretch" }}>
          {tiers.map(tier => (
            <div key={tier.name} style={{ borderRadius: 20, border: `1px solid ${tier.recommended ? GA + "60" : BD}`, backgroundColor: CARDBG, overflow: "hidden", display: "flex", flexDirection: "column" as const, boxShadow: tier.recommended ? `0 0 60px ${GA}20` : "none" }}>
              {tier.recommended && <div style={{ height: 4, backgroundColor: GA }} />}
              <div style={{ padding: 28, flex: 1 }}>
                {tier.recommended && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 999, backgroundColor: `${GA}20`, marginBottom: 14 }}>
                    <Star size={10} fill={GA} color={GA} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: GA }}>Most Popular</span>
                  </div>
                )}
                <div style={{ fontSize: 20, fontWeight: 800, color: TX, marginBottom: 6 }}>{tier.name}</div>
                <div style={{ fontSize: 13, color: TX2, marginBottom: 20, lineHeight: 1.5 }}>{tier.desc}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: TX, letterSpacing: "-0.03em" }}>{price(tier.monthly)}</span>
                  {tier.monthly !== null && <span style={{ fontSize: 14, color: TX2 }}>{annual ? "/mo, billed annually" : "/mo"}</span>}
                </div>
                {annual && tier.monthly !== null && (
                  <div style={{ fontSize: 12, color: TX2, marginBottom: 20, textDecoration: "line-through" }}>PKR {tier.monthly.toLocaleString()}/mo</div>
                )}
                {!annual && <div style={{ marginBottom: 20 }} />}
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 28 }}>
                  {tier.features.map(f => (
                    <div key={f.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14 }}>
                      <span style={{ color: TX2 }}>{f.label}</span>
                      <span style={{ color: f.value === true ? "#34D399" : f.value === false ? dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" : TX, fontWeight: typeof f.value === "string" ? 600 : 400 }}>
                        {f.value === true ? <Check size={14} /> : f.value === false ? <X size={14} /> : f.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "0 28px 28px" }}>
                <button onClick={() => tier.monthly === null ? navigate('/contact') : navigate('/register')}
                  style={{ width: "100%", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif", backgroundColor: tier.recommended ? GA : "transparent", color: tier.recommended ? (dark ? "#0D1117" : "#FFFFFF") : TX, border: tier.recommended ? "none" : `1px solid ${BD}` }}>
                  {tier.monthly === null ? "Contact Sales" : "Start Free Trial"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" as const }}>
          <div style={{ padding: "32px 40px", borderRadius: 20, border: `1px solid ${BD}`, backgroundColor: dark ? "rgba(22,27,34,0.5)" : "rgba(237,232,216,0.5)" }}>
            <p style={{ fontSize: 15, color: TX2, marginBottom: 24 }}>Trusted by legal professionals across Pakistan</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" as const }}>
              {[["200+", "Law Firms"], ["12,000+", "Cases Processed"], ["94.2%", "Prediction Accuracy"], ["4.9★", "Average Rating"]].map(([v, l]) => (
                <div key={l} style={{ textAlign: "center" as const }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: GA, letterSpacing: "-0.03em" }}>{v}</div>
                  <div style={{ fontSize: 13, color: TX2, marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: TX, textAlign: "center" as const, marginBottom: 40, letterSpacing: "-0.03em" }}>Common questions</h2>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderRadius: 14, border: `1px solid ${openFaq === i ? GA + "40" : BD}`, backgroundColor: CARDBG, overflow: "hidden" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  style={{ width: "100%", padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", textAlign: "left" as const }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: TX }}>{faq.q}</span>
                  <span style={{ color: openFaq === i ? GA : TX2, flexShrink: 0, transition: "transform 0.2s", display: "block", transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}>
                    <ChevronDown size={18} />
                  </span>
                </button>
                {openFaq === i && <div style={{ padding: "0 22px 18px", fontSize: 14, color: TX2, lineHeight: 1.7 }}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

