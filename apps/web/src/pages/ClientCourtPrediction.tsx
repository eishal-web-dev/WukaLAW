import { useEffect, useState } from 'react'
import { Scale, AlertTriangle } from 'lucide-react'
import { listCases, getCasePrediction, errorMessage } from '../lib/api'
import type { Case, CasePrediction } from '../lib/api'
import { Card, G } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'

/**
 * Client-facing Court Prediction page. There is no prediction engine
 * implemented anywhere in this codebase (confirmed: only User, Case,
 * Document, Chunk models exist -- no scoring logic, no trained model).
 * Per the spec's explicit instruction for this page, this calls a real
 * backend contract (getCasePrediction) that honestly reports
 * available=false, and renders that as "Not generated" -- never a
 * fabricated percentage, and never the old mock's invented judge/expert
 * statistics.
 */
export default function ClientCourtPrediction() {
  const [cases, setCases] = useState<Case[]>([])
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null)
  const [prediction, setPrediction] = useState<CasePrediction | null>(null)
  const [loadingCases, setLoadingCases] = useState(true)
  const [loadingPrediction, setLoadingPrediction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listCases()
      .then((res) => {
        if (cancelled) return
        setCases(res.items)
        if (res.items.length > 0) setSelectedCaseId(res.items[0].id)
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoadingCases(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (selectedCaseId === null) return
    let cancelled = false
    setLoadingPrediction(true)
    setPrediction(null)
    getCasePrediction(selectedCaseId)
      .then((res) => {
        if (!cancelled) setPrediction(res)
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoadingPrediction(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedCaseId])

  if (loadingCases) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Spinner label="Loading your cases…" />
      </div>
    )
  }

  if (cases.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Card className="p-8 max-w-md text-center">
          <Scale size={28} className="mx-auto mb-3 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground mb-1">No cases assigned yet</h2>
          <p className="text-sm text-muted-foreground">
            Court prediction estimates will be available here once a case is assigned to your account.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Scale size={18} style={{ color: G }} />
          <h1 className="text-xl font-bold text-foreground tracking-tight">Court Prediction</h1>
        </div>
        <select
          value={selectedCaseId ?? ''}
          onChange={(e) => setSelectedCaseId(Number(e.target.value))}
          className="text-sm px-3 py-2 rounded-xl border border-border bg-card text-foreground outline-none focus:border-primary/40"
        >
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.case_number} — {c.title}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorAlert message={error} />}

      {loadingPrediction ? (
        <div className="py-16 flex justify-center">
          <Spinner label="Checking for a prediction…" />
        </div>
      ) : prediction && !prediction.available ? (
        <Card className="p-10 text-center space-y-3">
          <AlertTriangle size={28} className="mx-auto text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Not generated</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">{prediction.disclaimer}</p>
        </Card>
      ) : prediction && prediction.available ? (
        <div className="space-y-4">
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold" style={{ color: G }}>
              {prediction.probability}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Estimated likelihood — not a guarantee</div>
          </Card>
          {prediction.factors.length > 0 && (
            <Card className="p-5">
              <h3 className="text-xs font-bold text-foreground mb-3">Contributing Factors</h3>
              <div className="space-y-2">
                {prediction.factors.map((f) => (
                  <div key={f.label} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{f.label}</span>
                    <span className={f.contribution >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {f.contribution >= 0 ? '+' : ''}
                      {f.contribution}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          <p className="text-xs text-muted-foreground text-center">{prediction.disclaimer}</p>
        </div>
      ) : null}
    </div>
  )
}
