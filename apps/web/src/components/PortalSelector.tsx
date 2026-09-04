import { Briefcase, ShieldCheck, UserRound } from 'lucide-react'
import { PORTAL_LABELS } from '../lib/portals'
import type { Portal } from '../lib/portals'
import { usePublicTokens } from './PublicShell'

const OPTIONS = [
  { role: 'client', icon: UserRound },
  { role: 'lawyer', icon: Briefcase },
  { role: 'admin', icon: ShieldCheck },
] as const

export default function PortalSelector({ value, onChange, includeAdmin = true, disabled = false }: {
  value: Portal | null
  onChange: (portal: Portal) => void
  includeAdmin?: boolean
  disabled?: boolean
}) {
  const { GA, BD, TX, TX2, SURF } = usePublicTokens()
  return (
    <fieldset disabled={disabled}>
      <legend className="text-sm font-medium mb-3" style={{ color: TX }}>Choose your portal</legend>
      <div className={`grid gap-3 ${includeAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {OPTIONS.filter((option) => includeAdmin || option.role !== 'admin').map(({ role, icon: Icon }) => (
          <label key={role} className="cursor-pointer">
            <input
              type="radio"
              name="portal"
              value={role}
              aria-label={PORTAL_LABELS[role]}
              checked={value === role}
              onChange={() => onChange(role)}
              required
              className="peer sr-only"
            />
            <span
              className="flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-sm font-semibold transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-disabled:opacity-50"
              style={{ backgroundColor: SURF, borderColor: value === role ? GA : BD, color: value === role ? GA : TX2, boxShadow: value === role ? `0 0 0 1px ${GA}` : undefined }}
            >
              <Icon size={20} aria-hidden="true" />
              {PORTAL_LABELS[role]}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
