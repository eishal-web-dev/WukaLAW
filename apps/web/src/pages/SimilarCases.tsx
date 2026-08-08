import { useEffect, useState } from 'react'
import { BriefcaseBusiness, ChevronDown, Scale } from 'lucide-react'
import { listCases, errorMessage } from '../lib/api'
import type { Case } from '../lib/api'
import { Card, G } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'
import CasePathwayIntelligence from '../components/CasePathwayIntelligence'
import CaseSimilarJudgments from '../components/CaseSimilarJudgments'

export default function SimilarCases() {
  const [cases, setCases] = useState<Case[]>([])
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null)
  const [loadingCases, setLoadingCases] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCases = async () => {
      setLoadingCases(true)
      setError(null)
      try {
        const response = await listCases()
        setCases(response.items)
      } catch (err) {
        setError(errorMessage(err))
      } finally {
        setLoadingCases(false)
      }
    }

    void loadCases()
  }, [])

  const selectedCase = cases.find((item) => item.id === selectedCaseId) ?? null

  return (
    <div className="p-8 space-y-7 overflow-y-auto h-full">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Similar Cases</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pick your case. WukaLAW will show where it is now and find Pakistani cases most like it.
        </p>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${G}15`, color: G }}
          >
            <BriefcaseBusiness size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">Which case do you want to check?</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              We use the facts and documents already saved in this case.
            </div>
          </div>
        </div>

        {loadingCases ? (
          <div className="py-5">
            <Spinner label="Loading your cases…" />
          </div>
        ) : error ? (
          <ErrorAlert message={error} />
        ) : cases.length === 0 ? (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-sm text-muted-foreground">
            You do not have a saved case yet. Create one in Case Management first.
          </div>
        ) : (
          <div className="relative">
            <select
              value={selectedCaseId ?? ''}
              onChange={(event) => {
                const value = event.target.value
                setSelectedCaseId(value ? Number(value) : null)
              }}
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 pr-11 text-sm text-foreground focus:outline-none focus:border-[#D4AF37]/50 cursor-pointer"
            >
              <option value="" className="bg-[#11161f]">Choose a case…</option>
              {cases.map((item) => (
                <option key={item.id} value={item.id} className="bg-[#11161f]">
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
            Once you choose one, WukaLAW starts the search automatically.
          </p>
        </Card>
      )}

      {selectedCase && (
        <div className="space-y-4">
          <Card className="p-4 border-[#D4AF37]/15">
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
