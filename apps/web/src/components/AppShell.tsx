import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, FileText, Search, Brain, GitBranch,
  MessageSquare, Cpu, Clock, BarChart2, TrendingUp, Bell, User,
  Settings, Shield, Layers, ChevronRight, ChevronLeft, Scale,
  LogOut, Sun, Moon,
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme'
import { Avatar, G } from './design'

const NAV_GROUPS: {
  label: string
  items: { path: string; label: string; icon: React.ReactNode; badge?: number }[]
}[] = [
  {
    label: 'Main',
    items: [{ path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> }],
  },
  {
    label: 'Work',
    items: [
      { path: '/cases', label: 'Case Management', icon: <Briefcase size={16} /> },
      { path: '/workspace', label: 'Case Workspace', icon: <Layers size={16} /> },
      { path: '/documents', label: 'Documents', icon: <FileText size={16} /> },
      { path: '/evidence', label: 'Evidence Analysis', icon: <Search size={16} /> },
    ],
  },
  {
    label: 'AI Intelligence',
    items: [
      { path: '/prediction', label: 'AI Court Prediction', icon: <Brain size={16} /> },
      { path: '/similar-cases', label: 'Similar Cases', icon: <GitBranch size={16} /> },
      { path: '/ai-chat', label: 'AI Assistant', icon: <MessageSquare size={16} /> },
      { path: '/explainable', label: 'Explainable AI', icon: <Cpu size={16} /> },
    ],
  },
  {
    label: 'Insights',
    items: [
      { path: '/timeline', label: 'Timeline', icon: <Clock size={16} /> },
      { path: '/reports', label: 'Reports', icon: <BarChart2 size={16} /> },
      { path: '/analytics', label: 'Analytics', icon: <TrendingUp size={16} /> },
    ],
  },
  {
    label: 'Account',
    items: [
      { path: '/notifications', label: 'Notifications', icon: <Bell size={16} />, badge: 3 },
      { path: '/profile', label: 'Profile', icon: <User size={16} /> },
      { path: '/settings', label: 'Settings', icon: <Settings size={16} /> },
    ],
  },
]

const ADMIN_NAV_ITEM: { path: string; label: string; icon: React.ReactNode; badge?: number } = {
  path: '/admin',
  label: 'Admin',
  icon: <Shield size={16} />,
}

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/cases': 'Case Management',
  '/workspace': 'Case Workspace',
  '/documents': 'Documents',
  '/evidence': 'Evidence Analysis',
  '/prediction': 'AI Court Prediction',
  '/similar-cases': 'Similar Cases',
  '/ai-chat': 'AI Assistant',
  '/explainable': 'Explainable AI',
  '/timeline': 'Timeline Intelligence',
  '/reports': 'Reports',
  '/analytics': 'Analytics',
  '/notifications': 'Notifications',
  '/profile': 'My Profile',
  '/settings': 'Settings',
  '/admin': 'Admin Dashboard',
}

function pageTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname]
  if (pathname.startsWith('/cases/')) return 'Case Detail'
  if (pathname.startsWith('/documents/')) return 'Document Detail'
  const match = Object.keys(TITLES).find((p) => pathname.startsWith(p))
  return match ? TITLES[match] : 'WukaLAW'
}

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const displayName = user?.name || 'WukaLAW User'

  // Admin link only shows for admins -- there's no self-service way to
  // become one, so showing it to everyone would just be a dead end for
  // non-admins (AdminRoute redirects them straight back to /dashboard).
  const groups = user?.role === 'admin'
    ? NAV_GROUPS.map((group) =>
        group.label === 'Account' ? { ...group, items: [...group.items, ADMIN_NAV_ITEM] } : group,
      )
    : NAV_GROUPS

  return (
    <div
      className={`flex flex-col h-full transition-all duration-300 border-r border-sidebar-border bg-sidebar flex-shrink-0 ${collapsed ? 'w-[60px]' : 'w-[220px]'}`}
    >
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border text-left"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: G }}
        >
          <Scale size={16} color="#0D1117" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-foreground tracking-wide">WukaLAW</div>
            <div className="text-[10px]" style={{ color: G }}>
              AI Legal Intelligence
            </div>
          </div>
        )}
      </button>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-2 mb-2">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.path || pathname.startsWith(`${item.path}/`)
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-all duration-150 group relative ${active ? 'font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'}`}
                    style={active ? { backgroundColor: 'rgba(212,175,55,0.12)', color: G } : {}}
                  >
                    <span style={active ? { color: G } : {}}>{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.badge ? (
                      <span
                        className="ml-auto text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center text-[#0D1117]"
                        style={{ backgroundColor: G }}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                    {collapsed && active && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                        style={{ backgroundColor: G }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-1">
            <Avatar name={displayName} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground truncate">{displayName}</div>
              <div className="text-[10px] text-muted-foreground truncate">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Avatar name={displayName} size="sm" />
          </div>
        )}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center mt-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors text-xs gap-1"
        >
          {collapsed ? (
            <ChevronRight size={14} />
          ) : (
            <>
              <ChevronLeft size={14} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function Topbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { dark, toggleDark } = useTheme()

  return (
    <div className="h-14 flex items-center justify-between px-6 border-b border-border bg-background flex-shrink-0">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">WukaLAW</span>
        <ChevronRight size={14} className="text-muted-foreground" />
        <span className="text-foreground font-medium">{pageTitle(pathname)}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search cases, docs, AI..."
            className="w-56 pl-8 pr-4 py-1.5 text-xs rounded-lg border border-border bg-muted/40 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
        <button
          onClick={toggleDark}
          className="w-8 h-8 rounded-lg border border-border bg-transparent cursor-pointer flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: G }} />
        </button>
        <button onClick={() => navigate('/profile')}>
          <Avatar name={user?.name || 'WukaLAW User'} size="sm" />
        </button>
      </div>
    </div>
  )
}

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="flex h-screen overflow-hidden bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-hidden bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
