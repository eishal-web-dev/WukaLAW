export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="wk-book-loader" role="status" aria-live="polite" aria-label={label || 'Loading'}>
      <div className="wk-book" aria-hidden="true">
        <div className="wk-book__pg-shadow" />
        <div className="wk-book__pg" />
        <div className="wk-book__pg wk-book__pg--2" />
        <div className="wk-book__pg wk-book__pg--3" />
        <div className="wk-book__pg wk-book__pg--4" />
        <div className="wk-book__pg wk-book__pg--5" />
      </div>
      {label && <span>{label}</span>}
    </div>
  )
}
