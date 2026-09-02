// @ts-nocheck -- faithfully imported Figma Make presentation components
/* oxlint-disable -- preserve generated Figma Make source without semantic rewrites */
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, Briefcase, Layers, Calendar, FileText, Search,
  Sparkles, Brain, GitBranch, MessageSquare, Cpu, Clock, BarChart2, TrendingUp,
  Bell, User, Settings, Shield, MessageCircle, UsersRound, ChevronRight,
  ChevronDown, ChevronLeft, Plus, Filter, Download, Upload, Star, AlertCircle,
  CheckCircle, XCircle, ArrowUp, ArrowDown, MoreHorizontal, Edit3, Trash2,
  Eye, Copy, Share2, Bookmark, Tag as TagIcon, Hash, Link, ExternalLink,
  Send, Mic, Paperclip, Image, Video, Phone, Mail, MapPin, Globe, Building,
  Scale, Gavel, BookOpen, FileSearch, FilePlus, FolderOpen, Folder,
  BarChart, PieChart, Activity, Zap, Target, Award, Flag, AlertTriangle,
  CheckSquare, Square, Circle, Dot, ArrowRight, Minus, X, Check,
  CreditCard, DollarSign, Receipt, TrendingDown, UserCheck, UserPlus,
  Kanban, Layout, Grid, List, SlidersHorizontal, RefreshCw, Info,
  ChevronUp, RotateCcw, Play, Pause, StopCircle, Maximize2, Minimize2,
  Lock, Unlock, Key, Database, Server, Wifi, WifiOff, Battery, Cpu as CpuIcon,
} from "lucide-react";
import {
  AreaChart, Area, BarChart as RBarChart, Bar, PieChart as RPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, LineChart, Line, Legend,
} from "recharts";

type Page = string;
interface NavProps { navigate: (p: Page) => void; current?: Page; }

const G = "#D4AF37";
const P = "#7C3AED";
const BG = "#07090F";
const S = "#10172A";
const C = "#1A2540";
const MUT = "#4B5563";

const gc = (a: string) => `linear-gradient(135deg, ${G}22, ${P}22)`;

// ─── Shared micro-components ───────────────────────────────────────────────

function Chip({ children, color = G }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ background: color + "22", color }}>
      {children}
    </span>
  );
}

function StatCard({ label, value, sub, icon, trend, color = G }:
  { label: string; value: string; sub?: string; icon?: React.ReactNode; trend?: "up"|"down"; color?: string }) {
  return (
    <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {icon && <span style={{ color }}>{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {sub && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {trend === "up" && <ArrowUp size={10} className="text-emerald-400" />}
          {trend === "down" && <ArrowDown size={10} className="text-rose-400" />}
          {sub}
        </div>
      )}
    </div>
  );
}

function SectionHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function Btn({ children, variant = "primary", onClick, className = "", icon, size = "md" }:
  { children?: React.ReactNode; variant?: "primary"|"ghost"|"danger"|"outline"; onClick?: () => void; className?: string; icon?: React.ReactNode; size?: "sm"|"md" }) {
  const base = "inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all cursor-pointer";
  const sz = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-2 text-sm";
  const v = {
    primary: `text-black`,
    ghost: "text-muted-foreground hover:text-foreground hover:bg-white/5",
    danger: "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30",
    outline: "border border-border text-foreground hover:bg-white/5",
  }[variant];
  return (
    <button onClick={onClick}
      className={`${base} ${sz} ${v} ${className}`}
      style={variant === "primary" ? { background: G, color: BG } : {}}>
      {icon}{children}
    </button>
  );
}

function SearchBar({ placeholder = "Search…" }: { placeholder?: string }) {
  return (
    <div className="relative flex-1">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input placeholder={placeholder}
        className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#D4AF37]/50" />
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  Active: "#10B981", Pending: G, Closed: MUT, Won: "#10B981", Lost: "#EF4444",
  "In Progress": P, Draft: MUT, Filed: "#3B82F6", Scheduled: "#F59E0B",
  Completed: "#10B981", Cancelled: "#EF4444", High: "#EF4444", Medium: G, Low: "#10B981",
  Todo: MUT, Review: P, Done: "#10B981",
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLOR[status] || MUT;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: color + "22", color }}>
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: color }} />
      {status}
    </span>
  );
}

// ─── Mock data ─────────────────────────────────────────────────────────────

const CLIENTS = [
  { id: "c1", name: "Arif Habib Group", contact: "Zubair Habib", type: "Corporate", cases: 5, value: "PKR 2.4M", status: "Active", since: "2022", avatar: "AH", risk: "Low" },
  { id: "c2", name: "Fatima Malik", contact: "Fatima Malik", type: "Individual", cases: 2, value: "PKR 480K", status: "Active", since: "2023", avatar: "FM", risk: "Medium" },
  { id: "c3", name: "Punjab Textile Mills", contact: "Adnan Siddiqui", type: "Corporate", cases: 8, value: "PKR 6.1M", status: "Active", since: "2021", avatar: "PT", risk: "High" },
  { id: "c4", name: "Hassan & Sons", contact: "Bilal Hassan", type: "SME", cases: 3, value: "PKR 870K", status: "Active", since: "2023", avatar: "HS", risk: "Low" },
  { id: "c5", name: "Dr. Samia Nawaz", contact: "Samia Nawaz", type: "Individual", cases: 1, value: "PKR 240K", status: "Pending", since: "2024", avatar: "SN", risk: "Low" },
];

const CASES_DATA = [
  { id: "WK-2024-001", title: "Arif Habib vs SECP – Securities Dispute", client: "Arif Habib Group", type: "Commercial", stage: "Trial", priority: "High", assigned: "Adv. Sara Khan", date: "2024-08-15", prediction: 74, status: "Active" },
  { id: "WK-2024-002", title: "Punjab Textile Labour Dispute", client: "Punjab Textile Mills", type: "Labour", stage: "Hearing", priority: "High", assigned: "Adv. Kamran Ali", date: "2024-07-20", prediction: 61, status: "Active" },
  { id: "WK-2024-003", title: "Malik Property Inheritance Case", client: "Fatima Malik", type: "Civil", stage: "Discovery", priority: "Medium", assigned: "Adv. Sara Khan", date: "2024-06-10", prediction: 82, status: "Active" },
  { id: "WK-2024-004", title: "Hassan & Sons Contract Breach", client: "Hassan & Sons", type: "Commercial", stage: "Mediation", priority: "Medium", assigned: "Adv. Bilal Rao", date: "2024-05-05", prediction: 55, status: "Active" },
  { id: "WK-2024-005", title: "Nawaz Medical Malpractice Defense", client: "Dr. Samia Nawaz", type: "Civil", stage: "Filing", priority: "Low", assigned: "Adv. Kamran Ali", date: "2024-09-01", prediction: 68, status: "Active" },
];

const HEARINGS_DATA = [
  { id: "h1", case: "WK-2024-001", title: "Arif Habib vs SECP", court: "Lahore High Court", date: "2024-08-20", time: "10:00 AM", type: "Oral Arguments", judge: "Justice Aamir Farooq", status: "Scheduled", prep: 85 },
  { id: "h2", case: "WK-2024-002", title: "Punjab Textile Labour", court: "Labour Court Lahore", date: "2024-08-22", time: "02:30 PM", type: "Evidence", judge: "DJC Khan", status: "Scheduled", prep: 60 },
  { id: "h3", case: "WK-2024-003", title: "Malik Property Inheritance", court: "Civil Court Karachi", date: "2024-08-25", time: "11:00 AM", type: "Witness Exam", judge: "ADJ Tariq", status: "Scheduled", prep: 40 },
  { id: "h4", case: "WK-2024-001", title: "Arif Habib vs SECP", court: "Lahore High Court", date: "2024-09-03", time: "09:30 AM", type: "Judgment", judge: "Justice Aamir Farooq", status: "Scheduled", prep: 20 },
];

const TASKS_DATA = {
  todo: [
    { id: "t1", title: "Draft counter-affidavit for WK-2024-001", case: "WK-2024-001", priority: "High", due: "Aug 18", assignee: "Sara Khan" },
    { id: "t2", title: "Review SECP guidelines amendment", case: "WK-2024-001", priority: "Medium", due: "Aug 19", assignee: "You" },
    { id: "t3", title: "Prepare witness list for labour case", case: "WK-2024-002", priority: "High", due: "Aug 20", assignee: "Kamran Ali" },
  ],
  inProgress: [
    { id: "t4", title: "Research precedents for property case", case: "WK-2024-003", priority: "Medium", due: "Aug 21", assignee: "You" },
    { id: "t5", title: "Compile financial evidence documents", case: "WK-2024-001", priority: "High", due: "Aug 17", assignee: "Sara Khan" },
  ],
  review: [
    { id: "t6", title: "Settlement agreement draft", case: "WK-2024-004", priority: "Low", due: "Aug 23", assignee: "Bilal Rao" },
  ],
  done: [
    { id: "t7", title: "Initial client consultation – Dr. Nawaz", case: "WK-2024-005", priority: "Low", due: "Aug 10", assignee: "Kamran Ali" },
    { id: "t8", title: "Case filing for malpractice defense", case: "WK-2024-005", priority: "Medium", due: "Aug 12", assignee: "You" },
  ],
};

const DOCS_DATA = [
  { id: "d1", name: "SECP Securities Dispute Petition.pdf", case: "WK-2024-001", type: "Petition", size: "2.4 MB", updated: "Aug 14", author: "Sara Khan", status: "Final", tags: ["petition", "secp"] },
  { id: "d2", name: "Labour Court Written Statement.docx", case: "WK-2024-002", type: "Statement", size: "840 KB", updated: "Aug 12", author: "Kamran Ali", status: "Draft", tags: ["statement", "labour"] },
  { id: "d3", name: "Property Inheritance Evidence Bundle.zip", case: "WK-2024-003", type: "Evidence", size: "18.2 MB", updated: "Aug 10", author: "You", status: "Final", tags: ["evidence", "property"] },
  { id: "d4", name: "SECP Regulatory Framework 2023.pdf", case: "WK-2024-001", type: "Reference", size: "5.1 MB", updated: "Aug 08", author: "System", status: "Reference", tags: ["secp", "regulation"] },
  { id: "d5", name: "Contract Breach Analysis Memo.docx", case: "WK-2024-004", type: "Memo", size: "320 KB", updated: "Aug 06", author: "Bilal Rao", status: "Draft", tags: ["contract", "analysis"] },
];

const TEAM_DATA = [
  { id: "m1", name: "Adv. Sara Khan", role: "Senior Associate", email: "sara@wukalaw.pk", cases: 8, speciality: "Commercial Law", status: "Active", avatar: "SK" },
  { id: "m2", name: "Adv. Kamran Ali", role: "Associate", email: "kamran@wukalaw.pk", cases: 5, speciality: "Labour Law", status: "Active", avatar: "KA" },
  { id: "m3", name: "Adv. Bilal Rao", role: "Junior Associate", email: "bilal@wukalaw.pk", cases: 3, speciality: "Contract Law", status: "Active", avatar: "BR" },
  { id: "m4", name: "Nadia Hussain", role: "Legal Researcher", email: "nadia@wukalaw.pk", cases: 0, speciality: "Research & Analysis", status: "Active", avatar: "NH" },
  { id: "m5", name: "Tariq Mehmood", role: "Paralegal", email: "tariq@wukalaw.pk", cases: 0, speciality: "Document Management", status: "Active", avatar: "TM" },
];

const MESSAGES_DATA = [
  { id: "msg1", from: "Zubair Habib", role: "Client – Arif Habib Group", time: "10:24 AM", preview: "Can we discuss the SECP response strategy before the hearing?", unread: 3, avatar: "ZH" },
  { id: "msg2", from: "Adv. Sara Khan", role: "Senior Associate", time: "09:45 AM", preview: "I've uploaded the counter-affidavit draft. Please review.", unread: 1, avatar: "SK" },
  { id: "msg3", from: "Adnan Siddiqui", role: "Client – Punjab Textile", time: "Yesterday", preview: "The labour union has proposed a settlement. What do you think?", unread: 0, avatar: "AS" },
  { id: "msg4", from: "Adv. Kamran Ali", role: "Associate", time: "Yesterday", preview: "Witness list for Aug 22 is ready. Need your approval.", unread: 0, avatar: "KA" },
  { id: "msg5", from: "Court Registry LHC", role: "Official", time: "2 days ago", preview: "Cause list for August 20 – WK-2024-001 listed at 10:00 AM", unread: 0, avatar: "CR" },
];

const NOTIFS = [
  { id: "n1", title: "Hearing Reminder", body: "Arif Habib vs SECP – tomorrow at 10:00 AM at LHC", time: "1h ago", type: "hearing", read: false },
  { id: "n2", title: "Document Uploaded", body: "Sara Khan uploaded counter-affidavit for WK-2024-001", time: "2h ago", type: "document", read: false },
  { id: "n3", title: "AI Strategy Ready", body: "New AI strategy analysis available for WK-2024-002", time: "4h ago", type: "ai", read: false },
  { id: "n4", title: "Task Due Tomorrow", body: "Draft counter-affidavit for SECP case due tomorrow", time: "6h ago", type: "task", read: true },
  { id: "n5", title: "Client Message", body: "Adnan Siddiqui sent a message about settlement", time: "Yesterday", type: "message", read: true },
  { id: "n6", title: "Court Order", body: "New court order received for WK-2024-003", time: "2 days ago", type: "court", read: true },
];

const AREA_DATA = [
  { m: "Mar", revenue: 320, cases: 4, hours: 48 },
  { m: "Apr", revenue: 480, cases: 6, hours: 72 },
  { m: "May", revenue: 390, cases: 5, hours: 60 },
  { m: "Jun", revenue: 620, cases: 8, hours: 96 },
  { m: "Jul", revenue: 740, cases: 9, hours: 112 },
  { m: "Aug", revenue: 580, cases: 7, hours: 88 },
];

const RADAR_DATA = [
  { subject: "Contracts", A: 90 }, { subject: "Labour", A: 72 }, { subject: "Civil", A: 85 },
  { subject: "Criminal", A: 45 }, { subject: "Corporate", A: 88 }, { subject: "Family", A: 60 },
];

// ─── 1. Lawyer Dashboard V2 ────────────────────────────────────────────────

export function LPDashboardV2({ navigate }: NavProps) {
  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Good morning, Adv. Ahmad</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Friday, August 1, 2026 · 3 hearings this week · 2 tasks overdue</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="outline" icon={<Plus size={14} />}>New Case</Btn>
          <Btn icon={<Sparkles size={14} />}>AI Insights</Btn>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Cases" value="24" sub="+3 this month" trend="up" icon={<Briefcase size={16} />} />
        <StatCard label="This Month Revenue" value="PKR 580K" sub="+18% vs last month" trend="up" icon={<TrendingUp size={16} />} color={P} />
        <StatCard label="Upcoming Hearings" value="7" sub="Next: Aug 20, 10AM" icon={<Calendar size={16} />} color="#3B82F6" />
        <StatCard label="Win Rate (YTD)" value="74%" sub="+6% vs last year" trend="up" icon={<Target size={16} />} color="#10B981" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border p-4 bg-card">
          <SectionHead title="Performance Overview" sub="Revenue · Cases · Billable Hours" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={AREA_DATA}>
              <defs>
                <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={G} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={G} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={P} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={P} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="m" tick={{ fill: MUT, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: MUT, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: S, border: "1px solid #1A2540", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke={G} fill="url(#gr)" strokeWidth={2} name="Revenue (K)" />
              <Area type="monotone" dataKey="hours" stroke={P} fill="url(#gp)" strokeWidth={2} name="Hours" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Practice Area Breakdown */}
        <div className="rounded-xl border border-border p-4 bg-card">
          <SectionHead title="Practice Areas" sub="Case distribution by type" />
          <RadarChart cx="50%" cy="50%" outerRadius={80} width={220} height={180} data={RADAR_DATA}>
            <PolarGrid stroke="#1A2540" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: MUT, fontSize: 10 }} />
            <Radar dataKey="A" stroke={G} fill={G} fillOpacity={0.2} />
          </RadarChart>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Cases */}
        <div className="lg:col-span-2 rounded-xl border border-border p-4 bg-card">
          <SectionHead title="Active Cases" action={<Btn variant="ghost" size="sm" onClick={() => navigate("lp-cases")}>View all <ChevronRight size={12} /></Btn>} />
          <div className="space-y-2">
            {CASES_DATA.slice(0, 4).map(c => (
              <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-all" onClick={() => navigate("workspace")}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: G + "22", color: G }}>
                  {c.type[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.client} · {c.stage}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={c.priority} />
                  <div className="text-xs text-muted-foreground">{c.prediction}% win</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Hearings */}
        <div className="rounded-xl border border-border p-4 bg-card">
          <SectionHead title="Next Hearings" action={<Btn variant="ghost" size="sm" onClick={() => navigate("lp-hearings")}>All <ChevronRight size={12} /></Btn>} />
          <div className="space-y-3">
            {HEARINGS_DATA.slice(0, 3).map(h => (
              <div key={h.id} className="p-2.5 rounded-lg border border-border/50">
                <div className="text-xs font-bold text-foreground truncate mb-1">{h.title}</div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Calendar size={10} /> {h.date} {h.time}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                  <MapPin size={10} /> {h.court}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <StatusBadge status={h.status} />
                  <span className="text-[11px]" style={{ color: h.prep > 70 ? "#10B981" : h.prep > 40 ? G : "#EF4444" }}>
                    {h.prep}% prep
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border p-4 bg-card" style={{ background: `linear-gradient(135deg, ${P}11, transparent)` }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={15} style={{ color: P }} />
            <span className="text-sm font-bold text-foreground">AI Recommendations</span>
            <Chip color={P}>Live</Chip>
          </div>
          <div className="space-y-2.5">
            {[
              { text: "File counter-affidavit before Aug 18 to avoid default judgment in WK-2024-001", urgency: "High" },
              { text: "3 similar SECP cases from 2022-23 support your argument on securities disclosure", urgency: "Medium" },
              { text: "Settlement window optimal for WK-2024-004 – opponent counsel may accept 80% of claim", urgency: "Medium" },
            ].map((r, i) => (
              <div key={i} className="flex gap-2.5 p-2.5 rounded-lg bg-white/5">
                <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" style={{ color: r.urgency === "High" ? "#EF4444" : G }} />
                <p className="text-xs text-muted-foreground">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border p-4 bg-card">
          <SectionHead title="Pending Tasks" action={<Btn variant="ghost" size="sm" onClick={() => navigate("lp-tasks")}>All tasks <ChevronRight size={12} /></Btn>} />
          <div className="space-y-2">
            {TASKS_DATA.todo.slice(0, 3).map(t => (
              <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                <Square size={14} className="text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate">{t.title}</div>
                  <div className="text-xs text-muted-foreground">Due {t.due} · {t.assignee}</div>
                </div>
                <StatusBadge status={t.priority} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2. Client Management V2 ──────────────────────────────────────────────

export function LPClientsV2({ navigate }: NavProps) {
  const [search, setSearch] = useState("");
  const filtered = CLIENTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contact.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Client Management</h1>
          <p className="text-sm text-muted-foreground">{CLIENTS.length} active clients · PKR 9.3M total engagement</p>
        </div>
        <Btn icon={<UserPlus size={14} />}>Add Client</Btn>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Clients" value="47" sub="+3 this quarter" trend="up" icon={<Users size={16} />} />
        <StatCard label="Corporate Clients" value="18" sub="38% of portfolio" icon={<Building size={16} />} color={P} />
        <StatCard label="Avg. Engagement" value="PKR 198K" sub="+12% vs last year" trend="up" icon={<TrendingUp size={16} />} color="#10B981" />
      </div>

      <div className="flex gap-3">
        <SearchBar placeholder="Search clients by name, contact..." />
        <Btn variant="outline" icon={<Filter size={14} />} size="sm">Filter</Btn>
        <Btn variant="outline" icon={<Download size={14} />} size="sm">Export</Btn>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-white/5">
              {["Client", "Type", "Cases", "Engagement Value", "Risk Level", "Since", "Status", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-white/5 cursor-pointer transition-all" onClick={() => navigate("lp-client-detail")}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: G + "22", color: G }}>{c.avatar}</div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.contact}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><Chip>{c.type}</Chip></td>
                <td className="px-4 py-3 text-sm text-foreground">{c.cases}</td>
                <td className="px-4 py-3 text-sm font-semibold" style={{ color: G }}>{c.value}</td>
                <td className="px-4 py-3"><StatusBadge status={c.risk} /></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{c.since}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3">
                  <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── 3. Client Detail ──────────────────────────────────────────────────────

export function LPClientDetailPage({ navigate }: NavProps) {
  const c = CLIENTS[0];
  const clientCases = CASES_DATA.filter(cs => cs.client === c.name);

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center gap-3">
        <button className="text-muted-foreground hover:text-foreground" onClick={() => navigate("lp-clients")}>
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{c.name}</h1>
          <p className="text-sm text-muted-foreground">Corporate Client · Since {c.since}</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="outline" icon={<Mail size={14} />}>Email</Btn>
          <Btn variant="outline" icon={<Phone size={14} />}>Call</Btn>
          <Btn icon={<Plus size={14} />}>New Case</Btn>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="rounded-xl border border-border p-5 bg-card space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold" style={{ background: G + "22", color: G }}>{c.avatar}</div>
            <div>
              <div className="font-bold text-foreground">{c.name}</div>
              <div className="text-xs text-muted-foreground">{c.type} Client</div>
              <StatusBadge status={c.status} />
            </div>
          </div>
          <hr className="border-border" />
          {[
            { icon: <User size={13} />, label: "Primary Contact", val: c.contact },
            { icon: <Mail size={13} />, label: "Email", val: "zubair@arhabib.pk" },
            { icon: <Phone size={13} />, label: "Phone", val: "+92 300 1234567" },
            { icon: <MapPin size={13} />, label: "Address", val: "Lahore, Punjab" },
            { icon: <Building size={13} />, label: "NTN", val: "1234567-8" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-muted-foreground mt-0.5">{item.icon}</span>
              <div>
                <div className="text-[10px] text-muted-foreground">{item.label}</div>
                <div className="text-sm text-foreground">{item.val}</div>
              </div>
            </div>
          ))}
          <div className="rounded-lg p-3 border border-border/50" style={{ background: G + "11" }}>
            <div className="text-xs text-muted-foreground mb-1">Total Engagement</div>
            <div className="text-xl font-bold" style={{ color: G }}>{c.value}</div>
            <div className="text-[11px] text-muted-foreground">Across {c.cases} active cases</div>
          </div>
        </div>

        {/* Cases + Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border p-4 bg-card">
            <SectionHead title="Active Cases" action={<Btn variant="ghost" size="sm">+ New Case</Btn>} />
            <div className="space-y-2">
              {clientCases.map(cs => (
                <div key={cs.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-border cursor-pointer" onClick={() => navigate("workspace")}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: P + "22", color: P }}>{cs.type[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{cs.title}</div>
                    <div className="text-xs text-muted-foreground">{cs.id} · {cs.stage} · {cs.assigned}</div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={cs.priority} />
                    <div className="text-xs text-muted-foreground mt-1">{cs.prediction}% win</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border p-4 bg-card">
            <SectionHead title="Recent Activity" />
            <div className="space-y-3">
              {[
                { action: "Hearing scheduled", detail: "Aug 20, 10:00 AM – LHC", time: "2h ago", icon: <Calendar size={12} /> },
                { action: "Document uploaded", detail: "SECP Securities Dispute Petition.pdf", time: "1 day ago", icon: <FileText size={12} /> },
                { action: "AI analysis completed", detail: "Court outcome prediction updated to 74%", time: "3 days ago", icon: <Sparkles size={12} /> },
                { action: "Invoice sent", detail: "PKR 120,000 – July retainer", time: "5 days ago", icon: <Receipt size={12} /> },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: G + "22", color: G }}>{a.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm text-foreground">{a.action}</div>
                    <div className="text-xs text-muted-foreground">{a.detail}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{a.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 4. Case Management V2 ────────────────────────────────────────────────

export function LPCasesV2({ navigate }: NavProps) {
  const [view, setView] = useState<"table"|"grid">("table");
  const [filter, setFilter] = useState("All");

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Case Management</h1>
          <p className="text-sm text-muted-foreground">{CASES_DATA.length} active cases across all practice areas</p>
        </div>
        <Btn icon={<Plus size={14} />}>New Case</Btn>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Active" value="24" icon={<Briefcase size={16} />} />
        <StatCard label="Trial Stage" value="8" icon={<Gavel size={16} />} color={P} />
        <StatCard label="Avg Win Rate" value="74%" icon={<Target size={16} />} color="#10B981" />
        <StatCard label="Pending Hearings" value="12" icon={<Calendar size={16} />} color="#3B82F6" />
      </div>

      <div className="flex gap-3 items-center">
        <SearchBar placeholder="Search cases by ID, title, client..." />
        <div className="flex rounded-lg overflow-hidden border border-border">
          {["All", "Commercial", "Labour", "Civil", "Criminal"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-2 text-xs font-semibold transition-all"
              style={filter === f ? { background: G, color: BG } : { background: "transparent", color: MUT }}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg overflow-hidden border border-border">
          <button onClick={() => setView("table")} className="p-2" style={view === "table" ? { background: G, color: BG } : { color: MUT }}><List size={14} /></button>
          <button onClick={() => setView("grid")} className="p-2" style={view === "grid" ? { background: G, color: BG } : { color: MUT }}><Grid size={14} /></button>
        </div>
      </div>

      {view === "table" ? (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-white/5">
                {["Case ID", "Title", "Client", "Type", "Stage", "Assigned", "AI Prediction", "Priority", ""].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CASES_DATA.map(c => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-white/5 cursor-pointer" onClick={() => navigate("workspace")}>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: G }}>{c.id}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-foreground max-w-[220px] truncate">{c.title}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.client}</td>
                  <td className="px-4 py-3"><Chip>{c.type}</Chip></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.stage}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.assigned}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10">
                        <div className="h-full rounded-full transition-all" style={{ width: `${c.prediction}%`, background: c.prediction > 65 ? "#10B981" : c.prediction > 45 ? G : "#EF4444" }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: c.prediction > 65 ? "#10B981" : c.prediction > 45 ? G : "#EF4444" }}>{c.prediction}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={c.priority} /></td>
                  <td className="px-4 py-3"><button className="text-muted-foreground hover:text-foreground"><MoreHorizontal size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {CASES_DATA.map(c => (
            <div key={c.id} className="rounded-xl border border-border p-4 bg-card hover:border-[#D4AF37]/30 cursor-pointer transition-all" onClick={() => navigate("workspace")}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs font-mono" style={{ color: G }}>{c.id}</div>
                  <div className="text-sm font-bold text-foreground mt-0.5 leading-tight">{c.title}</div>
                </div>
                <StatusBadge status={c.priority} />
              </div>
              <div className="text-xs text-muted-foreground mb-3">{c.client} · {c.stage}</div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground">AI Win Probability</span>
                <span className="text-xs font-bold ml-auto" style={{ color: c.prediction > 65 ? "#10B981" : G }}>{c.prediction}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div className="h-full rounded-full" style={{ width: `${c.prediction}%`, background: c.prediction > 65 ? "#10B981" : G }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 5. Hearing Schedule V2 ───────────────────────────────────────────────

export function LPHearingsV2({ navigate }: NavProps) {
  const [tab, setTab] = useState("upcoming");

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hearing Schedule</h1>
          <p className="text-sm text-muted-foreground">4 hearings scheduled this month</p>
        </div>
        <Btn icon={<Plus size={14} />}>Add Hearing</Btn>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="This Week" value="2" icon={<Calendar size={16} />} />
        <StatCard label="This Month" value="4" icon={<Gavel size={16} />} color={P} />
        <StatCard label="Avg. Prep Score" value="51%" icon={<Target size={16} />} color="#F59E0B" />
      </div>

      <div className="flex gap-2 border-b border-border">
        {["upcoming", "past", "all"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 text-sm font-semibold capitalize transition-all border-b-2 -mb-px"
            style={tab === t ? { color: G, borderColor: G } : { color: MUT, borderColor: "transparent" }}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {HEARINGS_DATA.map(h => (
          <div key={h.id} className="rounded-xl border border-border p-5 bg-card hover:border-[#D4AF37]/30 transition-all cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono" style={{ color: G }}>{h.case}</span>
                  <StatusBadge status={h.status} />
                  <Chip>{h.type}</Chip>
                </div>
                <div className="text-base font-bold text-foreground">{h.title}</div>
              </div>
              <div className="text-right ml-4">
                <div className="text-lg font-bold" style={{ color: G }}>{h.date}</div>
                <div className="text-sm text-muted-foreground">{h.time}</div>
              </div>
            </div>
            <hr className="border-border my-3" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Court</div>
                <div className="text-sm text-foreground">{h.court}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Presiding Judge</div>
                <div className="text-sm text-foreground">{h.judge}</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Preparation Progress</span>
                <span className="text-xs font-bold" style={{ color: h.prep > 70 ? "#10B981" : h.prep > 40 ? G : "#EF4444" }}>{h.prep}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full transition-all" style={{ width: `${h.prep}%`, background: h.prep > 70 ? "#10B981" : h.prep > 40 ? G : "#EF4444" }} />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Btn variant="ghost" size="sm" icon={<FileText size={12} />}>Documents</Btn>
              <Btn variant="ghost" size="sm" icon={<Sparkles size={12} />}>AI Prep</Btn>
              <Btn variant="ghost" size="sm" icon={<Edit3 size={12} />}>Notes</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 6. Calendar ──────────────────────────────────────────────────────────

export function LPCalendarPage({ navigate }: NavProps) {
  const [view, setView] = useState<"month"|"week">("month");
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const dates = Array.from({ length: 35 }, (_, i) => {
    const d = i - 3; // Aug 2026 starts on Saturday (index 6), adjust
    return d >= 1 && d <= 31 ? d : null;
  });
  const events: Record<number, { title: string; color: string }[]> = {
    20: [{ title: "Arif Habib – Oral Args", color: G }],
    22: [{ title: "Labour Court Hearing", color: P }],
    25: [{ title: "Witness Exam – Karachi", color: "#3B82F6" }],
    18: [{ title: "Counter-affidavit Due", color: "#EF4444" }],
  };

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground">August 2026 · 4 events scheduled</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg overflow-hidden border border-border">
            {(["month","week"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-3 py-1.5 text-xs font-semibold capitalize"
                style={view === v ? { background: G, color: BG } : { color: MUT }}>
                {v}
              </button>
            ))}
          </div>
          <Btn icon={<Plus size={14} />}>Add Event</Btn>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Month header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button className="text-muted-foreground hover:text-foreground"><ChevronLeft size={18} /></button>
          <h3 className="font-bold text-foreground">August 2026</h3>
          <button className="text-muted-foreground hover:text-foreground"><ChevronRight size={18} /></button>
        </div>
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {days.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
          ))}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {dates.map((d, i) => (
            <div key={i} className={`min-h-[90px] border-r border-b border-border/40 p-1.5 ${d ? "hover:bg-white/5 cursor-pointer" : "opacity-30"}`}>
              {d && (
                <>
                  <div className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center ${d === 1 ? "text-black" : "text-muted-foreground"}`}
                    style={d === 1 ? { background: G } : {}}>
                    {d}
                  </div>
                  {(events[d] || []).map((ev, j) => (
                    <div key={j} className="mt-1 text-[10px] px-1.5 py-0.5 rounded truncate font-semibold"
                      style={{ background: ev.color + "33", color: ev.color }}>
                      {ev.title}
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming events sidebar */}
      <div className="rounded-xl border border-border p-4 bg-card">
        <SectionHead title="Upcoming Events" />
        <div className="space-y-3">
          {[
            { date: "Aug 18", title: "Counter-affidavit Deadline", type: "Deadline", color: "#EF4444" },
            { date: "Aug 20", title: "Arif Habib vs SECP – Oral Arguments", type: "Hearing", color: G },
            { date: "Aug 22", title: "Punjab Textile Labour – Evidence", type: "Hearing", color: P },
            { date: "Aug 25", title: "Malik Inheritance – Witness Exam", type: "Hearing", color: "#3B82F6" },
          ].map((e, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-1 h-10 rounded-full" style={{ background: e.color }} />
              <div className="w-12 text-right">
                <div className="text-xs font-bold" style={{ color: e.color }}>{e.date}</div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{e.title}</div>
                <div className="text-xs text-muted-foreground">{e.type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 7. Task Management (Kanban) ──────────────────────────────────────────

export function LPTasksPage({ navigate }: NavProps) {
  const cols = [
    { id: "todo", label: "To Do", color: MUT, tasks: TASKS_DATA.todo },
    { id: "inProgress", label: "In Progress", color: G, tasks: TASKS_DATA.inProgress },
    { id: "review", label: "Review", color: P, tasks: TASKS_DATA.review },
    { id: "done", label: "Done", color: "#10B981", tasks: TASKS_DATA.done },
  ] as const;

  return (
    <div className="p-6 overflow-auto h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Management</h1>
          <p className="text-sm text-muted-foreground">Kanban board · 8 tasks total · 2 overdue</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="outline" icon={<Filter size={14} />} size="sm">Filter</Btn>
          <Btn icon={<Plus size={14} />}>Add Task</Btn>
        </div>
      </div>

      <div className="flex gap-4 min-w-max pb-4">
        {cols.map(col => (
          <div key={col.id} className="w-72 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
              <span className="text-sm font-bold text-foreground">{col.label}</span>
              <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-muted-foreground">{col.tasks.length}</span>
            </div>
            <div className="space-y-3">
              {col.tasks.map(t => (
                <div key={t.id} className="rounded-xl border border-border p-3.5 bg-card hover:border-[#D4AF37]/30 cursor-grab transition-all">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="text-sm font-medium text-foreground leading-tight">{t.title}</div>
                    <button className="text-muted-foreground flex-shrink-0"><MoreHorizontal size={13} /></button>
                  </div>
                  <div className="text-xs font-mono mb-2.5" style={{ color: G }}>{t.case}</div>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={t.priority} />
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: P + "33", color: P }}>
                        {t.assignee.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                      <span className="text-[10px] text-muted-foreground">Due {t.due}</span>
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full py-2 rounded-xl border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-border/80 transition-all flex items-center justify-center gap-1.5">
                <Plus size={12} /> Add task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 8. Document Management V2 ────────────────────────────────────────────

export function LPDocumentsV2({ navigate }: NavProps) {
  const [filter, setFilter] = useState("All");

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Document Management</h1>
          <p className="text-sm text-muted-foreground">124 documents · 1.8 GB total</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="outline" icon={<FolderOpen size={14} />}>New Folder</Btn>
          <Btn icon={<Upload size={14} />}>Upload</Btn>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Documents" value="124" icon={<FileText size={16} />} />
        <StatCard label="Drafts" value="18" icon={<Edit3 size={16} />} color={G} />
        <StatCard label="Final/Filed" value="87" icon={<CheckCircle size={16} />} color="#10B981" />
        <StatCard label="Storage Used" value="1.8 GB" icon={<Database size={16} />} color={P} />
      </div>

      <div className="flex gap-3">
        <SearchBar placeholder="Search documents by name, case, tag..." />
        <div className="flex rounded-lg overflow-hidden border border-border">
          {["All","Petition","Statement","Evidence","Reference","Memo"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-2.5 py-2 text-xs font-semibold transition-all"
              style={filter === f ? { background: G, color: BG } : { color: MUT }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-white/5">
              {["Name", "Case", "Type", "Author", "Updated", "Size", "Status", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DOCS_DATA.map(d => (
              <tr key={d.id} className="border-b border-border/50 hover:bg-white/5 cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: d.name.endsWith(".pdf") ? "#EF444433" : d.name.endsWith(".zip") ? "#F59E0B33" : P + "33",
                               color: d.name.endsWith(".pdf") ? "#EF4444" : d.name.endsWith(".zip") ? "#F59E0B" : P }}>
                      <FileText size={12} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground max-w-[200px] truncate">{d.name}</div>
                      <div className="flex gap-1 mt-0.5">
                        {d.tags.map(t => <span key={t} className="text-[9px] px-1 py-0.5 rounded bg-white/10 text-muted-foreground">#{t}</span>)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-mono" style={{ color: G }}>{d.case}</td>
                <td className="px-4 py-3"><Chip>{d.type}</Chip></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{d.author}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{d.updated}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{d.size}</td>
                <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="text-muted-foreground hover:text-foreground p-1"><Eye size={13} /></button>
                    <button className="text-muted-foreground hover:text-foreground p-1"><Download size={13} /></button>
                    <button className="text-muted-foreground hover:text-foreground p-1"><MoreHorizontal size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── 9. Evidence Analysis ────────────────────────────────────────────────

export function LPEvidenceV2({ navigate }: NavProps) {
  const evidenceItems = [
    { id: "ev1", name: "SECP Annual Report 2023.pdf", type: "Document", relevance: 92, category: "Financial", case: "WK-2024-001", tags: ["secp", "financial"], ai: "High relevance to securities disclosure argument" },
    { id: "ev2", name: "WhatsApp Communications Export", type: "Digital", relevance: 78, category: "Communication", case: "WK-2024-001", tags: ["communication", "digital"], ai: "Supports broker-client relationship claim" },
    { id: "ev3", name: "Property Deed – Gulberg III", type: "Document", relevance: 95, category: "Property", case: "WK-2024-003", tags: ["property", "deed"], ai: "Primary evidence of ownership claim" },
    { id: "ev4", name: "Labour Contract 2021-2024", type: "Document", relevance: 88, category: "Contract", case: "WK-2024-002", tags: ["labour", "contract"], ai: "Establishes employment terms and benefits" },
    { id: "ev5", name: "CCTV Footage – Factory Floor", type: "Video", relevance: 71, category: "Visual", case: "WK-2024-002", tags: ["video", "factory"], ai: "May support working conditions claim" },
  ];

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Evidence Analysis</h1>
          <p className="text-sm text-muted-foreground">AI-powered evidence review and relevance scoring</p>
        </div>
        <Btn icon={<Upload size={14} />}>Upload Evidence</Btn>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Evidence Items" value="47" icon={<FileSearch size={16} />} />
        <StatCard label="Avg AI Relevance" value="84%" icon={<Sparkles size={16} />} color={P} />
        <StatCard label="Pending Review" value="6" icon={<Clock size={16} />} color={G} />
      </div>

      <div className="flex gap-3">
        <SearchBar placeholder="Search evidence by name, case, tag..." />
        <Btn variant="outline" icon={<Filter size={14} />} size="sm">Filter</Btn>
      </div>

      <div className="space-y-4">
        {evidenceItems.map(ev => (
          <div key={ev.id} className="rounded-xl border border-border p-4 bg-card hover:border-[#D4AF37]/30 transition-all cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: ev.type === "Video" ? "#EF444422" : ev.type === "Digital" ? P + "22" : G + "22",
                         color: ev.type === "Video" ? "#EF4444" : ev.type === "Digital" ? P : G }}>
                {ev.type === "Video" ? <Video size={16} /> : ev.type === "Digital" ? <Wifi size={16} /> : <FileText size={16} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-foreground">{ev.name}</span>
                  <Chip color={ev.relevance > 85 ? "#10B981" : ev.relevance > 70 ? G : "#EF4444"}>{ev.relevance}% relevant</Chip>
                </div>
                <div className="text-xs text-muted-foreground mb-2">{ev.case} · {ev.category} · {ev.type}</div>
                <div className="flex gap-1 mb-2">
                  {ev.tags.map(t => <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground">#{t}</span>)}
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/5">
                  <Sparkles size={11} style={{ color: P }} className="mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">{ev.ai}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="w-16 h-16 relative flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#1A2540" strokeWidth="4" />
                    <circle cx="32" cy="32" r="28" fill="none"
                      stroke={ev.relevance > 85 ? "#10B981" : ev.relevance > 70 ? G : "#EF4444"}
                      strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={`${ev.relevance * 1.758} 175.8`} />
                  </svg>
                  <span className="text-xs font-bold text-foreground">{ev.relevance}%</span>
                </div>
                <div className="flex gap-1">
                  <button className="text-muted-foreground hover:text-foreground p-1"><Eye size={13} /></button>
                  <button className="text-muted-foreground hover:text-foreground p-1"><Download size={13} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 10. AI Legal Research ────────────────────────────────────────────────

export function LPResearchPage({ navigate }: NavProps) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const results = [
    { title: "PLD 2022 Lahore 145 – Securities Disclosure Requirements", court: "Lahore High Court", date: "2022", relevance: 94, type: "Precedent", summary: "Court held that SECP's disclosure requirements under Securities Act 2015 must be strictly interpreted. Broker's obligation to disclose all material information is non-negotiable." },
    { title: "2021 SCMR 892 – Beneficial Ownership in Securities", court: "Supreme Court of Pakistan", date: "2021", relevance: 88, type: "Binding", summary: "Supreme Court affirmed that beneficial ownership triggers disclosure obligations regardless of nominee arrangements." },
    { title: "PLD 2020 Karachi 78 – Broker-Client Fiduciary Duty", court: "Sindh High Court", date: "2020", relevance: 81, type: "Persuasive", summary: "Detailed analysis of fiduciary obligations in securities brokerage. Court adopted a broad interpretation of client best interests." },
  ];

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Legal Research</h1>
          <p className="text-sm text-muted-foreground">Semantic search across 50,000+ Pakistani court judgments</p>
        </div>
        <Chip color={P}><Sparkles size={10} /> AI Powered</Chip>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-border p-6 bg-card" style={{ background: `linear-gradient(135deg, ${P}11, transparent)` }}>
        <div className="text-sm font-semibold text-foreground mb-3">Research Query</div>
        <textarea
          rows={3}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Describe your legal research need in natural language... e.g., 'What are the disclosure obligations of securities brokers under Pakistani law?'"
          className="w-full bg-white/5 border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#7C3AED]/50 resize-none"
        />
        <div className="flex gap-3 mt-3">
          <Btn icon={<Search size={14} />} onClick={() => setSearched(true)}>Search Precedents</Btn>
          <Btn variant="outline" icon={<BookOpen size={14} />}>Browse Statutes</Btn>
          <div className="ml-auto flex gap-2">
            {["LHC", "SHC", "SC", "All Courts"].map(c => (
              <button key={c} className="px-2.5 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-all">{c}</button>
            ))}
          </div>
        </div>
      </div>

      {(searched || true) && (
        <>
          <div className="flex items-center gap-2">
            <Sparkles size={13} style={{ color: P }} />
            <span className="text-sm text-muted-foreground">AI found <strong className="text-foreground">3 highly relevant</strong> precedents for SECP securities disclosure research</span>
          </div>
          <div className="space-y-4">
            {results.map((r, i) => (
              <div key={i} className="rounded-xl border border-border p-5 bg-card hover:border-[#7C3AED]/30 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Chip color={r.relevance > 90 ? "#10B981" : r.relevance > 80 ? G : MUT}>{r.relevance}% match</Chip>
                      <Chip color={r.type === "Binding" ? "#EF4444" : r.type === "Precedent" ? G : MUT}>{r.type}</Chip>
                    </div>
                    <div className="text-base font-bold text-foreground">{r.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{r.court} · {r.date}</div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Btn variant="ghost" size="sm" icon={<Bookmark size={12} />}>Save</Btn>
                    <Btn variant="ghost" size="sm" icon={<ExternalLink size={12} />}>Full text</Btn>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.summary}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── 11. Similar Case Explorer ────────────────────────────────────────────

export function LPSimilarV2({ navigate }: NavProps) {
  const similars = [
    { id: "LHC-2022-4521", title: "National Securities vs SECP", similarity: 91, outcome: "Won", facts: "Securities broker failed to disclose material information. Court found disclosure mandatory.", court: "LHC", year: "2022", strategy: "Focus on materiality threshold – key precedent for your disclosure argument" },
    { id: "SHC-2021-2231", title: "Pak Brokers Ltd vs Securities Commission", similarity: 84, outcome: "Won", facts: "Broker-client fiduciary duty case. Court broadly interpreted disclosure obligations.", court: "SHC", year: "2021", strategy: "Use §34 Securities Act argument – same statutory provision applies" },
    { id: "LHC-2023-891", title: "Habib Bank vs SECP (Securities Division)", similarity: 79, outcome: "Lost", facts: "Bank-securities division disclosure failure. Penalty upheld due to willful concealment.", court: "LHC", year: "2023", strategy: "Distinguish your case on absence of willful intent – critical differentiation" },
  ];

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Similar Case Explorer</h1>
          <p className="text-sm text-muted-foreground">AI-matched precedents for WK-2024-001 · Arif Habib vs SECP</p>
        </div>
        <Chip color={P}><GitBranch size={10} /> {similars.length} matches</Chip>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Cases Analyzed" value="12,847" icon={<Database size={16} />} />
        <StatCard label="Best Match" value="91%" icon={<Target size={16} />} color="#10B981" />
        <StatCard label="Win Rate in Similar" value="67%" icon={<TrendingUp size={16} />} color={G} />
      </div>

      <div className="space-y-4">
        {similars.map((s, i) => (
          <div key={i} className="rounded-xl border border-border p-5 bg-card hover:border-[#D4AF37]/30 transition-all cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg"
                style={{ background: s.similarity > 88 ? "#10B98122" : G + "22", color: s.similarity > 88 ? "#10B981" : G }}>
                {s.similarity}%
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">{s.id}</span>
                  <StatusBadge status={s.outcome} />
                  <Chip>{s.court} · {s.year}</Chip>
                </div>
                <div className="text-base font-bold text-foreground mb-1">{s.title}</div>
                <p className="text-xs text-muted-foreground mb-3">{s.facts}</p>
                <div className="flex items-start gap-2 p-2.5 rounded-lg border border-border/50" style={{ background: G + "11" }}>
                  <Sparkles size={11} style={{ color: G }} className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-medium" style={{ color: G }}>Strategy insight: {s.strategy}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-2">
                <Btn variant="ghost" size="sm" icon={<ExternalLink size={12} />}>Full Judgment</Btn>
                <Btn variant="ghost" size="sm" icon={<Copy size={12} />}>Import Argument</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 12. Court Outcome Prediction V2 ─────────────────────────────────────

export function LPPredictionV2({ navigate }: NavProps) {
  const factors = [
    { name: "Legal Merit", score: 85, weight: "30%", icon: <Scale size={14} /> },
    { name: "Precedent Support", score: 78, weight: "25%", icon: <BookOpen size={14} /> },
    { name: "Evidence Strength", score: 72, weight: "20%", icon: <FileSearch size={14} /> },
    { name: "Judge Historical Bias", score: 65, weight: "15%", icon: <Gavel size={14} /> },
    { name: "Opposing Counsel Profile", score: 58, weight: "10%", icon: <User size={14} /> },
  ];

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Court Outcome Prediction</h1>
          <p className="text-sm text-muted-foreground">ML-powered prediction for WK-2024-001</p>
        </div>
        <Btn variant="outline" icon={<RefreshCw size={14} />}>Recalculate</Btn>
      </div>

      {/* Big prediction number */}
      <div className="rounded-xl border border-border p-8 bg-card text-center" style={{ background: `linear-gradient(135deg, ${G}11, ${P}11)` }}>
        <div className="text-6xl font-black mb-2" style={{ color: G }}>74%</div>
        <div className="text-lg font-bold text-foreground mb-1">Predicted Win Probability</div>
        <div className="text-sm text-muted-foreground mb-4">Arif Habib Group vs SECP · Lahore High Court</div>
        <div className="flex justify-center gap-4">
          <div className="px-4 py-2 rounded-xl border border-border bg-card">
            <div className="text-xs text-muted-foreground">Confidence</div>
            <div className="text-lg font-bold text-foreground">High</div>
          </div>
          <div className="px-4 py-2 rounded-xl border border-border bg-card">
            <div className="text-xs text-muted-foreground">Similar Won</div>
            <div className="text-lg font-bold" style={{ color: "#10B981" }}>67%</div>
          </div>
          <div className="px-4 py-2 rounded-xl border border-border bg-card">
            <div className="text-xs text-muted-foreground">Risk Level</div>
            <div className="text-lg font-bold" style={{ color: G }}>Medium</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Factor breakdown */}
        <div className="rounded-xl border border-border p-5 bg-card">
          <SectionHead title="Prediction Factors" sub="Weighted factor analysis" />
          <div className="space-y-4">
            {factors.map((f, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <span style={{ color: G }}>{f.icon}</span>{f.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Weight {f.weight}</span>
                    <span className="text-sm font-bold" style={{ color: f.score > 75 ? "#10B981" : f.score > 60 ? G : "#EF4444" }}>{f.score}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full transition-all" style={{ width: `${f.score}%`, background: f.score > 75 ? "#10B981" : f.score > 60 ? G : "#EF4444" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scenario analysis */}
        <div className="rounded-xl border border-border p-5 bg-card">
          <SectionHead title="Scenario Analysis" />
          <div className="space-y-3">
            {[
              { scenario: "Current strategy", prob: 74, color: G },
              { scenario: "+ Strong expert witness", prob: 82, color: "#10B981" },
              { scenario: "+ Settlement accepted", prob: 95, color: "#10B981" },
              { scenario: "If key evidence excluded", prob: 48, color: "#EF4444" },
              { scenario: "Appeal scenario (if lost)", prob: 61, color: P },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1 text-sm text-foreground">{s.scenario}</div>
                <div className="w-24 h-1.5 rounded-full bg-white/10">
                  <div className="h-full rounded-full" style={{ width: `${s.prob}%`, background: s.color }} />
                </div>
                <div className="w-10 text-right text-sm font-bold" style={{ color: s.color }}>{s.prob}%</div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg border border-border/50" style={{ background: P + "11" }}>
            <div className="text-xs font-bold mb-1" style={{ color: P }}>AI Recommendation</div>
            <p className="text-xs text-muted-foreground">Adding an expert witness in securities regulations would increase win probability by ~8%. Consider engaging Prof. Tariq from LUMS Law School.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 13. Strategy Builder ─────────────────────────────────────────────────

export function LPStrategyPage({ navigate }: NavProps) {
  const [activeStrategy, setActiveStrategy] = useState(0);

  const strategies = [
    {
      name: "Aggressive Litigation",
      confidence: 74,
      description: "Full litigation strategy targeting full damages plus costs",
      pros: ["Maximum recovery potential", "Establishes strong precedent", "Forces opponent concessions"],
      cons: ["Higher legal costs", "Longer timeline (12-18 months)", "Reputational risk for client"],
      steps: ["File counter-affidavit (Aug 18)", "Secure expert witnesses", "Challenge SECP's standing", "Oral arguments (Aug 20)", "Await judgment"],
    },
    {
      name: "Negotiated Settlement",
      confidence: 88,
      description: "Targeted settlement at 85% of claim value",
      pros: ["Fast resolution (2-4 months)", "Certainty of outcome", "Lower client cost"],
      cons: ["Below maximum recovery", "No precedent value", "May embolden future claims"],
      steps: ["Open settlement channel", "Counter at PKR 2.8M", "Due diligence on SECP posture", "Draft settlement deed", "Court approval"],
    },
  ];

  const s = strategies[activeStrategy];

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Strategy Builder</h1>
          <p className="text-sm text-muted-foreground">AI-assisted legal strategy for WK-2024-001</p>
        </div>
        <Btn icon={<Plus size={14} />}>New Strategy</Btn>
      </div>

      {/* Strategy selector */}
      <div className="flex gap-3">
        {strategies.map((st, i) => (
          <div key={i} className="flex-1 rounded-xl border p-4 cursor-pointer transition-all"
            style={activeStrategy === i ? { borderColor: G, background: G + "11" } : { borderColor: "var(--border)" }}
            onClick={() => setActiveStrategy(i)}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-foreground">{st.name}</div>
              <div className="text-lg font-black" style={{ color: st.confidence > 80 ? "#10B981" : G }}>{st.confidence}%</div>
            </div>
            <p className="text-xs text-muted-foreground">{st.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pros/Cons */}
        <div className="rounded-xl border border-border p-5 bg-card">
          <SectionHead title={`${s.name} Analysis`} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1"><Check size={11} /> Advantages</div>
              <div className="space-y-2">
                {s.pros.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-foreground">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-emerald-400" />
                    {p}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-rose-400 mb-2 flex items-center gap-1"><X size={11} /> Risks</div>
              <div className="space-y-2">
                {s.cons.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-foreground">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-rose-400" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Steps */}
        <div className="rounded-xl border border-border p-5 bg-card">
          <SectionHead title="Execution Plan" />
          <div className="space-y-3">
            {s.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-black" style={{ background: G }}>{i + 1}</div>
                <div className="flex-1 text-sm text-foreground pt-0.5">{step}</div>
                {i === 0 && <Chip color="#EF4444">Urgent</Chip>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 14. Timeline Intelligence ────────────────────────────────────────────

export function LPTimelineV2({ navigate }: NavProps) {
  const events = [
    { date: "2024-05-01", title: "Case Filed", type: "Filing", detail: "Initial petition filed at LHC Registry", status: "done" },
    { date: "2024-05-15", title: "Notice Issued", type: "Court Order", detail: "LHC issues notice to SECP respondents", status: "done" },
    { date: "2024-06-10", title: "Written Statement Filed", type: "Pleading", detail: "SECP files counter arguments", status: "done" },
    { date: "2024-07-01", title: "Discovery Phase", type: "Discovery", detail: "Document production and evidence exchange", status: "done" },
    { date: "2024-07-20", title: "Evidence Bundle Submitted", type: "Evidence", detail: "All exhibits filed with the court", status: "done" },
    { date: "2024-08-18", title: "Counter-Affidavit Due", type: "Deadline", detail: "Must be filed before 5 PM", status: "current", urgent: true },
    { date: "2024-08-20", title: "Oral Arguments", type: "Hearing", detail: "Main hearing – Justice Aamir Farooq presiding", status: "upcoming" },
    { date: "2024-09-03", title: "Judgment Expected", type: "Judgment", detail: "Court to announce decision", status: "upcoming" },
  ];

  const typeColors: Record<string, string> = {
    Filing: G, "Court Order": P, Pleading: "#3B82F6", Discovery: "#F59E0B",
    Evidence: "#10B981", Deadline: "#EF4444", Hearing: P, Judgment: G,
  };

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Timeline Intelligence</h1>
          <p className="text-sm text-muted-foreground">WK-2024-001 · Arif Habib vs SECP · Case progression</p>
        </div>
        <Btn icon={<Plus size={14} />}>Add Milestone</Btn>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Days Since Filing" value="92" icon={<Clock size={16} />} />
        <StatCard label="Milestones Complete" value="5/8" icon={<CheckCircle size={16} />} color="#10B981" />
        <StatCard label="Days to Next Hearing" value="19" icon={<Calendar size={16} />} color={G} />
      </div>

      <div className="rounded-xl border border-border p-6 bg-card">
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-6">
            {events.map((ev, i) => (
              <div key={i} className="relative flex items-start gap-6 pl-14">
                <div className={`absolute left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10`}
                  style={{
                    borderColor: ev.status === "current" ? "#EF4444" : ev.status === "done" ? "#10B981" : "var(--border)",
                    background: ev.status === "current" ? "#EF444422" : ev.status === "done" ? "#10B98122" : "var(--card)",
                  }}>
                  {ev.status === "done" && <Check size={10} className="text-emerald-400" />}
                  {ev.status === "current" && <Dot size={10} className="text-rose-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-muted-foreground">{ev.date}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: (typeColors[ev.type] || MUT) + "22", color: typeColors[ev.type] || MUT }}>
                      {ev.type}
                    </span>
                    {ev.urgent && <Chip color="#EF4444">URGENT</Chip>}
                  </div>
                  <div className="text-sm font-bold text-foreground">{ev.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{ev.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 15. AI Legal Assistant Chat ──────────────────────────────────────────

export function LPAIChatV2({ navigate }: NavProps) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello, I am WukaAI, your AI legal intelligence assistant. I have full context on all your active cases, Pakistani law, and recent court decisions. How can I assist you today?" },
    { role: "user", content: "What is the strength of our argument in WK-2024-001 regarding SECP disclosure?" },
    { role: "assistant", content: "Based on my analysis of WK-2024-001 (Arif Habib vs SECP), your disclosure argument is **strong at 74%**. Key supporting factors:\n\n1. **PLD 2022 LHC 145** directly supports your interpretation of §34 Securities Act 2015\n2. Your evidence bundle includes 3 key documents showing SECP's inconsistent enforcement\n3. Justice Aamir Farooq has ruled in favour of disclosure-based arguments in 68% of similar cases\n\n**Critical weakness**: The 2023 SHC judgment on willful concealment could be used against you. I recommend your counter-affidavit explicitly distinguishes this on factual grounds." },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { role: "user", content: input }]);
    setInput("");
    setTimeout(() => {
      setMessages(m => [...m, { role: "assistant", content: "Based on your query and current case context, I am analyzing the relevant precedents and statutory provisions. I will provide a detailed analysis shortly..." }]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: P + "22" }}>
            <Sparkles size={16} style={{ color: P }} />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">WukaAI Legal Assistant</div>
            <div className="text-xs text-muted-foreground">Context: All active cases · Pakistani Law Database · LHC/SHC/SC Judgments</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Btn variant="ghost" size="sm" icon={<RefreshCw size={12} />}>New Chat</Btn>
          <Chip color={P}>Online</Chip>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: P + "22" }}>
                <Sparkles size={13} style={{ color: P }} />
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "text-black" : "bg-card border border-border text-foreground"}`}
              style={m.role === "user" ? { background: G, borderRadius: "16px 16px 4px 16px" } : { borderRadius: "4px 16px 16px 16px" }}>
              {m.content.split("\n").map((line, j) => (
                <div key={j}>{line || <br />}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Suggested prompts */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0">
        {["Summarize hearing prep checklist", "What evidence is strongest?", "Draft cross-examination questions"].map(p => (
          <button key={p} onClick={() => setInput(p)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-all">
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="flex gap-3 items-end">
          <div className="flex-1 bg-card border border-border rounded-xl p-3 flex gap-2">
            <textarea
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Ask about any case, law, or legal strategy..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
            />
            <div className="flex gap-1 flex-shrink-0">
              <button className="text-muted-foreground hover:text-foreground p-1"><Paperclip size={14} /></button>
              <button className="text-muted-foreground hover:text-foreground p-1"><Mic size={14} /></button>
            </div>
          </div>
          <button onClick={send} className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-black" style={{ background: G }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 16. Report Generator ─────────────────────────────────────────────────

export function LPReportGenPage({ navigate }: NavProps) {
  const [type, setType] = useState("case-summary");

  const reportTypes = [
    { id: "case-summary", label: "Case Summary Report", icon: <Briefcase size={14} />, time: "~2 min" },
    { id: "hearing-prep", label: "Hearing Preparation Report", icon: <Gavel size={14} />, time: "~3 min" },
    { id: "evidence", label: "Evidence Analysis Report", icon: <FileSearch size={14} />, time: "~4 min" },
    { id: "client-report", label: "Client Status Report", icon: <Users size={14} />, time: "~2 min" },
    { id: "strategy", label: "Legal Strategy Report", icon: <Target size={14} />, time: "~5 min" },
    { id: "billing", label: "Billing & Time Report", icon: <Receipt size={14} />, time: "~1 min" },
  ];

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Report Generator</h1>
          <p className="text-sm text-muted-foreground">AI-generated professional legal reports</p>
        </div>
        <Chip color={P}><Sparkles size={10} /> AI Assisted</Chip>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-border p-4 bg-card">
            <div className="text-sm font-bold text-foreground mb-3">Report Type</div>
            <div className="space-y-1">
              {reportTypes.map(rt => (
                <button key={rt.id} onClick={() => setType(rt.id)}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-all"
                  style={type === rt.id ? { background: G + "22", color: G } : { color: "var(--muted-foreground)" }}>
                  {rt.icon}
                  <span className="text-xs font-semibold">{rt.label}</span>
                  <span className="ml-auto text-[10px] opacity-60">{rt.time}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border p-4 bg-card">
            <div className="text-sm font-bold text-foreground mb-3">Options</div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Case</label>
                <select className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                  {CASES_DATA.map(c => <option key={c.id}>{c.id} – {c.title.slice(0, 30)}...</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Format</label>
                <div className="flex gap-2">
                  {["PDF", "DOCX", "HTML"].map(f => (
                    <button key={f} className="flex-1 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground transition-all">{f}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Language</label>
                <div className="flex gap-2">
                  {["English", "Urdu"].map(l => (
                    <button key={l} className="flex-1 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground transition-all">{l}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Btn className="w-full justify-center" icon={<Sparkles size={14} />}>Generate Report</Btn>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2 rounded-xl border border-border p-6 bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-bold text-foreground">Report Preview</div>
            <div className="flex gap-2">
              <Btn variant="ghost" size="sm" icon={<Download size={12} />}>Download</Btn>
              <Btn variant="ghost" size="sm" icon={<Share2 size={12} />}>Share</Btn>
            </div>
          </div>
          <div className="rounded-lg border border-border/50 p-6 bg-white/5 min-h-[400px]">
            <div className="text-center mb-6">
              <div className="text-xl font-black text-foreground mb-1">CASE SUMMARY REPORT</div>
              <div className="text-sm text-muted-foreground">WK-2024-001 · Generated by WukaAI</div>
              <div className="text-xs text-muted-foreground">August 1, 2026</div>
            </div>
            <hr className="border-border mb-4" />
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: G }}>Case Overview</div>
                <p className="text-muted-foreground leading-relaxed">Arif Habib Group (Petitioner) vs Securities and Exchange Commission of Pakistan (Respondent) – A securities dispute arising from alleged disclosure violations under the Securities Act 2015...</p>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: G }}>Current Status</div>
                <p className="text-muted-foreground">Case is currently at the Trial stage with oral arguments scheduled for August 20, 2026 before Justice Aamir Farooq at Lahore High Court.</p>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: G }}>AI Win Probability</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 rounded-full bg-white/10">
                    <div className="h-full rounded-full" style={{ width: "74%", background: G }} />
                  </div>
                  <span className="font-bold" style={{ color: G }}>74%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 17. Team Collaboration ───────────────────────────────────────────────

export function LPTeamV2({ navigate }: NavProps) {
  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Collaboration</h1>
          <p className="text-sm text-muted-foreground">{TEAM_DATA.length} team members · 19 active assignments</p>
        </div>
        <Btn icon={<UserPlus size={14} />}>Invite Member</Btn>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Team Members" value="5" icon={<UsersRound size={16} />} />
        <StatCard label="Active Assignments" value="19" icon={<CheckSquare size={16} />} color={P} />
        <StatCard label="Tasks Completed (Aug)" value="34" icon={<CheckCircle size={16} />} color="#10B981" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members */}
        <div className="rounded-xl border border-border p-4 bg-card">
          <SectionHead title="Team Members" />
          <div className="space-y-3">
            {TEAM_DATA.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-all">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: G + "22", color: G }}>{m.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-foreground">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.role} · {m.speciality}</div>
                </div>
                <div className="text-right">
                  <StatusBadge status={m.status} />
                  <div className="text-xs text-muted-foreground mt-1">{m.cases} cases</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workload */}
        <div className="rounded-xl border border-border p-4 bg-card">
          <SectionHead title="Workload Distribution" />
          <div className="space-y-4">
            {TEAM_DATA.filter(m => m.cases > 0).map(m => (
              <div key={m.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: G + "22", color: G }}>{m.avatar}</div>
                    <span className="text-sm text-foreground">{m.name.split(". ")[1] || m.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{m.cases} cases</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full" style={{ width: `${(m.cases / 10) * 100}%`, background: m.cases > 7 ? "#EF4444" : m.cases > 5 ? G : "#10B981" }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-border p-4" style={{ background: G + "11" }}>
            <SectionHead title="Team Activity Feed" />
            <div className="space-y-2">
              {[
                { user: "Sara Khan", action: "uploaded counter-affidavit draft", time: "2h ago" },
                { user: "Kamran Ali", action: "completed witness list for Aug 22", time: "4h ago" },
                { user: "Bilal Rao", action: "added note to WK-2024-004", time: "Yesterday" },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ background: P + "33", color: P }}>
                    {a.user.split(" ").map(w => w[0]).join("")}
                  </div>
                  <span><strong className="text-foreground">{a.user}</strong> {a.action}</span>
                  <span className="ml-auto">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 18. Messages V2 ──────────────────────────────────────────────────────

export function LPMessagesV2({ navigate }: NavProps) {
  const [active, setActive] = useState("msg1");
  const activeMsg = MESSAGES_DATA.find(m => m.id === active)!;

  const chatMessages = [
    { from: activeMsg.from, content: "Can we discuss the SECP response strategy before the hearing?", time: "10:24 AM", mine: false },
    { from: "You", content: "Absolutely. I have reviewed the counter-affidavit draft. The key issue is the §34 disclosure argument. We need to emphasize that the disclosure timeline was reasonable given the complexity of the transaction.", time: "10:26 AM", mine: true },
    { from: activeMsg.from, content: "What about the risk if Justice Farooq rules against us on the standing issue?", time: "10:28 AM", mine: false },
    { from: "You", content: "Our AI analysis suggests 22% probability of standing being challenged. We have a solid rebuttal prepared. I will walk you through it in our call today.", time: "10:30 AM", mine: true },
  ];

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-border flex flex-col">
        <div className="p-3 border-b border-border">
          <SearchBar placeholder="Search messages..." />
        </div>
        <div className="flex-1 overflow-auto">
          {MESSAGES_DATA.map(m => (
            <div key={m.id} className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-white/5 border-b border-border/30 transition-all ${active === m.id ? "bg-white/5" : ""}`}
              onClick={() => setActive(m.id)}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: G + "22", color: G }}>{m.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">{m.from}</span>
                  <span className="text-[10px] text-muted-foreground">{m.time}</span>
                </div>
                <div className="text-[10px] text-muted-foreground">{m.role}</div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">{m.preview}</div>
              </div>
              {m.unread > 0 && <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 text-black" style={{ background: G }}>{m.unread}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-border flex-shrink-0">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: G + "22", color: G }}>{activeMsg.avatar}</div>
          <div>
            <div className="text-sm font-bold text-foreground">{activeMsg.from}</div>
            <div className="text-xs text-muted-foreground">{activeMsg.role}</div>
          </div>
          <div className="ml-auto flex gap-2">
            <Btn variant="ghost" size="sm" icon={<Phone size={12} />}>Call</Btn>
            <Btn variant="ghost" size="sm" icon={<Video size={12} />}>Video</Btn>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.mine ? "justify-end" : ""}`}>
              {!msg.mine && <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: G + "22", color: G }}>{activeMsg.avatar}</div>}
              <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${msg.mine ? "text-black" : "bg-card border border-border text-foreground"}`}
                style={msg.mine ? { background: G, borderRadius: "16px 16px 4px 16px" } : { borderRadius: "4px 16px 16px 16px" }}>
                {msg.content}
                <div className="text-[10px] mt-1 opacity-60">{msg.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="flex gap-2 items-center">
            <div className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-muted-foreground cursor-text">Type a message...</div>
            <Btn variant="ghost" size="sm" icon={<Paperclip size={14} />} />
            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-black" style={{ background: G }}><Send size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 19. Notifications V2 ─────────────────────────────────────────────────

export function LPNotificationsV2({ navigate }: NavProps) {
  const [notifs, setNotifs] = useState(NOTIFS);
  const typeIcon = (t: string) => {
    if (t === "hearing") return <Calendar size={13} style={{ color: G }} />;
    if (t === "document") return <FileText size={13} style={{ color: P }} />;
    if (t === "ai") return <Sparkles size={13} style={{ color: P }} />;
    if (t === "task") return <CheckSquare size={13} style={{ color: G }} />;
    if (t === "message") return <MessageSquare size={13} style={{ color: "#3B82F6" }} />;
    return <Bell size={13} style={{ color: MUT }} />;
  };

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">{notifs.filter(n => !n.read).length} unread notifications</p>
        </div>
        <Btn variant="ghost" size="sm" onClick={() => setNotifs(n => n.map(x => ({ ...x, read: true })))}>Mark all read</Btn>
      </div>

      <div className="space-y-2">
        {notifs.map(n => (
          <div key={n.id}
            className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${n.read ? "border-border/50 bg-card/50" : "border-border bg-card"}`}
            onClick={() => setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.read ? "opacity-50" : ""}`}
              style={{ background: n.type === "hearing" ? G + "22" : P + "22" }}>
              {typeIcon(n.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${n.read ? "text-muted-foreground" : "text-foreground"}`}>{n.title}</span>
                {!n.read && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: G }} />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 20. Analytics V2 ────────────────────────────────────────────────────

export function LPAnalyticsV2({ navigate }: NavProps) {
  const caseTypeData = [
    { name: "Commercial", value: 9, color: G },
    { name: "Labour", value: 5, color: P },
    { name: "Civil", value: 7, color: "#3B82F6" },
    { name: "Criminal", value: 3, color: "#EF4444" },
  ];

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Performance insights · Aug 2026</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="outline" size="sm">Monthly</Btn>
          <Btn variant="outline" icon={<Download size={14} />} size="sm">Export</Btn>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Revenue (YTD)" value="PKR 3.2M" sub="+24% vs last year" trend="up" icon={<TrendingUp size={16} />} />
        <StatCard label="Cases Resolved" value="31" sub="74% win rate" trend="up" icon={<CheckCircle size={16} />} color="#10B981" />
        <StatCard label="Billable Hours" value="1,840" sub="Avg 306h/month" trend="up" icon={<Clock size={16} />} color={P} />
        <StatCard label="New Clients" value="12" sub="+3 vs last quarter" trend="up" icon={<UserPlus size={16} />} color={G} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border p-4 bg-card">
          <SectionHead title="Revenue Trend" sub="Monthly breakdown" />
          <ResponsiveContainer width="100%" height={220}>
            <RBarChart data={AREA_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="m" tick={{ fill: MUT, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: MUT, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: S, border: "1px solid #1A2540", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Bar dataKey="revenue" fill={G} radius={[4, 4, 0, 0]} name="Revenue (K)" />
              <Bar dataKey="hours" fill={P} radius={[4, 4, 0, 0]} name="Hours" />
            </RBarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border p-4 bg-card">
          <SectionHead title="Case Type Mix" />
          <ResponsiveContainer width="100%" height={180}>
            <RPieChart>
              <Pie data={caseTypeData} dataKey="value" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                {caseTypeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: S, border: "1px solid #1A2540", borderRadius: 8, color: "#fff", fontSize: 12 }} />
            </RPieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {caseTypeData.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="ml-auto font-semibold text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-xl border border-border p-4 bg-card">
          <SectionHead title="Win/Loss Trend" sub="By month" />
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={[
              { m: "Mar", won: 3, lost: 1 }, { m: "Apr", won: 4, lost: 2 }, { m: "May", won: 3, lost: 2 },
              { m: "Jun", won: 6, lost: 2 }, { m: "Jul", won: 7, lost: 2 }, { m: "Aug", won: 5, lost: 2 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="m" tick={{ fill: MUT, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: MUT, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: S, border: "1px solid #1A2540", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Line type="monotone" dataKey="won" stroke="#10B981" strokeWidth={2} dot={false} name="Won" />
              <Line type="monotone" dataKey="lost" stroke="#EF4444" strokeWidth={2} dot={false} name="Lost" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-border p-4 bg-card">
          <SectionHead title="Team Productivity" />
          <div className="space-y-3 mt-2">
            {TEAM_DATA.filter(m => m.cases > 0).map(m => (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ background: G + "22", color: G }}>{m.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground">{m.name.split(". ").pop()}</div>
                  <div className="h-1.5 rounded-full bg-white/10 mt-1">
                    <div className="h-full rounded-full" style={{ width: `${(m.cases / 10) * 100}%`, background: G }} />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{m.cases} cases</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 21. Billing ──────────────────────────────────────────────────────────

export function LPBillingPage({ navigate }: NavProps) {
  const invoices = [
    { id: "INV-2026-081", client: "Arif Habib Group", amount: "PKR 120,000", status: "Paid", date: "Aug 1", due: "Aug 15", case: "WK-2024-001" },
    { id: "INV-2026-080", client: "Punjab Textile", amount: "PKR 85,000", status: "Pending", date: "Jul 25", due: "Aug 10", case: "WK-2024-002" },
    { id: "INV-2026-079", client: "Fatima Malik", amount: "PKR 40,000", status: "Paid", date: "Jul 20", due: "Aug 5", case: "WK-2024-003" },
    { id: "INV-2026-078", client: "Hassan & Sons", amount: "PKR 55,000", status: "Overdue", date: "Jul 10", due: "Jul 25", case: "WK-2024-004" },
    { id: "INV-2026-077", client: "Dr. Samia Nawaz", amount: "PKR 20,000", status: "Draft", date: "Aug 1", due: "Aug 20", case: "WK-2024-005" },
  ];

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing & Invoices</h1>
          <p className="text-sm text-muted-foreground">PKR 320K outstanding · 1 overdue invoice</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="outline" icon={<Download size={14} />}>Export</Btn>
          <Btn icon={<Plus size={14} />}>New Invoice</Btn>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="This Month Revenue" value="PKR 580K" trend="up" sub="+18%" icon={<TrendingUp size={16} />} />
        <StatCard label="Outstanding" value="PKR 320K" icon={<Clock size={16} />} color={G} />
        <StatCard label="Overdue" value="PKR 55K" icon={<AlertCircle size={16} />} color="#EF4444" />
        <StatCard label="Collected (YTD)" value="PKR 3.2M" trend="up" sub="+24%" icon={<CheckCircle size={16} />} color="#10B981" />
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-white/5">
              {["Invoice", "Client", "Case", "Amount", "Date", "Due Date", "Status", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="border-b border-border/50 hover:bg-white/5 cursor-pointer">
                <td className="px-4 py-3 text-xs font-mono" style={{ color: G }}>{inv.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{inv.client}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{inv.case}</td>
                <td className="px-4 py-3 text-sm font-bold" style={{ color: G }}>{inv.amount}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{inv.date}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{inv.due}</td>
                <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="text-muted-foreground hover:text-foreground p-1"><Eye size={13} /></button>
                    <button className="text-muted-foreground hover:text-foreground p-1"><Download size={13} /></button>
                    <button className="text-muted-foreground hover:text-foreground p-1"><Send size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── 22. Profile V2 ───────────────────────────────────────────────────────

export function LPProfileV2({ navigate }: NavProps) {
  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <Btn icon={<Edit3 size={14} />}>Edit Profile</Btn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="rounded-xl border border-border p-6 bg-card text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-2xl font-black" style={{ background: G + "22", color: G }}>AA</div>
          <div>
            <div className="text-lg font-bold text-foreground">Adv. Ahmad Raza</div>
            <div className="text-sm text-muted-foreground">Senior Advocate</div>
            <div className="text-xs text-muted-foreground">Lahore High Court · Bar No. LHC-12847</div>
          </div>
          <div className="flex justify-center gap-2">
            <Chip color="#10B981">Active</Chip>
            <Chip color={G}>Premium Plan</Chip>
          </div>
          <hr className="border-border" />
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><div className="text-lg font-bold text-foreground">24</div><div className="text-[10px] text-muted-foreground">Active Cases</div></div>
            <div><div className="text-lg font-bold" style={{ color: G }}>74%</div><div className="text-[10px] text-muted-foreground">Win Rate</div></div>
            <div><div className="text-lg font-bold text-foreground">7y</div><div className="text-[10px] text-muted-foreground">Experience</div></div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border p-5 bg-card">
            <SectionHead title="Personal Information" />
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Full Name", val: "Ahmad Raza Khan" },
                { label: "Bar Registration", val: "LHC-12847" },
                { label: "Email", val: "ahmad@wukalaw.pk" },
                { label: "Phone", val: "+92 321 4567890" },
                { label: "Office", val: "Lahore, Punjab" },
                { label: "Specialization", val: "Commercial & Securities Law" },
              ].map((f, i) => (
                <div key={i}>
                  <div className="text-xs text-muted-foreground mb-1">{f.label}</div>
                  <div className="text-sm text-foreground">{f.val}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border p-5 bg-card">
            <SectionHead title="Practice Areas" />
            <div className="flex flex-wrap gap-2">
              {["Commercial Law", "Securities & SECP", "Contract Disputes", "Corporate Litigation", "Labour Law", "Civil Litigation"].map(area => (
                <Chip key={area}>{area}</Chip>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border p-5 bg-card">
            <SectionHead title="Courts Registered" />
            <div className="grid grid-cols-2 gap-2">
              {["Supreme Court of Pakistan", "Lahore High Court", "Islamabad High Court", "Civil Courts (Punjab)", "Labour Courts (Punjab)", "Banking Courts"].map(ct => (
                <div key={ct} className="flex items-center gap-2 text-xs text-foreground">
                  <Scale size={11} style={{ color: G }} /> {ct}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 23. Settings V2 ──────────────────────────────────────────────────────

export function LPSettingsV2({ navigate }: NavProps) {
  const [section, setSection] = useState("general");
  const sections = [
    { id: "general", label: "General", icon: <Settings size={14} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={14} /> },
    { id: "ai", label: "AI Preferences", icon: <Sparkles size={14} /> },
    { id: "security", label: "Security", icon: <Shield size={14} /> },
    { id: "billing", label: "Plan & Billing", icon: <CreditCard size={14} /> },
  ];

  return (
    <div className="p-6 overflow-auto h-full">
      <h1 className="text-2xl font-bold text-foreground mb-5">Settings</h1>
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-44 flex-shrink-0 space-y-1">
          {sections.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all"
              style={section === s.id ? { background: G + "22", color: G } : { color: "var(--muted-foreground)" }}>
              {s.icon}{s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {section === "general" && (
            <>
              <div className="rounded-xl border border-border p-5 bg-card">
                <SectionHead title="Firm Information" />
                <div className="space-y-3">
                  {[
                    { label: "Firm Name", val: "Ahmad Raza & Associates" },
                    { label: "Display Name", val: "Adv. Ahmad Raza" },
                    { label: "Language", val: "English" },
                    { label: "Timezone", val: "PKT (UTC+5)" },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/30">
                      <span className="text-sm text-muted-foreground">{f.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground">{f.val}</span>
                        <button className="text-muted-foreground hover:text-foreground"><Edit3 size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border p-5 bg-card">
                <SectionHead title="Appearance" />
                {[
                  { label: "Dark Mode", desc: "Use dark theme throughout the app" },
                  { label: "Compact View", desc: "Reduce spacing in tables and lists" },
                  { label: "Show AI Confidence Scores", desc: "Display AI prediction confidence on all pages" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border/30">
                    <div>
                      <div className="text-sm font-medium text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                    <div className="w-10 h-5 rounded-full cursor-pointer" style={{ background: G }}><div className="w-4 h-4 rounded-full bg-black m-0.5 ml-auto" /></div>
                  </div>
                ))}
              </div>
            </>
          )}
          {section === "ai" && (
            <div className="rounded-xl border border-border p-5 bg-card">
              <SectionHead title="AI Preferences" />
              <div className="space-y-4">
                {[
                  { label: "Auto-generate case summaries", desc: "Automatically summarize new cases when added", on: true },
                  { label: "Proactive strategy suggestions", desc: "AI recommends strategies before hearings", on: true },
                  { label: "Similar case alerts", desc: "Notify when similar precedents are filed", on: true },
                  { label: "Real-time prediction updates", desc: "Update win probability as case progresses", on: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border/30">
                    <div>
                      <div className="text-sm font-medium text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                    <div className={`w-10 h-5 rounded-full cursor-pointer transition-all`} style={{ background: item.on ? G : "var(--border)" }}>
                      <div className={`w-4 h-4 rounded-full bg-white m-0.5 transition-all ${item.on ? "ml-auto" : "ml-0"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {section === "security" && (
            <div className="rounded-xl border border-border p-5 bg-card">
              <SectionHead title="Security Settings" />
              <div className="space-y-3">
                {[
                  { icon: <Key size={14} />, label: "Change Password", desc: "Last changed 30 days ago", action: "Change" },
                  { icon: <Shield size={14} />, label: "Two-Factor Authentication", desc: "Currently enabled via SMS", action: "Manage" },
                  { icon: <Server size={14} />, label: "Active Sessions", desc: "3 active sessions on 2 devices", action: "View" },
                  { icon: <Database size={14} />, label: "Data Export", desc: "Download all your data", action: "Export" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 border-b border-border/30">
                    <span style={{ color: G }}>{item.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                    <Btn variant="outline" size="sm">{item.action}</Btn>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(section === "notifications" || section === "billing") && (
            <div className="rounded-xl border border-border p-8 bg-card flex flex-col items-center justify-center text-center gap-3">
              <Bell size={32} className="text-muted-foreground" />
              <div className="text-sm font-bold text-foreground capitalize">{section} Settings</div>
              <div className="text-xs text-muted-foreground">Configure your {section} preferences here.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 24. AI Strategy V2 ───────────────────────────────────────────────────

export function LPAIStrategyV2({ navigate }: NavProps) {
  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Strategy Assistant</h1>
          <p className="text-sm text-muted-foreground">Intelligent legal strategy powered by WukaAI</p>
        </div>
        <Chip color={P}><Sparkles size={10} /> WukaAI</Chip>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {CASES_DATA.slice(0, 2).map(c => (
          <div key={c.id} className="rounded-xl border border-border p-5 bg-card" style={{ background: `linear-gradient(135deg, ${P}0A, transparent)` }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono" style={{ color: G }}>{c.id}</span>
              <StatusBadge status={c.priority} />
            </div>
            <div className="text-sm font-bold text-foreground mb-3">{c.title}</div>
            <div className="space-y-3">
              {[
                { icon: <Target size={12} />, label: "Recommended Strategy", val: "Aggressive litigation with expert witnesses" },
                { icon: <TrendingUp size={12} />, label: "Win Probability", val: `${c.prediction}% (AI Model v3.1)` },
                { icon: <AlertTriangle size={12} />, label: "Key Risk", val: "Opposing counsel has strong track record in LHC" },
                { icon: <Sparkles size={12} />, label: "AI Suggestion", val: "File counter-affidavit by Aug 18 – critical deadline" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/5">
                  <span style={{ color: G }} className="mt-0.5 flex-shrink-0">{item.icon}</span>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</div>
                    <div className="text-xs text-foreground">{item.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border p-5 bg-card">
        <SectionHead title="AI Insights Feed" sub="Real-time intelligence across all active cases" />
        <div className="space-y-3">
          {[
            { case: "WK-2024-001", insight: "New SECP circular (SRO-512/2024) issued today – directly relevant to your disclosure argument. Review before hearing.", urgency: "Critical", time: "Just now" },
            { case: "WK-2024-002", insight: "3 similar labour cases resolved via settlement in Aug 2024. Settlement window may be optimal this month.", urgency: "High", time: "1h ago" },
            { case: "WK-2024-003", insight: "Property mutation records for Gulberg-III now digitized – access via Punjab Land Records Portal for additional evidence.", urgency: "Medium", time: "3h ago" },
          ].map((ins, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border transition-all cursor-pointer">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: P + "22" }}>
                <Sparkles size={12} style={{ color: P }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono" style={{ color: G }}>{ins.case}</span>
                  <Chip color={ins.urgency === "Critical" ? "#EF4444" : ins.urgency === "High" ? G : MUT}>{ins.urgency}</Chip>
                  <span className="text-[10px] text-muted-foreground ml-auto">{ins.time}</span>
                </div>
                <p className="text-xs text-muted-foreground">{ins.insight}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
