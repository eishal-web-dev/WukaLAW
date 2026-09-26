/** Permanent legal disclaimer shown under all AI outputs. */
export default function Disclaimer() {
  return (
    <p className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
      <span className="font-semibold" style={{ color: '#D4AF37' }}>
        Decision-support only — not legal advice.
      </span>{' '}
      wukaLAW is a research tool. AI outputs may contain errors and must be verified against the
      original documents. It is not a replacement for lawyers, judges, or courts.
    </p>
  )
}
