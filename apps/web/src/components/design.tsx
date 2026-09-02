/**
 * Shared design-system primitives ported from the Figma export.
 * These preserve the visual language (gold accent, dark surfaces, rounded
 * cards) used across every app screen.
 */
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export const G = '#D4AF37' // gold
export const B = '#4F8EF7' // blue
export const S = '#161B22' // surface
export const C = '#1E2530' // card

export function Btn({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  icon,
  type = 'button',
  disabled = false,
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
  icon?: React.ReactNode
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  const base =
    'inline-flex items-center gap-2 font-medium transition-all duration-200 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-sm' }
  const variants = {
    primary: 'hover:opacity-90 shadow-lg',
    secondary: 'border border-border text-foreground hover:bg-muted/60',
    ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
  }
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      style={variant === 'primary' ? { backgroundColor: G, color: '#0D1117' } : {}}
    >
      {icon}
      {children}
    </button>
  )
}

export function Badge({ label, variant = 'default' }: { label: string; variant?: string }) {
  const v: Record<string, string> = {
    Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Review: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'On Hold': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Closed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    Critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    High: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Low: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    ai: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    case: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    system: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    default: 'bg-white/5 text-muted-foreground border-white/10',
    filing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    hearing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    ruling: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    deadline: 'bg-red-500/10 text-red-400 border-red-500/20',
    deposition: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    high: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    low: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  const cls = v[variant] || v[label] || v.default
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${cls}`}>
      {label}
    </span>
  )
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-card text-card-foreground ${className}`}>
      {children}
    </div>
  )
}

export function KPICard({
  icon,
  label,
  value,
  change,
  changeDir,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  change?: string
  changeDir?: 'up' | 'down'
  sub?: string
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(212,175,55,0.1)' }}>
          <span style={{ color: G }}>{icon}</span>
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${changeDir === 'up' ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {changeDir === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {change}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5 opacity-70">{sub}</div>}
    </Card>
  )
}

export function Input({
  placeholder,
  value,
  onChange,
  type = 'text',
  icon,
  className = '',
  required,
}: {
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
  type?: string
  icon?: React.ReactNode
  className?: string
  required?: boolean
}) {
  return (
    <div className={`relative ${className}`}>
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded-xl border border-border bg-muted/40 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors ${icon ? 'pl-9 pr-4 py-2.5' : 'px-4 py-2.5'}`}
      />
    </div>
  )
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-14 h-14 text-lg' }
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const colors = ['#D4AF37', '#4F8EF7', '#34D399', '#F87171', '#A78BFA']
  const color = colors[(name.charCodeAt(0) || 0) % colors.length]
  return (
    <div
      className={`${s[size]} rounded-full flex items-center justify-center font-semibold text-[#0D1117] flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}

export function ProgressBar({ value, max = 100, color = G }: { value: number; max?: number; color?: string }) {
  return (
    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
      />
    </div>
  )
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {action}
    </div>
  )
}

interface TooltipPayloadEntry {
  name: string
  value: number | string
  color: string
}

export const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl border border-white/10 p-3 shadow-2xl text-xs"
      style={{ backgroundColor: '#161B22' }}
    >
      <p className="text-[#B3B3B3] mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}
