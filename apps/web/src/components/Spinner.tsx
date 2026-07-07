export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-neutral-400" role="status">
      <span
        aria-hidden="true"
        className="inline-block size-4 animate-spin rounded-full border-2 border-neutral-600 border-t-gold"
      />
      <span>{label ?? 'Loading…'}</span>
    </div>
  )
}
