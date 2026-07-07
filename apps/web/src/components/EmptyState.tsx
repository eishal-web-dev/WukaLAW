import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-panel border border-dashed border-line bg-ink-900 px-6 py-14 text-center">
      {icon && (
        <span aria-hidden="true" className="text-3xl text-neutral-600">
          {icon}
        </span>
      )}
      <h2 className="text-base font-semibold text-neutral-200">{title}</h2>
      {description && (
        <p className="max-w-sm text-sm text-neutral-500">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
