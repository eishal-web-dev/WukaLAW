import { useEffect, useState } from 'react'
import { ChevronDown, Scale } from 'lucide-react'
import { listCases, errorMessage } from '../lib/api'
import type { Case } from '../lib/api'
import { Card, G } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'
import CasePathwayIntelligence from '../components/CasePathwayIntelligence'
import CaseSimilarJudgments from '../components/CaseSimilarJudgments'

/**
 * Client-facing Similar Cases page. Reuses the exact same real
 * CasePathwayIntelligence and CaseSimilarJudgments components the Lawyer
 * SimilarCases page uses -- both already call real backend endpoints
 * (pathway-intelligence searches this case's own documents, real
 * ownership-checked; similar-case search queries a genuinely separate
 * public precedent corpus, no invented citations). The backend ownership
 * check for pathway-intelligence had a real bug fixed alongside this page:
 * it only ever allowed the owning lawyer, so a client could never view it
 * for their own case -- now reuses the same _get_owned_case every other
 * case-scoped endpoint uses.
 */
export default function ClientSimilarCases() {
  const [cases, setCases] = useState<Case[]>([])
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null)
  const [loadingCases, setLoadingCases] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listCases()
      .then((res) => {
        if (cancelled) return
        setCases(res.items)
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

  const selectedCase = cases.find((item) => item.id === selectedCaseId) ?? null

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Similar Cases</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          See where your case stands and find similar Pakistani cases.
        </p>
      </div>

      <Card className="p-5">
        {loadingCases ? (
          <div className="py-5">
            <Spinner label="Loading your cases…" />
          </div>
        ) : error ? (
          <ErrorAlert message={error} />
        ) : cases.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
            No cases assigned yet — this will be available once a case is assigned to your account.
          </div>
        ) : (
          <div className="relative">
            <select
              value={selectedCaseId ?? ''}
              onChange={(event) => {
                const value = event.target.value
                setSelectedCaseId(value ? Number(value) : null)
              }}
              className="w-full appearance-none rounded-xl border border-border bg-muted/40 px-4 py-3.5 pr-11 text-sm text-foreground outline-none focus:border-primary/50 cursor-pointer"
            >
              <option value="">Choose a case…</option>
              {cases.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.case_number} — {item.title} ({item.case_type})
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
            />
          </div>
        )}
      </Card>

      {!loadingCases && !error && cases.length > 0 && !selectedCase && (
        <Card className="p-10 text-center">
          <Scale size={28} className="mx-auto mb-3" style={{ color: G }} />
          <div className="text-sm font-semibold text-foreground">Choose a case above</div>
          <p className="text-xs text-muted-foreground mt-1 max-w-lg mx-auto">
            Once you choose one, the search starts automatically.
          </p>
        </Card>
      )}

      {selectedCase && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-xs font-mono" style={{ color: G }}>{selectedCase.case_number}</span>
              <span className="text-sm font-semibold text-foreground">{selectedCase.title}</span>
              <span className="text-xs text-muted-foreground">{selectedCase.case_type}</span>
              <span className="text-xs text-muted-foreground">
                {selectedCase.num_documents} document{selectedCase.num_documents === 1 ? '' : 's'}
              </span>
            </div>
          </Card>

          <CasePathwayIntelligence key={`pathway-${selectedCase.id}`} caseId={selectedCase.id} />
          <CaseSimilarJudgments key={`similar-${selectedCase.id}`} caseId={selectedCase.id} />
        </div>
      )}
    </div>
  )
}
