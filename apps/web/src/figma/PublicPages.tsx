// @ts-nocheck -- faithfully imported Figma Make presentation components
/* oxlint-disable -- preserve generated Figma Make source without semantic rewrites */
import React, { useState, useRef, useEffect } from "react";
import { wukaIcon } from "./assets";
import {
  LayoutDashboard, Briefcase, FileText, Search, Brain, GitBranch, MessageSquare,
  Cpu, Clock, BarChart2, TrendingUp, Bell, User, Settings, Shield, Layers, Upload,
  ChevronRight, ChevronDown, Star, AlertCircle, CheckCircle, XCircle, Plus, Filter,
  MoreHorizontal, ArrowRight, Eye, Download, Scale, Gavel, BookOpen, Target, Zap,
  Activity, Calendar, LogOut, X, Menu, Send, Paperclip, Sparkles, Lock, Mail,
  ChevronLeft, RefreshCw, Flag, Award, Users, Lightbulb, Edit2, Trash2,
  ArrowUpRight, ArrowDownRight, Info, Copy, ExternalLink, Check, Building, Globe,
  TrendingDown, Phone, Hash, FolderOpen, Link2, DollarSign, Sun, Moon, CreditCard,
  UserCheck, Database, Key, ShieldCheck, MessageCircle, UsersRound, FileSearch,
  BarChart, PieChart, Wallet, MapPin, AtSign, HelpCircle, BookMarked, ChevronUp,
  AlertTriangle, Sliders, Layers3, Grid3x3, Percent, ArrowLeft, PlayCircle,
  Pause, RotateCcw, Maximize2
} from "lucide-react";

type Page = string;
interface PubProps { navigate: (p: Page) => void; dark: boolean; toggleDark: () => void; current?: string; }

function BrowserWindow({ children, url = "app.wukalaw.ai", className = "", style = {} }: {
  children: React.ReactNode; url?: string; className?: string; style?: React.CSSProperties;
}) {
  return (
    <div className={`rounded-2xl overflow-hidden shadow-2xl ${className}`}
      style={{ border: "1px solid rgba(255,255,255,0.09)", backgroundColor: C, ...style }}>
      <div className="h-10 flex items-center px-4 gap-3 flex-shrink-0"
        style={{ backgroundColor: S, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FF5F57" }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FEBC2E" }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#28C840" }} />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded-md text-[11px]"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#B3B3B3", maxWidth: 240 }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#34D399" }} />
            {url}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

function FloatCard({ value, label, sub, color = G, style = {} }: {
  value: string; label: string; sub?: string; color?: string; style?: React.CSSProperties;
}) {
  return (
    <div className="absolute rounded-2xl px-4 py-3 shadow-2xl"
      style={{ backgroundColor: "rgba(22,27,34,0.85)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", ...style }}>
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-[11px] font-medium text-white mt-0.5">{label}</div>
      {sub && <div className="text-[10px] mt-0.5" style={{ color: "#B3B3B3" }}>{sub}</div>}
    </div>
  );
}

const G  = "#D4AF37";
const P  = "#7C3AED";
const B  = "#60A5FA";
const S  = "#0F1521";
const C  = "#131C2E";
const BG = "#07090F";

function Input({ placeholder, value, onChange, type = "text", icon, className = "" }: {
  placeholder?: string; value?: string; onChange?: (v: string) => void;
  type?: string; icon?: React.ReactNode; className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded-xl border border-border bg-muted/40 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors ${icon ? "pl-9 pr-4 py-2.5" : "px-4 py-2.5"}`}
      />
    </div>
  );
}

const CASES = [
  { id: "WL-2024-001", title: "Johnson v. MegaCorp Industries", type: "Employment", status: "Active", priority: "High", prediction: 78, attorney: "Sarah Chen", deadline: "Mar 15, 2024", docs: 24, activity: "2h ago" },
  { id: "WL-2024-002", title: "Estate of Williams Trust", type: "Probate", status: "Review", priority: "Medium", prediction: 65, attorney: "Michael Torres", deadline: "Apr 20, 2024", docs: 18, activity: "5h ago" },
  { id: "WL-2024-003", title: "DataTech LLC IP Dispute", type: "IP", status: "Active", priority: "Critical", prediction: 82, attorney: "Sarah Chen", deadline: "Mar 1, 2024", docs: 41, activity: "1h ago" },
  { id: "WL-2024-004", title: "Harrison Property Dispute", type: "Real Estate", status: "Closed", priority: "Low", prediction: 91, attorney: "James Park", deadline: "Feb 28, 2024", docs: 12, activity: "2d ago" },
];

const AREA_DATA = [
  { month: "Jan", filed: 38, closed: 29 }, { month: "Feb", filed: 45, closed: 33 },
  { month: "Mar", filed: 52, closed: 40 }, { month: "Apr", filed: 48, closed: 44 },
  { month: "May", filed: 61, closed: 49 }, { month: "Jun", filed: 55, closed: 52 },
  { month: "Jul", filed: 67, closed: 58 }, { month: "Aug", filed: 72, closed: 61 },
];

export function PublicNav({ navigate, dark, toggleDark, current }: PubProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const TX  = dark ? "#F0F0F5"                   : "#0E0A03";
  const TX2 = dark ? "#8892A4"                   : "#5C4A28";
  const GA  = dark ? G                           : "#8B5E0A";
  const BD  = dark ? "rgba(255,255,255,0.06)"    : "rgba(60,30,0,0.08)";
  const NAVBG = dark ? "rgba(7,9,15,0.85)"       : "rgba(244,241,236,0.9)";
  const navLinks = [
    { label: "Features",       page: "features"        as Page },
    { label: "Solutions",      page: "solutions"       as Page },
    { label: "Practice Areas", page: "practice-areas"  as Page },
    { label: "Pricing",        page: "pricing"         as Page },
    { label: "About",          page: "about"           as Page },
  ];
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderBottom: `1px solid ${BD}`, backgroundColor: NAVBG, fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <button onClick={() => navigate("landing")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <img src={wukaIcon} alt="WukaLAW" style={{ width: 38, height: 38, objectFit: "contain" }} />
          <div>
            <div style={{ color: TX, fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em", lineHeight: 1 }}>WukaLAW</div>
            <div style={{ color: GA, fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>AI Legal Intelligence</div>
          </div>
        </button>

        {/* Desktop nav */}
        <nav style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {navLinks.map(nl => (
            <button key={nl.label} onClick={() => navigate(nl.page)}
              style={{ color: current === nl.page ? GA : TX2, fontSize: 13.5, background: "none", border: "none", cursor: "pointer", fontWeight: current === nl.page ? 600 : 450, transition: "color 0.15s", fontFamily: "Inter, sans-serif", letterSpacing: "-0.01em" }}>
              {nl.label}
            </button>
          ))}
        </nav>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={toggleDark} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${BD}`, backgroundColor: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: TX2, transition: "background 0.15s" }}>
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={() => navigate("login")} style={{ color: TX2, fontSize: 13.5, background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", letterSpacing: "-0.01em" }}>Sign in</button>
          <button onClick={() => navigate("register")} style={{ background: `linear-gradient(135deg, ${P}, ${P}CC)`, color: "#FFFFFF", fontSize: 13, fontWeight: 600, padding: "9px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", letterSpacing: "-0.01em", boxShadow: `0 4px 20px ${P}40` }}>
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter({ navigate, dark }: { navigate: (p: Page) => void; dark: boolean }) {
  const TX  = dark ? "#F0F0F5"                   : "#0E0A03";
  const TX2 = dark ? "#8892A4"                   : "#5C4A28";
  const GA  = dark ? G                           : "#8B5E0A";
  const BD  = dark ? "rgba(255,255,255,0.06)"    : "rgba(60,30,0,0.08)";
  const SURF= dark ? "#050810"                   : "#EDE8DF";
  const cols = [
    { heading: "Platform", links: [["Features","features"],["Pricing","pricing"],["Case Workspace","workspace"],["AI Assistant","ai-chat"]] },
    { heading: "Company",  links: [["About","about"],["Blog","blog"],["Careers","careers"],["Contact","contact"]] },
    { heading: "Legal",    links: [["Privacy Policy","privacy"],["Terms of Service","terms"],["Security","landing"],["FAQ","faq-page"]] },
  ];
  return (
    <footer style={{ borderTop: `1px solid ${BD}`, backgroundColor: SURF, padding: "64px 24px 32px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <img src={wukaIcon} alt="WukaLAW" style={{ width: 40, height: 40, objectFit: "contain" }} />
              <div>
                <div style={{ color: TX, fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>WukaLAW</div>
                <div style={{ color: GA, fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>AI Legal Intelligence</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: TX2, lineHeight: 1.75, maxWidth: 260, marginBottom: 20 }}>Pakistan's first AI-powered legal intelligence platform. Empowering advocates with data-driven insights since 2024.</p>
            <div style={{ display: "flex", gap: 10 }}>
              {[["Tw","twitter"],["Li","linkedin"],["Gh","github"]].map(([l, _]) => (
                <div key={l} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BD}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: TX2, fontSize: 11, fontWeight: 700 }}>{l}</div>
              ))}
            </div>
          </div>
          {cols.map(col => (
            <div key={col.heading}>
              <div style={{ fontSize: 11, fontWeight: 700, color: TX, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 18 }}>{col.heading}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {col.links.map(([label, page]) => (
                  <button key={label} onClick={() => navigate(page as Page)} style={{ fontSize: 13, color: TX2, background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "Inter, sans-serif", padding: 0, transition: "color 0.15s" }}>{label}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ paddingTop: 24, borderTop: `1px solid ${BD}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: TX2 }}>© 2024 WukaLAW Inc. · AI Legal Intelligence. Human Justice.</span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#34D399" }} />
            <span style={{ fontSize: 12, color: TX2 }}>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export function LandingPage({ navigate, dark, toggleDark }: { navigate: (p: Page) => void; dark: boolean; toggleDark: () => void }) {
  // ── Theme tokens ──────────────────────────────────────────────────────────
  const BG      = dark ? "#07090F"                    : "#F4F1EC";
  const SURF    = dark ? "#0F1521"                    : "#EDE8DF";
  const CARDBG  = dark ? "#131C2E"                    : "#FFFFFF";
  const TX      = dark ? "#F0F0F5"                    : "#0E0A03";
  const TX2     = dark ? "#8892A4"                    : "#5C4A28";
  const GA      = dark ? G                           : "#8B5E0A";
  const BD      = dark ? "rgba(255,255,255,0.06)"     : "rgba(60,30,0,0.08)";
  const NAVBG   = dark ? "rgba(7,9,15,0.85)"          : "rgba(244,241,236,0.9)";
  const WMK     = dark ? "rgba(255,255,255,0.018)"    : "rgba(0,0,0,0.03)";

  // Unsplash image URLs
  const IMG_JUSTICE  = "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=720&h=900&fit=crop&auto=format";
  const IMG_LAWYER1  = "https://images.unsplash.com/photo-1642522029686-5485ea7e6042?w=400&h=500&fit=crop&auto=format";
  const IMG_LAWYER2  = "https://images.unsplash.com/photo-1771244678811-50c22f17c791?w=400&h=500&fit=crop&auto=format";
  const IMG_LAWYER3  = "https://images.unsplash.com/photo-1758518727888-ffa196002e59?w=400&h=500&fit=crop&auto=format";
  const IMG_BOOKS    = "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1100&h=600&fit=crop&auto=format";
  const IMG_GAVEL    = "https://images.unsplash.com/photo-1618771623063-6c3faa854a61?w=900&h=550&fit=crop&auto=format";

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

      <PublicNav navigate={navigate} dark={dark} toggleDark={toggleDark} />

      {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, padding: "72px 24px 0", overflow: "hidden" }}>
        {/* Ambient glow orbs */}
        <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 800, height: 500, borderRadius: "50%", background: `radial-gradient(ellipse, ${P}22 0%, transparent 65%)`, filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 200, right: -100, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(ellipse, ${GA}18 0%, transparent 65%)`, filter: "blur(60px)", pointerEvents: "none" }} />
        {/* Urdu calligraphy watermarks */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", userSelect: "none", overflow: "hidden", zIndex: 0 }}>
          <div className="wk-urdu1" style={{ position: "absolute", top: "8%", right: "-2%", fontSize: "clamp(60px,9vw,130px)", fontFamily: "'Noto Nastaliq Urdu', serif", fontWeight: 700, color: WMK, lineHeight: 1, direction: "rtl" }}>وکالت</div>
          <div className="wk-urdu2" style={{ position: "absolute", top: "45%", left: "-2%", fontSize: "clamp(50px,7vw,100px)", fontFamily: "'Noto Nastaliq Urdu', serif", fontWeight: 700, color: WMK, lineHeight: 1, direction: "rtl" }}>عدالت</div>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 99, border: `1px solid ${P}35`, background: `${P}0E`, marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399" }} />
            <span style={{ fontSize: 11, color: P, fontWeight: 700, letterSpacing: "0.08em" }}>Pakistan's First AI Legal Intelligence Platform</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: "clamp(44px,6.5vw,88px)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.05em", marginBottom: 24, color: TX }}>
            AI-Powered Legal<br />
            <span style={dark
              ? { background: `linear-gradient(135deg, ${P} 0%, ${G} 60%, ${G} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }
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
            <button onClick={() => navigate("register")} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `linear-gradient(135deg,${P},${P}CC)`, color: "#fff", fontSize: 15, fontWeight: 700, padding: "14px 32px", borderRadius: 10, border: "none", cursor: "pointer", boxShadow: `0 8px 32px ${P}40`, letterSpacing: "-0.01em" }}>
              Start Free Trial <ArrowRight size={15} />
            </button>
            <button onClick={() => navigate("dashboard")} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, color: TX2, background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${BD}`, padding: "14px 28px", borderRadius: 10, cursor: "pointer", letterSpacing: "-0.01em" }}>
              View Live Demo
            </button>
          </div>

          {/* Social proof */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 56 }}>
            <div style={{ display: "flex" }}>
              {["SC","AK","FM","SH","LW"].map((i,idx) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${[P,G,"#34D399","#60A5FA","#F87171"][idx]},${[P,G,"#34D399","#60A5FA","#F87171"][idx]}CC)`, border: `2px solid ${BG}`, marginLeft: idx>0?-8:0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>{i}</div>
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
            <div style={{ position: "absolute", bottom: -60, left: "50%", transform: "translateX(-50%)", width: "70%", height: 120, background: `radial-gradient(ellipse, ${P}40 0%, transparent 70%)`, filter: "blur(40px)" }} />
            {/* Browser chrome */}
            <div style={{ borderRadius: "16px 16px 0 0", border: `1px solid ${BD}`, borderBottom: "none", background: dark ? "#0F1521" : "#FFFFFF", overflow: "hidden", boxShadow: dark ? `0 -8px 80px rgba(0,0,0,0.8), 0 0 100px ${P}20` : `0 -8px 60px rgba(0,0,0,0.1)` }}>
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
                  <img src={wukaIcon} alt="" style={{ width: 32, height: 32, objectFit: "contain", margin: "0 auto 8px" }} />
                  {[LayoutDashboard,Briefcase,Layers,Brain,MessageSquare,BarChart2,Bell].map((Icon, i) => (
                    <div key={i} style={{ width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: i===0?`${P}20`:"transparent", margin: "0 auto" }}>
                      <Icon size={15} color={i===0?P:"#8892A4"} />
                    </div>
                  ))}
                </div>
                {/* Main content */}
                <div style={{ flex: 1, padding: "20px 20px", overflow: "hidden" }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    {[["Active Cases","34",G],["Win Rate","82%",P],["Hearings","3","#34D399"],["Revenue","PKR 4.2M","#60A5FA"]].map(([l,v,c])=>(
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
                            <div style={{ width:"100%", background:`${P}90`, borderRadius:"3px 3px 0 0", height:`${(d.filed/91)*100}%`, minHeight:4 }} />
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
                          <div style={{ fontSize:11, fontWeight:800, color:c.prediction>75?G:P }}>{c.prediction}%</div>
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
              <div style={{ fontSize:"clamp(28px,3.5vw,44px)", fontWeight:900, letterSpacing:"-0.04em", marginBottom:6, background: dark?`linear-gradient(135deg,${G},${P})`:`linear-gradient(135deg,#8B5E0A,${P})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{v}</div>
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
            <button onClick={() => navigate("prediction")} style={btnPrimary}>
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
                <button onClick={() => navigate("similar-cases")} style={btnPrimary}>
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
              <button onClick={() => navigate("find-lawyer")} style={btnPrimary}>
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
                  onClick={() => navigate("lawyer-profile")}
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
                    <button onClick={() => navigate("lawyer-profile")} style={{ width: "100%", padding: "10px", borderRadius: 10, backgroundColor: `${GA}15`, color: GA, fontSize: 13, fontWeight: 700, border: `1px solid ${GA}35`, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
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
                <button onClick={() => navigate("find-lawyer")} style={{ ...btnPrimary, boxShadow: `0 0 60px ${GA}60` }}>
                  Book Free Consultation <ArrowRight size={15} />
                </button>
                <button onClick={() => navigate("login")} style={{ ...btnSecondary, color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  Access Platform
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Interactive Product Demo ══════════════════════════════════════════ */}
      <LandingProductDemo dark={dark} navigate={navigate} />

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

      <PublicFooter navigate={navigate} dark={dark} />
    </div>
  );
}

// ─── Landing Sub-Sections ─────────────────────────────────────────────────────

export function LandingProductDemo({ dark, navigate }: { dark: boolean; navigate: (p: Page) => void }) {
  const [activeTab, setActiveTab] = useState(0);
  const BG = dark ? "#0D1117" : "#F8F4EC";
  const TX = dark ? "#FFFFFF" : "#1A1005";
  const TX2 = dark ? "#B3B3B3" : "#6B5533";
  const GA = dark ? "#D4AF37" : "#8B6514";
  const BD = dark ? "rgba(255,255,255,0.07)" : "rgba(60,30,0,0.09)";
  const CARDBG = dark ? "#1E2530" : "#FFFFFF";

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
        <BrowserWindow dark={dark} url={`wukalaw.pk/${tabs[activeTab].label.toLowerCase().replace(/ /g, "-")}`}>
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

export function LandingPricingSection({ dark, navigate }: { dark: boolean; navigate: (p: Page) => void }) {
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
                <button onClick={() => navigate("register")}
                  style={{ width: "100%", padding: "13px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "opacity 0.2s", ...tier.ctaStyle }}>
                  {tier.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center" as const, marginTop: 32 }}>
          <button onClick={() => navigate("pricing")} style={{ fontSize: 14, color: GA, background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", textDecoration: "underline" }}>
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

// ─── Pricing Page ─────────────────────────────────────────────────────────────

export function PricingPage({ navigate, dark, toggleDark }: { navigate: (p: Page) => void; dark: boolean; toggleDark: () => void }) {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(-1);
  const BG = dark ? "#0D1117" : "#F8F4EC";
  const TX = dark ? "#FFFFFF" : "#1A1005";
  const TX2 = dark ? "#B3B3B3" : "#6B5533";
  const GA = dark ? "#D4AF37" : "#8B6514";
  const BD = dark ? "rgba(255,255,255,0.07)" : "rgba(60,30,0,0.09)";
  const CARDBG = dark ? "#1E2530" : "#FFFFFF";

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
      <PublicNav navigate={navigate} dark={dark} toggleDark={toggleDark} current="pricing" />

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
                <button onClick={() => tier.monthly === null ? navigate("contact") : navigate("register")}
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

      <PublicFooter navigate={navigate} dark={dark} />
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

export function LoginPage({ navigate, dark, toggleDark }: { navigate: (p: Page) => void; dark: boolean; toggleDark: () => void }) {
  const BG = dark ? "#0D1117" : "#F8F4EC";
  const SURF = dark ? "#161B22" : "#EDE8D8";
  const CARDBG = dark ? "#1E2530" : "#FFFFFF";
  const TX = dark ? "#FFFFFF" : "#1A1005";
  const TX2 = dark ? "#B3B3B3" : "#6B5533";
  const GA = dark ? "#D4AF37" : "#8B6514";
  const BD = dark ? "rgba(255,255,255,0.07)" : "rgba(60,30,0,0.09)";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: BG, position: "relative" }}>
      {/* Theme toggle */}
      <button onClick={toggleDark} style={{ position: "absolute", top: 20, right: 20, zIndex: 10, width: 36, height: 36, borderRadius: 10, border: `1px solid ${BD}`, backgroundColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: TX2 }}>
        {dark ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
         : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
      </button>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 border-r" style={{ backgroundColor: SURF, borderColor: BD }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: GA }}>
            <Scale size={16} color={dark ? "#0D1117" : "#FFFFFF"} />
          </div>
          <span style={{ color: TX, fontWeight: 700 }}>WukaLAW</span>
        </div>
        <div>
          <div className="flex mb-3 gap-1">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill={GA} color={GA} />)}</div>
          <blockquote style={{ fontSize: 20, fontWeight: 500, color: TX, lineHeight: 1.6, marginBottom: 24 }}>
            "WukaLAW has given our firm a decisive edge. The AI predictions have been accurate in 91% of our cases this year."
          </blockquote>
          <div className="flex items-center gap-3">
            <Avatar name="Marcus Reid" size="md" />
            <div>
              <div style={{ color: TX, fontWeight: 500 }}>Dr. Marcus Reid</div>
              <div style={{ color: TX2, fontSize: 14 }}>Head of Legal Tech, Thornton Global</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[["94.2%", "AI Accuracy"], ["50K+", "Cases"], ["200+", "Law Firms"]].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontSize: 24, fontWeight: 700, color: GA }}>{v}</div>
              <div style={{ color: TX2, fontSize: 12, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: BG }}>
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: GA }}>
              <Scale size={16} color={dark ? "#0D1117" : "#FFFFFF"} />
            </div>
            <span style={{ color: TX, fontWeight: 700, fontSize: 18 }}>WukaLAW</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: TX, marginBottom: 4 }}>Welcome back</h2>
          <p style={{ color: TX2, fontSize: 14, marginBottom: 32 }}>Sign in to your WukaLAW account</p>

          <div className="space-y-4">
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: TX2, display: "block", marginBottom: 6 }}>Email address</label>
              <Input placeholder="you@lawfirm.com" value={email} onChange={setEmail} type="email" icon={<Mail size={14} />} />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label style={{ fontSize: 12, fontWeight: 500, color: TX2 }}>Password</label>
                <button className="text-xs hover:underline" style={{ color: GA }}>Forgot password?</button>
              </div>
              <Input placeholder="••••••••" value={password} onChange={setPassword} type="password" icon={<Lock size={14} />} />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border flex items-center justify-center cursor-pointer" style={{ borderColor: `${GA}50` }}>
                <Check size={10} style={{ color: GA }} />
              </div>
              <span style={{ fontSize: 12, color: TX2 }}>Remember me for 30 days</span>
            </div>
          </div>

          <Btn onClick={() => navigate("dashboard")} className="w-full justify-center mt-6" size="lg">
            Sign in to WukaLAW
          </Btn>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: `${GA}20` }} />
            <span style={{ fontSize: 12, color: TX2 }}>or continue with</span>
            <div className="flex-1 h-px" style={{ backgroundColor: `${GA}20` }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {["Microsoft SSO", "Google Workspace"].map(provider => (
              <button key={provider} style={{ padding: "10px", fontSize: 12, border: `1px solid ${GA}30`, borderRadius: 12, color: TX2, background: "none", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                {provider}
              </button>
            ))}
          </div>

          <p style={{ textAlign: "center", fontSize: 14, color: TX2, marginTop: 32 }}>
            No account?{" "}
            <button onClick={() => navigate("register")} style={{ fontWeight: 500, color: GA, background: "none", border: "none", cursor: "pointer" }}>
              Start free trial
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Register Page ────────────────────────────────────────────────────────────

export function RegisterPage({ navigate, dark, toggleDark }: { navigate: (p: Page) => void; dark: boolean; toggleDark: () => void }) {
  const BG = dark ? "#0D1117" : "#F8F4EC";
  const SURF = dark ? "#161B22" : "#EDE8D8";
  const CARDBG = dark ? "#1E2530" : "#FFFFFF";
  const TX = dark ? "#FFFFFF" : "#1A1005";
  const TX2 = dark ? "#B3B3B3" : "#6B5533";
  const GA = dark ? "#D4AF37" : "#8B6514";
  const BD = dark ? "rgba(255,255,255,0.07)" : "rgba(60,30,0,0.09)";
  const [form, setForm] = useState({ name: "", email: "", firm: "", role: "", password: "" });
  const set = (k: keyof typeof form) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: BG }}>
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: GA }}>
            <Scale size={18} color={dark ? "#0D1117" : "#FFFFFF"} />
          </div>
          <span style={{ color: TX, fontWeight: 700, fontSize: 20 }}>WukaLAW</span>
        </div>
        <div style={{ padding: 32, borderRadius: 20, backgroundColor: CARDBG, border: `1px solid ${BD}`, boxShadow: dark ? "0 20px 60px rgba(0,0,0,0.4)" : "0 20px 40px rgba(100,70,0,0.08)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: TX, marginBottom: 4 }}>Create your account</h2>
          <p style={{ color: TX2, fontSize: 14, marginBottom: 24 }}>Start your 14-day free trial. No credit card required.</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#B3B3B3] mb-1.5 block">Full name</label>
                <Input placeholder="Alexandra Weiss" value={form.name} onChange={set("name")} icon={<User size={14} />} />
              </div>
              <div>
                <label className="text-xs font-medium text-[#B3B3B3] mb-1.5 block">Role</label>
                <Input placeholder="Senior Partner" value={form.role} onChange={set("role")} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[#B3B3B3] mb-1.5 block">Work email</label>
              <Input placeholder="you@lawfirm.com" value={form.email} onChange={set("email")} type="email" icon={<Mail size={14} />} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#B3B3B3] mb-1.5 block">Law firm</label>
              <Input placeholder="Weiss & Blake LLP" value={form.firm} onChange={set("firm")} icon={<Building size={14} />} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#B3B3B3] mb-1.5 block">Password</label>
              <Input placeholder="At least 12 characters" value={form.password} onChange={set("password")} type="password" icon={<Lock size={14} />} />
            </div>
            <div className="flex items-start gap-2 pt-1">
              <div className="w-4 h-4 rounded border flex items-center justify-center cursor-pointer mt-0.5 flex-shrink-0" style={{ borderColor: `${GA}50` }}>
                <Check size={10} style={{ color: GA }} />
              </div>
              <span style={{ fontSize: 12, color: TX2, lineHeight: 1.6 }}>I agree to the <a href="#" style={{ color: GA }}>Terms of Service</a> and <a href="#" style={{ color: GA }}>Privacy Policy</a></span>
            </div>
          </div>
          <Btn onClick={() => navigate("dashboard")} className="w-full justify-center mt-6" size="lg">
            Create Account
          </Btn>
          <p style={{ textAlign: "center", fontSize: 14, color: TX2, marginTop: 20 }}>
            Already have an account?{" "}
            <button onClick={() => navigate("login")} style={{ fontWeight: 500, color: GA, background: "none", border: "none", cursor: "pointer" }}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────


export function ContactPage({ navigate, dark, toggleDark }: { navigate: (p: Page) => void; dark: boolean; toggleDark: () => void }) {
  const BG = dark ? "#0D1117" : "#F8F4EC";
  const CARDBG = dark ? "#1E2530" : "#FFFFFF";
  const TX = dark ? "#FFFFFF" : "#1A1005";
  const TX2 = dark ? "#B3B3B3" : "#6B5533";
  const GA = dark ? "#D4AF37" : "#8B6514";
  const BD = dark ? "rgba(255,255,255,0.07)" : "rgba(60,30,0,0.09)";
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const set = (k: keyof typeof form) => (v: string) => setForm(p => ({ ...p, [k]: v }));
  const inputStyle: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${BD}`, backgroundColor: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", color: TX, fontSize: 14, outline: "none", fontFamily: "Inter, sans-serif", boxSizing: "border-box" };

  return (
    <div style={{ backgroundColor: BG, fontFamily: "Inter, sans-serif", minHeight: "100vh" }}>
      <PublicNav navigate={navigate} dark={dark} toggleDark={toggleDark} current="contact" />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, border: `1px solid ${GA}40`, backgroundColor: `${GA}12`, marginBottom: 20 }}>
            <span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: "0.06em" }}>GET IN TOUCH</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", marginBottom: 12, lineHeight: 1.1 }}>Contact WukaLAW</h1>
          <p style={{ fontSize: 15, color: TX2, lineHeight: 1.7 }}>Have a question about our platform? We'd love to hear from you.</p>
        </div>

        <div style={{ padding: "40px", borderRadius: 24, backgroundColor: CARDBG, border: `1px solid ${BD}`, boxShadow: dark ? "0 20px 60px rgba(0,0,0,0.4)" : "0 20px 40px rgba(100,70,0,0.08)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: TX2, display: "block", marginBottom: 8 }}>Full Name</label>
              <input type="text" placeholder="Your name" value={form.name} onChange={e => set("name")(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: TX2, display: "block", marginBottom: 8 }}>Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email")(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: TX2, display: "block", marginBottom: 8 }}>Subject</label>
            <input type="text" placeholder="How can we help?" value={form.subject} onChange={e => set("subject")(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: TX2, display: "block", marginBottom: 8 }}>Message</label>
            <textarea placeholder="Tell us more..." value={form.message} onChange={e => set("message")(e.target.value)} rows={5} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <button style={{ width: "100%", padding: "14px", borderRadius: 12, backgroundColor: GA, color: dark ? "#0D1117" : "#FFFFFF", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
            Send Message →
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 32 }}>
          {[["Email", "hello@wukalaw.pk"], ["WhatsApp", "+92 300 WukaLAW"], ["Response", "Within 24 hours"]].map(([l, v]) => (
            <div key={l} style={{ padding: "18px", borderRadius: 16, backgroundColor: CARDBG, border: `1px solid ${BD}`, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: TX2, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: GA }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <PublicFooter navigate={navigate} dark={dark} />
    </div>
  );
}

// ─── Practice Areas Page ──────────────────────────────────────────────────────

export function PracticeAreasPage({ navigate, dark, toggleDark }: { navigate: (p: Page) => void; dark: boolean; toggleDark: () => void }) {
  const BG = dark ? "#0D1117" : "#F8F4EC";
  const CARDBG = dark ? "#1E2530" : "#FFFFFF";
  const TX = dark ? "#FFFFFF" : "#1A1005";
  const TX2 = dark ? "#B3B3B3" : "#6B5533";
  const GA = dark ? "#D4AF37" : "#8B6514";
  const BD = dark ? "rgba(255,255,255,0.07)" : "rgba(60,30,0,0.09)";

  const areas = [
    { icon: "⚖️", title: "Constitutional Law", desc: "Fundamental rights litigation, constitutional petitions, and judicial review before Pakistan's Supreme Court and High Courts.", count: "120+ cases" },
    { icon: "🏢", title: "Corporate & Commercial", desc: "Company formation, mergers & acquisitions, contract disputes, and regulatory compliance across all sectors.", count: "340+ cases" },
    { icon: "🛡️", title: "Criminal Defence", desc: "Expert criminal defence representation at trial courts, sessions courts, and appellate levels throughout Pakistan.", count: "85+ cases" },
    { icon: "💡", title: "Intellectual Property", desc: "Patent registration, trademark protection, copyright enforcement, and IP litigation under Pakistan IP laws.", count: "210+ cases" },
    { icon: "🏠", title: "Real Estate & Property", desc: "Property disputes, title verification, lease agreements, and land acquisition proceedings.", count: "190+ cases" },
    { icon: "👨‍👩‍👧", title: "Family & Personal Law", desc: "Divorce, custody, inheritance, and family court matters under Muslim Family Laws and general law.", count: "155+ cases" },
    { icon: "💰", title: "Taxation & Revenue", desc: "Tax planning, FBR disputes, tax tribunal representation, and customs & excise matters.", count: "98+ cases" },
    { icon: "⚡", title: "Energy & Infrastructure", desc: "Power sector agreements, infrastructure contracts, NEPRA proceedings, and regulatory matters.", count: "62+ cases" },
  ];

  return (
    <div style={{ backgroundColor: BG, fontFamily: "Inter, sans-serif", minHeight: "100vh" }}>
      <PublicNav navigate={navigate} dark={dark} toggleDark={toggleDark} current="practice-areas" />

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "80px 24px 60px", borderBottom: `1px solid ${BD}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "clamp(80px, 15vw, 180px)", fontFamily: "'Noto Nastaliq Urdu', serif", fontWeight: 700, color: dark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.04)", pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap", zIndex: 0 }}>قانون</div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, border: `1px solid ${GA}40`, backgroundColor: `${GA}12`, marginBottom: 24 }}>
            <span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: "0.06em" }}>PRACTICE AREAS</span>
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", marginBottom: 16, lineHeight: 1.1 }}>Expertise Across<br />Every Domain of Law</h1>
          <p style={{ fontSize: 16, color: TX2, maxWidth: 520, margin: "0 auto" }}>From constitutional litigation to corporate counsel — our AI-enhanced practice covers Pakistan's full legal spectrum.</p>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {areas.map(a => (
            <div key={a.title} className="wk-card-hover" style={{ padding: "32px 28px", borderRadius: 20, backgroundColor: CARDBG, border: `1px solid ${BD}`, cursor: "pointer", position: "relative", overflow: "hidden", boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.3)" : "0 8px 24px rgba(100,70,0,0.07)" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: GA }} />
              <div style={{ fontSize: 36, marginBottom: 16 }}>{a.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: TX, marginBottom: 10, letterSpacing: "-0.02em" }}>{a.title}</h3>
              <p style={{ fontSize: 13, color: TX2, lineHeight: 1.7, marginBottom: 20 }}>{a.desc}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: GA, fontWeight: 700, padding: "3px 10px", borderRadius: 20, backgroundColor: `${GA}12`, border: `1px solid ${GA}30` }}>{a.count}</span>
                <span style={{ fontSize: 13, color: GA, fontWeight: 600 }}>Learn more →</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div style={{ marginTop: 80, padding: "60px 48px", borderRadius: 28, background: dark ? `linear-gradient(135deg, rgba(212,175,55,0.12), rgba(79,142,247,0.08))` : `linear-gradient(135deg, rgba(139,101,20,0.1), rgba(237,232,216,0.5))`, border: `1px solid ${GA}30`, textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 800, color: TX, marginBottom: 16, letterSpacing: "-0.03em" }}>Don't see your area? Let's talk.</h2>
          <p style={{ fontSize: 15, color: TX2, marginBottom: 36 }}>Our AI platform adapts to any legal matter across Pakistani law.</p>
          <button onClick={() => navigate("contact")} style={{ backgroundColor: GA, color: dark ? "#0D1117" : "#FFFFFF", fontSize: 15, fontWeight: 700, padding: "14px 36px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
            Schedule Consultation →
          </button>
        </div>
      </div>

      <PublicFooter navigate={navigate} dark={dark} />
    </div>
  );
}

// ─── Case Studies Page ────────────────────────────────────────────────────────

export function CaseStudiesPage({ navigate, dark, toggleDark }: { navigate: (p: Page) => void; dark: boolean; toggleDark: () => void }) {
  const BG = dark ? "#0D1117" : "#F8F4EC";
  const CARDBG = dark ? "#1E2530" : "#FFFFFF";
  const TX = dark ? "#FFFFFF" : "#1A1005";
  const TX2 = dark ? "#B3B3B3" : "#6B5533";
  const GA = dark ? "#D4AF37" : "#8B6514";
  const BD = dark ? "rgba(255,255,255,0.07)" : "rgba(60,30,0,0.09)";
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Constitutional", "Corporate", "IP", "Criminal", "Real Estate"];

  const studies = [
    { id: 1, category: "IP", title: "DataTech LLC Patent Victory", outcome: "Win", value: "$12M", duration: "14 months", ai: 82, desc: "Successfully defended a landmark software patent infringement case before the Lahore High Court. AI analysis identified 3 overlooked precedents that formed the cornerstone of our winning argument.", year: 2024 },
    { id: 2, category: "Constitutional", title: "Fundamental Rights Petition", outcome: "Win", value: "N/A", duration: "8 months", ai: 91, desc: "Secured constitutional relief for a media house facing unlawful censorship. The WukaLAW AI mapped 47 relevant SC judgments that established the precedent for our constitutional petition.", year: 2023 },
    { id: 3, category: "Corporate", title: "Cross-border M&A Defence", outcome: "Settled", value: "$8.4M", duration: "6 months", ai: 74, desc: "Navigated a complex cross-border merger dispute between a Pakistani conglomerate and a UAE investor, achieving a favorable settlement through AI-powered evidence analysis.", year: 2024 },
    { id: 4, category: "Criminal", title: "White-collar Fraud Acquittal", outcome: "Win", value: "N/A", duration: "22 months", ai: 68, desc: "Achieved full acquittal in a high-profile financial fraud case at the Accountability Court. Document analysis by WukaLAW AI revealed exculpatory evidence buried in 3,000 pages of records.", year: 2023 },
    { id: 5, category: "Real Estate", title: "Karachi Property Restitution", outcome: "Win", value: "$4.2M", duration: "11 months", ai: 88, desc: "Recovered a prime commercial property in Karachi from an illegal occupant through strategic litigation backed by AI-driven title chain analysis spanning 60 years of records.", year: 2024 },
    { id: 6, category: "Corporate", title: "Startup IP Portfolio Defence", outcome: "Win", value: "$2.1M", duration: "5 months", ai: 79, desc: "Protected a Pakistani fintech startup's IP portfolio from a well-funded competitor, leveraging AI precedent search to craft an aggressive but precise legal strategy.", year: 2023 },
  ];

  const filtered = filter === "All" ? studies : studies.filter(s => s.category === filter);

  return (
    <div style={{ backgroundColor: BG, fontFamily: "Inter, sans-serif", minHeight: "100vh" }}>
      <PublicNav navigate={navigate} dark={dark} toggleDark={toggleDark} current="case-studies" />

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "80px 24px 60px", borderBottom: `1px solid ${BD}` }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, border: `1px solid ${GA}40`, backgroundColor: `${GA}12`, marginBottom: 24 }}>
          <span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: "0.06em" }}>CASE STUDIES</span>
        </div>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", marginBottom: 16, lineHeight: 1.1 }}>Proven Results,<br />Powered by AI</h1>
        <p style={{ fontSize: 16, color: TX2, maxWidth: 500, margin: "0 auto" }}>Real cases, real outcomes. See how WukaLAW's AI intelligence delivered decisive results for our clients.</p>
      </div>

      {/* Filters */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{ padding: "8px 20px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif", border: `1px solid ${filter === c ? GA : BD}`, backgroundColor: filter === c ? GA : "transparent", color: filter === c ? (dark ? "#0D1117" : "#FFFFFF") : TX2, transition: "all 0.2s" }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24 }}>
          {filtered.map(s => (
            <div key={s.id} className="wk-card-hover" style={{ borderRadius: 24, overflow: "hidden", backgroundColor: CARDBG, border: `1px solid ${BD}`, boxShadow: dark ? "0 12px 40px rgba(0,0,0,0.35)" : "0 12px 32px rgba(100,70,0,0.08)", cursor: "pointer" }}>
              {/* Card header */}
              <div style={{ padding: "28px 28px 0", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6, backgroundColor: `${GA}18`, color: GA, border: `1px solid ${GA}35` }}>{s.category}</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: TX2 }}>AI Confidence</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.ai >= 80 ? "#34D399" : GA }}>{s.ai}%</div>
                  </div>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: TX, marginBottom: 10, lineHeight: 1.3, letterSpacing: "-0.02em" }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: TX2, lineHeight: 1.7, marginBottom: 20 }}>{s.desc}</p>
              </div>
              {/* Card footer */}
              <div style={{ padding: "16px 28px 24px", borderTop: `1px solid ${BD}`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[["Outcome", s.outcome, s.outcome === "Win" ? "#34D399" : GA], ["Value", s.value, TX], ["Duration", s.duration, TX2]].map(([label, val, color]) => (
                  <div key={label as string}>
                    <div style={{ fontSize: 10, color: TX2, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: String(color) }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <PublicFooter navigate={navigate} dark={dark} />
    </div>
  );
}

// ─── About Page ───────────────────────────────────────────────────────────────

export function AboutPage({ navigate, dark, toggleDark }: { navigate: (p: Page) => void; dark: boolean; toggleDark: () => void }) {
  const BG = dark ? "#0D1117" : "#F8F4EC";
  const SURF = dark ? "#161B22" : "#EDE8D8";
  const CARDBG = dark ? "#1E2530" : "#FFFFFF";
  const TX = dark ? "#FFFFFF" : "#1A1005";
  const TX2 = dark ? "#B3B3B3" : "#6B5533";
  const GA = dark ? "#D4AF37" : "#8B6514";
  const BD = dark ? "rgba(255,255,255,0.07)" : "rgba(60,30,0,0.09)";
  const WMK = dark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.04)";

  return (
    <div style={{ backgroundColor: BG, fontFamily: "Inter, sans-serif", minHeight: "100vh" }}>
      <PublicNav navigate={navigate} dark={dark} toggleDark={toggleDark} current="about" />

      {/* Hero */}
      <div style={{ position: "relative", textAlign: "center", padding: "100px 24px 80px", overflow: "hidden", borderBottom: `1px solid ${BD}` }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "clamp(80px, 18vw, 220px)", fontFamily: "'Noto Nastaliq Urdu', serif", fontWeight: 700, color: WMK, pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap" }}>وکالت</div>
        {dark && <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(212,175,55,0.15) 0%, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none" }} />}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, border: `1px solid ${GA}40`, backgroundColor: `${GA}12`, marginBottom: 24 }}>
            <span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: "0.06em" }}>OUR STORY</span>
          </div>
          <h1 style={{ fontSize: "clamp(32px, 6vw, 72px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", marginBottom: 20, lineHeight: 1.05 }}>
            Pakistan's Legal Future,<br />
            <span style={dark ? { backgroundImage: "linear-gradient(135deg, #D4AF37, #F0D060)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" } : { color: "#7A5510" }}>Built on Intelligence.</span>
          </h1>
          <p style={{ fontSize: 17, color: TX2, maxWidth: 580, margin: "0 auto", lineHeight: 1.75 }}>
            WukaLAW was founded in 2024 to bridge the gap between Pakistan's deep legal tradition and the power of modern AI — giving every advocate the edge of a senior partner.
          </p>
        </div>
      </div>

      {/* Mission + Vision */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        {[
          { icon: "⚖️", title: "Our Mission", text: "To democratize access to elite legal intelligence in Pakistan by equipping every advocate — from solo practitioners to top-tier firms — with AI-powered tools that were previously available only to the largest firms with the deepest pockets." },
          { icon: "🔭", title: "Our Vision", text: "A Pakistan where every citizen can access excellent legal representation, where justice is not determined by resources but by the strength of facts — and where Pakistani law firms compete and win on the global stage." },
        ].map(s => (
          <div key={s.title} style={{ padding: "40px", borderRadius: 24, backgroundColor: CARDBG, border: `1px solid ${BD}`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: GA }} />
            <div style={{ fontSize: 40, marginBottom: 20 }}>{s.icon}</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: TX, marginBottom: 16, letterSpacing: "-0.02em" }}>{s.title}</h3>
            <p style={{ fontSize: 14, color: TX2, lineHeight: 1.8 }}>{s.text}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ backgroundColor: dark ? "rgba(22,27,34,0.6)" : "rgba(237,232,216,0.7)", borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}`, padding: "60px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, textAlign: "center" }}>
          {[["2024", "Founded"], ["50K+", "Cases Analyzed"], ["3", "Pakistan Offices"], ["94.2%", "AI Accuracy"]].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontSize: 40, fontWeight: 900, color: GA, letterSpacing: "-0.04em", marginBottom: 6 }}>{v}</div>
              <div style={{ fontSize: 13, color: TX2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
        <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 800, color: TX, letterSpacing: "-0.03em", marginBottom: 48, textAlign: "center" }}>What we stand for</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            { title: "Transparency", icon: "🔍", desc: "Our Explainable AI shows every factor behind each prediction. No black boxes — only clear, understandable reasoning." },
            { title: "Excellence", icon: "🏆", desc: "Trained on Pakistan's full legal corpus. Our AI is built specifically for Pakistani law, courts, and judicial patterns." },
            { title: "Access", icon: "🤝", desc: "Tiered pricing to serve solo advocates, boutique firms, and large corporations. Quality AI for every scale of practice." },
          ].map(v => (
            <div key={v.title} style={{ padding: "32px 28px", borderRadius: 20, backgroundColor: CARDBG, border: `1px solid ${BD}`, textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{v.icon}</div>
              <h4 style={{ fontSize: 17, fontWeight: 800, color: TX, marginBottom: 12 }}>{v.title}</h4>
              <p style={{ fontSize: 13, color: TX2, lineHeight: 1.75 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "60px 40px", borderRadius: 28, backgroundColor: CARDBG, border: `1px solid ${GA}30`, boxShadow: dark ? `0 0 80px ${GA}10` : "0 20px 60px rgba(100,70,0,0.1)" }}>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800, color: TX, marginBottom: 16 }}>Ready to transform your practice?</h2>
          <p style={{ fontSize: 15, color: TX2, marginBottom: 32 }}>Join Pakistan's leading AI legal platform.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => navigate("find-lawyer")} style={{ backgroundColor: GA, color: dark ? "#0D1117" : "#FFFFFF", fontSize: 14, fontWeight: 700, padding: "12px 28px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Find a Lawyer →</button>
            <button onClick={() => navigate("contact")} style={{ fontSize: 14, color: TX2, padding: "12px 24px", borderRadius: 12, border: `1px solid ${BD}`, backgroundColor: "transparent", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Contact Us</button>
          </div>
        </div>
      </div>

      <PublicFooter navigate={navigate} dark={dark} />
    </div>
  );
}

// ─── Find Lawyer Page ─────────────────────────────────────────────────────────

export function FindLawyerPage({ navigate, dark, toggleDark }: { navigate: (p: Page) => void; dark: boolean; toggleDark: () => void }) {
  const BG = dark ? "#0D1117" : "#F8F4EC";
  const CARDBG = dark ? "#1E2530" : "#FFFFFF";
  const TX = dark ? "#FFFFFF" : "#1A1005";
  const TX2 = dark ? "#B3B3B3" : "#6B5533";
  const GA = dark ? "#D4AF37" : "#8B6514";
  const BD = dark ? "rgba(255,255,255,0.07)" : "rgba(60,30,0,0.09)";
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("All");
  const [city, setCity] = useState("All");
  const areas = ["All", "Constitutional", "Corporate", "IP", "Criminal", "Real Estate", "Family", "Tax"];
  const cities = ["All", "Karachi", "Lahore", "Islamabad"];

  const lawyers = [
    { id: 1, name: "Barrister Ahmad Raza", role: "Managing Partner", spec: "Constitutional Law", city: "Karachi", area: "Constitutional", img: "https://images.unsplash.com/photo-1642522029686-5485ea7e6042?w=400&h=500&fit=crop&auto=format", cases: 340, rating: 4.9, years: 18, rate: 15000, available: true },
    { id: 2, name: "Adv. Zara Sheikh", role: "Senior Partner", spec: "Corporate & IP", city: "Lahore", area: "Corporate", img: "https://images.unsplash.com/photo-1758518727888-ffa196002e59?w=400&h=500&fit=crop&auto=format", cases: 210, rating: 4.8, years: 12, rate: 12000, available: true },
    { id: 3, name: "Omar Malik SC", role: "Senior Counsel", spec: "Criminal Defence", city: "Islamabad", area: "Criminal", img: "https://images.unsplash.com/photo-1771244678811-50c22f17c791?w=400&h=500&fit=crop&auto=format", cases: 155, rating: 4.7, years: 15, rate: 18000, available: false },
    { id: 4, name: "Barrister Ayesha Mirza", role: "Partner", spec: "Family & Personal Law", city: "Karachi", area: "Family", img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=500&fit=crop&auto=format&crop=face", cases: 198, rating: 4.9, years: 14, rate: 10000, available: true },
    { id: 5, name: "Adv. Tariq Hussain", role: "Senior Associate", spec: "Real Estate & Property", city: "Lahore", area: "Real Estate", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop&auto=format", cases: 167, rating: 4.6, years: 10, rate: 9000, available: true },
    { id: 6, name: "Dr. Farrukh Nawaz", role: "Tax Counsel", spec: "Taxation & Revenue", city: "Islamabad", area: "Tax", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&auto=format", cases: 89, rating: 4.5, years: 20, rate: 14000, available: true },
  ];

  const filtered = lawyers.filter(l =>
    (area === "All" || l.area === area) &&
    (city === "All" || l.city === city) &&
    (l.name.toLowerCase().includes(search.toLowerCase()) || l.spec.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ backgroundColor: BG, fontFamily: "Inter, sans-serif", minHeight: "100vh" }}>
      <PublicNav navigate={navigate} dark={dark} toggleDark={toggleDark} />

      {/* Hero search */}
      <div style={{ padding: "64px 24px 48px", textAlign: "center", borderBottom: `1px solid ${BD}` }}>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", marginBottom: 12 }}>Find Your Legal Expert</h1>
        <p style={{ fontSize: 15, color: TX2, marginBottom: 36 }}>Pakistan's top advocates — rated, reviewed, and bookable instantly.</p>
        {/* Search bar */}
        <div style={{ position: "relative", maxWidth: 560, margin: "0 auto 28px" }}>
          <svg style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TX2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or specialization..." style={{ width: "100%", padding: "14px 16px 14px 48px", borderRadius: 14, border: `1px solid ${BD}`, backgroundColor: CARDBG, color: TX, fontSize: 15, outline: "none", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }} />
        </div>
        {/* Filter pills */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 8 }}>
          {areas.map(a => (
            <button key={a} onClick={() => setArea(a)} style={{ padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif", border: `1px solid ${area === a ? GA : BD}`, backgroundColor: area === a ? GA : "transparent", color: area === a ? (dark ? "#0D1117" : "#FFFFFF") : TX2, transition: "all 0.2s" }}>{a}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {cities.map(c => (
            <button key={c} onClick={() => setCity(c)} style={{ padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif", border: `1px solid ${city === c ? BD : BD}`, backgroundColor: city === c ? (dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)") : "transparent", color: city === c ? TX : TX2 }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Lawyer grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ fontSize: 13, color: TX2, marginBottom: 24 }}>{filtered.length} advocates found</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
          {filtered.map(l => (
            <div key={l.id} onClick={() => navigate("lawyer-profile")}
              style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${BD}`, backgroundColor: CARDBG, cursor: "pointer", transition: "transform 0.25s, box-shadow 0.25s", boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 24px rgba(100,70,0,0.08)", position: "relative" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = dark ? "0 24px 60px rgba(0,0,0,0.6)" : "0 24px 48px rgba(100,70,0,0.18)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = dark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 24px rgba(100,70,0,0.08)"; }}>
              {/* Availability badge */}
              <div style={{ position: "absolute", top: 14, right: 14, zIndex: 3, display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, backgroundColor: l.available ? "rgba(52,211,153,0.9)" : "rgba(107,114,128,0.8)", backdropFilter: "blur(8px)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "white" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "white" }}>{l.available ? "Available" : "Busy"}</span>
              </div>
              {/* Portrait photo */}
              <div style={{ height: 260, overflow: "hidden", position: "relative" }}>
                <img src={l.img} alt={l.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 90, background: dark ? "linear-gradient(to top, #1E2530, transparent)" : "linear-gradient(to top, #FFFFFF, transparent)" }} />
              </div>
              {/* Info */}
              <div style={{ padding: "14px 18px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: TX }}>{l.name}</span>
                  <div style={{ width: 15, height: 15, borderRadius: "50%", backgroundColor: "#34D399", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#0D1117" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: GA, fontWeight: 600, marginBottom: 1 }}>{l.role}</div>
                <div style={{ fontSize: 12, color: TX2, marginBottom: 14 }}>{l.spec} · {l.city}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill={GA} stroke={GA} strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      <span style={{ fontSize: 12, fontWeight: 700, color: TX }}>{l.rating}</span>
                    </div>
                    <span style={{ fontSize: 11, color: TX2 }}>{l.cases} cases</span>
                    <span style={{ fontSize: 11, color: TX2 }}>{l.years}y exp</span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: TX }}>PKR {l.rate.toLocaleString()}</span>
                    <span style={{ fontSize: 11, color: TX2 }}>/hr</span>
                  </div>
                  <button style={{ padding: "8px 16px", borderRadius: 10, backgroundColor: GA, color: dark ? "#0D1117" : "#FFFFFF", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PublicFooter navigate={navigate} dark={dark} />
    </div>
  );
}

// ─── Lawyer Profile Page ──────────────────────────────────────────────────────

export function LawyerProfilePage({ navigate, dark, toggleDark }: { navigate: (p: Page) => void; dark: boolean; toggleDark: () => void }) {
  const BG = dark ? "#0D1117" : "#F8F4EC";
  const CARDBG = dark ? "#1E2530" : "#FFFFFF";
  const TX = dark ? "#FFFFFF" : "#1A1005";
  const TX2 = dark ? "#B3B3B3" : "#6B5533";
  const GA = dark ? "#D4AF37" : "#8B6514";
  const BD = dark ? "rgba(255,255,255,0.07)" : "rgba(60,30,0,0.09)";

  const months = ["September", "October", "November", "December", "January"];
  const days = [
    { num: 3, day: "Mon" }, { num: 4, day: "Tue" }, { num: 5, day: "Wed" },
    { num: 6, day: "Thu" }, { num: 7, day: "Fri" }, { num: 8, day: "Sat" }, { num: 9, day: "Sun" },
  ];
  const times = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
  const [selMonth, setSelMonth] = useState(1);
  const [selDay, setSelDay] = useState(2);
  const [selTime, setSelTime] = useState(0);
  const [booked, setBooked] = useState(false);

  const lawyer = {
    name: "Barrister Ahmad Raza",
    spec: "Constitutional Law",
    rating: 4.9,
    img: "https://images.unsplash.com/photo-1642522029686-5485ea7e6042?w=700&h=600&fit=crop&auto=format&crop=top",
    years: 18,
    clients: "340+",
    reviews: "4.9",
    rate: 15000,
  };

  if (booked) {
    return (
      <div style={{ backgroundColor: BG, fontFamily: "Inter, sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", backgroundColor: "#34D399", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 36 }}>✓</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: TX, marginBottom: 12 }}>Appointment Confirmed!</h2>
          <p style={{ color: TX2, marginBottom: 8 }}>{lawyer.name}</p>
          <p style={{ color: GA, fontWeight: 700, marginBottom: 32 }}>{months[selMonth]}, {days[selDay].num} at {times[selTime]}</p>
          <button onClick={() => { setBooked(false); navigate("find-lawyer"); }} style={{ backgroundColor: GA, color: dark ? "#0D1117" : "#FFFFFF", padding: "12px 32px", borderRadius: 12, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Back to Search</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: BG, fontFamily: "Inter, sans-serif", minHeight: "100vh" }}>
      <PublicNav navigate={navigate} dark={dark} toggleDark={toggleDark} />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Back button */}
        <button onClick={() => navigate("find-lawyer")} style={{ display: "flex", alignItems: "center", gap: 8, color: TX2, background: "none", border: "none", cursor: "pointer", fontSize: 14, fontFamily: "Inter, sans-serif", marginBottom: 28 }}>
          ← Back to Search
        </button>

        {/* Profile header card */}
        <div style={{ borderRadius: 28, overflow: "hidden", marginBottom: 24, boxShadow: dark ? "0 32px 80px rgba(0,0,0,0.6)" : "0 32px 60px rgba(100,70,0,0.18)", position: "relative" }}>
          <div style={{ height: 300, position: "relative" }}>
            <img src={lawyer.img} alt={lawyer.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 30%, rgba(13,10,3,0.95) 100%)` }} />
            {/* Back + favorite icons */}
            <div style={{ position: "absolute", top: 20, left: 20, right: 20, display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => navigate("find-lawyer")} style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>←</button>
              <button style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>
            {/* Name + rating at bottom of photo */}
            <div style={{ position: "absolute", bottom: 20, left: 24, right: 24 }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: 26, fontWeight: 900, color: "white", letterSpacing: "-0.03em", marginBottom: 4 }}>{lawyer.name}</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>{lawyer.spec}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={GA} stroke={GA} strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      <span style={{ fontSize: 14, fontWeight: 700, color: GA }}>{lawyer.rating}</span>
                    </div>
                  </div>
                </div>
                {/* Action icons */}
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    <svg key="chat" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
                    <svg key="phone" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
                    <svg key="video" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
                  ].map((icon, i) => (
                    <button key={i} style={{ width: 42, height: 42, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
          {[["⏱", `${lawyer.years} years`, "Experience"], ["👥", lawyer.clients, "Clients"], ["⭐", lawyer.reviews, "Reviews"]].map(([icon, val, label]) => (
            <div key={label as string} style={{ padding: "18px 16px", borderRadius: 16, backgroundColor: CARDBG, border: `1px solid ${BD}`, textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: TX, marginBottom: 2 }}>{val}</div>
              <div style={{ fontSize: 11, color: TX2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Date + Time booking card */}
        <div style={{ borderRadius: 24, overflow: "hidden", backgroundColor: CARDBG, border: `1px solid ${BD}`, padding: "28px", marginBottom: 20, boxShadow: dark ? "0 12px 40px rgba(0,0,0,0.3)" : "0 12px 32px rgba(100,70,0,0.08)" }}>
          {/* Month selector */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: TX, marginBottom: 14 }}>Select Date</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {months.map((m, i) => (
                <button key={m} onClick={() => setSelMonth(i)} style={{ padding: "8px 18px", borderRadius: 999, fontSize: 13, fontWeight: 600, border: `1px solid ${i === selMonth ? GA : BD}`, backgroundColor: i === selMonth ? GA : "transparent", color: i === selMonth ? (dark ? "#0D1117" : "#FFFFFF") : TX2, cursor: "pointer", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>{m}</button>
              ))}
            </div>
            {/* Day picker */}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              {days.map((d, i) => (
                <button key={d.num} onClick={() => setSelDay(i)} style={{ flex: 1, padding: "12px 6px", borderRadius: 14, textAlign: "center", border: `1px solid ${i === selDay ? GA : BD}`, backgroundColor: i === selDay ? GA : "transparent", cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ fontSize: 10, color: i === selDay ? (dark ? "#0D1117" : "#FFFFFF") : TX2, marginBottom: 4, fontWeight: 600 }}>{d.day}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: i === selDay ? (dark ? "#0D1117" : "#FFFFFF") : TX }}>{d.num}</div>
                  {i === selDay && <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: dark ? "#0D1117" : "#FFFFFF", margin: "4px auto 0" }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Time slots */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: TX, marginBottom: 14 }}>Select Time</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {times.map((t, i) => (
                <button key={t} onClick={() => setSelTime(i)} style={{ padding: "10px 8px", borderRadius: 12, fontSize: 12, fontWeight: 600, textAlign: "center", border: `1px solid ${i === selTime ? GA : BD}`, backgroundColor: i === selTime ? `${GA}20` : "transparent", color: i === selTime ? GA : TX2, cursor: "pointer", fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected slot summary */}
        <div style={{ padding: "14px 20px", borderRadius: 14, backgroundColor: `${GA}12`, border: `1px solid ${GA}30`, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 12, color: TX2 }}>Appointment: </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: TX }}>{months[selMonth]} {days[selDay].num} · {times[selTime]}</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: GA }}>PKR {lawyer.rate.toLocaleString()}/hr</span>
        </div>

        {/* Book CTA */}
        <button onClick={() => setBooked(true)} style={{ width: "100%", padding: "18px", borderRadius: 16, backgroundColor: GA, color: dark ? "#0D1117" : "#FFFFFF", fontSize: 16, fontWeight: 800, border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", boxShadow: `0 0 40px ${GA}50`, letterSpacing: "-0.01em" }}>
          Book Consultation — PKR {lawyer.rate.toLocaleString()}/hr
        </button>
      </div>
    </div>
  );
}

// ─── New Public Pages ─────────────────────────────────────────────────────────

export function FeaturesPage({ navigate, dark, toggleDark }: { navigate: (p: Page) => void; dark: boolean; toggleDark: () => void }) {
  const BG = dark ? "#07090F" : "#F4F1EC"; const TX = dark ? "#F0F0F5" : "#0E0A03";
  const TX2 = dark ? "#8892A4" : "#5C4A28"; const GA = dark ? G : "#8B5E0A";
  const BD = dark ? "rgba(255,255,255,0.06)" : "rgba(60,30,0,0.08)";
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
      <PublicNav navigate={navigate} dark={dark} toggleDark={toggleDark} current="features" />
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
        <button onClick={() => navigate("register")} style={{ background: `linear-gradient(135deg,${P},${P}CC)`, color: "#fff", fontSize: 15, fontWeight: 700, padding: "14px 36px", borderRadius: 10, border: "none", cursor: "pointer", boxShadow: `0 8px 32px ${P}40` }}>
          Start Free Trial
        </button>
      </div>
      <PublicFooter navigate={navigate} dark={dark} />
    </div>
  );
}

export function SolutionsPage({ navigate, dark, toggleDark }: { navigate: (p: Page) => void; dark: boolean; toggleDark: () => void }) {
  const BG = dark ? "#07090F" : "#F4F1EC"; const TX = dark ? "#F0F0F5" : "#0E0A03";
  const TX2 = dark ? "#8892A4" : "#5C4A28"; const GA = dark ? G : "#8B5E0A";
  const BD = dark ? "rgba(255,255,255,0.06)" : "rgba(60,30,0,0.08)";
  const CARD = dark ? "#0F1521" : "#FFFFFF";
  const solutions = [
    { title: "Solo Practitioners", icon: "👤", color: GA, desc: "AI-powered research, drafting and prediction tools that give a solo lawyer the horsepower of a full legal team. Level the playing field against large firms.", features: ["Instant case research","AI brief drafting","Outcome prediction","Client portal"] },
    { title: "Law Firms", icon: "🏛️", color: P, desc: "Multi-user workspace with role-based access, shared case libraries, firm-wide analytics and white-label client portals. Built for firms of 5 to 500.", features: ["Team collaboration","Case analytics","Client management","Custom branding"] },
    { title: "Legal Departments", icon: "🏢", color: "#34D399", desc: "Streamline in-house legal operations with contract intelligence, matter tracking, spend analytics and seamless integration with your existing systems.", features: ["Matter tracking","Contract AI","Spend analytics","API integration"] },
    { title: "Law Schools & Academia", icon: "📚", color: "#F87171", desc: "Teach the future of law with live case databases, research tools and AI demonstrations. Special pricing for educational institutions.", features: ["Research library","Teaching tools","Student accounts","Academic pricing"] },
  ];
  return (
    <div style={{ backgroundColor: BG, fontFamily: "Inter, sans-serif", minHeight: "100vh" }}>
      <PublicNav navigate={navigate} dark={dark} toggleDark={toggleDark} current="solutions" />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px 64px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 99, border: `1px solid ${P}40`, background: `${P}10`, marginBottom: 24 }}>
          <Layers size={12} color={P} /><span style={{ fontSize: 11, color: P, fontWeight: 700, letterSpacing: "0.06em" }}>SOLUTIONS</span>
        </div>
        <h1 style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 20 }}>
          Built for every kind of<br /><span style={{ color: P }}>legal professional.</span>
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
            <button onClick={() => navigate("register")} style={{ marginTop: 28, width: "100%", padding: "12px", background: `${s.color}15`, border: `1px solid ${s.color}30`, borderRadius: 10, color: s.color, fontSize: 13.5, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em" }}>
              Get started →
            </button>
          </div>
        ))}
      </div>
      <PublicFooter navigate={navigate} dark={dark} />
    </div>
  );
}

export function BlogPage({ navigate, dark, toggleDark }: { navigate: (p: Page) => void; dark: boolean; toggleDark: () => void }) {
  const BG = dark ? "#07090F" : "#F4F1EC"; const TX = dark ? "#F0F0F5" : "#0E0A03";
  const TX2 = dark ? "#8892A4" : "#5C4A28"; const GA = dark ? G : "#8B5E0A";
  const BD = dark ? "rgba(255,255,255,0.06)" : "rgba(60,30,0,0.08)";
  const CARD = dark ? "#0F1521" : "#FFFFFF";
  const posts = [
    { tag: "AI & Law", title: "How AI is Transforming Courtroom Strategy in Pakistan", excerpt: "A deep dive into how predictive analytics is changing how advocates approach Supreme Court hearings.", date: "Jul 28, 2024", read: "8 min", img: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=600&h=340&fit=crop&auto=format" },
    { tag: "Case Studies", title: "94% Accuracy: How WukaLAW Predicted 47 Consecutive Outcomes", excerpt: "Our AI model's performance analysis across a full quarter of real Pakistani court cases.", date: "Jul 15, 2024", read: "12 min", img: "https://images.unsplash.com/photo-1453945619913-79ec89a82c51?w=600&h=340&fit=crop&auto=format" },
    { tag: "Legal Tech", title: "The Rise of LegalTech in South Asia: Trends for 2024-2025", excerpt: "How Pakistan, India and Bangladesh are embracing AI tools to modernize their legal systems.", date: "Jul 8, 2024", read: "6 min", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=340&fit=crop&auto=format" },
    { tag: "Product", title: "Introducing AI Strategy Assistant: Your AI Co-Counsel", excerpt: "Today we're launching our most powerful feature yet — a real-time strategic advisor trained on Pakistani case law.", date: "Jun 30, 2024", read: "5 min", img: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=340&fit=crop&auto=format" },
    { tag: "Research", title: "Understanding Judicial Bias: Patterns Across Pakistan's High Courts", excerpt: "An empirical analysis of 50,000 decisions reveals significant patterns in judicial decision-making across provinces.", date: "Jun 22, 2024", read: "15 min", img: "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=600&h=340&fit=crop&auto=format" },
    { tag: "Tutorial", title: "Getting Started with WukaLAW: A 10-Minute Walkthrough", excerpt: "From case creation to your first AI prediction — everything you need to know to hit the ground running.", date: "Jun 18, 2024", read: "10 min", img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=340&fit=crop&auto=format" },
  ];
  return (
    <div style={{ backgroundColor: BG, fontFamily: "Inter, sans-serif", minHeight: "100vh" }}>
      <PublicNav navigate={navigate} dark={dark} toggleDark={toggleDark} current="blog" />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 40px" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 99, border: `1px solid ${GA}40`, background: `${GA}10`, marginBottom: 20 }}>
            <BookOpen size={12} color={GA} /><span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: "0.06em" }}>BLOG & RESOURCES</span>
          </div>
          <h1 style={{ fontSize: "clamp(32px,4.5vw,56px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16 }}>Legal AI Insights</h1>
          <p style={{ fontSize: 16, color: TX2, maxWidth: 480, lineHeight: 1.7 }}>Research, tutorials and product updates from the WukaLAW team.</p>
        </div>
        {/* Featured */}
        <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 20, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr", marginBottom: 32 }}>
          <img src={posts[0].img} alt={posts[0].title} style={{ width: "100%", height: 300, objectFit: "cover" }} />
          <div style={{ padding: 40, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: GA, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Featured · {posts[0].tag}</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: TX, lineHeight: 1.3, letterSpacing: "-0.02em", marginBottom: 14 }}>{posts[0].title}</h2>
            <p style={{ fontSize: 14, color: TX2, lineHeight: 1.7, marginBottom: 20 }}>{posts[0].excerpt}</p>
            <div style={{ fontSize: 12, color: TX2 }}>{posts[0].date} · {posts[0].read} read</div>
          </div>
        </div>
        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, paddingBottom: 80 }}>
          {posts.slice(1).map((p, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "transform 0.2s,box-shadow 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 24px 60px rgba(0,0,0,0.2)`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}>
              <img src={p.img} alt={p.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: GA, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{p.tag}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: TX, lineHeight: 1.4, letterSpacing: "-0.01em", marginBottom: 10 }}>{p.title}</div>
                <p style={{ fontSize: 12.5, color: TX2, lineHeight: 1.65, marginBottom: 12 }}>{p.excerpt}</p>
                <div style={{ fontSize: 11, color: TX2 }}>{p.date} · {p.read} read</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <PublicFooter navigate={navigate} dark={dark} />
    </div>
  );
}

export function FAQPage({ navigate, dark, toggleDark }: { navigate: (p: Page) => void; dark: boolean; toggleDark: () => void }) {
  const [open, setOpen] = useState<number | null>(0);
  const BG = dark ? "#07090F" : "#F4F1EC"; const TX = dark ? "#F0F0F5" : "#0E0A03";
  const TX2 = dark ? "#8892A4" : "#5C4A28"; const GA = dark ? G : "#8B5E0A";
  const BD = dark ? "rgba(255,255,255,0.06)" : "rgba(60,30,0,0.08)";
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
      <PublicNav navigate={navigate} dark={dark} toggleDark={toggleDark} />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "96px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 99, border: `1px solid ${GA}40`, background: `${GA}10`, marginBottom: 24 }}>
            <HelpCircle size={12} color={GA} /><span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: "0.06em" }}>FAQ</span>
          </div>
          <h1 style={{ fontSize: "clamp(32px,4.5vw,56px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16 }}>Frequently Asked Questions</h1>
          <p style={{ fontSize: 16, color: TX2, lineHeight: 1.7 }}>Everything you need to know about WukaLAW. Can't find an answer? <button onClick={() => navigate("contact")} style={{ color: GA, background: "none", border: "none", cursor: "pointer", fontWeight: 600, textDecoration: "underline" }}>Talk to our team.</button></p>
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
      <PublicFooter navigate={navigate} dark={dark} />
    </div>
  );
}

export function CareersPage({ navigate, dark, toggleDark }: { navigate: (p: Page) => void; dark: boolean; toggleDark: () => void }) {
  const BG = dark ? "#07090F" : "#F4F1EC"; const TX = dark ? "#F0F0F5" : "#0E0A03";
  const TX2 = dark ? "#8892A4" : "#5C4A28"; const GA = dark ? G : "#8B5E0A";
  const BD = dark ? "rgba(255,255,255,0.06)" : "rgba(60,30,0,0.08)";
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
      <PublicNav navigate={navigate} dark={dark} toggleDark={toggleDark} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 99, border: `1px solid ${P}40`, background: `${P}10`, marginBottom: 24 }}>
            <Users size={12} color={P} /><span style={{ fontSize: 11, color: P, fontWeight: 700, letterSpacing: "0.06em" }}>CAREERS</span>
          </div>
          <h1 style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 20 }}>Join the team building Pakistan's<br /><span style={{ color: P }}>legal future.</span></h1>
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
                <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: `${P}15`, color: P, fontWeight: 600 }}>{j.type}</span>
                <button style={{ fontSize: 13, fontWeight: 700, color: GA, background: "none", border: `1px solid ${GA}40`, padding: "8px 16px", borderRadius: 8, cursor: "pointer" }}>Apply →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <PublicFooter navigate={navigate} dark={dark} />
    </div>
  );
}

export function PrivacyPage({ navigate, dark, toggleDark }: { navigate: (p: Page) => void; dark: boolean; toggleDark: () => void }) {
  const BG = dark ? "#07090F" : "#F4F1EC"; const TX = dark ? "#F0F0F5" : "#0E0A03";
  const TX2 = dark ? "#8892A4" : "#5C4A28"; const GA = dark ? G : "#8B5E0A";
  const BD = dark ? "rgba(255,255,255,0.06)" : "rgba(60,30,0,0.08)";
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
      <PublicNav navigate={navigate} dark={dark} toggleDark={toggleDark} />
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
      <PublicFooter navigate={navigate} dark={dark} />
    </div>
  );
}

export function TermsPage({ navigate, dark, toggleDark }: { navigate: (p: Page) => void; dark: boolean; toggleDark: () => void }) {
  const BG = dark ? "#07090F" : "#F4F1EC"; const TX = dark ? "#F0F0F5" : "#0E0A03";
  const TX2 = dark ? "#8892A4" : "#5C4A28"; const GA = dark ? G : "#8B5E0A";
  const BD = dark ? "rgba(255,255,255,0.06)" : "rgba(60,30,0,0.08)";
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
      <PublicNav navigate={navigate} dark={dark} toggleDark={toggleDark} />
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
      <PublicFooter navigate={navigate} dark={dark} />
    </div>
  );
}

// ─── Auth Pages ───────────────────────────────────────────────────────────────
