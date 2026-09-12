import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ErrorAlert({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-400"
    >
      <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
      <span className="leading-relaxed flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 font-semibold hover:underline flex-shrink-0"
        >
          <RefreshCw size={11} /> Retry
        </button>
      )}
    </div>
  )
}
