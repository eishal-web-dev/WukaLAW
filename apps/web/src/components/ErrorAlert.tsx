export default function ErrorAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
    >
      <span className="font-semibold">Error:</span> {message}
    </div>
  )
}
