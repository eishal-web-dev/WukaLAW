import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Activity, BarChart2, Bell, BookOpen, Brain, Briefcase, Calendar,
  ChevronLeft, ChevronRight, Clock, Code, CreditCard, Database, Download,
  FileSearch, FileText, Gavel, GitBranch, HardDrive, Key, Layers,
  LayoutDashboard, LogOut, MessageCircle, MessageSquare, Moon, Newspaper,
  Search, Settings, ShieldCheck, Sparkles, Sun, Target, TrendingUp, Upload,
  User, UserCheck, Users, UsersRound,
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useNotifications } from '../lib/notifications'
import { useTheme } from '../lib/theme'
import { wukaIcon } from '../figma/assets'
import { Avatar, G } from './design'
import { portalForRole, portalHome, PORTAL_LABELS } from '../lib/portals'
import type { Portal } from '../lib/portals'

type NavItem = { path: string; label: string; icon: LucideIcon; notificationBadge?: boolean }
type NavGroup = { label: string; items: NavItem[] }

const LAWYER_NAV: NavGroup[] = [
  { label: 'Main', items: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/clients', label: 'Clients', icon: Users },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/tasks', label: 'Task Board', icon: Layers },
  ] },
  { label: 'Case Work', items: [
    { path: '/cases', label: 'Case Management', icon: Briefcase },
    { path: '/workspace', label: 'Case Workspace', icon: Layers },
    { path: '/hearings', label: 'Hearings', icon: Gavel },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/evidence', label: 'Evidence', icon: Search },
  ] },
  { label: 'AI Intelligence', items: [
    { path: '/ai-strategy', label: 'AI Strategy', icon: Sparkles },
    { path: '/research', label: 'Legal Research', icon: BookOpen },
    { path: '/prediction', label: 'Court Prediction', icon: Brain },
    { path: '/similar-cases', label: 'Similar Cases', icon: GitBranch },
    { path: '/ai-chat', label: 'AI Assistant', icon: MessageSquare },
    { path: '/strategy', label: 'Strategy Builder', icon: Target },
  ] },
  { label: 'Insights', items: [
    { path: '/timeline', label: 'Timeline', icon: Clock },
    { path: '/reports', label: 'Reports', icon: BarChart2 },
    { path: '/report-generator', label: 'Report Generator', icon: FileText },
    { path: '/analytics', label: 'Analytics', icon: TrendingUp },
  ] },
  { label: 'Team & Comms', items: [
    { path: '/messages', label: 'Messages', icon: MessageCircle },
    { path: '/team', label: 'Team', icon: UsersRound },
    { path: '/notifications', label: 'Notifications', icon: Bell, notificationBadge: true },
  ] },
  { label: 'Account', items: [
    { path: '/billing', label: 'Billing', icon: CreditCard },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
  ] },
]

const CLIENT_NAV: NavGroup[] = [
  { label: 'Overview', items: [
    { path: '/client', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/client/cases', label: 'My Cases', icon: Briefcase },
    { path: '/client/search', label: 'Search', icon: Search },
  ] },
  { label: 'Case', items: [
    { path: '/client/workspace', label: 'Case Workspace', icon: Layers },
    { path: '/client/cases', label: 'Case Details', icon: FileSearch },
    { path: '/client/upload', label: 'Upload Documents', icon: Upload },
    { path: '/documents', label: 'My Documents', icon: FileText },
    { path: '/client/evidence', label: 'Evidence', icon: FileSearch },
    { path: '/timeline', label: 'Timeline', icon: Clock },
  ] },
  { label: 'AI Intelligence', items: [
    { path: '/ai-chat', label: 'AI Assistant', icon: MessageSquare },
    { path: '/client/ai-summary', label: 'AI Summary', icon: Sparkles },
    { path: '/client/predictions', label: 'Court Prediction', icon: Brain },
    { path: '/client/similar-cases', label: 'Similar Cases', icon: GitBranch },
    { path: '/client/explainable', label: 'Explainable AI', icon: Activity },
  ] },
  { label: 'Reports', items: [
    { path: '/client/report-generator', label: 'Report Generator', icon: BarChart2 },
    { path: '/client/downloads', label: 'Downloads', icon: Download },
  ] },
  { label: 'Account', items: [
    { path: '/billing', label: 'Billing', icon: CreditCard },
    { path: '/notifications', label: 'Notifications', icon: Bell, notificationBadge: true },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
  ] },
]

const ADMIN_NAV: NavGroup[] = [
  { label: 'Overview', items: [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/analytics', label: 'System Analytics', icon: TrendingUp },
    { path: '/admin/health', label: 'System Health', icon: Activity },
    { path: '/admin/audit', label: 'Audit Logs', icon: FileSearch },
  ] },
  { label: 'Users', items: [
    { path: '/admin/users', label: 'All Users', icon: Users },
    { path: '/admin/lawyers', label: 'Lawyers', icon: UserCheck },
    { path: '/admin/clients', label: 'Clients', icon: User },
    { path: '/admin/roles', label: 'Roles & Permissions', icon: Key },
  ] },
  { label: 'AI Platform', items: [
    { path: '/admin/ai-models', label: 'AI Models', icon: Brain },
    { path: '/admin/datasets', label: 'Datasets', icon: Database },
    { path: '/admin/knowledge', label: 'Knowledge Base', icon: BookOpen },
  ] },
  { label: 'Operations', items: [
    { path: '/admin/security', label: 'Security Center', icon: ShieldCheck },
    { path: '/admin/api', label: 'API Management', icon: Code },
    { path: '/admin/backup', label: 'Backup & Recovery', icon: HardDrive },
    { path: '/admin/reports', label: 'Reports', icon: BarChart2 },
  ] },
  { label: 'Business', items: [
    { path: '/admin/billing', label: 'Billing & Plans', icon: CreditCard },
    { path: '/admin/support', label: 'Support Tickets', icon: MessageSquare },
    { path: '/admin/cms', label: 'Blog & CMS', icon: Newspaper },
  ] },
  { label: 'Config', items: [
    { path: '/notifications', label: 'Notifications', icon: Bell, notificationBadge: true },
    { path: '/admin/settings', label: 'Platform Settings', icon: Settings },
  ] },
]

const PORTAL_COLOR: Record<Portal, string> = { lawyer: G, client: '#60A5FA', admin: '#7C3AED' }

function groupsFor(portal: Portal): NavGroup[] {
  return portal === 'client' ? CLIENT_NAV : portal === 'admin' ? ADMIN_NAV : LAWYER_NAV
}

function titleFor(pathname: string): string {
  if (pathname.startsWith('/cases/')) return 'Case Detail'
  if (pathname.startsWith('/documents/')) return 'Document Detail'
  const allItems = [...LAWYER_NAV, ...CLIENT_NAV, ...ADMIN_NAV].flatMap((group) => group.items)
  const exact = allItems.find((item) => item.path === pathname)
  return exact?.label ?? 'WukaLAW'
}

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const portal = portalForRole(user?.role)
  const accent = PORTAL_COLOR[portal]
  const displayName = user?.name || 'WukaLAW User'

  return (
    <aside className={`flex flex-col h-full transition-all duration-300 border-r border-sidebar-border bg-sidebar flex-shrink-0 ${collapsed ? 'w-[60px]' : 'w-[230px]'}`}>
      <button type="button" onClick={() => navigate(portalHome(portal))} className="flex items-center gap-2.5 px-3 py-3.5 border-b border-sidebar-border text-left">
        <img src={wukaIcon} alt="WukaLAW" className="flex-shrink-0" style={{ width: 46, height: 46, objectFit: 'contain' }} />
        {!collapsed && <div className="min-w-0"><div className="text-sm font-bold text-foreground tracking-tight leading-tight">WukaLAW</div><div className="text-[9px] font-semibold uppercase tracking-widest leading-tight" style={{ color: accent }}>AI Legal Intelligence</div></div>}
      </button>

      {!collapsed && (
        <div className="px-4 pt-4 pb-1 text-xs font-semibold" style={{ color: accent }}>
          {PORTAL_LABELS[portal]} portal
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {groupsFor(portal).map((group) => (
          <div key={group.label}>
            {!collapsed && <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 px-2 mb-1.5 mt-1">{group.label}</div>}
            <div className="space-y-px">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = pathname === item.path || (!['/client', '/admin'].includes(item.path) && pathname.startsWith(`${item.path}/`))
                const badge = item.notificationBadge ? unreadCount : 0
                return (
                  <button type="button" key={`${group.label}-${item.path}-${item.label}`} onClick={() => navigate(item.path)} title={collapsed ? item.label : undefined} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all duration-100 relative ${active ? 'font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'}`} style={active ? { backgroundColor: `${accent}15`, color: accent } : {}}>
                    <Icon size={15} className="flex-shrink-0" />
                    {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                    {!collapsed && badge > 0 && <span className="ml-auto text-[9px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center" style={{ backgroundColor: accent, color: '#07090F' }}>{badge > 99 ? '99+' : badge}</span>}
                    {collapsed && active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r" style={{ backgroundColor: accent }} />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-2.5">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors">
            <Avatar name={displayName} size="sm" />
            <div className="flex-1 min-w-0"><div className="text-xs font-semibold text-foreground truncate leading-tight">{displayName}</div><div className="text-[10px] text-muted-foreground truncate leading-tight">{portal === 'admin' ? 'System Administrator' : portal === 'client' ? 'Client Portal' : 'Legal Professional'}</div></div>
            <button type="button" onClick={logout} className="text-muted-foreground hover:text-foreground p-0.5" title="Sign out"><LogOut size={13} /></button>
          </div>
        ) : <div className="flex justify-center py-1"><Avatar name={displayName} size="sm" /></div>}
        <button type="button" onClick={onToggle} className="w-full flex items-center justify-center mt-2 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors text-[10px] gap-1">
          {collapsed ? <ChevronRight size={13} /> : <><ChevronLeft size={13} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  )
}

function Topbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { dark, toggleDark } = useTheme()
  const { unreadCount } = useNotifications()
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-background flex-shrink-0">
      <div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">WukaLAW</span><ChevronRight size={14} className="text-muted-foreground" /><span className="text-foreground font-medium">{titleFor(pathname)}</span></div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input placeholder="Search cases, docs, AI..." className="w-56 pl-8 pr-4 py-1.5 text-xs rounded-lg border border-border bg-muted/40 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50" /></div>
        <button type="button" onClick={toggleDark} aria-label="Toggle color theme" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">{dark ? <Sun size={14} /> : <Moon size={14} />}</button>
        <button type="button" onClick={() => navigate('/notifications')} aria-label={`${unreadCount} unread notifications`} className="relative p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground"><Bell size={16} />{unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center text-[#07090F]" style={{ backgroundColor: G }}>{unreadCount > 99 ? '99+' : unreadCount}</span>}</button>
        <button type="button" onClick={() => navigate('/profile')} aria-label="Open profile"><Avatar name={user?.name || 'WukaLAW User'} size="sm" /></button>
      </div>
    </header>
  )
}

export default function FigmaAppShell() {
  const [collapsed, setCollapsed] = useState(false)
  return <div className="flex h-screen overflow-hidden bg-background" style={{ fontFamily: 'Inter, sans-serif' }}><Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} /><div className="flex flex-col flex-1 min-w-0 overflow-hidden"><Topbar /><main className="flex-1 overflow-hidden bg-background"><Outlet /></main></div></div>
}
