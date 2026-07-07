/** Human-readable file size, e.g. 20480 -> "20.0 KB". */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes
  let unit = 'B'
  for (const next of units) {
    if (value < 1024) break
    value /= 1024
    unit = next
  }
  return `${value.toFixed(1)} ${unit}`
}

/** Human-readable date, e.g. "12 Mar 2026, 14:05". */
export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Similarity score (0..1) rendered as a percentage, e.g. 0.8234 -> "82%". */
export function formatScore(score: number): string {
  const clamped = Math.max(0, Math.min(1, score))
  return `${Math.round(clamped * 100)}%`
}

/** Trim long chunk text for card excerpts. */
export function excerpt(text: string, maxLength = 320): string {
  const clean = text.trim().replace(/\s+/g, ' ')
  if (clean.length <= maxLength) return clean
  return `${clean.slice(0, maxLength).trimEnd()}…`
}
