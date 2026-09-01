import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, ArrowUpRight, Award, BarChart2, Bell, BookOpen, Brain, Briefcase,
  Check, ChevronDown, Clock, Cpu, GitBranch, Globe, Layers, LayoutDashboard,
  Lock, MessageSquare, Scale, Search, Send, Shield, Sparkles, Star, Users,
} from 'lucide-react'
import { PublicNav, PublicFooter, BrowserWindow, usePublicTokens } from '../components/PublicShell'
import { G } from '../components/design'
import { CASES, AREA_DATA } from '../lib/mock'

export default function Landing() {
  const navigate = useNavigate()
  const { dark, BG, CARDBG, TX, TX2, GA, BD, WMK } = usePublicTokens()
  // ── Theme tokens ──────────────────────────────────────────────────────────

  // Unsplash image URLs

  const btnPrimary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 8,
    backgroundColor: GA, color: dark ? "#0D1117" : "#FFFFFF",
    fontSize: 14, fontWeight: 700, padding: "13px 28px",
    borderRadius: 12, border: "none", cursor: "pointer",
    boxShadow: `0 0 32px ${GA}50`,
  };
  const btnSecondary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 8,
    fontSize: 14, color: TX2, background: "none",
    border: `1px solid ${BD}`, padding: "12px 24px",
    borderRadius: 12, cursor: "pointer",
  };

  return (
    <div style={{ backgroundColor: BG, fontFamily: "Inter, sans-serif", overflowX: "hidden", transition: "background-color 0.3s, color 0.3s" }}>
      <style>{`
        @keyframes wk-float  { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-14px)} }
        @keyframes wk-float2 { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-10px) rotate(1deg)} }
        @keyframes wk-glow   { 0%,100%{opacity:0.35} 50%{opacity:0.7} }
        @keyframes wk-marquee{ 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes wk-fade-up{ from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes wk-spin   { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes wk-urdu-drift { 0%,100%{transform:translateY(0) rotate(3deg)} 50%{transform:translateY(-8px) rotate(2deg)} }
        @keyframes wk-urdu-drift2 { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-12px) rotate(-3deg)} }
        @keyframes wk-border-glow { 0%,100%{box-shadow:0 0 0 0 ${GA}00} 50%{box-shadow:0 0 30px 4px ${GA}30} }
        .wkf  { animation: wk-float  7s ease-in-out infinite; }
        .wkf2 { animation: wk-float2 9s ease-in-out infinite; }
        .wkg  { animation: wk-glow   4s ease-in-out infinite; }
        .wkm  { animation: wk-marquee 30s linear infinite; }
        .wkfu { animation: wk-fade-up 0.7s ease-out both; }
        .wk-urdu1 { animation: wk-urdu-drift  10s ease-in-out infinite; }
        .wk-urdu2 { animation: wk-urdu-drift2 13s ease-in-out infinite; }
        .wk-urdu3 { animation: wk-urdu-drift  8s ease-in-out infinite 1s; }
        .wk-border-glow { animation: wk-border-glow 3s ease-in-out infinite; }
        ::-webkit-scrollbar{ width:0; }
        .wk-hover-gold:hover { color: ${GA} !important; }
        .wk-card-hover { transition: transform 0.3s, box-shadow 0.3s; }
        .wk-card-hover:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 32px 80px rgba(0,0,0,0.3) !important; }
        .wk-img-zoom img { transition: transform 0.5s ease; }
        .wk-img-zoom:hover img { transform: scale(1.05); }
      `}</style>

      {/* ── Ambient orbs (dark only) ── */}
      {dark && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div className="wkg" style={{ position: "absolute", top: "-15%", right: "-5%", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 65%)`, filter: "blur(80px)" }} />
          <div className="wkg" style={{ position: "absolute", bottom: "5%", left: "-10%", width: 800, height: 800, borderRadius: "50%", background: `radial-gradient(circle, rgba(79,142,247,0.13) 0%, transparent 65%)`, filter: "blur(100px)", animationDelay: "2s" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
        </div>
      )}
      {/* Light mode subtle pattern */}
      {!dark && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "radial-gradient(circle, rgba(139,101,20,0.08) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
      )}

      <PublicNav current="/" />

      {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, padding: "72px 24px 0", overflow: "hidden" }}>
        {/* Ambient glow orbs */}
        <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 800, height: 500, borderRadius: "50%", background: `radial-gradient(ellipse, ${GA}22 0%, transparent 65%)`, filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 200, right: -100, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(ellipse, ${GA}18 0%, transparent 65%)`, filter: "blur(60px)", pointerEvents: "none" }} />
        {/* Urdu calligraphy watermarks */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", userSelect: "none", overflow: "hidden", zIndex: 0 }}>
          <div className="wk-urdu1" style={{ position: "absolute", top: "8%", right: "-2%", fontSize: "clamp(60px,9vw,130px)", fontFamily: "'Noto Nastaliq Urdu', serif", fontWeight: 700, color: WMK, lineHeight: 1, direction: "rtl" }}>وکالت</div>
          <div className="wk-urdu2" style={{ position: "absolute", top: "45%", left: "-2%", fontSize: "clamp(50px,7vw,100px)", fontFamily: "'Noto Nastaliq Urdu', serif", fontWeight: 700, color: WMK, lineHeight: 1, direction: "rtl" }}>عدالت</div>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 99, border: `1px solid ${GA}35`, background: `${GA}0E`, marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399" }} />
            <span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: "0.08em" }}>Pakistan's First AI Legal Intelligence Platform</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: "clamp(44px,6.5vw,88px)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.05em", marginBottom: 24, color: TX }}>
            AI-Powered Legal<br />
            <span style={dark
              ? { background: `linear-gradient(135deg, ${GA} 0%, ${G} 60%, ${G} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }
              : { color: "#7C3AED" }}>
              Intelligence
            </span>{" "}for Pakistan
          </h1>

          {/* Subtext */}
          <p style={{ fontSize: 18, color: TX2, lineHeight: 1.75, maxWidth: 580, margin: "0 auto 40px" }}>
            Predict court outcomes, research 15M+ cases, draft documents and collaborate — all in one platform built for Pakistan's legal professionals.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 56 }}>
            <button onClick={() => navigate('/register')} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `linear-gradient(135deg,${GA},${GA}CC)`, color: "#fff", fontSize: 15, fontWeight: 700, padding: "14px 32px", borderRadius: 10, border: "none", cursor: "pointer", boxShadow: `0 8px 32px ${GA}40`, letterSpacing: "-0.01em" }}>
              Start Free Trial <ArrowRight size={15} />
            </button>
            <button onClick={() => navigate('/dashboard')} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, color: TX2, background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${BD}`, padding: "14px 28px", borderRadius: 10, cursor: "pointer", letterSpacing: "-0.01em" }}>
              View Live Demo
            </button>
          </div>

          {/* Social proof */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 56 }}>
            <div style={{ display: "flex" }}>
              {["SC","AK","FM","SH","LW"].map((i,idx) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${[GA,G,"#34D399","#60A5FA","#F87171"][idx]},${[GA,G,"#34D399","#60A5FA","#F87171"][idx]}CC)`, border: `2px solid ${BG}`, marginLeft: idx>0?-8:0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>{i}</div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: TX2 }}>
              <span style={{ fontWeight: 700, color: TX }}>2,400+</span> lawyers trust WukaLAW
            </div>
            <div style={{ display: "flex", gap: 2 }}>
              {[1,2,3,4,5].map(s => <div key={s} style={{ width: 12, height: 12, fontSize: 11 }}>⭐</div>)}
            </div>
            <div style={{ fontSize: 13, color: TX2 }}><span style={{ fontWeight: 700, color: TX }}>4.9</span>/5</div>
          </div>
        </div>

        {/* ── Full-width Dashboard Mockup ── */}
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <div className="wkf" style={{ position: "relative" }}>
            {/* Glow under mockup */}
            <div style={{ position: "absolute", bottom: -60, left: "50%", transform: "translateX(-50%)", width: "70%", height: 120, background: `radial-gradient(ellipse, ${GA}40 0%, transparent 70%)`, filter: "blur(40px)" }} />
            {/* Browser chrome */}
            <div style={{ borderRadius: "16px 16px 0 0", border: `1px solid ${BD}`, borderBottom: "none", background: dark ? "#0F1521" : "#FFFFFF", overflow: "hidden", boxShadow: dark ? `0 -8px 80px rgba(0,0,0,0.8), 0 0 100px ${GA}20` : `0 -8px 60px rgba(0,0,0,0.1)` }}>
              {/* Browser top bar */}
              <div style={{ height: 36, background: dark ? "#131C2E" : "#F4F4F4", borderBottom: `1px solid ${BD}`, display: "flex", alignItems: "center", padding: "0 14px", gap: 8 }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {["#F87171","#FBBF24","#34D399"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                </div>
                <div style={{ flex: 1, margin: "0 16px", background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)", borderRadius: 5, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 10, color: TX2 }}>app.wukalaw.ai/dashboard</span>
                </div>
              </div>
              {/* Dashboard content preview */}
              <div style={{ display: "flex", height: 480, overflow: "hidden" }}>
                {/* Mini sidebar */}
                <div style={{ width: 56, background: dark ? "#050810" : "#EDE8DF", borderRight: `1px solid ${BD}`, padding: "16px 8px", display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: GA, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                    <Scale size={16} color={dark ? "#0D1117" : "#FFFFFF"} />
                  </div>
                  {[LayoutDashboard,Briefcase,Layers,Brain,MessageSquare,BarChart2,Bell].map((Icon, i) => (
                    <div key={i} style={{ width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: i===0?`${GA}20`:"transparent", margin: "0 auto" }}>
                      <Icon size={15} color={i===0?GA:"#8892A4"} />
                    </div>
                  ))}
                </div>
                {/* Main content */}
                <div style={{ flex: 1, padding: "20px 20px", overflow: "hidden" }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    {[["Active Cases","34",G],["Win Rate","82%",GA],["Hearings","3","#34D399"],["Revenue","PKR 4.2M","#60A5FA"]].map(([l,v,c])=>(
                      <div key={String(l)} style={{ flex:1, background: dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.04)", border:`1px solid ${BD}`, borderRadius:10, padding:"12px 14px" }}>
                        <div style={{ fontSize:9, color:"#8892A4", marginBottom:4 }}>{l}</div>
                        <div style={{ fontSize:18, fontWeight:800, color:c as string, letterSpacing:"-0.03em" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:12 }}>
                    <div style={{ background: dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)", border:`1px solid ${BD}`, borderRadius:10, padding:14, height:240 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:TX, marginBottom:10 }}>Case Analytics</div>
                      <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:160 }}>
                        {AREA_DATA.slice(0,8).map((d,i)=>(
                          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", gap:2, alignItems:"center", height:"100%", justifyContent:"flex-end" }}>
                            <div style={{ width:"100%", background:`${GA}90`, borderRadius:"3px 3px 0 0", height:`${(d.filed/91)*100}%`, minHeight:4 }} />
                            <div style={{ fontSize:7, color:"#8892A4" }}>{d.month.slice(0,1)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {CASES.slice(0,4).map((c,i)=>(
                        <div key={i} style={{ background: dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)", border:`1px solid ${BD}`, borderRadius:8, padding:"8px 10px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <div>
                            <div style={{ fontSize:9, fontWeight:600, color:TX, maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title}</div>
                            <div style={{ fontSize:8, color:"#8892A4", marginTop:2 }}>{c.type}</div>
                          </div>
                          <div style={{ fontSize:11, fontWeight:800, color:c.prediction>75?G:GA }}>{c.prediction}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}`, background: dark?"rgba(15,21,33,0.6)":"rgba(237,232,223,0.6)", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
          {[["94.2%","Court prediction accuracy"],["200K+","Cases in training data"],["15M+","Legal precedents searchable"],["2,400+","Lawyers on platform"]].map(([v,l],i)=>(
            <div key={v} style={{ textAlign:"center", borderRight: i<3?`1px solid ${BD}`:"none", padding:"0 24px" }}>
              <div style={{ fontSize:"clamp(28px,3.5vw,44px)", fontWeight:900, letterSpacing:"-0.04em", marginBottom:6, background: dark?`linear-gradient(135deg,${G},${GA})`:`linear-gradient(135deg,#8B5E0A,${GA})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{v}</div>
              <div style={{ fontSize:13, color:TX2 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TRUSTED BY ═══════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, padding: "48px 0", overflow: "hidden", background: dark?"rgba(15,21,33,0.5)":"rgba(237,232,223,0.5)" }}>
        <div style={{ marginBottom: 20, textAlign: "center", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: TX2, fontWeight: 700, opacity: 0.6 }}>
          Trusted by Pakistan's premier law firms
        </div>
        <div style={{ overflow: "hidden", maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)" }}>
          <div className="wkm" style={{ display: "flex", gap: 64, flexShrink: 0, whiteSpace: "nowrap" }}>
            {(["Cornelius Lane & Mufti","Orr Dignam & Co.","Surridge & Beecheno","Mohsin Tayebaly & Co.","RIAA Barker Gillette","Rizvi Isa Afridi & Angell","Hassan & Hassan","Khilji & Co.","Axis Law Chambers","Ibrahim & Ibrahim","A.K. Brohi & Co.","Bhandari Naqvi Riaz"]).concat(
             ["Cornelius Lane & Mufti","Orr Dignam & Co.","Surridge & Beecheno","Mohsin Tayebaly & Co.","RIAA Barker Gillette","Rizvi Isa Afridi & Angell","Hassan & Hassan","Khilji & Co.","Axis Law Chambers","Ibrahim & Ibrahim","A.K. Brohi & Co.","Bhandari Naqvi Riaz"]
            ).map((firm,i) => (
              <div key={i} style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
                <Scale size={11} color={GA} opacity={0.5} />
                <span style={{ fontSize:13.5, fontWeight:600, color:TX2, opacity:0.55 }}>{firm}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION: AI Prediction — text left, mockup right ══════════════════ */}
      <section style={{ position: "relative", zIndex: 1, padding: "120px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 80, alignItems: "center" }}>
          {/* Text */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, border: `1px solid ${GA}40`, backgroundColor: `${GA}12`, marginBottom: 28 }}>
              <Brain size={12} color={GA} />
              <span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: "0.06em" }}>AI COURT PREDICTION</span>
            </div>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 50px)", fontWeight: 800, color: TX, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 20 }}>
              Know the verdict<br />before you enter court.
            </h2>
            <p style={{ fontSize: 15, color: TX2, lineHeight: 1.75, marginBottom: 36, maxWidth: 380 }}>
              AI trained on Pakistan's Supreme Court, High Courts, and district court rulings delivers outcome predictions your clients can trust.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
              {[["Pakistan Supreme Court precedents", "#34D399"], ["Judge behavioral pattern analysis", dark ? "#4F8EF7" : "#3070D0"], ["Evidence strength confidence scoring", GA]].map(([l, c]) => (
                <div key={String(l)} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: `${c}20`, border: `1px solid ${c}50`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
          <div className="wkf" style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: -40, background: `radial-gradient(ellipse at 60% 40%, ${GA}18 0%, transparent 65%)`, filter: "blur(50px)" }} />
            <BrowserWindow url="app.wukalaw.ai/prediction" style={{ position: "relative", boxShadow: dark ? `0 40px 100px rgba(0,0,0,0.7), 0 0 60px ${GA}15` : `0 40px 80px rgba(100,70,0,0.15)` }}>
              <div style={{ padding: 28, backgroundColor: dark ? undefined : "#FAFAF6" }}>
                <div style={{ display: "flex", gap: 24, marginBottom: 28 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 10px" }}>
                      <svg viewBox="0 0 100 100" style={{ width: "100%", transform: "rotate(-90deg)" }}>
                        <circle cx="50" cy="50" r="40" fill="none" stroke={dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"} strokeWidth="9" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke={GA} strokeWidth="9" strokeDasharray="206 251" strokeLinecap="round" />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: TX }}>82%</div>
                        <div style={{ fontSize: 10, color: TX2 }}>win</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "#34D399", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontWeight: 700 }}><ArrowUpRight size={12} /> +6% this week</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: TX, marginBottom: 12 }}>Outcome Scenarios</div>
                    {[["Full Win + Damages", 48, "#34D399"], ["Partial Win", 34, GA], ["Settlement", 12, dark ? "#4F8EF7" : "#3070D0"], ["Adverse", 6, "#F87171"]].map(([l, v, c]) => (
                      <div key={String(l)} style={{ marginBottom: 9 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: TX2 }}>{l}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: String(c) }}>{v}%</span>
                        </div>
                        <div style={{ height: 4, backgroundColor: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", borderRadius: 4 }}>
                          <div style={{ height: "100%", width: `${Number(v) * 1.6}%`, backgroundColor: String(c), borderRadius: 4 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Image strip — gavel */}
                <div style={{ borderRadius: 12, overflow: "hidden", height: 100, position: "relative" }}>
                  <img src="https://images.unsplash.com/photo-1618771623063-6c3faa854a61?w=900&h=550&fit=crop&auto=format" alt="Judge's gavel and law book" style={{ width: "100%", height: "100%", objectFit: "cover", filter: dark ? "brightness(0.7)" : "brightness(1)" }} />
                  <div style={{ position: "absolute", inset: 0, background: dark ? "linear-gradient(90deg, rgba(13,17,23,0.8), transparent)" : "linear-gradient(90deg, rgba(255,255,255,0.7), transparent)", display: "flex", alignItems: "center", padding: "0 16px" }}>
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

      {/* ══ SECTION: Legal Library image + AI overlay ═════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 120px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ position: "relative", borderRadius: 28, overflow: "hidden", boxShadow: dark ? "0 40px 100px rgba(0,0,0,0.8)" : "0 40px 80px rgba(100,70,0,0.18)" }}>
            <img src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1100&h=600&fit=crop&auto=format" alt="Legal library with law books" style={{ width: "100%", height: 480, objectFit: "cover", display: "block", filter: dark ? "brightness(0.4)" : "brightness(0.65)" }} />
            {/* Overlay gradient */}
            <div style={{ position: "absolute", inset: 0, background: dark ? `linear-gradient(135deg, rgba(13,17,23,0.85) 0%, rgba(13,17,23,0.4) 60%, transparent 100%)` : `linear-gradient(135deg, rgba(248,244,236,0.9) 0%, rgba(248,244,236,0.5) 50%, transparent 100%)` }} />
            {/* Content */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 72px" }}>
              <div style={{ maxWidth: 520 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, border: `1px solid ${GA}40`, backgroundColor: `${GA}15`, marginBottom: 24 }}>
                  <BookOpen size={12} color={GA} />
                  <span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: "0.06em" }}>50,000+ LEGAL PRECEDENTS</span>
                </div>
                <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: TX, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 20 }}>
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
            {/* Floating search result card */}
            <div style={{ position: "absolute", right: 48, top: "50%", transform: "translateY(-50%)", width: 300 }}>
              <div style={{ borderRadius: 16, overflow: "hidden", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", backgroundColor: dark ? "rgba(22,27,34,0.92)" : "rgba(255,255,255,0.92)", border: `1px solid ${BD}`, boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
                <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BD}`, display: "flex", alignItems: "center", gap: 8 }}>
                  <Search size={12} color={GA} />
                  <span style={{ fontSize: 11, color: TX2 }}>patent infringement prior art...</span>
                </div>
                {[{ title: "PLD 2022 SC 445", sim: "91%", c: "#34D399" }, { title: "2019 SCMR 1834", sim: "84%", c: GA }, { title: "PLD 2018 Lah 203", sim: "79%", c: dark ? "#4F8EF7" : "#3070D0" }].map(r => (
                  <div key={r.title} style={{ padding: "12px 16px", borderBottom: `1px solid ${BD}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: TX }}>{r.title}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: r.c }}>{r.sim}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTION: Full workspace mockup ════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 120px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, border: `1px solid ${dark ? "#4F8EF7" : "#3070D0"}40`, backgroundColor: dark ? "rgba(79,142,247,0.1)" : "rgba(48,112,208,0.08)", marginBottom: 22 }}>
              <Layers size={12} color={dark ? "#4F8EF7" : "#3070D0"} />
              <span style={{ fontSize: 11, color: dark ? "#4F8EF7" : "#3070D0", fontWeight: 700, letterSpacing: "0.06em" }}>CASE WORKSPACE</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: TX, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
              Every dimension of a case,<br />in one command center.
            </h2>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, background: dark ? `radial-gradient(ellipse at 50% 0%, rgba(79,142,247,0.15) 0%, transparent 60%)` : `radial-gradient(ellipse at 50% 0%, ${GA}10 0%, transparent 60%)`, filter: "blur(60px)", zIndex: 0 }} />
            <BrowserWindow url="app.wukalaw.ai/workspace/WL-2024-003" style={{ position: "relative", zIndex: 1, boxShadow: dark ? `0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)` : `0 40px 80px rgba(100,70,0,0.18)` }}>
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 240px", height: 420, backgroundColor: dark ? undefined : "#FAFAF6" }}>
                {/* Left */}
                <div style={{ borderRight: `1px solid ${BD}`, padding: "14px 10px" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: TX2, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, paddingLeft: 8, opacity: 0.6 }}>Cases</div>
                  {CASES.map((c, i) => (
                    <div key={c.id} style={{ padding: "8px 8px", borderRadius: 9, marginBottom: 2, backgroundColor: i === 2 ? `${GA}14` : "transparent", border: `1px solid ${i === 2 ? `${GA}30` : "transparent"}`, cursor: "pointer" }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: i === 2 ? TX : TX2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                      <div style={{ fontSize: 9, color: i === 2 ? GA : TX2, marginTop: 2, opacity: i === 2 ? 1 : 0.6 }}>{c.id}</div>
                    </div>
                  ))}
                </div>
                {/* Center */}
                <div style={{ borderRight: `1px solid ${BD}`, padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: TX }}>DataTech LLC IP Dispute</div>
                      <div style={{ fontSize: 11, color: TX2, marginTop: 3 }}>WL-2024-003 · Patent · Supreme Court</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 9, color: TX2 }}>Win Probability</div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: GA }}>82%</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                    {["Overview", "AI Summary", "Prediction", "Strategy"].map((t, i) => (
                      <div key={t} style={{ padding: "4px 9px", borderRadius: 6, fontSize: 10, fontWeight: 600, backgroundColor: i === 2 ? GA : dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)", color: i === 2 ? (dark ? "#0D1117" : "#fff") : TX2, cursor: "pointer" }}>{t}</div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                    {[["Evidence Strength", 85, "#34D399"], ["Precedent Match", 72, dark ? "#4F8EF7" : "#3070D0"], ["Judge Alignment", 68, "#A78BFA"], ["Documentation", 94, "#34D399"]].map(([l, v, c]) => (
                      <div key={String(l)} style={{ padding: "10px 12px", borderRadius: 10, backgroundColor: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)", border: `1px solid ${BD}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 10, color: TX2 }}>{l}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: String(c) }}>{v}%</span>
                        </div>
                        <div style={{ height: 3, backgroundColor: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)", borderRadius: 3 }}>
                          <div style={{ height: "100%", width: `${v}%`, backgroundColor: String(c), borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "10px 14px", borderRadius: 10, backgroundColor: `${GA}10`, border: `1px solid ${GA}30`, fontSize: 10, color: TX2, lineHeight: 1.5 }}>
                    <span style={{ color: GA, fontWeight: 700 }}>AI: </span>File Daubert motion to limit opposing expert. Lead with functional novelty — avoid Alice challenge.
                  </div>
                </div>
                {/* Right — chat */}
                <div style={{ display: "flex", flexDirection: "column", padding: "14px 12px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: GA, marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}><Sparkles size={10} />AI Assistant</div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, overflowY: "hidden" }}>
                    <div style={{ padding: "8px 10px", borderRadius: 10, backgroundColor: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${BD}`, fontSize: 10, color: TX2, lineHeight: 1.5 }}>
                      Win probability <strong style={{ color: GA }}>82%</strong> after expert report filed. Judge Wells has ruled against SW patents 3/7 times.
                    </div>
                    <div style={{ padding: "8px 10px", borderRadius: 10, backgroundColor: `${GA}18`, border: `1px solid ${GA}35`, fontSize: 10, color: TX, lineHeight: 1.5 }}>
                      Draft Daubert motion outline.
                    </div>
                    <div style={{ padding: "8px 10px", borderRadius: 10, backgroundColor: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${BD}`, fontSize: 10, color: TX2, lineHeight: 1.5 }}>
                      Drafting motion... limiting Dr. Kovacs to compression algorithm scope only... <span style={{ color: GA }}>●●●</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                    <div style={{ flex: 1, height: 28, borderRadius: 8, backgroundColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)", border: `1px solid ${BD}` }} />
                    <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: GA, display: "flex", alignItems: "center", justifyContent: "center" }}><Send size={10} color={dark ? "#0D1117" : "#fff"} /></div>
                  </div>
                </div>
              </div>
            </BrowserWindow>
          </div>
        </div>
      </section>

      {/* ══ TEAM SECTION ═══════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 120px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 80, alignItems: "start" }}>
            {/* Left text */}
            <div style={{ paddingTop: 20 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, border: `1px solid ${GA}40`, backgroundColor: `${GA}12`, marginBottom: 28 }}>
                <Users size={12} color={GA} />
                <span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: "0.06em" }}>OUR LEGAL EXPERTS</span>
              </div>
              <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 800, color: TX, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 24 }}>
                Powerful success,<br />driven by strategy<br />&amp; experience.
              </h2>
              <p style={{ fontSize: 15, color: TX2, lineHeight: 1.75, marginBottom: 36 }}>
                Our senior advocates have appeared before Pakistan's Supreme Court, Federal Shariat Court, and all four High Courts.
              </p>
              <button onClick={() => navigate('/find-lawyer')} style={btnPrimary}>
                Schedule Consultation <ArrowRight size={14} />
              </button>
            </div>

            {/* Right — attorney photo grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[
                { name: "Barrister Ahmad Raza", role: "Managing Partner", spec: "Constitutional Law", img: "https://images.unsplash.com/photo-1642522029686-5485ea7e6042?w=400&h=500&fit=crop&auto=format", cases: 340, rating: 4.9, years: 18 },
                { name: "Adv. Zara Sheikh", role: "Senior Partner", spec: "Corporate & IP", img: "https://images.unsplash.com/photo-1758518727888-ffa196002e59?w=400&h=500&fit=crop&auto=format", cases: 210, rating: 4.8, years: 12 },
                { name: "Omar Malik SC", role: "Senior Counsel", spec: "Criminal Defence", img: "https://images.unsplash.com/photo-1771244678811-50c22f17c791?w=400&h=500&fit=crop&auto=format", cases: 155, rating: 4.7, years: 15 },
              ].map((a) => (
                <div key={a.name} style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${BD}`, marginTop: a.spec === "Corporate & IP" ? 32 : 0, backgroundColor: dark ? "#1E2530" : "#FFFFFF", boxShadow: dark ? "0 20px 60px rgba(0,0,0,0.5)" : "0 20px 40px rgba(100,70,0,0.12)", cursor: "pointer", transition: "transform 0.3s, box-shadow 0.3s", position: "relative" }}
                  onClick={() => navigate('/lawyer-profile')}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}>
                  {/* Gold top stripe */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: GA, zIndex: 2 }} />
                  {/* Portrait photo — takes up most of card */}
                  <div style={{ height: 280, overflow: "hidden", position: "relative" }}>
                    <img src={a.img} alt={a.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block", transition: "transform 0.4s" }} />
                    {/* Subtle gradient at bottom of photo */}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: dark ? "linear-gradient(to top, #1E2530, transparent)" : "linear-gradient(to top, #FFFFFF, transparent)" }} />
                  </div>
                  {/* Info area below photo */}
                  <div style={{ padding: "16px 20px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: TX }}>{a.name}</span>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "#34D399", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0D1117" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: GA, fontWeight: 600, marginBottom: 2 }}>{a.role}</div>
                    <div style={{ fontSize: 12, color: TX2, marginBottom: 14 }}>{a.spec}</div>
                    {/* Stats row */}
                    <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={TX2} strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        <span style={{ fontSize: 12, color: TX2 }}>{a.cases}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill={GA} stroke={GA} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        <span style={{ fontSize: 12, color: TX2 }}>{a.rating}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={TX2} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <span style={{ fontSize: 12, color: TX2 }}>{a.years}y</span>
                      </div>
                    </div>
                    {/* View profile button */}
                    <button onClick={() => navigate('/lawyer-profile')} style={{ width: "100%", padding: "10px", borderRadius: 10, backgroundColor: `${GA}15`, color: GA, fontSize: 13, fontWeight: 700, border: `1px solid ${GA}35`, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                      View Profile →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ═══════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}`, backgroundColor: dark ? "rgba(22,27,34,0.6)" : "rgba(237,232,216,0.7)", padding: "80px 24px", overflow: "hidden" }}>
        {/* Urdu background words in stats section */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", userSelect: "none", overflow: "hidden", zIndex: 0 }}>
          <div className="wk-urdu2" style={{ position: "absolute", bottom: "-20%", left: "50%", transform: "translateX(-50%)", fontSize: "clamp(100px, 20vw, 240px)", fontFamily: "'Noto Nastaliq Urdu', serif", fontWeight: 700, color: WMK, lineHeight: 1, direction: "rtl", whiteSpace: "nowrap" }}>
            قانون
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, position: "relative", zIndex: 1 }}>
          {[
            { value: "94.2%", label: "AI Prediction Accuracy", sub: "Verified by 50K+ cases" },
            { value: "30+", label: "Years Combined Expertise", sub: "Supreme & High Courts" },
            { value: "12K+", label: "Legal Matters Resolved", sub: "Across Pakistan" },
            { value: "95%", label: "Client Approval Rate", sub: "Post-case surveys" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center", padding: "20px" }}>
              <div style={dark
                ? { fontSize: 48, fontWeight: 900, letterSpacing: "-0.05em", backgroundImage: `linear-gradient(135deg, #D4AF37, #F0D060)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 8 }
                : { fontSize: 48, fontWeight: 900, letterSpacing: "-0.05em", color: "#7A5510", marginBottom: 8 }}>{s.value}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: TX, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: TX2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, padding: "120px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 800, color: TX, letterSpacing: "-0.03em" }}>
              Pakistan's top attorneys trust WukaLAW.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {[
              { name: "Justice (R) Fakhruddin", role: "Former Supreme Court Judge, Karachi", text: "The AI prediction model's accuracy on constitutional matters is exceptional. WukaLAW represents the future of Pakistani legal practice.", avatar: "FG", color: GA },
              { name: "Barrister Ayesha Mirza", role: "Managing Partner, Mirza Law Associates", text: "As a woman in Pakistani law, having AI-backed data on judicial patterns has transformed how we prepare our cases before the High Court.", avatar: "AM", color: dark ? "#4F8EF7" : "#3070D0" },
              { name: "Advocate Tariq Hussain", role: "Senior Counsel, Lahore Bar", text: "The similar case search found a Lahore High Court ruling from 2019 that our opponent had no idea about. That precedent won us the case.", avatar: "TH", color: "#A78BFA" },
            ].map(t => (
              <div key={t.name} className="wk-card-hover" style={{ padding: "32px", borderRadius: 24, backgroundColor: dark ? CARDBG : "#FFFFFF", border: `1px solid ${BD}`, boxShadow: dark ? "0 20px 60px rgba(0,0,0,0.3)" : "0 20px 40px rgba(100,70,0,0.08)" }}>
                <div style={{ display: "flex", gap: 2, marginBottom: 20 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={13} fill={GA} color={GA} />)}
                </div>
                <p style={{ fontSize: 14, color: TX2, lineHeight: 1.75, marginBottom: 28, fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: dark ? "#0D1117" : "#FFFFFF", backgroundColor: t.color, flexShrink: 0 }}>{t.avatar}</div>
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

      {/* ══ CTA with image background ════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 120px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ position: "relative", borderRadius: 32, overflow: "hidden", minHeight: 420, display: "flex", alignItems: "center" }}>
            <img src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1100&h=600&fit=crop&auto=format" alt="Legal library" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.3) saturate(0.7)" }} />
            <div style={{ position: "absolute", inset: 0, background: dark ? `linear-gradient(135deg, rgba(13,17,23,0.92), rgba(13,17,23,0.6))` : `linear-gradient(135deg, rgba(26,16,5,0.9), rgba(26,16,5,0.6))` }} />
            {/* Gold vignette */}
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 80% 50%, ${GA}20 0%, transparent 60%)` }} />
            {/* Ring decorations */}
            <div style={{ position: "absolute", right: -100, top: "50%", transform: "translateY(-50%)", width: 500, height: 500, borderRadius: "50%", border: `1px solid ${GA}20`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", right: -60, top: "50%", transform: "translateY(-50%)", width: 350, height: 350, borderRadius: "50%", border: `1px solid ${GA}30`, pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 1, padding: "64px 72px", maxWidth: 600 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 999, backgroundColor: `${GA}20`, marginBottom: 28 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#34D399" }} />
                <span style={{ fontSize: 11, color: "#34D399", fontWeight: 700 }}>Free consultation — No obligation</span>
              </div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.04em", lineHeight: 1.08, marginBottom: 20 }}>
                Your legal partner<br />in every situation.
              </h2>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", marginBottom: 44, lineHeight: 1.7 }}>
                From Karachi to Islamabad — let Pakistan's most advanced AI legal platform work for you.
              </p>
              <div style={{ display: "flex", gap: 16 }}>
                <button onClick={() => navigate('/find-lawyer')} style={{ ...btnPrimary, boxShadow: `0 0 60px ${GA}60` }}>
                  Book Free Consultation <ArrowRight size={15} />
                </button>
                <button onClick={() => navigate('/login')} style={{ ...btnSecondary, color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  Access Platform
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Interactive Product Demo ══════════════════════════════════════════ */}
      <LandingProductDemo dark={dark} />

      {/* ══ AI Features Grid ══════════════════════════════════════════════════ */}
      <LandingAIFeaturesGrid dark={dark} />

      {/* ══ Security & Privacy ════════════════════════════════════════════════ */}
      <LandingSecuritySection dark={dark} />

      {/* ══ Integrations ══════════════════════════════════════════════════════ */}
      <LandingIntegrations dark={dark} />

      {/* ══ Pricing ═══════════════════════════════════════════════════════════ */}
      <LandingPricingSection dark={dark} navigate={navigate} />

      {/* ══ FAQ ═══════════════════════════════════════════════════════════════ */}
      <LandingFAQ dark={dark} />

      <PublicFooter />
    </div>
  );
}


// ─── Landing sub-sections (used only by Landing) ──────────────────────────

export function LandingProductDemo({ dark }: { dark: boolean }) {
  const [activeTab, setActiveTab] = useState(0);
  const TX = dark ? "#FFFFFF" : "#1A1005";
  const TX2 = dark ? "#B3B3B3" : "#6B5533";
  const GA = dark ? "#D4AF37" : "#8B6514";
  const BD = dark ? "rgba(255,255,255,0.07)" : "rgba(60,30,0,0.09)";

  const tabs = [
    {
      label: "AI Prediction",
      icon: <Brain size={15} />,
      color: GA,
      content: (
        <div style={{ padding: 24, fontFamily: "Inter, sans-serif" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Brain size={16} color={GA} />
            <span style={{ fontSize: 14, fontWeight: 700, color: TX }}>AI Court Prediction — DataTech LLC v. NovaTech</span>
            <span style={{ marginLeft: "auto", fontSize: 11, padding: "3px 10px", borderRadius: 999, backgroundColor: `${GA}20`, color: GA, fontWeight: 700 }}>94.2% Accuracy</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div style={{ borderRadius: 12, padding: 20, backgroundColor: dark ? "rgba(212,175,55,0.08)" : "rgba(139,101,20,0.06)", border: `1px solid ${GA}25`, textAlign: "center" as const }}>
              <div style={{ fontSize: 56, fontWeight: 900, color: GA, lineHeight: 1, letterSpacing: "-0.04em", textShadow: `0 0 40px ${GA}60` }}>82%</div>
              <div style={{ fontSize: 12, color: TX2, marginTop: 8 }}>Win Probability</div>
              <div style={{ fontSize: 11, color: "#34D399", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><ArrowUpRight size={11} /> +6% this week</div>
            </div>
            <div style={{ borderRadius: 12, padding: 16, backgroundColor: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px solid ${BD}` }}>
              {[["Evidence Strength", 85, "#34D399"], ["Precedent Match", 72, "#4F8EF7"], ["Judge Alignment", 68, "#A78BFA"]].map(([l, v, c]) => (
                <div key={String(l)} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: TX2 }}>{l}</span>
                    <span style={{ color: String(c), fontWeight: 700 }}>{v}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 4, backgroundColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
                    <div style={{ height: "100%", width: `${v}%`, borderRadius: 4, backgroundColor: String(c) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderRadius: 10, padding: "12px 16px", backgroundColor: dark ? "rgba(52,211,153,0.08)" : "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", fontSize: 12, color: "#34D399" }}>
            <Sparkles size={12} style={{ display: "inline", marginRight: 6 }} />
            AI recommends leading with functional novelty argument for maximum impact.
          </div>
        </div>
      )
    },
    {
      label: "Case Workspace",
      icon: <Layers size={15} />,
      color: "#4F8EF7",
      content: (
        <div style={{ padding: 24, fontFamily: "Inter, sans-serif" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Layers size={16} color="#4F8EF7" />
            <span style={{ fontSize: 14, fontWeight: 700, color: TX }}>3-Panel Command Center</span>
            <span style={{ marginLeft: "auto", fontSize: 11, padding: "3px 10px", borderRadius: 999, backgroundColor: "rgba(79,142,247,0.15)", color: "#4F8EF7", fontWeight: 700 }}>Live</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 140px", gap: 10, height: 200, overflow: "hidden" }}>
            {[
              { label: "Cases", items: ["DataTech LLC", "Johnson v. MegaCorp", "Rivera Securities", "Estate of Williams"] },
            ].map(panel => (
              <div key={panel.label} style={{ borderRadius: 10, border: `1px solid ${BD}`, backgroundColor: dark ? "rgba(13,17,23,0.8)" : "rgba(237,232,216,0.5)", padding: 10, overflow: "hidden" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: TX2, marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>CASES</div>
                {panel.items.map((item, i) => (
                  <div key={item} style={{ padding: "6px 8px", borderRadius: 7, marginBottom: 3, backgroundColor: i === 0 ? `${GA}15` : "transparent", fontSize: 11, color: i === 0 ? GA : TX2, fontWeight: i === 0 ? 600 : 400 }}>{item}</div>
                ))}
              </div>
            ))}
            <div style={{ borderRadius: 10, border: `1px solid ${BD}`, backgroundColor: dark ? "rgba(30,37,48,0.6)" : "rgba(255,255,255,0.7)", padding: 14, overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TX, marginBottom: 8 }}>DataTech LLC v. NovaTech</div>
              <div style={{ fontSize: 11, color: TX2, lineHeight: 1.6 }}>Patent infringement case — Northern District of CA. 41 documents. Hearing scheduled March 20, 2024. AI confidence: 82% win probability based on functional novelty precedent...</div>
              <div style={{ marginTop: 12, padding: "8px 10px", borderRadius: 8, backgroundColor: `${GA}12`, border: `1px solid ${GA}25`, fontSize: 11, color: GA }}>
                <Sparkles size={11} style={{ display: "inline", marginRight: 5 }} />AI: File Daubert motion within 5 days
              </div>
            </div>
            <div style={{ borderRadius: 10, border: `1px solid ${BD}`, backgroundColor: dark ? "rgba(13,17,23,0.8)" : "rgba(237,232,216,0.5)", padding: 10, display: "flex", flexDirection: "column" as const, gap: 6, overflow: "hidden" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: TX2, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>AI CHAT</div>
              <div style={{ padding: "7px 9px", borderRadius: 8, backgroundColor: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", fontSize: 11, color: TX2, lineHeight: 1.4 }}>What's our strongest argument?</div>
              <div style={{ padding: "7px 9px", borderRadius: 8, backgroundColor: `${GA}15`, fontSize: 11, color: GA, lineHeight: 1.4 }}>Functional novelty + the 14-day filing window creates decisive precedent...</div>
            </div>
          </div>
        </div>
      )
    },
    {
      label: "Legal Search",
      icon: <GitBranch size={15} />,
      color: "#34D399",
      content: (
        <div style={{ padding: 24, fontFamily: "Inter, sans-serif" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <GitBranch size={16} color="#34D399" />
            <span style={{ fontSize: 14, fontWeight: 700, color: TX }}>Semantic Case Search — 50K+ Precedents</span>
          </div>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TX2 }} />
            <div style={{ width: "100%", padding: "11px 16px 11px 36px", borderRadius: 10, border: `1px solid ${BD}`, backgroundColor: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", fontSize: 13, color: TX, fontFamily: "Inter, sans-serif", boxSizing: "border-box" as const }}>
              software patent functional novelty Pakistan High Court
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {["Supreme Court", "Lahore HC", "All Provinces", "2020–2024"].map(tag => (
              <span key={tag} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, border: `1px solid ${BD}`, color: TX2, backgroundColor: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}>{tag}</span>
            ))}
          </div>
          {[
            { title: "Hafeez & Co. v. National Database Authority", court: "Lahore HC · 2022", match: 94, outcome: "Win" },
            { title: "PakTech Solutions v. FBR (Digital Rights)", court: "Supreme Court · 2021", match: 87, outcome: "Win" },
            { title: "Innovative Systems Ltd. v. PTCL", court: "Islamabad HC · 2023", match: 81, outcome: "Partial" },
          ].map(c => (
            <div key={c.title} style={{ padding: "12px 14px", borderRadius: 10, border: `1px solid ${BD}`, backgroundColor: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: TX, marginBottom: 2 }}>{c.title}</div>
                <div style={{ fontSize: 11, color: TX2 }}>{c.court}</div>
              </div>
              <div style={{ textAlign: "center" as const, flexShrink: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#34D399" }}>{c.match}%</div>
                <div style={{ fontSize: 10, color: TX2 }}>match</div>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      label: "AI Assistant",
      icon: <MessageSquare size={15} />,
      color: "#A78BFA",
      content: (
        <div style={{ padding: 24, fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column" as const, height: "100%", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <MessageSquare size={16} color="#A78BFA" />
            <span style={{ fontSize: 14, fontWeight: 700, color: TX }}>WukaLAW AI Assistant</span>
            <span style={{ marginLeft: "auto", fontSize: 11, padding: "3px 10px", borderRadius: 999, backgroundColor: "rgba(167,139,250,0.15)", color: "#A78BFA", fontWeight: 700 }}>Online</span>
          </div>
          {[
            { role: "user", text: "What's the strongest precedent for our IP case?" },
            { role: "ai", text: "Based on my analysis of 41 case documents and 50K+ Pakistani precedents, I recommend citing Hafeez & Co. v. NDA (Lahore HC, 2022) — 94% similarity. The court upheld software patent novelty based on functional architecture differences, which directly supports your DataTech argument." },
            { role: "user", text: "Should we settle or go to trial?" },
            { role: "ai", text: "With 82% win probability and Judge Malik's favorable record on tech patents (7/9 upheld), I recommend trial. Settlement floor should be PKR 68M if opposing counsel approaches — don't go below." },
          ].map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "85%", padding: "10px 14px", borderRadius: 14, fontSize: 12, lineHeight: 1.6, backgroundColor: m.role === "user" ? "#A78BFA" : dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", color: m.role === "user" ? "#FFFFFF" : TX2, border: m.role === "ai" ? `1px solid ${BD}` : "none" }}>
                {m.role === "ai" && <div style={{ fontSize: 10, fontWeight: 700, color: "#A78BFA", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}><Sparkles size={10} /> WukaLAW AI</div>}
                {m.text}
              </div>
            </div>
          ))}
        </div>
      )
    },
  ];

  return (
    <section style={{ padding: "0 24px 100px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center" as const, marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 999, backgroundColor: `${GA}15`, marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: GA }} />
            <span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: "0.08em" }}>INTERACTIVE DEMO</span>
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16 }}>See WukaLAW in action</h2>
          <p style={{ fontSize: 17, color: TX2, maxWidth: 480, margin: "0 auto" }}>Every feature designed for Pakistan's legal landscape — explore the platform.</p>
        </div>

        {/* Tab Bar */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 32 }}>
          {tabs.map((tab, i) => (
            <button key={tab.label} onClick={() => setActiveTab(i)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, border: `1px solid ${activeTab === i ? tab.color + "50" : BD}`, backgroundColor: activeTab === i ? `${tab.color}15` : "transparent", color: activeTab === i ? tab.color : TX2, fontSize: 14, fontWeight: activeTab === i ? 700 : 400, cursor: "pointer", transition: "all 0.2s", fontFamily: "Inter, sans-serif" }}>
              <span style={{ color: activeTab === i ? tab.color : TX2 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Browser Window */}
        <BrowserWindow url={`wukalaw.pk/${tabs[activeTab].label.toLowerCase().replace(/ /g, "-")}`}>
          {tabs[activeTab].content}
        </BrowserWindow>
      </div>
    </section>
  );
}

export function LandingAIFeaturesGrid({ dark }: { dark: boolean }) {
  const TX = dark ? "#FFFFFF" : "#1A1005";
  const TX2 = dark ? "#B3B3B3" : "#6B5533";
  const GA = dark ? "#D4AF37" : "#8B6514";
  const BD = dark ? "rgba(255,255,255,0.07)" : "rgba(60,30,0,0.09)";
  const CARDBG = dark ? "#1E2530" : "#FFFFFF";

  const features = [
    { icon: <Brain size={20} />, color: GA, bg: `${GA}18`, title: "AI Court Prediction", desc: "94.2% accuracy on Pakistan's courts — Supreme, High, and District." },
    { icon: <Layers size={20} />, color: "#4F8EF7", bg: "rgba(79,142,247,0.15)", title: "Case Workspace", desc: "3-panel command center with AI chat, docs, and evidence in one view." },
    { icon: <GitBranch size={20} />, color: "#34D399", bg: "rgba(52,211,153,0.15)", title: "Similar Case Search", desc: "50K+ precedents with semantic search — find the right case in seconds." },
    { icon: <Clock size={20} />, color: "#A78BFA", bg: "rgba(167,139,250,0.15)", title: "Timeline Intelligence", desc: "AI-generated case chronology — never miss a deadline or event." },
    { icon: <Cpu size={20} />, color: "#FB923C", bg: "rgba(251,146,60,0.15)", title: "Explainable AI", desc: "Transparent reasoning for every prediction — know the 'why' always." },
    { icon: <BarChart2 size={20} />, color: GA, bg: `${GA}18`, title: "Reports & Analytics", desc: "Firm-wide performance dashboards — track win rates, revenue, trends." },
  ];

  return (
    <section style={{ padding: "0 24px 100px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center" as const, marginBottom: 56 }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", marginBottom: 16 }}>Everything your firm needs</h2>
          <p style={{ fontSize: 17, color: TX2, maxWidth: 480, margin: "0 auto" }}>Six AI-powered capabilities built specifically for Pakistani law.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {features.map(f => (
            <div key={f.title}
              style={{ padding: 28, borderRadius: 18, border: `1px solid ${BD}`, backgroundColor: CARDBG, cursor: "default", transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 60px ${f.color}20`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: f.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, color: f.color }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: TX, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: TX2, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingSecuritySection({ dark }: { dark: boolean }) {
  const TX = dark ? "#FFFFFF" : "#1A1005";
  const TX2 = dark ? "#B3B3B3" : "#6B5533";
  const GA = dark ? "#D4AF37" : "#8B6514";
  const BD = dark ? "rgba(255,255,255,0.07)" : "rgba(60,30,0,0.09)";
  const SECTBG = dark ? "rgba(22,27,34,0.6)" : "rgba(237,232,216,0.7)";

  const pillars = [
    { icon: <Shield size={28} />, title: "Bank-Grade Encryption", sub: "AES-256 + TLS 1.3", desc: "Every document and communication encrypted at rest and in transit — same standard as Pakistan's leading banks." },
    { icon: <Lock size={28} />, title: "Zero-Knowledge Architecture", sub: "Your data stays yours", desc: "We never access your case data. Fully isolated per-firm storage with zero cross-contamination guarantees." },
    { icon: <Award size={28} />, title: "ISO 27001 Certified", sub: "Independently audited", desc: "Annual third-party security audits. Full compliance with SECP and Pakistan Data Protection Act guidelines." },
  ];

  return (
    <section style={{ padding: "0 24px 100px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ borderRadius: 24, padding: "64px 72px", backgroundColor: SECTBG, border: `1px solid ${BD}` }}>
          <div style={{ textAlign: "center" as const, marginBottom: 52 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: 999, backgroundColor: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", marginBottom: 24 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#34D399" }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#34D399" }}>Your Data Never Trains Our Model</span>
            </div>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 42px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", marginBottom: 14 }}>Security you can trust with client confidences</h2>
            <p style={{ fontSize: 16, color: TX2, maxWidth: 520, margin: "0 auto" }}>Built from the ground up for the strict confidentiality demands of legal practice.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {pillars.map(p => (
              <div key={p.title} style={{ textAlign: "center" as const, padding: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: GA }}>{p.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: TX, marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: GA, marginBottom: 10, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{p.sub}</div>
                <div style={{ fontSize: 14, color: TX2, lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingIntegrations({ dark }: { dark: boolean }) {
  const TX = dark ? "#FFFFFF" : "#1A1005";
  const TX2 = dark ? "#B3B3B3" : "#6B5533";
  const GA = dark ? "#D4AF37" : "#8B6514";
  const BD = dark ? "rgba(255,255,255,0.07)" : "rgba(60,30,0,0.09)";
  const CARDBG = dark ? "#1E2530" : "#FFFFFF";

  const integrations = [
    "Microsoft 365", "Google Workspace", "Dropbox", "DocuSign",
    "Clio", "LexisNexis", "Thomson Reuters", "Slack",
  ];

  return (
    <section style={{ padding: "0 24px 100px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" as const }}>
        <h2 style={{ fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", marginBottom: 12 }}>Works with your existing stack</h2>
        <p style={{ fontSize: 16, color: TX2, marginBottom: 48 }}>Connect the tools your firm already uses — zero friction, instant sync.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {integrations.map(name => (
            <div key={name} style={{ padding: "20px 16px", borderRadius: 14, border: `1px solid ${BD}`, backgroundColor: CARDBG, fontSize: 14, fontWeight: 600, color: TX2, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "border-color 0.2s, color 0.2s", cursor: "default" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${GA}50`; (e.currentTarget as HTMLDivElement).style.color = TX; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = BD; (e.currentTarget as HTMLDivElement).style.color = TX2; }}>
              <Globe size={15} style={{ color: GA, flexShrink: 0 }} />
              {name}
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: TX2, marginTop: 28 }}>+ API access for custom integrations · Webhook support · Zapier compatible</p>
      </div>
    </section>
  );
}

export function LandingPricingSection({ dark, navigate }: { dark: boolean; navigate: (path: string) => void }) {
  const TX = dark ? "#FFFFFF" : "#1A1005";
  const TX2 = dark ? "#B3B3B3" : "#6B5533";
  const GA = dark ? "#D4AF37" : "#8B6514";
  const BD = dark ? "rgba(255,255,255,0.07)" : "rgba(60,30,0,0.09)";
  const CARDBG = dark ? "#1E2530" : "#FFFFFF";

  const tiers = [
    {
      name: "Advocate",
      price: "PKR 5,000",
      period: "/mo",
      desc: "Solo practitioners",
      recommended: false,
      features: ["5 active cases", "AI court prediction", "Case workspace", "Email support", "Basic analytics"],
      cta: "Start Free Trial",
      ctaStyle: { backgroundColor: "transparent", color: GA, border: `1px solid ${GA}60` },
    },
    {
      name: "Firm",
      price: "PKR 18,000",
      period: "/mo",
      desc: "Small to mid-size firms",
      recommended: true,
      features: ["Unlimited cases", "All AI features", "Priority support", "5 team seats", "Advanced analytics", "Similar case search", "Timeline intelligence"],
      cta: "Start Free Trial",
      ctaStyle: { backgroundColor: GA, color: dark ? "#0D1117" : "#FFFFFF", border: "none" },
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      desc: "Large firms & corporations",
      recommended: false,
      features: ["Custom team seats", "White-label option", "Dedicated CSM", "SLA guarantee", "Custom integrations", "On-premise option"],
      cta: "Contact Sales",
      ctaStyle: { backgroundColor: "transparent", color: TX, border: `1px solid ${BD}` },
    },
  ];

  return (
    <section style={{ padding: "0 24px 100px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center" as const, marginBottom: 56 }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", marginBottom: 16 }}>Simple, transparent pricing</h2>
          <p style={{ fontSize: 17, color: TX2 }}>Start free for 14 days. No credit card required.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, alignItems: "stretch" }}>
          {tiers.map(tier => (
            <div key={tier.name} style={{ borderRadius: 20, border: `1px solid ${tier.recommended ? GA + "60" : BD}`, backgroundColor: CARDBG, overflow: "hidden", display: "flex", flexDirection: "column" as const, position: "relative" as const, boxShadow: tier.recommended ? `0 0 60px ${GA}20` : "none" }}>
              {tier.recommended && <div style={{ height: 4, backgroundColor: GA, width: "100%" }} />}
              <div style={{ padding: 28, flex: 1 }}>
                {tier.recommended && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 999, backgroundColor: `${GA}20`, marginBottom: 14 }}>
                    <Star size={10} fill={GA} color={GA} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: GA }}>Most Popular</span>
                  </div>
                )}
                <div style={{ fontSize: 18, fontWeight: 800, color: TX, marginBottom: 6 }}>{tier.name}</div>
                <div style={{ fontSize: 13, color: TX2, marginBottom: 20 }}>{tier.desc}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: TX, letterSpacing: "-0.03em" }}>{tier.price}</span>
                  <span style={{ fontSize: 14, color: TX2 }}>{tier.period}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 28 }}>
                  {tier.features.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: TX2 }}>
                      <Check size={14} color="#34D399" style={{ flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "0 28px 28px" }}>
                <button onClick={() => navigate('/register')}
                  style={{ width: "100%", padding: "13px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "opacity 0.2s", ...tier.ctaStyle }}>
                  {tier.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center" as const, marginTop: 32 }}>
          <button onClick={() => navigate('/pricing')} style={{ fontSize: 14, color: GA, background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", textDecoration: "underline" }}>
            View full feature comparison
          </button>
        </div>
      </div>
    </section>
  );
}

export function LandingFAQ({ dark }: { dark: boolean }) {
  const [openIdx, setOpenIdx] = useState(-1);
  const TX = dark ? "#FFFFFF" : "#1A1005";
  const TX2 = dark ? "#B3B3B3" : "#6B5533";
  const GA = dark ? "#D4AF37" : "#8B6514";
  const BD = dark ? "rgba(255,255,255,0.07)" : "rgba(60,30,0,0.09)";
  const CARDBG = dark ? "#1E2530" : "#FFFFFF";

  const faqs = [
    { q: "How accurate is WukaLAW's AI prediction?", a: "Our AI achieves 94.2% accuracy verified against historical Pakistani court cases spanning 2010–2024. The model is trained on over 200,000 case outcomes from the Supreme Court, all four High Courts, and district courts across Pakistan." },
    { q: "Is my client data secure?", a: "Absolutely. We use AES-256 encryption at rest and TLS 1.3 in transit. Our zero-knowledge architecture means our team cannot access your case data. Your data is never used to train our models — it's fully isolated per firm." },
    { q: "Does it work for all Pakistani courts?", a: "Yes. WukaLAW covers the Supreme Court of Pakistan, all four High Courts (Lahore, Sindh, Islamabad, Peshawar), Federal Shariat Court, and district courts across all provinces including AJK and Gilgit-Baltistan." },
    { q: "How quickly can I get started?", a: "Most firms are fully onboarded in under 30 minutes. We offer guided setup, data import tools, and a dedicated onboarding specialist for Firm and Enterprise plans. Solo practitioners can self-serve in minutes." },
    { q: "Can I import existing cases?", a: "Yes. WukaLAW supports bulk import from PDF, DOCX, Excel/Sheets, and CSV formats. We also offer integrations with Clio, Thomson Reuters, and LexisNexis for seamless migration from existing case management systems." },
    { q: "Is there a free trial?", a: "Yes — all plans come with a 14-day free trial with no credit card required. You get full access to all features in your chosen tier. Enterprise trials are available upon request with a demo call." },
  ];

  return (
    <section style={{ padding: "0 24px 100px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center" as const, marginBottom: 52 }}>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", marginBottom: 14 }}>Frequently asked questions</h2>
          <p style={{ fontSize: 16, color: TX2 }}>Everything you need to know about WukaLAW.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderRadius: 14, border: `1px solid ${openIdx === i ? GA + "40" : BD}`, backgroundColor: CARDBG, overflow: "hidden", transition: "border-color 0.2s" }}>
              <button
                onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                style={{ width: "100%", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", textAlign: "left" as const }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: TX, lineHeight: 1.4 }}>{faq.q}</span>
                <span style={{ color: openIdx === i ? GA : TX2, flexShrink: 0, transition: "transform 0.2s", transform: openIdx === i ? "rotate(180deg)" : "rotate(0deg)" }}>
                  <ChevronDown size={18} />
                </span>
              </button>
              {openIdx === i && (
                <div style={{ padding: "0 24px 20px", fontSize: 14, color: TX2, lineHeight: 1.7 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

