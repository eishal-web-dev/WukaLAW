// @ts-nocheck -- faithfully imported Figma Make presentation components
/* oxlint-disable -- preserve generated Figma Make source without semantic rewrites */
import React, { useState } from "react";
import {
  LayoutDashboard, Users, UserCheck, User, Key, Brain, Database, BarChart2,
  FileSearch, Bell, Shield, CreditCard, Settings, TrendingUp, TrendingDown,
  AlertCircle, AlertTriangle, CheckCircle, XCircle, Clock, Activity, Zap,
  Server, Cpu, Wifi, Globe, Lock, Unlock, Eye, EyeOff, Download, Upload,
  Plus, Filter, Search, MoreHorizontal, Edit3, Trash2, RefreshCw, Copy,
  ChevronRight, ChevronDown, ChevronLeft, ArrowUp, ArrowDown, ExternalLink,
  Mail, Phone, MapPin, Building, Star, Flag, Hash, Link, Bookmark,
  FileText, FolderOpen, File, Archive, Package, Layers, Scale, Gavel,
  MessageSquare, Send, Inbox, ToggleLeft, ToggleRight, Check, X, Minus,
  HardDrive, Network, Thermometer, Gauge, Radio, Satellite, Terminal,
  GitBranch, Code, BookOpen, Newspaper, Tag, ShieldCheck, ShieldAlert,
  BarChart, PieChart, LineChart as LineChartIcon, Target, Award, Percent,
  DollarSign, Receipt, Wallet, Calendar, Info, Sparkles, UserPlus,
} from "lucide-react";
import {
  AreaChart, Area, BarChart as RBarChart, Bar, PieChart as RPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";

// ─── Types & constants ─────────────────────────────────────────────────────

type Page = string;
interface NavProps { navigate: (p: Page) => void; current?: Page; }

const G = "#D4AF37";
const P = "#7C3AED";
const BG = "#07090F";
const S = "#10172A";
const C = "#1A2540";
const MUT = "#4B5563";

// ─── Shared micro-components ───────────────────────────────────────────────

function Chip({ children, color = G }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ background: color + "22", color }}>
      {children}
    </span>
  );
}

function StatCard({ label, value, sub, icon, trend, color = G, detail }:
  { label: string; value: string; sub?: string; icon?: React.ReactNode; trend?: "up"|"down"; color?: string; detail?: string }) {
  return (
    <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-2 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5" style={{ background: color, transform: "translate(30%, -30%)" }} />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        {icon && <span className="opacity-80" style={{ color }}>{icon}</span>}
      </div>
      <div className="text-2xl font-black text-foreground tracking-tight">{value}</div>
      {sub && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {trend === "up" && <ArrowUp size={10} className="text-emerald-400" />}
          {trend === "down" && <ArrowDown size={10} className="text-rose-400" />}
          <span>{sub}</span>
        </div>
      )}
      {detail && <div className="text-[10px] text-muted-foreground border-t border-border/40 pt-1.5 mt-0.5">{detail}</div>}
    </div>
  );
}

function SectionHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function Btn({ children, variant = "primary", onClick, className = "", icon, size = "md" }:
  { children?: React.ReactNode; variant?: "primary"|"ghost"|"danger"|"outline"|"success"; onClick?: () => void; className?: string; icon?: React.ReactNode; size?: "sm"|"md" }) {
  const base = "inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all cursor-pointer border border-transparent";
  const sz = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-2 text-sm";
  const v: Record<string, string> = {
    primary: "text-black",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-white/5",
    danger: "bg-rose-500/15 border-rose-500/20 text-rose-400 hover:bg-rose-500/25",
    outline: "border-border text-foreground hover:bg-white/5",
    success: "bg-emerald-500/15 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25",
  };
  return (
    <button onClick={onClick} className={`${base} ${sz} ${v[variant]} ${className}`}
      style={variant === "primary" ? { background: G, color: BG } : {}}>
      {icon}{children}
    </button>
  );
}

function SearchBar({ placeholder = "Search…", className = "" }: { placeholder?: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input placeholder={placeholder}
        className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#D4AF37]/40 transition-colors" />
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  Active: "#10B981", Inactive: MUT, Suspended: "#EF4444", Pending: G,
  Online: "#10B981", Offline: "#EF4444", Degraded: "#F59E0B",
  Healthy: "#10B981", Warning: "#F59E0B", Critical: "#EF4444",
  Enabled: "#10B981", Disabled: MUT, Beta: P, Stable: "#10B981",
  Training: G, Deployed: "#10B981", Failed: "#EF4444",
  Paid: "#10B981", Overdue: "#EF4444", Draft: MUT, Cancelled: "#EF4444",
  Admin: "#EF4444", Lawyer: G, Client: "#3B82F6", Staff: P,
  High: "#EF4444", Medium: G, Low: "#10B981", Info: "#3B82F6",
};

function Badge({ status, size = "sm" }: { status: string; size?: "sm"|"xs" }) {
  const color = STATUS_COLOR[status] || MUT;
  const sz = size === "xs" ? "text-[9px] px-1.5 py-0.5 gap-1" : "text-[10px] px-2 py-0.5 gap-1";
  return (
    <span className={`inline-flex items-center rounded-full font-bold ${sz}`}
      style={{ background: color + "20", color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      {status}
    </span>
  );
}

function HealthDot({ status }: { status: "Healthy"|"Warning"|"Critical"|"Offline" }) {
  const c = { Healthy: "#10B981", Warning: "#F59E0B", Critical: "#EF4444", Offline: MUT }[status];
  return (
    <span className="relative flex items-center justify-center w-3 h-3">
      <span className="absolute inline-flex w-full h-full rounded-full opacity-40 animate-ping" style={{ background: c }} />
      <span className="relative w-2 h-2 rounded-full" style={{ background: c }} />
    </span>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className="w-10 h-5 rounded-full transition-all relative flex-shrink-0"
      style={{ background: checked ? G : "var(--border)" }}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

// ─── Mock data ─────────────────────────────────────────────────────────────

const MONTHLY = [
  { m: "Mar", users: 240, revenue: 420, cases: 32, aiCalls: 1200 },
  { m: "Apr", users: 280, revenue: 510, cases: 41, aiCalls: 1540 },
  { m: "May", users: 310, revenue: 480, cases: 38, aiCalls: 1380 },
  { m: "Jun", users: 390, revenue: 720, cases: 56, aiCalls: 2100 },
  { m: "Jul", users: 450, revenue: 890, cases: 68, aiCalls: 2650 },
  { m: "Aug", users: 520, revenue: 980, cases: 74, aiCalls: 3100 },
];

const USERS_DATA = [
  { id: "u1", name: "Adv. Ahmad Raza", email: "ahmad@wukalaw.pk", role: "Lawyer", plan: "Enterprise", status: "Active", joined: "Jan 2024", cases: 24, lastLogin: "2h ago", verified: true },
  { id: "u2", name: "Zubair Habib", email: "zubair@arhabib.pk", role: "Client", plan: "Business", status: "Active", joined: "Feb 2024", cases: 5, lastLogin: "5h ago", verified: true },
  { id: "u3", name: "Adv. Sara Khan", email: "sara@wukalaw.pk", role: "Lawyer", plan: "Professional", status: "Active", joined: "Mar 2024", cases: 8, lastLogin: "1d ago", verified: true },
  { id: "u4", name: "Adnan Siddiqui", email: "adnan@punjabtext.pk", role: "Client", plan: "Starter", status: "Active", joined: "Mar 2024", cases: 8, lastLogin: "3h ago", verified: true },
  { id: "u5", name: "Adv. Kamran Ali", email: "kamran@wukalaw.pk", role: "Lawyer", plan: "Professional", status: "Active", joined: "Apr 2024", cases: 5, lastLogin: "30m ago", verified: true },
  { id: "u6", name: "Bilal Hassan", email: "bilal@hassasons.pk", role: "Client", plan: "Starter", status: "Pending", joined: "Jul 2024", cases: 3, lastLogin: "2d ago", verified: false },
  { id: "u7", name: "Test Account", email: "test@example.com", role: "Client", plan: "Free", status: "Suspended", joined: "Jun 2024", cases: 0, lastLogin: "30d ago", verified: false },
];

const AI_MODELS = [
  { id: "m1", name: "WukaAI-Legal-v3.1", type: "LLM", status: "Deployed", accuracy: 94, calls: "2.1M", latency: "420ms", updated: "Jul 28", provider: "Anthropic Claude 3.5" },
  { id: "m2", name: "Outcome-Predictor-v2.4", type: "ML Classifier", status: "Deployed", accuracy: 81, calls: "540K", latency: "180ms", updated: "Jul 15", provider: "Custom TensorFlow" },
  { id: "m3", name: "SimilarCase-Embeddings-v1.8", type: "Embedding", status: "Deployed", accuracy: 88, calls: "890K", latency: "95ms", updated: "Jul 20", provider: "Custom BERT" },
  { id: "m4", name: "DocumentOCR-v1.2", type: "Vision", status: "Beta", accuracy: 97, calls: "120K", latency: "2.1s", updated: "Aug 1", provider: "Azure Vision" },
  { id: "m5", name: "WukaAI-Legal-v4.0-preview", type: "LLM", status: "Training", accuracy: 0, calls: "—", latency: "—", updated: "Aug 1", provider: "Anthropic Claude 3.7" },
];

const AUDIT_DATA = [
  { id: "a1", user: "Ahmad Raza", action: "Accessed case WK-2024-001 documents", type: "Data Access", severity: "Info", ip: "202.165.12.4", time: "2m ago" },
  { id: "a2", user: "System", action: "AI model Outcome-Predictor-v2.4 retrained", type: "AI Operation", severity: "Info", ip: "Internal", time: "15m ago" },
  { id: "a3", user: "Sara Khan", action: "Downloaded evidence bundle for WK-2024-003", type: "Data Export", severity: "Medium", ip: "103.47.88.21", time: "32m ago" },
  { id: "a4", user: "Unknown", action: "Failed login attempt — 5 retries blocked", type: "Security", severity: "High", ip: "185.220.101.45", time: "1h ago" },
  { id: "a5", user: "Admin", action: "User bilal@hassasons.pk status changed to Pending", type: "User Management", severity: "Info", ip: "202.165.12.4", time: "2h ago" },
  { id: "a6", user: "System", action: "Database backup completed — 4.2 GB", type: "System", severity: "Info", ip: "Internal", time: "6h ago" },
  { id: "a7", user: "Unknown", action: "SQL injection attempt detected and blocked", type: "Security", severity: "Critical", ip: "192.168.1.105", time: "8h ago" },
];

const PLANS_DATA = [
  { id: "p1", name: "Free", price: "PKR 0", users: 124, status: "Active", features: ["3 cases", "Basic AI", "1 user"] },
  { id: "p2", name: "Starter", price: "PKR 4,999/mo", users: 87, status: "Active", features: ["10 cases", "Standard AI", "3 users", "Document mgmt"] },
  { id: "p3", name: "Professional", price: "PKR 14,999/mo", users: 52, status: "Active", features: ["Unlimited cases", "Advanced AI", "10 users", "Analytics", "Priority support"] },
  { id: "p4", name: "Business", price: "PKR 29,999/mo", users: 18, status: "Active", features: ["Everything", "AI Strategy", "25 users", "Custom integrations", "Dedicated success manager"] },
  { id: "p5", name: "Enterprise", price: "Custom", users: 6, status: "Active", features: ["Everything", "On-premise option", "Unlimited users", "SLA", "Custom AI training"] },
];

const DATASETS_DATA = [
  { id: "ds1", name: "LHC Judgments 2010-2024", size: "12.4 GB", records: "48,291", status: "Active", lastUpdated: "Aug 1", coverage: "Lahore High Court" },
  { id: "ds2", name: "SHC Judgments 2010-2024", size: "9.8 GB", records: "38,774", status: "Active", lastUpdated: "Aug 1", coverage: "Sindh High Court" },
  { id: "ds3", name: "Supreme Court Judgments", size: "6.2 GB", records: "22,108", status: "Active", lastUpdated: "Jul 30", coverage: "Supreme Court of Pakistan" },
  { id: "ds4", name: "Pakistan Statutes & Legislation", size: "2.1 GB", records: "8,420", status: "Active", lastUpdated: "Jul 25", coverage: "All legislation" },
  { id: "ds5", name: "IHC Judgments 2015-2024", size: "4.3 GB", records: "16,550", status: "Active", lastUpdated: "Jul 28", coverage: "Islamabad High Court" },
  { id: "ds6", name: "BHC Judgments 2018-2024", size: "3.1 GB", records: "11,200", status: "Training", lastUpdated: "Aug 1", coverage: "Balochistan High Court" },
];

const SECURITY_ALERTS = [
  { id: "s1", type: "Brute Force", severity: "High", ip: "185.220.101.45", detail: "5 failed login attempts in 2 minutes", time: "1h ago", resolved: false },
  { id: "s2", type: "SQL Injection", severity: "Critical", ip: "192.168.1.105", detail: "Malicious query detected in search endpoint", time: "8h ago", resolved: true },
  { id: "s3", type: "Unusual Access", severity: "Medium", ip: "41.33.21.8", detail: "User downloaded 120 documents in 10 minutes", time: "1d ago", resolved: true },
  { id: "s4", type: "API Abuse", severity: "Medium", ip: "103.21.58.9", detail: "API rate limit exceeded by 400%", time: "2d ago", resolved: true },
];

// ─── 1. Admin Dashboard ────────────────────────────────────────────────────

export function APDashboardV2({ navigate }: NavProps) {
  const pieData = [
    { name: "Lawyers", value: 127, color: G },
    { name: "Clients", value: 381, color: P },
    { name: "Staff", value: 12, color: "#3B82F6" },
  ];

  const healthItems = [
    { label: "API Server", status: "Healthy" as const, latency: "42ms", uptime: "99.98%" },
    { label: "Database Cluster", status: "Healthy" as const, latency: "8ms", uptime: "99.99%" },
    { label: "AI Model Service", status: "Healthy" as const, latency: "420ms", uptime: "99.94%" },
    { label: "File Storage", status: "Warning" as const, latency: "—", uptime: "98.2%" },
    { label: "Email Service", status: "Healthy" as const, latency: "—", uptime: "99.90%" },
  ];

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Platform overview · August 2026 · All systems operational</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="outline" icon={<Download size={14} />} size="sm">Export Report</Btn>
          <Btn icon={<RefreshCw size={14} />} size="sm">Refresh</Btn>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value="520" sub="+12 this week" trend="up" icon={<Users size={16} />} detail="127 lawyers · 381 clients · 12 staff" />
        <StatCard label="Monthly Revenue" value="PKR 980K" sub="+10.2% vs last month" trend="up" icon={<DollarSign size={16} />} color={P} detail="287 active subscriptions" />
        <StatCard label="AI Requests (Today)" value="14,821" sub="+18% vs yesterday" trend="up" icon={<Sparkles size={16} />} color="#10B981" detail="Avg latency 420ms" />
        <StatCard label="Active Cases" value="342" sub="+24 this month" trend="up" icon={<Scale size={16} />} color="#3B82F6" detail="Across all client accounts" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border p-4 bg-card">
          <SectionHead title="Platform Growth" sub="Users · Revenue · AI Usage by month" />
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={MONTHLY}>
              <defs>
                <linearGradient id="gu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={G} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={G} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={P} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={P} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
              <XAxis dataKey="m" tick={{ fill: MUT, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: MUT, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: S, border: "1px solid #1A2540", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Area type="monotone" dataKey="users" stroke={G} fill="url(#gu)" strokeWidth={2} name="Users" />
              <Area type="monotone" dataKey="revenue" stroke={P} fill="url(#gp)" strokeWidth={2} name="Revenue (K)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Distribution */}
        <div className="rounded-xl border border-border p-4 bg-card">
          <SectionHead title="User Breakdown" sub="By portal type" />
          <ResponsiveContainer width="100%" height={150}>
            <RPieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={65} innerRadius={40} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: S, border: "1px solid #1A2540", borderRadius: 8, color: "#fff", fontSize: 12 }} />
            </RPieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-1">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-muted-foreground flex-1">{d.name}</span>
                <span className="font-bold text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="rounded-xl border border-border p-4 bg-card">
          <SectionHead title="System Health" action={<Badge status="Healthy" />} />
          <div className="space-y-3">
            {healthItems.map((h, i) => (
              <div key={i} className="flex items-center gap-3">
                <HealthDot status={h.status} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground">{h.label}</div>
                  <div className="text-[10px] text-muted-foreground">Uptime {h.uptime} {h.latency !== "—" && `· ${h.latency}`}</div>
                </div>
                <Badge status={h.status} size="xs" />
              </div>
            ))}
          </div>
          <button className="mt-3 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1" onClick={() => navigate("ap-health")}>
            View full status <ChevronRight size={11} />
          </button>
        </div>

        {/* Security Alerts */}
        <div className="rounded-xl border border-border p-4 bg-card">
          <SectionHead title="Security Alerts" action={
            <Chip color="#EF4444">{SECURITY_ALERTS.filter(a => !a.resolved).length} open</Chip>
          } />
          <div className="space-y-2.5">
            {SECURITY_ALERTS.slice(0, 4).map(a => (
              <div key={a.id} className="flex items-start gap-2.5 p-2 rounded-lg border border-border/40"
                style={{ background: a.severity === "Critical" ? "#EF444410" : a.severity === "High" ? "#F59E0B10" : "transparent" }}>
                <ShieldAlert size={12} className="flex-shrink-0 mt-0.5"
                  style={{ color: a.severity === "Critical" ? "#EF4444" : a.severity === "High" ? "#F59E0B" : MUT }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground">{a.type}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{a.detail}</div>
                </div>
                <span className="text-[9px] text-muted-foreground flex-shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
          <button className="mt-3 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1" onClick={() => navigate("ap-security")}>
            View all alerts <ChevronRight size={11} />
          </button>
        </div>

        {/* Recent Audit */}
        <div className="rounded-xl border border-border p-4 bg-card">
          <SectionHead title="Recent Activity" action={<button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => navigate("ap-audit")}>All logs</button>} />
          <div className="space-y-3">
            {AUDIT_DATA.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: a.severity === "Critical" ? "#EF444422" : a.severity === "High" ? "#F59E0B22" : G + "22",
                           color: a.severity === "Critical" ? "#EF4444" : a.severity === "High" ? "#F59E0B" : G }}>
                  {a.type === "Security" ? <Shield size={10} /> : a.type === "Data Access" ? <Eye size={10} /> : <Activity size={10} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-foreground truncate">{a.action}</div>
                  <div className="text-[10px] text-muted-foreground">{a.user} · {a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Model Status + Dataset Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border p-4 bg-card">
          <SectionHead title="AI Model Status" action={<Btn variant="ghost" size="sm" onClick={() => navigate("ap-ai-model")}>Manage <ChevronRight size={12} /></Btn>} />
          <div className="space-y-2">
            {AI_MODELS.slice(0, 4).map(m => (
              <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: P + "22" }}>
                  <Brain size={13} style={{ color: P }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground">{m.name}</div>
                  <div className="text-[10px] text-muted-foreground">{m.type} · {m.latency !== "—" ? m.latency : "Training"}</div>
                </div>
                <div className="text-right">
                  <Badge status={m.status} size="xs" />
                  {m.accuracy > 0 && <div className="text-[10px] text-muted-foreground mt-0.5">{m.accuracy}% acc.</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border p-4 bg-card">
          <SectionHead title="Dataset Status" action={<Btn variant="ghost" size="sm" onClick={() => navigate("ap-datasets")}>View all <ChevronRight size={12} /></Btn>} />
          <div className="space-y-3">
            {DATASETS_DATA.slice(0, 4).map(d => (
              <div key={d.id} className="flex items-center gap-3">
                <Database size={13} style={{ color: G }} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">{d.name}</div>
                  <div className="text-[10px] text-muted-foreground">{d.records} records · {d.size}</div>
                </div>
                <Badge status={d.status} size="xs" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2. User Management ────────────────────────────────────────────────────

export function APUsersV2({ navigate }: NavProps) {
  const [filter, setFilter] = useState("All");
  const filtered = USERS_DATA.filter(u => filter === "All" || u.role === filter);

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">520 total users · 7 pending verification · 1 suspended</p>
        </div>
        <Btn icon={<UserPlus size={14} />}>Add User</Btn>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Users" value="520" sub="+12 this week" trend="up" icon={<Users size={16} />} />
        <StatCard label="Lawyers" value="127" icon={<UserCheck size={16} />} color={G} />
        <StatCard label="Clients" value="381" icon={<User size={16} />} color={P} />
        <StatCard label="Pending Verification" value="7" icon={<AlertCircle size={16} />} color="#F59E0B" />
      </div>

      <div className="flex gap-3">
        <SearchBar placeholder="Search by name, email, role..." className="flex-1" />
        <div className="flex rounded-lg overflow-hidden border border-border">
          {["All","Lawyer","Client","Staff"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className="px-3 py-2 text-xs font-semibold transition-all"
              style={filter === f ? { background: G, color: BG } : { color: MUT }}>
              {f}
            </button>
          ))}
        </div>
        <Btn variant="outline" icon={<Download size={14} />} size="sm">Export</Btn>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border" style={{ background: "var(--muted)/20" }}>
              {["User", "Role", "Plan", "Cases", "Status", "Joined", "Last Login", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-border/40 hover:bg-white/5 cursor-pointer transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: u.role === "Lawyer" ? G + "22" : P + "22", color: u.role === "Lawyer" ? G : P }}>
                      {u.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground flex items-center gap-1">
                        {u.name}
                        {u.verified && <CheckCircle size={11} className="text-emerald-400" />}
                      </div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><Badge status={u.role} size="xs" /></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{u.plan}</td>
                <td className="px-4 py-3 text-sm text-foreground">{u.cases}</td>
                <td className="px-4 py-3"><Badge status={u.status} size="xs" /></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{u.joined}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{u.lastLogin}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1 text-muted-foreground hover:text-foreground"><Eye size={13} /></button>
                    <button className="p-1 text-muted-foreground hover:text-foreground"><Edit3 size={13} /></button>
                    <button className="p-1 text-muted-foreground hover:text-rose-400"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">Showing {filtered.length} of 520 users</span>
          <div className="flex gap-1">
            <button className="px-2.5 py-1 text-xs border border-border rounded-lg text-muted-foreground hover:text-foreground">Previous</button>
            <button className="px-2.5 py-1 text-xs border border-border rounded-lg" style={{ background: G, color: BG }}>1</button>
            <button className="px-2.5 py-1 text-xs border border-border rounded-lg text-muted-foreground hover:text-foreground">2</button>
            <button className="px-2.5 py-1 text-xs border border-border rounded-lg text-muted-foreground hover:text-foreground">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 3. Lawyer Management ─────────────────────────────────────────────────

export function APLawyersV2({ navigate }: NavProps) {
  const lawyers = USERS_DATA.filter(u => u.role === "Lawyer");

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Lawyer Management</h1>
          <p className="text-sm text-muted-foreground">127 registered lawyers · 119 active · 8 pending bar verification</p>
        </div>
        <Btn icon={<UserPlus size={14} />}>Add Lawyer</Btn>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Lawyers" value="127" icon={<UserCheck size={16} />} />
        <StatCard label="Verified" value="119" icon={<CheckCircle size={16} />} color="#10B981" />
        <StatCard label="Pending Verification" value="8" icon={<Clock size={16} />} color={G} />
        <StatCard label="Avg Cases/Lawyer" value="6.2" icon={<Scale size={16} />} color={P} />
      </div>

      <div className="flex gap-3">
        <SearchBar placeholder="Search lawyers by name, bar number, specialisation..." className="flex-1" />
        <Btn variant="outline" icon={<Filter size={14} />} size="sm">Filter</Btn>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border" style={{ background: "var(--muted)/20" }}>
              {["Lawyer", "Bar No.", "Specialisation", "Active Cases", "Plan", "Status", "Verified", "Actions"].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lawyers.map(l => (
              <tr key={l.id} className="border-b border-border/40 hover:bg-white/5 cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: G + "22", color: G }}>
                      {l.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{l.name}</div>
                      <div className="text-xs text-muted-foreground">{l.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">LHC-{Math.floor(Math.random() * 90000 + 10000)}</td>
                <td className="px-4 py-3 text-xs text-foreground">Commercial Law</td>
                <td className="px-4 py-3 text-sm text-foreground">{l.cases}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{l.plan}</td>
                <td className="px-4 py-3"><Badge status={l.status} size="xs" /></td>
                <td className="px-4 py-3">
                  {l.verified ? <CheckCircle size={14} className="text-emerald-400" /> : <AlertCircle size={14} className="text-amber-400" />}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Btn variant="ghost" size="sm">View</Btn>
                    {!l.verified && <Btn variant="success" size="sm" icon={<Check size={11} />}>Verify</Btn>}
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

// ─── 4. Client Management ─────────────────────────────────────────────────

export function APClientsV2({ navigate }: NavProps) {
  const clients = USERS_DATA.filter(u => u.role === "Client");

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Client Management</h1>
          <p className="text-sm text-muted-foreground">381 registered clients across all subscription tiers</p>
        </div>
        <Btn icon={<UserPlus size={14} />}>Add Client</Btn>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Clients" value="381" icon={<Users size={16} />} />
        <StatCard label="Enterprise/Business" value="24" icon={<Building size={16} />} color={G} />
        <StatCard label="Avg Revenue/Client" value="PKR 3,417/mo" icon={<DollarSign size={16} />} color={P} />
        <StatCard label="Churn Rate (MTD)" value="1.2%" sub="-0.3% vs last month" trend="down" icon={<TrendingDown size={16} />} color="#10B981" />
      </div>

      <div className="flex gap-3">
        <SearchBar placeholder="Search clients by name, email, company..." className="flex-1" />
        <Btn variant="outline" icon={<Filter size={14} />} size="sm">Filter</Btn>
        <Btn variant="outline" icon={<Download size={14} />} size="sm">Export</Btn>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border" style={{ background: "var(--muted)/20" }}>
              {["Client", "Cases", "Plan", "Revenue", "Status", "Joined", "Last Active", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id} className="border-b border-border/40 hover:bg-white/5 cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: P + "22", color: P }}>
                      {c.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">{c.cases}</td>
                <td className="px-4 py-3"><Chip>{c.plan}</Chip></td>
                <td className="px-4 py-3 text-sm font-semibold" style={{ color: G }}>PKR {(Math.random() * 30 + 5).toFixed(0)}K</td>
                <td className="px-4 py-3"><Badge status={c.status} size="xs" /></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{c.joined}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{c.lastLogin}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1 text-muted-foreground hover:text-foreground"><Eye size={13} /></button>
                    <button className="p-1 text-muted-foreground hover:text-foreground"><Edit3 size={13} /></button>
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

// ─── 5. Role & Permission Management ──────────────────────────────────────

export function APRolesV2({ navigate }: NavProps) {
  const roles = [
    { name: "Super Admin", users: 2, color: "#EF4444", perms: ["All permissions", "System configuration", "Data deletion", "Billing management", "AI model deployment"] },
    { name: "Admin", users: 5, color: P, perms: ["User management", "Analytics access", "Content management", "Support management", "Dataset management"] },
    { name: "Lawyer", users: 127, color: G, perms: ["Case management", "AI tools access", "Client management", "Document upload", "Hearing management"] },
    { name: "Client", users: 381, color: "#3B82F6", perms: ["View own cases", "AI summary view", "Document download", "Message lawyer", "Report download"] },
    { name: "Staff / Paralegal", users: 12, color: "#10B981", perms: ["View assigned cases", "Document management", "Task management", "Calendar access"] },
  ];

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Roles & Permissions</h1>
          <p className="text-sm text-muted-foreground">5 roles · 47 granular permissions managed</p>
        </div>
        <Btn icon={<Plus size={14} />}>Add Role</Btn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map((r, i) => (
          <div key={i} className="rounded-xl border border-border p-5 bg-card hover:border-[#D4AF37]/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: r.color + "22" }}>
                  <Key size={15} style={{ color: r.color }} />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.users} users</div>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-1 text-muted-foreground hover:text-foreground"><Edit3 size={13} /></button>
              </div>
            </div>
            <hr className="border-border mb-3" />
            <div className="space-y-1.5">
              {r.perms.map((p, j) => (
                <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check size={10} style={{ color: r.color }} className="flex-shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border p-5 bg-card">
        <SectionHead title="Permission Matrix" sub="Granular access control overview" />
        <div className="overflow-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-muted-foreground font-semibold">Permission</th>
                {roles.map(r => <th key={r.name} className="text-center py-2 px-3 font-semibold" style={{ color: r.color }}>{r.name.split(" ")[0]}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                "User Management", "AI Model Access", "Case Management", "Billing Management",
                "Analytics", "System Config", "Data Export", "Document Upload",
              ].map((perm, i) => (
                <tr key={i} className="border-b border-border/30">
                  <td className="py-2 pr-4 text-muted-foreground">{perm}</td>
                  {[true, i < 5, i < 3, i === 2, i < 4].map((has, j) => (
                    <td key={j} className="text-center py-2 px-3">
                      {has ? <Check size={12} className="mx-auto text-emerald-400" /> : <X size={12} className="mx-auto text-muted-foreground/40" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── 6. AI Model Management ───────────────────────────────────────────────

export function APAIModelV2({ navigate }: NavProps) {
  const [selected, setSelected] = useState("m1");
  const model = AI_MODELS.find(m => m.id === selected)!;

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">AI Model Management</h1>
          <p className="text-sm text-muted-foreground">5 models deployed · 3.5M total API calls this month</p>
        </div>
        <Btn icon={<Plus size={14} />}>Deploy New Model</Btn>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Deployed Models" value="4" icon={<Brain size={16} />} />
        <StatCard label="Total API Calls (Aug)" value="3.5M" sub="+22% vs Jul" trend="up" icon={<Zap size={16} />} color={P} />
        <StatCard label="Avg Accuracy" value="90.2%" icon={<Target size={16} />} color="#10B981" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model list */}
        <div className="space-y-2">
          {AI_MODELS.map(m => (
            <div key={m.id}
              className="rounded-xl border p-3.5 cursor-pointer transition-all"
              style={selected === m.id ? { borderColor: P, background: P + "11" } : { borderColor: "var(--border)" }}
              onClick={() => setSelected(m.id)}>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: P + "22" }}>
                  <Brain size={12} style={{ color: P }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">{m.name}</div>
                  <div className="text-[10px] text-muted-foreground">{m.type}</div>
                </div>
                <Badge status={m.status} size="xs" />
              </div>
            </div>
          ))}
        </div>

        {/* Model detail */}
        <div className="lg:col-span-2 rounded-xl border border-border p-5 bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">{model.name}</h3>
              <div className="text-xs text-muted-foreground mt-0.5">{model.provider} · {model.type}</div>
            </div>
            <div className="flex gap-2">
              <Btn variant="outline" size="sm" icon={<RefreshCw size={12} />}>Retrain</Btn>
              <Badge status={model.status} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: "Accuracy", value: model.accuracy > 0 ? `${model.accuracy}%` : "Training…" },
              { label: "API Calls (Aug)", value: model.calls },
              { label: "Avg Latency", value: model.latency },
            ].map((s, i) => (
              <div key={i} className="rounded-lg border border-border p-3 text-center">
                <div className="text-lg font-black text-foreground">{s.value}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <div className="text-xs font-semibold text-muted-foreground mb-2">Accuracy Trend</div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={[{m:"Mar",v:87},{m:"Apr",v:89},{m:"May",v:88},{m:"Jun",v:91},{m:"Jul",v:93},{m:"Aug",v:model.accuracy || 0}]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
                <XAxis dataKey="m" tick={{ fill: MUT, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[80, 100]} tick={{ fill: MUT, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: S, border: "1px solid #1A2540", borderRadius: 8, color: "#fff", fontSize: 11 }} />
                <Line type="monotone" dataKey="v" stroke={P} strokeWidth={2} dot={false} name="Accuracy %" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-2">
            <Btn variant="ghost" size="sm" icon={<Eye size={12} />}>View Logs</Btn>
            <Btn variant="ghost" size="sm" icon={<Download size={12} />}>Export Metrics</Btn>
            <Btn variant="danger" size="sm" icon={<X size={12} />}>Disable Model</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 7. Dataset Management ────────────────────────────────────────────────

export function APDatasetsV2({ navigate }: NavProps) {
  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Dataset Management</h1>
          <p className="text-sm text-muted-foreground">6 datasets · 145,343 total court judgments · 37.9 GB</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="outline" icon={<Upload size={14} />}>Import Dataset</Btn>
          <Btn icon={<Plus size={14} />}>Add Source</Btn>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Records" value="145K+" icon={<Database size={16} />} />
        <StatCard label="Storage Used" value="37.9 GB" icon={<HardDrive size={16} />} color={G} />
        <StatCard label="Last Sync" value="Today" icon={<RefreshCw size={16} />} color="#10B981" />
        <StatCard label="Coverage" value="5 courts" icon={<Scale size={16} />} color={P} />
      </div>

      <div className="space-y-4">
        {DATASETS_DATA.map(d => (
          <div key={d.id} className="rounded-xl border border-border p-5 bg-card hover:border-[#D4AF37]/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: G + "22" }}>
                <Database size={16} style={{ color: G }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-foreground">{d.name}</span>
                  <Badge status={d.status} size="xs" />
                </div>
                <div className="text-xs text-muted-foreground mb-3">{d.coverage} · Updated {d.lastUpdated}</div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Records</div>
                    <div className="text-sm font-bold text-foreground">{d.records}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Size</div>
                    <div className="text-sm font-bold text-foreground">{d.size}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Last Updated</div>
                    <div className="text-sm font-bold text-foreground">{d.lastUpdated}</div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-white/10">
                  <div className="h-full rounded-full" style={{ width: `${Math.random() * 30 + 70}%`, background: d.status === "Training" ? G : "#10B981" }} />
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Btn variant="ghost" size="sm" icon={<RefreshCw size={12} />}>Sync</Btn>
                <Btn variant="ghost" size="sm" icon={<MoreHorizontal size={12} />} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 8. Knowledge Base Management ─────────────────────────────────────────

export function APKnowledgeBasePage({ navigate }: NavProps) {
  const [tab, setTab] = useState("articles");
  const articles = [
    { id: "kb1", title: "How to File a Case in WukaLAW", category: "Getting Started", views: 1240, status: "Published", updated: "Jul 28" },
    { id: "kb2", title: "Understanding AI Win Probability Scores", category: "AI Features", views: 890, status: "Published", updated: "Jul 25" },
    { id: "kb3", title: "Setting Up Your Client Portal", category: "Onboarding", views: 760, status: "Published", updated: "Jul 20" },
    { id: "kb4", title: "Pakistani Court System Overview for AI Analysis", category: "Legal Context", views: 540, status: "Published", updated: "Jul 15" },
    { id: "kb5", title: "Billing and Subscription Management Guide", category: "Billing", views: 320, status: "Draft", updated: "Aug 1" },
  ];

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground">42 articles · 12 categories · 3 drafts pending review</p>
        </div>
        <Btn icon={<Plus size={14} />}>New Article</Btn>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Articles" value="42" icon={<BookOpen size={16} />} />
        <StatCard label="Monthly Views" value="18,240" sub="+12% vs last month" trend="up" icon={<Eye size={16} />} color={G} />
        <StatCard label="Avg Rating" value="4.7/5" icon={<Star size={16} />} color="#10B981" />
        <StatCard label="Drafts" value="3" icon={<Edit3 size={16} />} color={P} />
      </div>

      <div className="flex gap-2 border-b border-border">
        {["articles", "categories", "faq"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 text-sm font-semibold capitalize border-b-2 -mb-px transition-all"
            style={tab === t ? { color: G, borderColor: G } : { color: MUT, borderColor: "transparent" }}>
            {t === "faq" ? "FAQ" : t}
          </button>
        ))}
      </div>

      {tab === "articles" && (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border" style={{ background: "var(--muted)/20" }}>
                {["Title", "Category", "Views", "Status", "Updated", ""].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articles.map(a => (
                <tr key={a.id} className="border-b border-border/40 hover:bg-white/5 cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <FileText size={13} style={{ color: G }} />
                      <span className="text-sm font-medium text-foreground">{a.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Chip>{a.category}</Chip></td>
                  <td className="px-4 py-3 text-sm text-foreground">{a.views.toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge status={a.status} size="xs" /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{a.updated}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1 text-muted-foreground hover:text-foreground"><Edit3 size={13} /></button>
                      <button className="p-1 text-muted-foreground hover:text-foreground"><Eye size={13} /></button>
                      <button className="p-1 text-muted-foreground hover:text-rose-400"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── 9. System Analytics ──────────────────────────────────────────────────

export function APAnalyticsV2({ navigate }: NavProps) {
  const revenueByPlan = [
    { name: "Enterprise", value: 180000, color: G },
    { name: "Business", value: 360000, color: P },
    { name: "Professional", value: 390000, color: "#3B82F6" },
    { name: "Starter", value: 435000, color: "#10B981" },
  ];

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">System Analytics</h1>
          <p className="text-sm text-muted-foreground">Platform performance · August 2026 · All portals</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg overflow-hidden border border-border">
            {["7D", "30D", "90D", "YTD"].map(p => (
              <button key={p} className="px-3 py-1.5 text-xs font-semibold transition-all"
                style={p === "30D" ? { background: G, color: BG } : { color: MUT }}>
                {p}
              </button>
            ))}
          </div>
          <Btn variant="outline" icon={<Download size={14} />} size="sm">Export</Btn>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Monthly Recurring Revenue" value="PKR 980K" sub="+10.2% MoM" trend="up" icon={<TrendingUp size={16} />} />
        <StatCard label="Annual Recurring Revenue" value="PKR 11.76M" sub="Projected" icon={<BarChart size={16} />} color={P} />
        <StatCard label="New Users (Aug)" value="74" sub="+18% vs Jul" trend="up" icon={<UserPlus size={16} />} color="#10B981" />
        <StatCard label="AI Calls (Aug)" value="3.1M" sub="+22% vs Jul" trend="up" icon={<Sparkles size={16} />} color={G} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border p-4 bg-card">
          <SectionHead title="Revenue & User Growth" sub="Monthly trend analysis" />
          <ResponsiveContainer width="100%" height={230}>
            <RBarChart data={MONTHLY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
              <XAxis dataKey="m" tick={{ fill: MUT, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: MUT, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: MUT, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: S, border: "1px solid #1A2540", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="revenue" fill={G} radius={[3,3,0,0]} name="Revenue (K)" />
              <Bar yAxisId="right" dataKey="users" fill={P} radius={[3,3,0,0]} name="Users" />
            </RBarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border p-4 bg-card">
          <SectionHead title="Revenue by Plan" />
          <ResponsiveContainer width="100%" height={170}>
            <RPieChart>
              <Pie data={revenueByPlan} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={45} paddingAngle={2}>
                {revenueByPlan.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: S, border: "1px solid #1A2540", borderRadius: 8, color: "#fff", fontSize: 11 }} formatter={(v: number) => `PKR ${(v/1000).toFixed(0)}K`} />
            </RPieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-1">
            {revenueByPlan.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground flex-1">{d.name}</span>
                <span className="font-bold text-foreground">PKR {(d.value/1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border p-4 bg-card">
          <SectionHead title="AI Usage Trend" sub="API calls per month" />
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={MONTHLY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
              <XAxis dataKey="m" tick={{ fill: MUT, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: MUT, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: S, border: "1px solid #1A2540", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Line type="monotone" dataKey="aiCalls" stroke={P} strokeWidth={2} dot={false} name="AI Calls" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border p-4 bg-card">
          <SectionHead title="Top Metrics" />
          <div className="space-y-3">
            {[
              { label: "Avg Session Duration", value: "18m 42s", change: "+2m" },
              { label: "Daily Active Users", value: "284", change: "+14%" },
              { label: "AI Satisfaction Score", value: "4.6/5", change: "+0.2" },
              { label: "Support Tickets (Aug)", value: "38", change: "-12%" },
              { label: "Avg Case Resolution Time", value: "4.2 months", change: "-0.3m" },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/30">
                <span className="text-xs text-muted-foreground">{m.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{m.value}</span>
                  <span className="text-[10px] text-emerald-400">{m.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 10. Audit Logs ────────────────────────────────────────────────────────

export function APAuditV2({ navigate }: NavProps) {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? AUDIT_DATA : AUDIT_DATA.filter(a => a.type === filter || a.severity === filter);

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">Complete tamper-proof activity log · 7 events today</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="outline" icon={<Filter size={14} />} size="sm">Advanced Filter</Btn>
          <Btn variant="outline" icon={<Download size={14} />} size="sm">Export</Btn>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Events (Aug)" value="8,421" icon={<Activity size={16} />} />
        <StatCard label="Security Events" value="12" icon={<ShieldAlert size={16} />} color="#EF4444" />
        <StatCard label="Data Exports" value="47" icon={<Download size={16} />} color={G} />
        <StatCard label="AI Operations" value="3,100" icon={<Sparkles size={16} />} color={P} />
      </div>

      <div className="flex gap-3">
        <SearchBar placeholder="Search by user, action, IP address..." className="flex-1" />
        <div className="flex rounded-lg overflow-hidden border border-border">
          {["All","Security","Data Access","AI Operation","System"].map(f => (
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
            <tr className="border-b border-border" style={{ background: "var(--muted)/20" }}>
              {["Severity", "User", "Action", "Type", "IP Address", "Time", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AUDIT_DATA.map(a => (
              <tr key={a.id} className="border-b border-border/40 hover:bg-white/5"
                style={{ background: a.severity === "Critical" ? "#EF444408" : a.severity === "High" ? "#F59E0B08" : "" }}>
                <td className="px-4 py-3">
                  <Badge status={a.severity} size="xs" />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{a.user}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[280px]">{a.action}</td>
                <td className="px-4 py-3"><Chip>{a.type}</Chip></td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{a.ip}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{a.time}</td>
                <td className="px-4 py-3">
                  <button className="p-1 text-muted-foreground hover:text-foreground"><Eye size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── 11. Security Center ──────────────────────────────────────────────────

export function APSecurityV2({ navigate }: NavProps) {
  const [toggles, setToggles] = useState({
    mfa: true, ipWhitelist: false, rateLimit: true, bruteForce: true,
    dataEncryption: true, auditLogging: true, sessionTimeout: true,
  });

  const toggle = (key: keyof typeof toggles) => setToggles(t => ({ ...t, [key]: !t[key] }));

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Security Center</h1>
          <p className="text-sm text-muted-foreground">Platform security posture · 1 active threat · Security score 87/100</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-black" style={{ color: "#10B981" }}>87</div>
            <div className="text-[10px] text-muted-foreground">Security Score</div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center" style={{ borderColor: "#10B981" }}>
            <Shield size={16} style={{ color: "#10B981" }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Active Threats" value="1" icon={<ShieldAlert size={16} />} color="#EF4444" />
        <StatCard label="Resolved Alerts (Aug)" value="38" icon={<CheckCircle size={16} />} color="#10B981" />
        <StatCard label="Blocked Requests" value="1,284" icon={<X size={16} />} color={G} />
        <StatCard label="Failed Logins (24h)" value="23" icon={<Lock size={16} />} color="#F59E0B" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <div className="rounded-xl border border-border p-5 bg-card">
          <SectionHead title="Active Security Alerts" />
          <div className="space-y-3">
            {SECURITY_ALERTS.map(a => (
              <div key={a.id} className="p-3.5 rounded-xl border transition-colors"
                style={{ borderColor: a.resolved ? "var(--border)" : a.severity === "Critical" ? "#EF444440" : "#F59E0B40",
                         background: a.resolved ? "transparent" : a.severity === "Critical" ? "#EF444408" : "#F59E0B08" }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge status={a.severity} size="xs" />
                      <Chip>{a.type}</Chip>
                      {a.resolved && <Chip color="#10B981">Resolved</Chip>}
                    </div>
                    <div className="text-xs text-foreground font-medium">{a.detail}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">IP: {a.ip} · {a.time}</div>
                  </div>
                  {!a.resolved && (
                    <Btn variant="success" size="sm" icon={<Check size={11} />}>Resolve</Btn>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Controls */}
        <div className="rounded-xl border border-border p-5 bg-card">
          <SectionHead title="Security Controls" />
          <div className="space-y-1">
            {[
              { key: "mfa" as const, label: "Multi-Factor Authentication", desc: "Require MFA for all admin accounts" },
              { key: "bruteForce" as const, label: "Brute Force Protection", desc: "Auto-block after 5 failed attempts" },
              { key: "rateLimit" as const, label: "API Rate Limiting", desc: "100 requests/minute per user" },
              { key: "ipWhitelist" as const, label: "IP Whitelisting", desc: "Restrict admin access by IP" },
              { key: "dataEncryption" as const, label: "Data Encryption at Rest", desc: "AES-256 encryption for all data" },
              { key: "auditLogging" as const, label: "Audit Logging", desc: "Log all user actions and data access" },
              { key: "sessionTimeout" as const, label: "Session Timeout", desc: "Auto-logout after 4 hours inactivity" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <div className="text-sm font-semibold text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
                <Toggle checked={toggles[item.key]} onChange={() => toggle(item.key)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 12. API Management ───────────────────────────────────────────────────

export function APAPIManagementPage({ navigate }: NavProps) {
  const endpoints = [
    { path: "/api/v1/cases", method: "GET", calls: "48,291", latency: "82ms", errors: "0.2%", status: "Healthy" },
    { path: "/api/v1/ai/predict", method: "POST", calls: "14,821", latency: "420ms", errors: "0.8%", status: "Healthy" },
    { path: "/api/v1/documents/upload", method: "POST", calls: "3,401", latency: "1.2s", errors: "1.1%", status: "Warning" },
    { path: "/api/v1/users/auth", method: "POST", calls: "22,150", latency: "95ms", errors: "2.4%", status: "Warning" },
    { path: "/api/v1/hearings", method: "GET", calls: "8,920", latency: "68ms", errors: "0.1%", status: "Healthy" },
  ];

  const apiKeys = [
    { name: "Production API Key", key: "wuka_prod_••••••••••••8f2a", scope: "Full Access", created: "Jan 2024", lastUsed: "2m ago", status: "Active" },
    { name: "Mobile App Key", key: "wuka_mob_••••••••••••3c1b", scope: "Read-only", created: "Mar 2024", lastUsed: "1h ago", status: "Active" },
    { name: "Integration Key (Zapier)", key: "wuka_int_••••••••••••7d9e", scope: "Limited", created: "May 2024", lastUsed: "2d ago", status: "Active" },
  ];

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">API Management</h1>
          <p className="text-sm text-muted-foreground">REST API v1 · 97.8% uptime · 14,821 calls today</p>
        </div>
        <Btn icon={<Plus size={14} />}>Generate API Key</Btn>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total API Calls (Aug)" value="1.2M" sub="+18% vs Jul" trend="up" icon={<Zap size={16} />} />
        <StatCard label="Avg Latency" value="287ms" icon={<Gauge size={16} />} color={G} />
        <StatCard label="Error Rate" value="0.6%" sub="Target: <1%" icon={<AlertCircle size={16} />} color="#10B981" />
        <StatCard label="Active API Keys" value="3" icon={<Key size={16} />} color={P} />
      </div>

      <div className="rounded-xl border border-border p-5 bg-card">
        <SectionHead title="Endpoint Performance" sub="Real-time API metrics" />
        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Endpoint", "Method", "Calls (24h)", "Avg Latency", "Error Rate", "Status"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground py-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {endpoints.map((e, i) => (
                <tr key={i} className="border-b border-border/30">
                  <td className="py-3 pr-4 text-xs font-mono text-foreground">{e.path}</td>
                  <td className="py-3 pr-4">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: e.method === "POST" ? P + "22" : G + "22", color: e.method === "POST" ? P : G }}>
                      {e.method}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-sm text-foreground">{e.calls}</td>
                  <td className="py-3 pr-4 text-sm text-foreground">{e.latency}</td>
                  <td className="py-3 pr-4 text-sm" style={{ color: parseFloat(e.errors) > 1.5 ? "#EF4444" : parseFloat(e.errors) > 0.5 ? "#F59E0B" : "#10B981" }}>{e.errors}</td>
                  <td className="py-3 pr-4"><HealthDot status={e.status as any} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-border p-5 bg-card">
        <SectionHead title="API Keys" action={<Btn size="sm" icon={<Plus size={12} />}>New Key</Btn>} />
        <div className="space-y-3">
          {apiKeys.map((k, i) => (
            <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl border border-border/50 hover:border-border">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: G + "22" }}>
                <Key size={14} style={{ color: G }} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{k.name}</div>
                <div className="text-xs font-mono text-muted-foreground mt-0.5">{k.key}</div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div>Scope: {k.scope}</div>
                <div>Last used: {k.lastUsed}</div>
              </div>
              <Badge status={k.status} size="xs" />
              <div className="flex gap-1">
                <button className="p-1 text-muted-foreground hover:text-foreground"><Copy size={13} /></button>
                <button className="p-1 text-muted-foreground hover:text-rose-400"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 13. Billing & Subscriptions ──────────────────────────────────────────

export function APBillingV2({ navigate }: NavProps) {
  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Billing & Subscriptions</h1>
          <p className="text-sm text-muted-foreground">PKR 980K MRR · 287 active subscriptions · 4 overdue</p>
        </div>
        <Btn icon={<Plus size={14} />}>Create Plan</Btn>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="MRR" value="PKR 980K" sub="+10.2% MoM" trend="up" icon={<TrendingUp size={16} />} />
        <StatCard label="ARR" value="PKR 11.76M" icon={<BarChart size={16} />} color={P} />
        <StatCard label="Active Subscriptions" value="287" sub="+14 this month" trend="up" icon={<CheckCircle size={16} />} color="#10B981" />
        <StatCard label="Overdue Invoices" value="4" sub="PKR 82K outstanding" icon={<AlertCircle size={16} />} color="#EF4444" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plans */}
        <div className="rounded-xl border border-border p-4 bg-card">
          <SectionHead title="Subscription Plans" action={<Btn size="sm" icon={<Edit3 size={12} />}>Manage Plans</Btn>} />
          <div className="space-y-3">
            {PLANS_DATA.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-border transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: G + "22" }}>
                  <CreditCard size={13} style={{ color: G }} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.price}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-foreground">{p.users}</div>
                  <div className="text-[10px] text-muted-foreground">subscribers</div>
                </div>
                <Badge status={p.status} size="xs" />
              </div>
            ))}
          </div>
        </div>

        {/* Revenue chart */}
        <div className="rounded-xl border border-border p-4 bg-card">
          <SectionHead title="Revenue Trend" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY}>
              <defs>
                <linearGradient id="grv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={G} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={G} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
              <XAxis dataKey="m" tick={{ fill: MUT, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: MUT, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: S, border: "1px solid #1A2540", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke={G} fill="url(#grv)" strokeWidth={2} name="Revenue (K)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── 14. Contact & Support Management ─────────────────────────────────────

export function APSupportPage({ navigate }: NavProps) {
  const tickets = [
    { id: "T-1024", user: "Zubair Habib", subject: "AI prediction seems off for my case", priority: "Medium", status: "Open", created: "2h ago", assignee: "Support Team" },
    { id: "T-1023", user: "Adnan Siddiqui", subject: "Cannot upload PDF over 50MB", priority: "High", status: "In Progress", created: "5h ago", assignee: "Tech Team" },
    { id: "T-1022", user: "Bilal Hassan", subject: "Billing invoice discrepancy", priority: "High", status: "Open", created: "1d ago", assignee: "Billing Team" },
    { id: "T-1021", user: "Ahmad Raza", subject: "How to export case reports as PDF", priority: "Low", status: "Resolved", created: "2d ago", assignee: "Support Team" },
  ];

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Contact & Support</h1>
          <p className="text-sm text-muted-foreground">38 tickets this month · 2 open · Avg response 2.4h</p>
        </div>
        <Btn icon={<Plus size={14} />}>Create Ticket</Btn>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Open Tickets" value="2" icon={<Inbox size={16} />} color="#EF4444" />
        <StatCard label="In Progress" value="1" icon={<Clock size={16} />} color={G} />
        <StatCard label="Resolved (Aug)" value="35" icon={<CheckCircle size={16} />} color="#10B981" />
        <StatCard label="Avg Response" value="2.4h" icon={<Gauge size={16} />} color={P} />
      </div>

      <div className="flex gap-3">
        <SearchBar placeholder="Search tickets by ID, user, subject..." className="flex-1" />
        <div className="flex rounded-lg overflow-hidden border border-border">
          {["All","Open","In Progress","Resolved"].map(f => (
            <button key={f} className="px-2.5 py-2 text-xs font-semibold transition-all text-muted-foreground hover:text-foreground">{f}</button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border" style={{ background: "var(--muted)/20" }}>
              {["Ticket ID", "User", "Subject", "Priority", "Assignee", "Status", "Created", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id} className="border-b border-border/40 hover:bg-white/5 cursor-pointer">
                <td className="px-4 py-3 text-xs font-mono" style={{ color: G }}>{t.id}</td>
                <td className="px-4 py-3 text-sm text-foreground">{t.user}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">{t.subject}</td>
                <td className="px-4 py-3"><Badge status={t.priority} size="xs" /></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{t.assignee}</td>
                <td className="px-4 py-3"><Badge status={t.status} size="xs" /></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{t.created}</td>
                <td className="px-4 py-3">
                  <Btn variant="ghost" size="sm">View</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── 15. CMS / Blog Management ────────────────────────────────────────────

export function APCMSPage({ navigate }: NavProps) {
  const posts = [
    { id: "b1", title: "AI is Transforming Pakistani Legal Practice in 2026", category: "AI & Law", author: "WukaLAW Team", status: "Published", date: "Aug 1", views: 2840 },
    { id: "b2", title: "Top 10 Things Clients Should Know Before Hiring a Lawyer", category: "Legal Tips", author: "Adv. Ahmad Raza", status: "Published", date: "Jul 28", views: 1920 },
    { id: "b3", title: "Supreme Court of Pakistan's New Digital Filing System", category: "News", author: "Editorial", status: "Published", date: "Jul 20", views: 3410 },
    { id: "b4", title: "Understanding SECP Regulations for Corporate Clients", category: "Corporate Law", author: "WukaLAW Team", status: "Draft", date: "Aug 2", views: 0 },
  ];

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">CMS / Blog Management</h1>
          <p className="text-sm text-muted-foreground">24 published posts · 3 drafts · 18,240 monthly readers</p>
        </div>
        <Btn icon={<Plus size={14} />}>New Post</Btn>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Published Posts" value="24" icon={<Newspaper size={16} />} />
        <StatCard label="Monthly Readers" value="18.2K" sub="+12% vs last month" trend="up" icon={<Eye size={16} />} color={G} />
        <StatCard label="Drafts" value="3" icon={<Edit3 size={16} />} color={P} />
        <StatCard label="Avg Read Time" value="4.2 min" icon={<Clock size={16} />} color="#10B981" />
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border" style={{ background: "var(--muted)/20" }}>
              {["Title", "Category", "Author", "Views", "Status", "Date", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id} className="border-b border-border/40 hover:bg-white/5 cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Newspaper size={13} style={{ color: G }} />
                    <span className="text-sm font-medium text-foreground max-w-[240px] truncate">{p.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><Chip>{p.category}</Chip></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{p.author}</td>
                <td className="px-4 py-3 text-sm text-foreground">{p.views.toLocaleString()}</td>
                <td className="px-4 py-3"><Badge status={p.status} size="xs" /></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{p.date}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1 text-muted-foreground hover:text-foreground"><Edit3 size={13} /></button>
                    <button className="p-1 text-muted-foreground hover:text-foreground"><Eye size={13} /></button>
                    <button className="p-1 text-muted-foreground hover:text-rose-400"><Trash2 size={13} /></button>
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

// ─── 16. Platform Settings ────────────────────────────────────────────────

export function APSettingsV2({ navigate }: NavProps) {
  const [section, setSection] = useState("general");
  const sections = [
    { id: "general", label: "General", icon: <Settings size={14} /> },
    { id: "email", label: "Email & SMTP", icon: <Mail size={14} /> },
    { id: "integrations", label: "Integrations", icon: <Link size={14} /> },
    { id: "ai", label: "AI Configuration", icon: <Sparkles size={14} /> },
    { id: "legal", label: "Legal & Compliance", icon: <Scale size={14} /> },
    { id: "maintenance", label: "Maintenance", icon: <Server size={14} /> },
  ];

  return (
    <div className="p-6 overflow-auto h-full">
      <h1 className="text-2xl font-black text-foreground mb-5">Platform Settings</h1>
      <div className="flex gap-6">
        <div className="w-48 flex-shrink-0 space-y-1">
          {sections.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all"
              style={section === s.id ? { background: G + "22", color: G } : { color: "var(--muted-foreground)" }}>
              {s.icon}{s.label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-4">
          {section === "general" && (
            <>
              <div className="rounded-xl border border-border p-5 bg-card">
                <SectionHead title="Platform Information" />
                {[
                  { label: "Platform Name", val: "WukaLAW" },
                  { label: "Platform URL", val: "https://app.wukalaw.pk" },
                  { label: "Support Email", val: "support@wukalaw.pk" },
                  { label: "Default Language", val: "English (Pakistan)" },
                  { label: "Timezone", val: "PKT (UTC+5)" },
                  { label: "Currency", val: "Pakistani Rupee (PKR)" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/30">
                    <span className="text-sm text-muted-foreground">{f.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{f.val}</span>
                      <button className="text-muted-foreground hover:text-foreground"><Edit3 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-border p-5 bg-card">
                <SectionHead title="Feature Flags" />
                {[
                  { label: "AI Legal Assistant", desc: "Enable WukaAI chatbot for all portals", on: true },
                  { label: "Court Outcome Prediction", desc: "ML-based case outcome predictions", on: true },
                  { label: "Similar Case Explorer", desc: "Semantic search for precedents", on: true },
                  { label: "Urdu Interface", desc: "Allow Urdu language toggle", on: false },
                  { label: "Mobile App API", desc: "Expose endpoints for mobile app", on: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border/30">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                    <Toggle checked={item.on} onChange={() => {}} />
                  </div>
                ))}
              </div>
            </>
          )}
          {section === "ai" && (
            <div className="rounded-xl border border-border p-5 bg-card">
              <SectionHead title="AI Configuration" />
              {[
                { label: "Primary LLM Provider", val: "Anthropic Claude 3.5 Sonnet" },
                { label: "AI Response Language", val: "English / Urdu (auto-detect)" },
                { label: "Max Context Window", val: "200K tokens" },
                { label: "Rate Limit (per user/min)", val: "30 requests" },
                { label: "AI Confidence Threshold", val: "60% (below = 'Uncertain')" },
              ].map((f, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">{f.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{f.val}</span>
                    <button className="text-muted-foreground hover:text-foreground"><Edit3 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!["general","ai"].includes(section) && (
            <div className="rounded-xl border border-border p-10 bg-card flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: G + "22" }}>
                {sections.find(s => s.id === section)?.icon}
              </div>
              <div className="text-sm font-bold text-foreground capitalize">{section.replace("-", " ")} Settings</div>
              <div className="text-xs text-muted-foreground">Configure {section.replace("-", " ")} settings for the platform.</div>
              <Btn icon={<Edit3 size={13} />}>Configure</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 17. Notification Center ──────────────────────────────────────────────

export function APNotificationsV2({ navigate }: NavProps) {
  const notifs = [
    { id: "n1", title: "New User Registration", body: "Ahmad Raza (Lawyer) registered and pending bar verification", time: "5m ago", type: "user", read: false },
    { id: "n2", title: "AI Model Retrained", body: "Outcome-Predictor-v2.4 completed retraining with 94% accuracy", time: "1h ago", type: "ai", read: false },
    { id: "n3", title: "Security Alert", body: "Brute force attempt blocked from IP 185.220.101.45", time: "1h ago", type: "security", read: false },
    { id: "n4", title: "Subscription Upgrade", body: "Punjab Textile Mills upgraded from Professional to Business plan", time: "3h ago", type: "billing", read: false },
    { id: "n5", title: "Database Backup Complete", body: "Scheduled backup completed successfully — 4.2 GB", time: "6h ago", type: "system", read: true },
    { id: "n6", title: "Dataset Sync Complete", body: "LHC Judgments dataset synced — 248 new records added", time: "8h ago", type: "ai", read: true },
    { id: "n7", title: "Support Ticket Escalated", body: "Ticket T-1023 escalated to Tech Team — urgent", time: "Yesterday", type: "support", read: true },
  ];

  const typeIcon = (t: string) => {
    const map: Record<string, React.ReactNode> = {
      user: <Users size={12} style={{ color: G }} />,
      ai: <Sparkles size={12} style={{ color: P }} />,
      security: <ShieldAlert size={12} style={{ color: "#EF4444" }} />,
      billing: <CreditCard size={12} style={{ color: "#10B981" }} />,
      system: <Server size={12} style={{ color: "#3B82F6" }} />,
      support: <MessageSquare size={12} style={{ color: G }} />,
    };
    return map[t] || <Bell size={12} />;
  };

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Notification Center</h1>
          <p className="text-sm text-muted-foreground">{notifs.filter(n => !n.read).length} unread system notifications</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="ghost" size="sm">Mark all read</Btn>
          <Btn icon={<Settings size={14} />} variant="outline" size="sm">Configure</Btn>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Unread" value={String(notifs.filter(n => !n.read).length)} icon={<Bell size={16} />} color="#EF4444" />
        <StatCard label="Security Alerts" value="1" icon={<ShieldAlert size={16} />} color="#F59E0B" />
        <StatCard label="AI Events (24h)" value="12" icon={<Sparkles size={16} />} color={P} />
        <StatCard label="Total (Aug)" value="284" icon={<Activity size={16} />} color={G} />
      </div>

      <div className="space-y-2">
        {notifs.map(n => (
          <div key={n.id}
            className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${n.read ? "border-border/40 opacity-70" : "border-border bg-card"}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}
              style={{ background: n.type === "security" ? "#EF444422" : n.type === "billing" ? "#10B98122" : P + "22" }}>
              {typeIcon(n.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{n.title}</span>
                {!n.read && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: G }} />}
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

// ─── 18. Backup & Recovery ────────────────────────────────────────────────

export function APBackupPage({ navigate }: NavProps) {
  const backups = [
    { id: "bk1", name: "Full Database Backup", size: "4.2 GB", type: "Automatic", date: "Aug 1, 06:00 AM", status: "Completed", retention: "30 days" },
    { id: "bk2", name: "User Data Export", size: "1.1 GB", type: "Manual", date: "Jul 31, 02:30 PM", status: "Completed", retention: "90 days" },
    { id: "bk3", name: "Document Storage Backup", size: "18.4 GB", type: "Automatic", date: "Jul 31, 06:00 AM", status: "Completed", retention: "30 days" },
    { id: "bk4", name: "AI Model Checkpoint", size: "2.8 GB", type: "Automatic", date: "Jul 30, 11:00 PM", status: "Completed", retention: "90 days" },
    { id: "bk5", name: "Full Database Backup", size: "4.1 GB", type: "Automatic", date: "Jul 30, 06:00 AM", status: "Completed", retention: "30 days" },
  ];

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Backup & Recovery</h1>
          <p className="text-sm text-muted-foreground">Automated daily backups · Last backup: Today 06:00 AM · All healthy</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="outline" icon={<RefreshCw size={14} />}>Run Backup Now</Btn>
          <Btn icon={<Download size={14} />}>Restore</Btn>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Last Backup" value="6h ago" sub="Today 06:00 AM" icon={<Archive size={16} />} color="#10B981" />
        <StatCard label="Total Storage Used" value="30.6 GB" icon={<HardDrive size={16} />} color={G} />
        <StatCard label="Backup Frequency" value="Daily" icon={<Clock size={16} />} color={P} />
        <StatCard label="Retention Period" value="30 days" icon={<Calendar size={16} />} color="#3B82F6" />
      </div>

      {/* Schedule */}
      <div className="rounded-xl border border-border p-5 bg-card">
        <SectionHead title="Backup Schedule" action={<Btn size="sm" icon={<Edit3 size={12} />}>Edit Schedule</Btn>} />
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Full Backup", schedule: "Daily at 06:00 AM PKT", next: "Tomorrow 06:00 AM", type: "Automatic" },
            { label: "Incremental Backup", schedule: "Every 6 hours", next: "In 2h 18m", type: "Automatic" },
            { label: "AI Model Checkpoint", schedule: "After each training run", next: "On next training", type: "Automatic" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <div className="text-sm font-bold text-foreground mb-2">{s.label}</div>
              <div className="text-xs text-muted-foreground mb-1">{s.schedule}</div>
              <div className="text-xs text-muted-foreground">Next: {s.next}</div>
              <Chip className="mt-2">{s.type}</Chip>
            </div>
          ))}
        </div>
      </div>

      {/* Backup history */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border" style={{ background: "var(--muted)/20" }}>
              {["Backup Name", "Type", "Size", "Date & Time", "Retention", "Status", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {backups.map(b => (
              <tr key={b.id} className="border-b border-border/40 hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Archive size={13} style={{ color: G }} />
                    <span className="text-sm font-medium text-foreground">{b.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><Chip>{b.type}</Chip></td>
                <td className="px-4 py-3 text-sm text-foreground">{b.size}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{b.date}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{b.retention}</td>
                <td className="px-4 py-3"><Badge status={b.status} size="xs" /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Btn variant="ghost" size="sm" icon={<Download size={12} />}>Restore</Btn>
                    <button className="p-1 text-muted-foreground hover:text-foreground"><MoreHorizontal size={13} /></button>
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

// ─── 19. System Health Monitoring ─────────────────────────────────────────

export function APHealthPage({ navigate }: NavProps) {
  const services = [
    { name: "API Gateway", status: "Healthy" as const, uptime: "99.98%", latency: "42ms", cpu: 28, memory: 41, requests: "14.8K/h" },
    { name: "Primary Database (PostgreSQL)", status: "Healthy" as const, uptime: "99.99%", latency: "8ms", cpu: 35, memory: 62, requests: "42K/h" },
    { name: "Redis Cache", status: "Healthy" as const, uptime: "99.97%", latency: "2ms", cpu: 12, memory: 78, requests: "120K/h" },
    { name: "AI Model Service", status: "Healthy" as const, uptime: "99.94%", latency: "420ms", cpu: 72, memory: 85, requests: "1.2K/h" },
    { name: "File Storage (MinIO)", status: "Warning" as const, uptime: "98.2%", latency: "—", cpu: 45, memory: 91, requests: "3.4K/h" },
    { name: "Email Service (SendGrid)", status: "Healthy" as const, uptime: "99.90%", latency: "—", cpu: 8, memory: 24, requests: "240/h" },
    { name: "Search Engine (Elasticsearch)", status: "Healthy" as const, uptime: "99.95%", latency: "18ms", cpu: 54, memory: 68, requests: "8.1K/h" },
  ];

  const uptime30d = [
    {m:"Jul 2",v:100},{m:"Jul 5",v:100},{m:"Jul 8",v:99.8},{m:"Jul 11",v:100},{m:"Jul 14",v:100},
    {m:"Jul 17",v:100},{m:"Jul 20",v:99.9},{m:"Jul 23",v:100},{m:"Jul 26",v:100},{m:"Jul 29",v:99.7},{m:"Aug 1",v:100},
  ];

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">System Health Monitoring</h1>
          <p className="text-sm text-muted-foreground">Real-time infrastructure metrics · 6/7 services healthy · 1 warning</p>
        </div>
        <div className="flex items-center gap-3">
          <HealthDot status="Warning" />
          <span className="text-sm font-semibold text-foreground">1 service degraded</span>
          <Btn variant="outline" size="sm" icon={<RefreshCw size={13} />}>Refresh</Btn>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Overall Uptime (30d)" value="99.8%" icon={<Activity size={16} />} color="#10B981" />
        <StatCard label="Avg API Latency" value="42ms" icon={<Gauge size={16} />} color={G} />
        <StatCard label="Active Connections" value="284" icon={<Network size={16} />} color={P} />
        <StatCard label="Incidents (Aug)" value="1" sub="1 warning · 0 critical" icon={<AlertTriangle size={16} />} color="#F59E0B" />
      </div>

      {/* Uptime chart */}
      <div className="rounded-xl border border-border p-5 bg-card">
        <SectionHead title="Platform Uptime (30 days)" sub="Overall system availability" />
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={uptime30d}>
            <defs>
              <linearGradient id="gut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
            <XAxis dataKey="m" tick={{ fill: MUT, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[99, 100]} tick={{ fill: MUT, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: S, border: "1px solid #1A2540", borderRadius: 8, color: "#fff", fontSize: 11 }} />
            <Area type="monotone" dataKey="v" stroke="#10B981" fill="url(#gut)" strokeWidth={2} name="Uptime %" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Services */}
      <div className="space-y-3">
        {services.map((s, i) => (
          <div key={i} className="rounded-xl border border-border p-4 bg-card"
            style={s.status === "Warning" ? { borderColor: "#F59E0B40", background: "#F59E0B08" } : {}}>
            <div className="flex items-center gap-4">
              <HealthDot status={s.status} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-foreground">{s.name}</span>
                  <Badge status={s.status} size="xs" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <div className="text-muted-foreground">Uptime (30d)</div>
                    <div className="font-bold text-foreground">{s.uptime}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Latency</div>
                    <div className="font-bold text-foreground">{s.latency}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">CPU</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10">
                        <div className="h-full rounded-full" style={{ width: `${s.cpu}%`, background: s.cpu > 80 ? "#EF4444" : s.cpu > 60 ? "#F59E0B" : "#10B981" }} />
                      </div>
                      <span className="font-bold">{s.cpu}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Memory</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10">
                        <div className="h-full rounded-full" style={{ width: `${s.memory}%`, background: s.memory > 85 ? "#EF4444" : s.memory > 70 ? "#F59E0B" : "#10B981" }} />
                      </div>
                      <span className="font-bold">{s.memory}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div>{s.requests}</div>
                <div className="mt-0.5">requests</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Reports Page (stub V2) ────────────────────────────────────────────────

export function APReportsV2({ navigate }: NavProps) {
  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Reports</h1>
        <Btn icon={<Plus size={14} />}>Generate Report</Btn>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { title: "Platform Usage Report", desc: "Users, sessions, feature usage metrics", icon: <Activity size={16} />, color: G },
          { title: "Revenue & Billing Report", desc: "MRR, ARR, subscription breakdown", icon: <DollarSign size={16} />, color: P },
          { title: "AI Performance Report", desc: "Model accuracy, calls, latency trends", icon: <Sparkles size={16} />, color: "#10B981" },
          { title: "User Onboarding Report", desc: "Signup funnel, activation rates", icon: <UserPlus size={16} />, color: "#3B82F6" },
          { title: "Security Audit Report", desc: "Threats blocked, vulnerabilities, incidents", icon: <ShieldCheck size={16} />, color: "#EF4444" },
          { title: "Content Performance Report", desc: "Blog views, knowledge base usage", icon: <Newspaper size={16} />, color: G },
        ].map((r, i) => (
          <div key={i} className="rounded-xl border border-border p-5 bg-card hover:border-[#D4AF37]/30 cursor-pointer transition-colors">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: r.color + "22" }}>
              <span style={{ color: r.color }}>{r.icon}</span>
            </div>
            <div className="text-sm font-bold text-foreground mb-1">{r.title}</div>
            <div className="text-xs text-muted-foreground mb-3">{r.desc}</div>
            <div className="flex gap-2">
              <Btn variant="ghost" size="sm" icon={<Sparkles size={11} />}>Generate</Btn>
              <Btn variant="ghost" size="sm" icon={<Download size={11} />}>PDF</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
