// @ts-nocheck -- faithfully imported Figma Make presentation components
/* oxlint-disable -- preserve generated Figma Make source without semantic rewrites */
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Briefcase, FileText, Search, Brain, GitBranch, MessageSquare,
  Cpu, Clock, BarChart2, Bell, User, Settings, Layers, Upload, ChevronRight,
  Star, AlertCircle, CheckCircle, Plus, Filter, MoreHorizontal, ArrowRight,
  Eye, Download, Scale, Gavel, BookOpen, Target, Zap, Activity, Calendar,
  LogOut, X, Menu, Send, Paperclip, Sparkles, Lock, Mail, ChevronLeft, RefreshCw,
  Flag, Award, Users, Lightbulb, Edit2, Trash2, ArrowUpRight, ArrowDownRight,
  Info, Copy, ExternalLink, Check, Building, Globe, TrendingDown, Phone, Hash,
  FolderOpen, Link2, DollarSign, Sun, Moon, CreditCard, UserCheck, Database,
  Key, ShieldCheck, MessageCircle, UsersRound, FileSearch, BarChart, PieChart,
  Wallet, MapPin, AtSign, HelpCircle, BookMarked, ChevronUp, AlertTriangle,
  Sliders, Layers3, Grid3x3, Percent, ArrowLeft, PlayCircle, Pause, RotateCcw,
  Maximize2, TrendingUp, ChevronDown
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

const G  = "#D4AF37";
const P  = "#7C3AED";
const B  = "#60A5FA";
const S  = "#0F1521";
const C  = "#131C2E";
const BG = "#07090F";

type Page = string;
interface NavProps { navigate: (p: Page) => void; current?: Page; }

const CASES = [
  { id:"WL-2024-001",title:"Johnson v. MegaCorp Employment",type:"Employment",status:"Active",priority:"High",prediction:72,attorney:"Sarah Chen",docs:28,deadline:"Apr 20",activity:"2h ago" },
  { id:"WL-2024-002",title:"Smith Property Dispute",type:"Property",status:"Review",priority:"Medium",prediction:58,attorney:"Ali Hassan",docs:15,deadline:"May 5",activity:"1d ago" },
  { id:"WL-2024-003",title:"DataTech LLC IP Dispute",type:"IP",status:"Active",priority:"Critical",prediction:85,attorney:"Sarah Chen",docs:41,deadline:"Mar 20",activity:"30m ago" },
  { id:"WL-2024-004",title:"Rivera Family Trust",type:"Estate",status:"Closed",priority:"Low",prediction:91,attorney:"Michael Torres",docs:22,deadline:"Jan 10",activity:"3d ago" },
  { id:"WL-2024-005",title:"Chen v. City Transport",type:"Civil",status:"Active",priority:"High",prediction:67,attorney:"Sarah Chen",docs:19,deadline:"Apr 15",activity:"5h ago" },
  { id:"WL-2024-006",title:"Rivera Securities Fraud",type:"Criminal",status:"Review",priority:"Critical",prediction:43,attorney:"Ali Hassan",docs:57,deadline:"Mar 28",activity:"1h ago" },
];

const DOCS = [
  { name:"Patent_Filing_PK2019.pdf",type:"PDF",size:"1.8 MB",date:"Jan 20",tag:"Evidence" },
  { name:"Complaint_DataTech.pdf",type:"PDF",size:"2.4 MB",date:"Jan 15",tag:"Pleading" },
  { name:"Expert_Witness_Report.pdf",type:"PDF",size:"4.1 MB",date:"Feb 28",tag:"Evidence" },
  { name:"Source_Code_Analysis.docx",type:"DOCX",size:"890 KB",date:"Feb 10",tag:"Technical" },
  { name:"Revenue_Impact.xlsx",type:"XLSX",size:"1.2 MB",date:"Feb 15",tag:"Financial" },
  { name:"Witness_Statement_1.pdf",type:"PDF",size:"650 KB",date:"Feb 22",tag:"Evidence" },
  { name:"Prior_Art_Search.pdf",type:"PDF",size:"3.2 MB",date:"Mar 1",tag:"Research" },
  { name:"Company_Correspondence.pdf",type:"PDF",size:"980 KB",date:"Jan 30",tag:"Communication" },
];

// ─── Design Utils ────────────────────────────────────────────────────────────

export function SkeletonLine({ w = "100%", h = 12 }: { w?: string | number; h?: number }) {
  return <div className="rounded-md bg-sidebar-accent animate-pulse" style={{ width: w, height: h }} />;
}
export function SkeletonCard({ h = 80 }: { h?: number }) {
  return <div className="rounded-xl bg-card border border-border animate-pulse" style={{ height: h }} />;
}
export function EmptyState({ icon, title, body, action, onAction }: { icon: React.ReactNode; title: string; body: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-8">
      <div className="w-14 h-14 rounded-2xl bg-sidebar-accent border border-border flex items-center justify-center mb-4 text-muted-foreground">{icon}</div>
      <div className="text-base font-bold text-foreground mb-2">{title}</div>
      <div className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">{body}</div>
      {action && <button onClick={onAction} className="px-5 py-2.5 text-sm font-semibold rounded-lg text-white" style={{ background: P }}>{action}</button>}
    </div>
  );
}
export function AIBadge({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: `${P}18`, border: `1px solid ${P}30`, color: P }}>
      <Sparkles size={9} /> {text}
    </div>
  );
}
export function ConfidenceMeter({ value, label, color = G }: { value: number; label: string; color?: string }) {
  const r = 38, circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ position: "relative", width: 96, height: 96 }}>
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease", filter: `drop-shadow(0 0 6px ${color}80)` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span className="text-xl font-black text-foreground" style={{ letterSpacing: "-0.03em", color }}>{value}%</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}
export function Tag({ children, color = G }: { children: React.ReactNode; color?: string }) {
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>{children}</span>;
}
export function StatusDot({ status }: { status: "Active"|"Closed"|"Review"|"Pending"|"Won"|"Lost" }) {
  const map = { Active:"#34D399", Closed:"#8892A4", Review:G, Pending:"#60A5FA", Won:"#34D399", Lost:"#F87171" };
  return <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: map[status] }}>
    <span style={{ width:6, height:6, borderRadius:"50%", background:map[status], display:"inline-block", flexShrink:0 }} />{status}
  </span>;
}
// ─── Client Portal — Shared Layout ───────────────────────────────────────────

export function CPLayout({ nav, current, children, rightPanel, navigate }: {
  nav?: React.ReactNode; current: Page; children: React.ReactNode;
  rightPanel?: React.ReactNode; navigate: (p: Page) => void;
}) {
  return (
    <div className="flex h-full overflow-hidden">
      {nav}
      <div className="flex-1 overflow-y-auto bg-background">{children}</div>
      {rightPanel && (
        <div className="w-72 flex-shrink-0 border-l border-border bg-sidebar overflow-y-auto">{rightPanel}</div>
      )}
    </div>
  );
}

// ─── Client Dashboard ─────────────────────────────────────────────────────────

export function CPDashboardPageV2({ navigate }: NavProps) {
  const recentActivity = [
    { icon: <Brain size={13} color={P} />, text: "AI prediction updated: 85% win probability", time: "2m ago", bg: `${P}15` },
    { icon: <FileText size={13} color={G} />, text: "3 new documents added by Sarah Chen", time: "1h ago", bg: `${G}15` },
    { icon: <Calendar size={13} color="#34D399" />, text: "Hearing scheduled: Mar 20 at 2:00 PM", time: "3h ago", bg: "#34D39918" },
    { icon: <AlertCircle size={13} color="#F87171" />, text: "Action required: Sign affidavit by Mar 10", time: "5h ago", bg: "#F8717115" },
  ];
  const upcomingEvents = [
    { date: "Mar 15", label: "Trial Date", case: "WL-2024-001", type: "hearing", color: P },
    { date: "Mar 20", label: "Arguments", case: "WL-2024-003", type: "hearing", color: G },
    { date: "Mar 22", label: "Doc Deadline", case: "WL-2024-001", type: "deadline", color: "#F87171" },
    { date: "Apr 5", label: "Hearing", case: "WL-2024-006", type: "hearing", color: "#34D399" },
  ];
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Good morning</div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Ahmed Hassan <span className="text-muted-foreground font-normal">👋</span></h1>
          <p className="text-sm text-muted-foreground mt-1">You have <span className="text-foreground font-semibold">2 active cases</span> and <span style={{ color: G }} className="font-semibold">1 upcoming hearing</span> this week.</p>
        </div>
        <button onClick={() => navigate("cp-workspace")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: `linear-gradient(135deg,${P},${P}CC)`, boxShadow: `0 6px 24px ${P}40` }}>
          <Layers size={15} /> Open Workspace
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Cases", value: "2", delta: "Both progressing", icon: <Briefcase size={16} color={P} />, color: P },
          { label: "Win Probability", value: "85%", delta: "+3% this week", icon: <Brain size={16} color={G} />, color: G },
          { label: "Next Hearing", value: "6 days", delta: "Mar 15, 2024", icon: <Calendar size={16} color="#34D399" />, color: "#34D399" },
          { label: "Documents", value: "41", delta: "+3 new this week", icon: <FileText size={16} color="#60A5FA" />, color: "#60A5FA" },
        ].map((k, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-primary/20 transition-colors cursor-pointer">
            <div className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.color}15` }}>{k.icon}</div>
            <div className="text-xs text-muted-foreground mb-2 font-medium">{k.label}</div>
            <div className="text-2xl font-black text-foreground mb-1" style={{ letterSpacing: "-0.03em", color: k.color }}>{k.value}</div>
            <div className="text-xs text-muted-foreground">{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Active Cases */}
        <div className="col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <span className="font-bold text-foreground">Active Cases</span>
            <button onClick={() => navigate("cp-cases")} className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">View all <ChevronRight size={12} /></button>
          </div>
          {CASES.slice(0, 3).map((c, i) => (
            <div key={i} onClick={() => navigate("cp-workspace")}
              className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-sidebar-accent transition-colors cursor-pointer">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground font-mono">{c.id}</span>
                  <StatusDot status={c.status as any} />
                </div>
                <div className="font-semibold text-foreground text-sm truncate">{c.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.type} · {c.attorney} · {c.activity}</div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <ConfidenceMeter value={c.prediction} label="" color={c.prediction > 75 ? G : P} />
              </div>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Upcoming */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border font-bold text-foreground text-sm">Upcoming Events</div>
            <div className="p-3 flex flex-col gap-2">
              {upcomingEvents.map((e, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-sidebar-accent transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-center" style={{ background: `${e.color}15` }}>
                    <div className="text-[8px] font-bold uppercase" style={{ color: e.color }}>{e.date.split(" ")[0]}</div>
                    <div className="text-sm font-black leading-none" style={{ color: e.color }}>{e.date.split(" ")[1]}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">{e.label}</div>
                    <div className="text-[10px] text-muted-foreground">{e.case}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border font-bold text-foreground text-sm">Recent Activity</div>
            <div className="p-3 flex flex-col gap-2">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: a.bg }}>{a.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-foreground leading-relaxed">{a.text}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── My Cases ────────────────────────────────────────────────────────────────

export function CPCasesPageV2({ navigate }: NavProps) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const tabs = ["All", "Active", "Review", "Closed"];
  const filtered = CASES.filter(c =>
    (filter === "All" || c.status === filter) &&
    (c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">My Cases</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{CASES.length} total cases · {CASES.filter(c => c.status === "Active").length} active</p>
        </div>
        <button onClick={() => navigate("cp-upload")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: `linear-gradient(135deg,${P},${P}CC)` }}>
          <Upload size={14} /> Upload Documents
        </button>
      </div>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases…"
            className="w-full pl-8 pr-4 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground outline-none focus:border-primary/40 transition-colors" />
        </div>
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
          {tabs.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={filter === t ? { background: P, color: "#fff" } : { color: "var(--muted-foreground)" }}>
              {t}
            </button>
          ))}
        </div>
      </div>
      {/* Case Cards */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <EmptyState icon={<Briefcase size={22} />} title="No cases found" body="Try adjusting your search or filter." />
        ) : filtered.map((c, i) => (
          <div key={i} onClick={() => navigate("cp-workspace")}
            className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-mono text-muted-foreground">{c.id}</span>
                  <StatusDot status={c.status as any} />
                  <Tag color={c.priority === "Critical" ? "#F87171" : c.priority === "High" ? G : "#8892A4"}>{c.priority}</Tag>
                  <Tag color="#60A5FA">{c.type}</Tag>
                </div>
                <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors mb-2 truncate">{c.title}</h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><User size={11} />{c.attorney}</span>
                  <span className="flex items-center gap-1"><FileText size={11} />{c.docs} docs</span>
                  <span className="flex items-center gap-1"><Calendar size={11} />Due {c.deadline}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />{c.activity}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <ConfidenceMeter value={c.prediction} label="Win%" color={c.prediction > 75 ? G : c.prediction > 60 ? "#FBBF24" : "#F87171"} />
                <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-3">
              <div className="text-xs text-muted-foreground">Case progress</div>
              <div className="flex-1 h-1.5 bg-sidebar-accent rounded-full overflow-hidden">
                <div style={{ width: `${c.prediction}%`, height: "100%", background: `linear-gradient(90deg,${P},${G})`, borderRadius: 99 }} />
              </div>
              <div className="text-xs font-semibold" style={{ color: G }}>{c.prediction}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Case Workspace (FLAGSHIP — 3-panel layout) ───────────────────────────────

export function CPWorkspacePage({ navigate }: NavProps) {
  const [activeTab, setActiveTab] = useState<"overview"|"documents"|"evidence"|"timeline"|"strategy">("overview");
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { role: "ai" as const, text: "I've analyzed all 41 documents for WL-2024-003. The case looks strong — 85% win probability. Your key advantage is the novelty of the patent filing date. What would you like to know?" },
    { role: "user" as const, text: "What are the biggest risks I should be aware of?" },
    { role: "ai" as const, text: "The 3 main risks are:\n\n1. **Prior art challenge** — Defendant may argue prior art exists within 14 days of your filing. Probability: 68%.\n\n2. **Judge Wells' history** — She has ruled against software patents in 3 of 7 recent cases. Recommend emphasizing functional novelty over technical novelty.\n\n3. **Expert witness credibility** — Dr. Morse's previous case had challenged methodology. Consider bringing a second expert.\n\nOverall: these risks are manageable with the right strategy." },
  ]);
  const caseData = CASES[2]; // DataTech IP Dispute

  const tabs = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={13} /> },
    { id: "documents", label: "Documents", icon: <FileText size={13} /> },
    { id: "evidence", label: "Evidence", icon: <FileSearch size={13} /> },
    { id: "timeline", label: "Timeline", icon: <Clock size={13} /> },
    { id: "strategy", label: "AI Strategy", icon: <Sparkles size={13} /> },
  ];

  const sendAI = () => {
    if (!aiInput.trim()) return;
    const q = aiInput; setAiInput("");
    setAiMessages(m => [...m,
      { role: "user", text: q },
      { role: "ai", text: "Based on my analysis of WL-2024-003, " + q.toLowerCase().includes("hearing") ? "the next hearing is March 20 at 2:00 PM before Justice A. Khan. I recommend preparing your opening arguments around the functional uniqueness doctrine." : "I can provide more detailed analysis on this point. The key factors to consider are the evidence strength (94%), precedent alignment (78%), and the judge's historical rulings in similar IP cases." }
    ]);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Case Nav */}
      <div className="w-48 flex-shrink-0 border-r border-border bg-sidebar flex flex-col">
        <div className="px-3 py-4 border-b border-border">
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Case</div>
          <div className="text-xs font-bold text-foreground leading-tight">{caseData.title}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{caseData.id}</div>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          {[
            { id:"overview",label:"Overview",icon:<LayoutDashboard size={14}/> },
            { id:"documents",label:"Documents",icon:<FileText size={14}/>,badge:41 },
            { id:"evidence",label:"Evidence",icon:<FileSearch size={14}/>,badge:8 },
            { id:"timeline",label:"Timeline",icon:<Clock size={14}/> },
            { id:"strategy",label:"AI Strategy",icon:<Sparkles size={14}/> },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all mb-0.5"
              style={activeTab === item.id ? { background: `${P}18`, color: P, fontWeight: 600 } : { color: "var(--muted-foreground)" }}>
              <span style={activeTab === item.id ? { color: P } : {}}>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {(item as any).badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${P}20`, color: P }}>{(item as any).badge}</span>}
            </button>
          ))}
          <div className="mt-4 pt-3 border-t border-border space-y-0.5">
            {[
              { id:"cp-predictions",label:"AI Prediction",icon:<Brain size={14}/> },
              { id:"cp-similar",label:"Similar Cases",icon:<GitBranch size={14}/> },
              { id:"cp-explainable",label:"Explainable AI",icon:<Cpu size={14}/> },
              { id:"cp-report-gen",label:"Reports",icon:<BarChart2 size={14}/> },
            ].map(item => (
              <button key={item.id} onClick={() => navigate(item.id as Page)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all">
                {item.icon}<span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
        <div className="p-3 border-t border-border">
          <button onClick={() => navigate("cp-cases")} className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5">
            <ArrowLeft size={12} /> All Cases
          </button>
        </div>
      </div>

      {/* Center Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Case Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-background flex-shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{caseData.title}</span>
                <StatusDot status="Active" />
                <Tag color="#F87171">Critical</Tag>
              </div>
              <div className="text-xs text-muted-foreground">{caseData.id} · {caseData.type} · {caseData.attorney}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("cp-upload")} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <Upload size={12} /> Upload
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <Download size={12} /> Export
            </button>
            <button className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg text-white" style={{ background: `linear-gradient(135deg,${P},${P}CC)` }}>
              <Sparkles size={12} /> AI Analysis
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-0 px-5 border-b border-border bg-background flex-shrink-0">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)}
              className="flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all"
              style={activeTab === t.id
                ? { borderColor: P, color: P }
                : { borderColor: "transparent", color: "var(--muted-foreground)" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "overview" && (
            <div className="grid grid-cols-2 gap-4">
              {/* Case Summary */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4"><AIBadge text="AI Summary" /><span className="text-sm font-bold text-foreground">Case Overview</span></div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  DataTech LLC filed a patent infringement claim against InfoSys Corp regarding software patent #PK-2019-4821. The patent covers a novel method of real-time data synchronization with a unique 14-day filing priority advantage. Current win probability stands at <strong style={{ color: G }}>85%</strong> following the submission of the expert witness report.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[["Filed","Jan 15, 2024"],["Court","Supreme Court"],["Judge","J. A. Khan"],["Next Hearing","Mar 20, 2024"],["Attorney","Sarah Chen"],["Docs","41 files"]].map(([k,v])=>(
                    <div key={k} className="flex justify-between py-2 border-b border-border last:border-0">
                      <span className="text-muted-foreground">{k}</span><span className="font-semibold text-foreground">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Win Probability */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-foreground">AI Court Prediction</span>
                  <AIBadge text="94.2% accurate" />
                </div>
                <div className="flex items-center justify-around mb-6">
                  <ConfidenceMeter value={85} label="Win Probability" color={G} />
                  <div className="h-20 w-px bg-border" />
                  <div className="text-center">
                    <div className="text-3xl font-black mb-1" style={{ color: P, letterSpacing: "-0.04em" }}>47</div>
                    <div className="text-xs text-muted-foreground">Similar Cases Found</div>
                    <div className="text-xs font-semibold mt-1" style={{ color: "#34D399" }}>82% plaintiff wins</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {[["Evidence Strength", 94, G],["Precedent Alignment", 78, P],["Procedural Compliance", 91, "#34D399"],["Judge Affinity", 68, "#60A5FA"]].map(([l,v,c])=>(
                    <div key={String(l)} className="flex items-center gap-3">
                      <div className="text-xs text-muted-foreground w-36 flex-shrink-0">{l}</div>
                      <div className="flex-1 h-1.5 bg-sidebar-accent rounded-full overflow-hidden">
                        <div style={{ width: `${v}%`, height: "100%", background: c as string, borderRadius: 99, transition: "width 1s ease" }} />
                      </div>
                      <div className="text-xs font-bold w-8 text-right" style={{ color: c as string }}>{v}%</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Key Milestones */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="text-sm font-bold text-foreground mb-4">Key Milestones</div>
                <div className="flex flex-col gap-0">
                  {[
                    { done:true, label:"Case Filed", date:"Jan 15", note:"Complaint submitted to Supreme Court" },
                    { done:true, label:"Documents Submitted", date:"Feb 1", note:"41 documents uploaded & indexed" },
                    { done:true, label:"Expert Witness Confirmed", date:"Feb 28", note:"Dr. Alan Morse — patent validity" },
                    { done:false, label:"Discovery Deadline", date:"Mar 10", note:"Final evidence submission", urgent:true },
                    { done:false, label:"Trial Date", date:"Mar 20", note:"Before Justice A. Khan" },
                    { done:false, label:"Expected Ruling", date:"Apr 15", note:"AI predicted timeline" },
                  ].map((m,i)=>(
                    <div key={i} className="flex gap-3 pb-4 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: m.done ? "#34D399" : (m as any).urgent ? "#F87171" : `${P}20`, border: `2px solid ${m.done ? "#34D399" : (m as any).urgent ? "#F87171" : P}` }}>
                          {m.done ? <Check size={10} color="#07090F" /> : <div style={{ width:6,height:6,borderRadius:"50%",background:(m as any).urgent?"#F87171":P }} />}
                        </div>
                        {i < 5 && <div className="w-px flex-1 mt-1" style={{ background: m.done ? "#34D399" : "var(--border)", minHeight: 16 }} />}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">{m.label}</span>
                          <span className="text-[10px] text-muted-foreground">{m.date}</span>
                          {(m as any).urgent && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background:"#F8717118",color:"#F87171" }}>URGENT</span>}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{m.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Recent Documents */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-foreground">Recent Documents</span>
                  <button onClick={() => setActiveTab("documents")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">View all <ChevronRight size={11} /></button>
                </div>
                <div className="flex flex-col gap-2">
                  {DOCS.slice(0, 5).map((d, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-sidebar-accent transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: d.type === "PDF" ? "#F8717115" : `${P}15` }}>
                        <FileText size={13} color={d.type === "PDF" ? "#F87171" : P} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">{d.name}</div>
                        <div className="text-[10px] text-muted-foreground">{d.size} · {d.date}</div>
                      </div>
                      <Tag color={d.tag === "Pleading" ? P : d.tag === "Evidence" ? G : "#60A5FA"}>{d.tag}</Tag>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold text-foreground">41 Documents</div>
                <button onClick={() => navigate("cp-upload")} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg text-white" style={{ background: P }}>
                  <Upload size={12} /> Upload
                </button>
              </div>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-xs text-muted-foreground">
                    {["Document","Type","Size","Added","Tag",""].map(h => <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>)}
                  </tr></thead>
                  <tbody>{DOCS.map((d, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-sidebar-accent transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: d.type === "PDF" ? "#F8717115" : `${P}15` }}>
                            <FileText size={12} color={d.type === "PDF" ? "#F87171" : P} />
                          </div>
                          <span className="text-xs font-medium text-foreground">{d.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{d.type}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{d.size}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{d.date}</td>
                      <td className="px-4 py-3"><Tag color={d.tag === "Pleading" ? P : d.tag === "Evidence" ? G : "#60A5FA"}>{d.tag}</Tag></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="text-muted-foreground hover:text-foreground transition-colors"><Eye size={13} /></button>
                          <button className="text-muted-foreground hover:text-foreground transition-colors"><Download size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "evidence" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-bold text-foreground">Evidence Analysis</div>
                  <div className="text-xs text-muted-foreground">8 pieces of evidence · AI-analyzed</div>
                </div>
                <AIBadge text="AI Analyzed" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name:"Patent Filing #PK-2019-4821", strength:94, type:"Patent Document", status:"Strong", note:"14-day priority window confirmed by USPTO records" },
                  { name:"Expert Witness Report — Dr. Morse", strength:88, type:"Expert Opinion", status:"Strong", note:"PhD Computer Science, 12 years patent litigation experience" },
                  { name:"Source Code Comparison Analysis", strength:76, type:"Technical Evidence", status:"Moderate", note:"87% similarity score confirmed by 3 independent reviewers" },
                  { name:"Prior Art Search Results", strength:62, type:"Counter Evidence", status:"Weak", note:"Defendant's prior art claim has 3 material distinctions" },
                  { name:"Revenue Impact Analysis", strength:91, type:"Financial Evidence", status:"Strong", note:"PKR 24M annual revenue directly attributed to the patent" },
                  { name:"Witness Testimonies (3)", strength:70, type:"Witness Evidence", status:"Moderate", note:"Corroborating accounts of independent development" },
                ].map((e, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-foreground truncate mb-1">{e.name}</div>
                        <div className="text-[10px] text-muted-foreground">{e.type}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
                        style={{ background: e.status==="Strong"?"#34D39918":e.status==="Moderate"?`${G}18`:"#F8717118", color: e.status==="Strong"?"#34D399":e.status==="Moderate"?G:"#F87171" }}>
                        {e.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-1.5 bg-sidebar-accent rounded-full overflow-hidden">
                        <div style={{ width:`${e.strength}%`,height:"100%",background:e.status==="Strong"?"#34D399":e.status==="Moderate"?G:"#F87171",borderRadius:99 }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color:e.status==="Strong"?"#34D399":e.status==="Moderate"?G:"#F87171" }}>{e.strength}%</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{e.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="text-sm font-bold text-foreground">Case Timeline</div>
                <AIBadge text="AI Predictions included" />
              </div>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                <div className="flex flex-col gap-0">
                  {[
                    { date:"Apr 15, 2024",label:"Expected Ruling",desc:"AI predicted outcome based on court scheduling patterns",type:"predicted",color:P },
                    { date:"Mar 20, 2024",label:"Trial Date",desc:"Arguments before Justice A. Khan — Supreme Court",type:"upcoming",color:G },
                    { date:"Mar 10, 2024",label:"Discovery Deadline",desc:"Final submission of all discovery materials",type:"deadline",color:"#F87171" },
                    { date:"Mar 5, 2024",label:"Expert Witness Deposition",desc:"Dr. Alan Morse deposition — DataTech patent validity",type:"scheduled",color:"#60A5FA" },
                    { date:"Feb 28, 2024",label:"Expert Report Filed",desc:"Expert witness report submitted, increasing win probability to 85%",type:"done",color:"#34D399" },
                    { date:"Feb 20, 2024",label:"Preliminary Injunction Denied",desc:"Court denied DataTech preliminary injunction motion",type:"done",color:"#8892A4" },
                    { date:"Jan 15, 2024",label:"Case Filed",desc:"DataTech LLC IP Dispute initiated — WL-2024-003",type:"done",color:"#34D399" },
                  ].map((e,i)=>(
                    <div key={i} className="flex gap-5 pb-6 last:pb-0 relative">
                      <div className="w-10 flex-shrink-0 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center z-10 relative border-2"
                          style={{ background: e.type==="done"?"#34D39918":e.type==="predicted"?`${P}15`:e.type==="deadline"?"#F8717115":`${e.color}15`, borderColor: e.color }}>
                          {e.type==="done"?<Check size={14} color="#34D399"/>:e.type==="predicted"?<Brain size={14} color={P}/>:e.type==="deadline"?<AlertCircle size={14} color="#F87171"/>:<Clock size={14} color={e.color}/>}
                        </div>
                      </div>
                      <div className="flex-1 pt-1.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-foreground">{e.label}</span>
                          {e.type==="predicted" && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background:`${P}18`,color:P }}>AI PREDICTED</span>}
                          {e.type==="deadline" && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background:"#F8717115",color:"#F87171" }}>URGENT</span>}
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">{e.desc}</div>
                        <div className="text-[10px] font-semibold" style={{ color:e.color }}>{e.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "strategy" && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <AIBadge text="AI Generated Strategy" />
                <span className="text-sm font-bold text-foreground">Recommended Legal Strategy</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { priority:"P1",title:"Lead with Functional Uniqueness",confidence:92,type:"Argument",detail:"Judge Wells has ruled in favor of functional uniqueness in 8 of 12 recent software patent cases. Build opening arguments around Section 14 of the Patents Ordinance 2000 — specifically the 'novel function' clause rather than technical novelty." },
                  { priority:"P2",title:"Pre-empt Prior Art Challenge",confidence:87,type:"Defense",detail:"Defendant has raised prior art challenges in 3 of their last 5 IP cases. File a proactive expert witness statement from Dr. Morse establishing the 14-day filing priority window before defendant's counter-argument." },
                  { priority:"P3",title:"Quantify Economic Damages",confidence:81,type:"Damages",detail:"Statistical analysis shows 34% higher damages awards when future revenue impact is quantified with an independent financial expert. Commission a PKR 24M forward revenue model." },
                  { priority:"P4",title:"Highlight Defendant's Filing Gap",confidence:74,type:"Argument",detail:"The defendant's competing product was released 47 days after DataTech's patent filing — well within the exclusivity window. This timeline should be visualized clearly for the bench." },
                ].map((s,i)=>(
                  <div key={i} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded-lg" style={{ background:`${P}20`,color:P }}>{s.priority}</span>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{s.type}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-sidebar-accent rounded-full overflow-hidden"><div style={{ width:`${s.confidence}%`,height:"100%",background:G,borderRadius:99 }} /></div>
                        <span className="text-xs font-bold" style={{ color:G }}>{s.confidence}%</span>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-foreground mb-2">{s.title}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right AI Panel */}
      <div className="w-80 flex-shrink-0 border-l border-border bg-sidebar flex flex-col">
        {/* AI Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg,${P},${P}CC)` }}>
            <Sparkles size={14} color="#fff" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">WukaLAW AI</div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" /> Online · WL-2024-003
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="px-3 py-3 border-b border-border">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">AI Insights</div>
          <div className="flex flex-col gap-1.5">
            {[
              { icon:<TrendingUp size={11} color="#34D399"/>,text:"Win probability increased 3% after expert report",color:"#34D399" },
              { icon:<AlertCircle size={11} color="#F87171"/>,text:"Discovery deadline in 8 days — action required",color:"#F87171" },
              { icon:<Brain size={11} color={P}/>,text:"47 similar cases found with 82% plaintiff win rate",color:P },
              { icon:<Target size={11} color={G}/>,text:"Judge Wells favors functional uniqueness arguments",color:G },
            ].map((ins,i)=>(
              <div key={i} className="flex items-start gap-2 p-2 rounded-xl" style={{ background:`${ins.color}08` }}>
                <div className="mt-0.5 flex-shrink-0">{ins.icon}</div>
                <div className="text-[11px] text-foreground leading-relaxed">{ins.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Actions */}
        <div className="px-3 py-3 border-b border-border">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Suggested Actions</div>
          <div className="flex flex-col gap-1.5">
            {[
              "Review discovery deadline (Mar 10)",
              "Upload missing affidavit",
              "Schedule pre-hearing meeting",
              "Review Dr. Morse deposition prep",
            ].map((a,i)=>(
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer group">
                <div className="w-4 h-4 rounded-full border border-border flex-shrink-0 group-hover:border-primary transition-colors" />
                <span className="text-[11px] text-foreground">{a}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Chat */}
        <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
          {aiMessages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-[11px] leading-relaxed ${m.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                style={m.role === "user" ? { background: P, color: "#fff" } : { background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
                {m.text.split("\n").map((line, j) => (
                  <span key={j}>{line}{j < m.text.split("\n").length - 1 && <br />}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* AI Input */}
        <div className="px-3 py-3 border-t border-border">
          <div className="flex items-end gap-2 bg-card border border-border rounded-xl px-3 py-2.5">
            <textarea value={aiInput} onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAI(); } }}
              placeholder="Ask anything about this case…" rows={2}
              className="flex-1 text-xs bg-transparent text-foreground placeholder-muted-foreground outline-none resize-none leading-relaxed" />
            <button onClick={sendAI} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: aiInput.trim() ? P : "var(--sidebar-accent)" }}>
              <Send size={12} color={aiInput.trim() ? "#fff" : "var(--muted-foreground)"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Upload Documents ─────────────────────────────────────────────────────────

export function CPUploadPage({ navigate }: NavProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState<string[]>([]);
  const [uploaded, setUploaded] = useState<string[]>([]);

  const handleDrop = () => {
    const files = ["Contract_Amendment.pdf","Witness_Statement.docx","Financial_Records.xlsx"];
    setUploading(files);
    setTimeout(() => { setUploaded(files); setUploading([]); }, 2200);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground tracking-tight mb-1">Upload Documents</h1>
        <p className="text-sm text-muted-foreground">Files are encrypted, auto-indexed and analyzed by AI upon upload.</p>
      </div>

      {/* Drop zone */}
      <div onClick={handleDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
        className="border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all mb-6"
        style={{ borderColor: dragging ? P : "var(--border)", background: dragging ? `${P}08` : "var(--card)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${P}15` }}>
          <Upload size={28} color={P} />
        </div>
        <div className="text-base font-bold text-foreground mb-2">Drop files here or click to browse</div>
        <div className="text-sm text-muted-foreground">PDF, DOCX, XLSX, JPG, PNG — up to 50MB per file</div>
      </div>

      {/* Uploading states */}
      {uploading.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4 mb-4 flex flex-col gap-3">
          <div className="text-sm font-bold text-foreground mb-2">Uploading…</div>
          {uploading.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${P}15` }}><FileText size={14} color={P} /></div>
              <div className="flex-1">
                <div className="text-xs font-medium text-foreground mb-1">{f}</div>
                <div className="h-1.5 bg-sidebar-accent rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ background: `linear-gradient(90deg,${P},${G})`, animation: "wk-loader-bar 2s ease forwards" }} />
                </div>
              </div>
              <RefreshCw size={13} className="text-muted-foreground animate-spin" />
            </div>
          ))}
        </div>
      )}

      {/* Uploaded success */}
      {uploaded.length > 0 && (
        <div className="bg-card border rounded-2xl p-4 mb-4 flex flex-col gap-3" style={{ borderColor: "#34D39940" }}>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} color="#34D399" />
            <div className="text-sm font-bold text-foreground">Upload complete! AI is analyzing your documents…</div>
          </div>
          {uploaded.map((f, i) => (
            <div key={i} className="flex items-center gap-3 py-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#34D39918" }}><Check size={12} color="#34D399" /></div>
              <div className="flex-1 text-xs text-foreground">{f}</div>
              <AIBadge text="Indexed" />
            </div>
          ))}
        </div>
      )}

      {/* Select Case */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="text-sm font-bold text-foreground mb-3">Attach to Case</div>
        <div className="flex flex-col gap-2">
          {CASES.slice(0, 3).map((c, i) => (
            <label key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 transition-colors cursor-pointer">
              <input type="radio" name="case" defaultChecked={i === 2} className="accent-purple-600" />
              <div>
                <div className="text-xs font-semibold text-foreground">{c.title}</div>
                <div className="text-[10px] text-muted-foreground">{c.id} · {c.status}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Evidence Management ──────────────────────────────────────────────────────

export function CPEvidencePageV2({ navigate }: NavProps) {
  const evidence = [
    { name:"Patent Filing #PK-2019-4821",type:"Patent",strength:94,status:"Strong",added:"Jan 20",aiNote:"Primary evidence — confirms novel filing date. High admissibility." },
    { name:"Expert Witness Report — Dr. Morse",type:"Expert",strength:88,status:"Strong",added:"Feb 28",aiNote:"Credible expert. Previous methodology challenged in unrelated case — mitigate proactively." },
    { name:"Source Code Comparison",type:"Technical",strength:76,status:"Moderate",added:"Feb 10",aiNote:"87% similarity score. Independent verification recommended." },
    { name:"Revenue Impact Analysis",type:"Financial",strength:91,status:"Strong",added:"Feb 15",aiNote:"PKR 24M economic impact well-documented. Recommend quantifying forward projections." },
    { name:"Prior Art Search (Defendant)",type:"Counter",strength:62,status:"Weak",added:"Mar 1",aiNote:"3 material distinctions undermine defendant's prior art claim." },
    { name:"Witness Testimonies (3)",type:"Witness",strength:70,status:"Moderate",added:"Feb 25",aiNote:"Corroborating accounts. One witness has conflict of interest — note for cross-examination." },
    { name:"Company Correspondence",type:"Communication",strength:85,status:"Strong",added:"Jan 30",aiNote:"Email chain confirms independent development process." },
    { name:"Financial Statements 2019-2023",type:"Financial",strength:79,status:"Moderate",added:"Feb 5",aiNote:"Shows revenue directly tied to patented technology. Audited records preferred." },
  ];
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Evidence Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">8 pieces · AI-analyzed · WL-2024-003</p>
        </div>
        <div className="flex items-center gap-2">
          <AIBadge text="All analyzed" />
          <button onClick={() => navigate("cp-upload")} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white" style={{ background: P }}>
            <Upload size={12} /> Add Evidence
          </button>
        </div>
      </div>
      {/* Overall strength */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[["Overall Strength","84%",G],["Strong Evidence","5/8","#34D399"],["AI Risk Flags","2","#F87171"],["Admissibility","96%",P]].map(([l,v,c])=>(
          <div key={String(l)} className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="text-xs text-muted-foreground mb-2">{l}</div>
            <div className="text-2xl font-black" style={{ color:c as string, letterSpacing:"-0.04em" }}>{v}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {evidence.map((e, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/20 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: e.status==="Strong"?"#34D39915":e.status==="Moderate"?`${G}15`:"#F8717115" }}>
                {e.type==="Patent"?<BookOpen size={16} color={G}/>:e.type==="Expert"?<User size={16} color={P}/>:e.type==="Financial"?<DollarSign size={16} color="#34D399"/>:<FileText size={16} color="#60A5FA"/>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground text-sm">{e.name}</span>
                  <Tag color={e.status==="Strong"?"#34D399":e.status==="Moderate"?G:"#F87171"}>{e.status}</Tag>
                  <Tag color="#60A5FA">{e.type}</Tag>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 max-w-48 h-1.5 bg-sidebar-accent rounded-full overflow-hidden">
                    <div style={{ width:`${e.strength}%`,height:"100%",background:e.status==="Strong"?"#34D399":e.status==="Moderate"?G:"#F87171",borderRadius:99 }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color:e.status==="Strong"?"#34D399":e.status==="Moderate"?G:"#F87171" }}>{e.strength}% strength</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Sparkles size={10} color={P} className="mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{e.aiNote}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground">{e.added}</span>
                <button className="text-muted-foreground hover:text-foreground transition-colors"><Eye size={14} /></button>
                <button className="text-muted-foreground hover:text-foreground transition-colors"><Download size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AI Summary ───────────────────────────────────────────────────────────────

export function CPAISummaryPage({ navigate }: NavProps) {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1400); return () => clearTimeout(t); }, []);
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <AIBadge text="AI Generated" />
        <h1 className="text-xl font-bold text-foreground tracking-tight">AI Case Summary</h1>
      </div>
      {loading ? (
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-sidebar-accent animate-pulse" />
              <SkeletonLine w={200} h={14} />
            </div>
            {[80,95,70,88,60].map((w,i) => <div key={i} className="mb-2"><SkeletonLine w={`${w}%`} h={10} /></div>)}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <SkeletonCard key={i} h={120} />)}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Executive Summary */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${P}15` }}><Brain size={16} color={P} /></div>
                <span className="font-bold text-foreground">Executive Summary</span>
              </div>
              <span className="text-xs text-muted-foreground">Generated Mar 5, 2024</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed mb-4">
              DataTech LLC's intellectual property case (WL-2024-003) presents a <span style={{ color: G }} className="font-semibold">strong position</span> with an 85% predicted win probability. The case centers on Patent #PK-2019-4821 for a novel real-time data synchronization method. DataTech holds a decisive 14-day filing priority advantage over the defendant's competing technology.
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              Key strengths include a credible expert witness, strong financial evidence (PKR 24M documented revenue impact), and favorable precedent from DataTech v. InfoSys (2022). Primary risk vectors are the defendant's prior art challenge and Judge Wells' mixed record on software patents, both of which are manageable with the strategies outlined below.
            </p>
          </div>
          {/* Three key metrics */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { title:"Strongest Argument",icon:<Target size={18} color={G}/>,color:G,text:"Patent filing priority (14-day advantage) confirmed by USPTO records and expert testimony." },
              { title:"Primary Risk",icon:<AlertCircle size={18} color="#F87171"/>,color:"#F87171",text:"Judge Wells has ruled against software patents in 3 of 7 recent cases. Functional uniqueness framing is critical." },
              { title:"Recommended Action",icon:<ArrowRight size={18} color={P}/>,color:P,text:"File proactive expert witness statement on prior art by March 8 — before defendant raises it at discovery." },
            ].map((c,i)=>(
              <div key={i} className="bg-card border rounded-2xl p-4" style={{ borderColor:`${c.color}25` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background:`${c.color}15` }}>{c.icon}</div>
                <div className="text-xs font-bold text-foreground mb-2">{c.title}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
          {/* AI Recommendations */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="font-bold text-foreground mb-4">AI Recommendations</div>
            <div className="flex flex-col gap-3">
              {[
                { n:1,text:"Lead opening statements with functional uniqueness doctrine — avoid technical novelty framing.",done:false },
                { n:2,text:"File Dr. Morse's supplemental statement by March 8 addressing prior art preemptively.",done:false },
                { n:3,text:"Commission forward revenue projection from financial expert before March 15 hearing.",done:false },
                { n:4,text:"Prepare visual timeline of patent filing vs. defendant product release — 47-day gap.",done:true },
              ].map((r,i)=>(
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: r.done?"#34D39908":"var(--sidebar-accent)" }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background:r.done?"#34D39920":"var(--border)", border:`1.5px solid ${r.done?"#34D399":P}` }}>
                    {r.done?<Check size={10} color="#34D399"/>:<span className="text-[9px] font-black" style={{ color:P }}>{r.n}</span>}
                  </div>
                  <span className="text-xs text-foreground leading-relaxed">{r.text}</span>
                  {r.done && <span className="text-[9px] font-bold ml-auto flex-shrink-0 mt-0.5" style={{ color:"#34D399" }}>Done</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Similar Case Search ──────────────────────────────────────────────────────

export function CPSimilarPageV2({ navigate }: NavProps) {
  const [query, setQuery] = useState("software patent infringement Pakistan Supreme Court");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(true);
  const similar = [
    { id:"PK-SC-2022-847",title:"DataTech v. InfoSys Corp",court:"Supreme Court",year:2022,outcome:"Plaintiff Won",similarity:94,judge:"J. R. Ahmed",notes:"Nearly identical patent filing timeline. Plaintiff prevailed on functional uniqueness argument." },
    { id:"LHC-2021-2341",title:"TechSolutions v. ByteCraft",court:"Lahore High Court",year:2021,outcome:"Plaintiff Won",similarity:87,judge:"J. S. Malik",notes:"Software patent infringement. Prior art challenge rejected by court." },
    { id:"PK-SC-2023-112",title:"InnovatePK v. CopyTech Ltd",court:"Supreme Court",year:2023,outcome:"Defendant Won",similarity:79,judge:"J. A. Khan",notes:"Functional novelty argument insufficient — judge required technical novelty proof." },
    { id:"SHC-2020-4821",title:"AppDev Corp v. SoftPiracy Inc",court:"Sindh High Court",year:2020,outcome:"Plaintiff Won",similarity:76,judge:"J. F. Mirza",notes:"Revenue impact evidence was decisive — PKR 18M similar to current case." },
    { id:"IHC-2022-934",title:"PatentPro v. Knockoff Systems",court:"Islamabad HC",year:2022,outcome:"Settled",similarity:71,judge:"J. M. Siddiqui",notes:"Settled before trial for PKR 12M after strong preliminary injunction motion." },
  ];
  const doSearch = () => { setSearching(true); setResults(false); setTimeout(() => { setSearching(false); setResults(true); }, 1200); };
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Similar Case Search</h1>
        <AIBadge text="Semantic AI Search" />
      </div>
      {/* Search bar */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key==="Enter"&&doSearch()}
              placeholder="Describe your case in natural language…"
              className="w-full pl-10 pr-4 py-3 bg-sidebar-accent border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/40 transition-colors" />
          </div>
          <button onClick={doSearch} className="px-5 py-3 text-sm font-bold rounded-xl text-white" style={{ background:`linear-gradient(135deg,${P},${P}CC)` }}>
            {searching ? <RefreshCw size={14} className="animate-spin" /> : "Search"}
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["Supreme Court","IP Patent","2022-2024","Plaintiff Won"].map(tag => (
            <span key={tag} className="text-[10px] font-semibold px-2.5 py-1 rounded-full cursor-pointer hover:text-foreground transition-colors" style={{ background:"var(--sidebar-accent)",color:"var(--muted-foreground)" }}>{tag}</span>
          ))}
        </div>
      </div>
      {searching && (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => <SkeletonCard key={i} h={100} />)}
        </div>
      )}
      {results && !searching && (
        <div>
          <div className="text-xs text-muted-foreground mb-3">{similar.length} similar cases found · sorted by relevance</div>
          <div className="flex flex-col gap-3">
            {similar.map((s, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{s.id}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{s.court} · {s.year}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:s.outcome.includes("Won")&&s.outcome.includes("Plaintiff")?"#34D39918":s.outcome==="Settled"?`${G}18`:"#F8717118", color:s.outcome.includes("Won")&&s.outcome.includes("Plaintiff")?"#34D399":s.outcome==="Settled"?G:"#F87171" }}>{s.outcome}</span>
                    </div>
                    <div className="font-bold text-foreground text-sm">{s.title}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Similarity</div>
                      <div className="text-xl font-black" style={{ color:s.similarity>85?G:s.similarity>70?P:"#8892A4", letterSpacing:"-0.04em" }}>{s.similarity}%</div>
                    </div>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-sidebar-accent rounded-full overflow-hidden mb-3">
                  <div style={{ width:`${s.similarity}%`,height:"100%",background:`linear-gradient(90deg,${P},${G})`,borderRadius:99 }} />
                </div>
                <div className="flex items-start gap-1.5">
                  <Sparkles size={10} color={P} className="mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.notes}</p>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Judge: {s.judge}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Court Prediction (Client) ────────────────────────────────────────────────

export function CPPredictionsPageV2({ navigate }: NavProps) {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-foreground tracking-tight">AI Court Prediction</h1>
        <AIBadge text="94.2% model accuracy" />
      </div>
      <div className="grid grid-cols-3 gap-5 mb-6">
        <div className="col-span-1 bg-card border border-border rounded-2xl p-6 flex flex-col items-center">
          <ConfidenceMeter value={85} label="Win Probability" color={G} />
          <div className="mt-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">Based on 47 similar cases</div>
            <div className="text-xs font-semibold" style={{ color:"#34D399" }}>↑ +3% from last week</div>
          </div>
          <div className="w-full mt-5 pt-4 border-t border-border grid grid-cols-2 gap-3 text-center">
            {[["Plaintiff Win","82%","#34D399"],["Settlement","12%",G],["Defendant Win","6%","#F87171"]].slice(0,2).map(([l,v,c])=>(
              <div key={String(l)}><div className="text-xs text-muted-foreground">{l}</div><div className="font-bold" style={{ color:c as string }}>{v}</div></div>
            ))}
          </div>
        </div>
        <div className="col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="font-bold text-foreground mb-4">Prediction Factors</div>
          <div className="flex flex-col gap-3">
            {[
              ["Evidence Strength","94%",G,"Strong documentary evidence including patent filing and expert report"],
              ["Precedent Alignment","78%",P,"Similar cases in Supreme Court have 82% plaintiff win rate"],
              ["Procedural Compliance","91%","#34D399","All filings timely and complete"],
              ["Judge Affinity","68%","#60A5FA","Judge Wells: mixed record on software patents — 3 of 7 against"],
              ["Opposing Counsel Risk","45%","#F87171","Defendant firm has strong IP practice — prepare thoroughly"],
            ].map(([l,v,c,note])=>(
              <div key={String(l)}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-foreground">{l}</span>
                  <span className="text-xs font-bold" style={{ color:c as string }}>{v}</span>
                </div>
                <div className="h-2 bg-sidebar-accent rounded-full overflow-hidden mb-1">
                  <div style={{ width:v as string,height:"100%",background:c as string,borderRadius:99 }} />
                </div>
                <div className="text-[10px] text-muted-foreground">{note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="font-bold text-foreground mb-4">Probability Over Time</div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={[{t:"Jan",v:65},{t:"Feb",v:72},{t:"Feb 28",v:82},{t:"Mar",v:85}]}>
            <defs><linearGradient id="predG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={G} stopOpacity={0.3}/><stop offset="100%" stopColor={G} stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="t" tick={{ fontSize:10,fill:"#8892A4" }} axisLine={false} tickLine={false} />
            <YAxis domain={[50,100]} tick={{ fontSize:10,fill:"#8892A4" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,fontSize:12 }} />
            <Area type="monotone" dataKey="v" stroke={G} fill="url(#predG)" strokeWidth={2.5} dot={{ fill:G,strokeWidth:2,r:4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Explainable AI ───────────────────────────────────────────────────────────

export function CPExplainablePage({ navigate }: NavProps) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Explainable AI</h1>
        <AIBadge text="Transparent Decisions" />
      </div>
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <div className="font-bold text-foreground mb-2">Why does WukaLAW predict 85% win probability?</div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">Our AI analyzed 47 similar cases and 6 evidence categories. Here's exactly what's driving the prediction:</p>
        <div className="flex flex-col gap-3">
          {[
            { factor:"Patent Filing Priority Advantage",contribution:"+19%",direction:true,detail:"14-day filing priority is a decisive advantage confirmed in 89% of comparable cases" },
            { factor:"Expert Witness Report Quality",contribution:"+12%",direction:true,detail:"Dr. Morse's report rates 88% credibility score vs. 71% average for similar experts" },
            { factor:"Revenue Impact Documentation",contribution:"+9%",direction:true,detail:"PKR 24M documented impact significantly strengthens damages claim" },
            { factor:"Judge Wells Affinity",contribution:"-8%",direction:false,detail:"Judge Wells has ruled against software patents in 43% of cases — below median affinity" },
            { factor:"Opposing Counsel Strength",contribution:"-5%",direction:false,detail:"Defendant firm won 68% of their recent IP cases — above average opponent risk" },
            { factor:"Prior Art Exposure",contribution:"-7%",direction:false,detail:"Defendant's prior art challenge has 32% chance of partial success at trial" },
          ].map((f,i)=>(
            <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-sidebar-accent">
              <div className="w-14 text-right flex-shrink-0">
                <span className="text-sm font-black" style={{ color:f.direction?"#34D399":"#F87171" }}>{f.contribution}</span>
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-foreground mb-0.5">{f.factor}</div>
                <div className="text-[11px] text-muted-foreground">{f.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="font-bold text-foreground mb-3">Model Transparency</div>
        <div className="grid grid-cols-3 gap-4 text-center text-xs">
          {[["Training Cases","200,000+"],["Model Version","WukaLAW-Predict v4.2"],["Last Retrained","Mar 1, 2024"],["Validation Accuracy","94.2%"],["Confidence Interval","±4.1%"],["Data Sources","SC, 4 HCs, District Courts"]].map(([k,v])=>(
            <div key={k} className="p-3 bg-sidebar-accent rounded-xl">
              <div className="text-muted-foreground mb-1">{k}</div>
              <div className="font-bold text-foreground">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Report Generator ─────────────────────────────────────────────────────────

export function CPReportGenPage({ navigate }: NavProps) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const generate = () => { setGenerating(true); setTimeout(() => { setGenerating(false); setGenerated(true); }, 2500); };
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-foreground tracking-tight mb-6">Report Generator</h1>
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <div className="font-bold text-foreground mb-4">Configure Report</div>
        <div className="grid grid-cols-2 gap-4 mb-5">
          {[
            { label:"Report Type", options:["Executive Summary","Full Case Analysis","Court Submission","Evidence Report","Strategy Brief"] },
            { label:"Case",options:["WL-2024-003 — DataTech LLC","WL-2024-001 — Johnson v. MegaCorp","WL-2024-006 — Rivera Securities"] },
          ].map(({label,options})=>(
            <div key={label}>
              <label className="text-xs font-semibold text-foreground block mb-2">{label}</label>
              <select className="w-full bg-sidebar-accent border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none">
                {options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="mb-4">
          <div className="text-xs font-semibold text-foreground mb-2">Include Sections</div>
          <div className="grid grid-cols-2 gap-2">
            {["AI Summary","Court Prediction","Evidence Analysis","Similar Cases","Timeline","Strategy Recommendations","Risk Assessment","Financial Impact"].map(s => (
              <label key={s} className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-purple-600" />
                <span className="text-xs text-foreground">{s}</span>
              </label>
            ))}
          </div>
        </div>
        <button onClick={generate} disabled={generating} className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2" style={{ background:`linear-gradient(135deg,${P},${P}CC)`, opacity:generating?0.7:1 }}>
          {generating ? <><RefreshCw size={14} className="animate-spin" /> Generating Report…</> : <><Sparkles size={14} /> Generate AI Report</>}
        </button>
      </div>
      {generating && (
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
          <div className="text-sm font-bold text-foreground">Generating your report…</div>
          {["Analyzing 41 documents…","Running court prediction models…","Searching similar cases…","Compiling strategy recommendations…"].map((s,i)=>(
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background:`${P}15` }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:P }} />
              </div>
              <span className="text-xs text-muted-foreground">{s}</span>
            </div>
          ))}
        </div>
      )}
      {generated && (
        <div className="bg-card rounded-2xl p-5" style={{ border:`1px solid ${G}40` }}>
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle size={20} color="#34D399" />
            <div className="font-bold text-foreground">Report Ready: Executive Summary — WL-2024-003</div>
          </div>
          <div className="text-sm text-muted-foreground mb-4">12 pages · Generated Mar 5, 2024 · Includes AI prediction, evidence analysis, and strategy recommendations</div>
          <div className="flex gap-3">
            <button onClick={() => navigate("cp-download-reports")} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl text-white" style={{ background:`linear-gradient(135deg,${G},${G}CC)` }}>
              <Download size={14} /> Download PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors">
              <Eye size={14} /> Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Download Reports ─────────────────────────────────────────────────────────

export function CPDownloadReportsPage({ navigate }: NavProps) {
  const reports = [
    { name:"Executive Summary — WL-2024-003",date:"Mar 5, 2024",size:"2.4 MB",type:"PDF",case:"DataTech LLC IP Dispute" },
    { name:"Full Case Analysis — WL-2024-001",date:"Feb 28, 2024",size:"8.7 MB",type:"PDF",case:"Johnson v. MegaCorp" },
    { name:"Evidence Report — WL-2024-003",date:"Feb 20, 2024",size:"4.1 MB",type:"PDF",case:"DataTech LLC IP Dispute" },
    { name:"Strategy Brief — WL-2024-006",date:"Feb 15, 2024",size:"1.9 MB",type:"PDF",case:"Rivera Securities Fraud" },
    { name:"AI Prediction Report — Q1 2024",date:"Jan 31, 2024",size:"3.2 MB",type:"PDF",case:"All Cases" },
  ];
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Downloaded Reports</h1>
        <button onClick={() => navigate("cp-report-gen")} className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl text-white" style={{ background:P }}>
          <Plus size={13} /> New Report
        </button>
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border"><th className="text-left px-5 py-3 text-xs text-muted-foreground font-semibold">Report</th><th className="text-left px-5 py-3 text-xs text-muted-foreground font-semibold">Case</th><th className="text-left px-5 py-3 text-xs text-muted-foreground font-semibold">Generated</th><th className="text-left px-5 py-3 text-xs text-muted-foreground font-semibold">Size</th><th className="px-5 py-3"></th></tr></thead>
          <tbody>{reports.map((r,i)=>(
            <tr key={i} className="border-b border-border last:border-0 hover:bg-sidebar-accent transition-colors">
              <td className="px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:"#F8717115" }}><FileText size={14} color="#F87171" /></div>
                  <span className="text-xs font-medium text-foreground">{r.name}</span>
                </div>
              </td>
              <td className="px-5 py-3 text-xs text-muted-foreground">{r.case}</td>
              <td className="px-5 py-3 text-xs text-muted-foreground">{r.date}</td>
              <td className="px-5 py-3 text-xs text-muted-foreground">{r.size}</td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <button className="text-muted-foreground hover:text-foreground transition-colors p-1"><Eye size={13} /></button>
                  <button className="text-muted-foreground hover:text-foreground transition-colors p-1"><Download size={13} /></button>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Global Search ────────────────────────────────────────────────────────────

export function CPSearchPage({ navigate }: NavProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const results = query.length > 1 ? [
    { type:"Case",title:"DataTech LLC IP Dispute",sub:"WL-2024-003 · Active · 82% win probability",icon:<Briefcase size={14} color={P}/>,bg:`${P}15`,page:"cp-workspace" as Page },
    { type:"Document",title:"Johnson_Complaint.pdf",sub:"2.4 MB · Feb 28, 2024 · WL-2024-001",icon:<FileText size={14} color="#F87171"/>,bg:"#F8717115",page:"cp-documents" as Page },
    { type:"AI Prediction",title:"Court Outcome Prediction for WL-2024-003",sub:"85% win probability · Updated 2h ago",icon:<Brain size={14} color={G}/>,bg:`${G}15`,page:"cp-predictions" as Page },
    { type:"Evidence",title:"Expert Witness Report — Dr. Morse",sub:"Strength: 88% · Added Feb 28",icon:<FileSearch size={14} color="#34D399"/>,bg:"#34D39915",page:"cp-evidence" as Page },
  ] : [];
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-foreground tracking-tight mb-6">Search</h1>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search cases, documents, evidence, AI insights…"
          className="w-full pl-11 pr-4 py-4 bg-card border border-border rounded-2xl text-base text-foreground placeholder-muted-foreground outline-none focus:border-primary/40 transition-colors" />
      </div>
      <div className="flex gap-2 mb-5">
        {["All","Cases","Documents","Evidence","AI Insights"].map(c => (
          <button key={c} onClick={() => setCategory(c)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={category===c?{background:P,color:"#fff"}:{background:"var(--card)",border:"1px solid var(--border)",color:"var(--muted-foreground)"}}>
            {c}
          </button>
        ))}
      </div>
      {query.length === 0 && <EmptyState icon={<Search size={20}/>} title="Search your legal universe" body="Find cases, documents, evidence, AI predictions and more in one place." />}
      {results.length > 0 && (
        <div className="flex flex-col gap-2">
          {results.map((r,i)=>(
            <button key={i} onClick={() => navigate(r.page)} className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all text-left w-full">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:r.bg }}>{r.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{r.title}</div>
                <div className="text-xs text-muted-foreground">{r.sub}</div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background:"var(--sidebar-accent)",color:"var(--muted-foreground)" }}>{r.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
