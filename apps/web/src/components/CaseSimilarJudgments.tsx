import { useEffect, useState } from 'react'
import { AlertTriangle, BookOpenCheck, RefreshCw, Scale } from 'lucide-react'
import { Card, Badge, Btn, G } from './design'
import ErrorAlert from './ErrorAlert'
import Spinner from './Spinner'
import { getCaseSimilarJudgments } from '../lib/caseSimilar'
import type { CaseSimilarResponse, SimilarJudgment } from '../lib/caseSimilar'

function score100(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score <= 1 ? score * 100 : score)))
}

function readableLabel(label: string): string {
  return label.replaceAll('_', ' ')
}

function issueLabel(item: SimilarJudgment): string | null {
  const factor = item.matching_factors.find((entry) => entry.factor === 'same_specific_issue')
  if (!factor?.value) return null
  const labels: Record<string, string> = {
    murder_homicide: 'Murder / Homicide',
    fraud_deception: 'Fraud / Deception',
    bail: 'Bail',
    custody_guardianship: 'Custody / Guardianship',
    maintenance_dower: 'Maintenance / Dower',
    divorce_dissolution: 'Divorce / Dissolution',
    property_ownership: 'Property / Ownership',
    constitutional_writ: 'Constitutional / Writ',
    tax_revenue: 'Tax / Revenue',
  }
  return labels[factor.value] ?? readableLabel(factor.value)
}

function domainLabel(item: SimilarJudgment): string | null {
  const factor = item.matching_factors.find((entry) => entry.factor === 'same_legal_domain')
  return factor?.value || null
}

export default function CaseSimilarJudgments({ caseId }: { caseId: number | string }) {
  const [data, setData] = useState<CaseSimilarResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await getCaseSimilarJudgments(caseId, 8))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load similar judgments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [caseId])

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Scale size={16} style={{ color: G }} />
            Similar Pakistani Cases
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Historical Pakistani judgments ranked by legal issue, factual overlap, cited law and semantic relevance.
          </p>
        </div>
        <Btn
          variant="secondary"
          icon={<RefreshCw size={13} className={loading ? 'animate-spin' : ''} />}
          onClick={() => void load()}
          disabled={loading}
        >
          Refresh
        </Btn>
      </div>

      {loading && (
        <Card className="p-7">
          <Spinner label="Searching Pakistani judgment history for comparable cases…" />
        </Card>
      )}

      {error && <ErrorAlert message={error} />}

      {!loading && !error && data && (
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">
            {data.total_candidates} candidate judgment{data.total_candidates === 1 ? '' : 's'} reviewed
            {' · '}{data.source_case.documents_used} case document{data.source_case.documents_used === 1 ? '' : 's'} used
            {' · '}{Math.round(data.processing_time_ms)} ms
          </div>

          {data.source_case.documents_used === 0 && (
            <Card className="p-3 border-amber-500/20 bg-amber-500/[0.04]">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertTriangle size={14} className="mt-0.5 text-amber-400 flex-shrink-0" />
                <span>
                  Limited case information: no documents are attached. Results are based on the case type, title and description only. Add case facts or documents for more precise precedent matching.
                </span>
              </div>
            </Card>
          )}

          {data.results.length === 0 ? (
            <Card className="p-7 text-center">
              <BookOpenCheck size={24} className="mx-auto mb-3 text-muted-foreground" />
              <div className="text-sm font-semibold text-foreground">No sufficiently relevant historical match found</div>
              <p className="text-xs text-muted-foreground mt-1">
                Weak semantic neighbours are hidden. Add a clearer description or relevant documents and refresh the search.
              </p>
            </Card>
          ) : (
            data.results.map((item) => {
              const issue = issueLabel(item)
              const domain = domainLabel(item)
              return (
                <Card key={`${item.document_id}-${item.rank}`} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono text-muted-foreground">#{item.rank}</span>
                        <Badge label={readableLabel(item.similarity_label)} />
                        {item.court && <Badge label={item.court} />}
                        {domain && <Badge label={domain} />}
                        {issue && <Badge label={issue} />}
                      </div>
                      <h4 className="text-sm font-semibold text-foreground">
                        {item.title || item.case_number || 'Pakistani judgment'}
                      </h4>
                      <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                        {item.case_number && <span>{item.case_number}</span>}
                        {item.decision_date && <span>{item.decision_date}</span>}
                        {item.judges.length > 0 && <span>{item.judges.join(', ')}</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold" style={{ color: G }}>{score100(item.similarity_score)}</div>
                      <div className="text-[10px] text-muted-foreground">match score / 100</div>
                    </div>
                  </div>

                  {item.explanation && (
                    <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Why it matches</div>
                      <p className="text-xs text-foreground leading-relaxed">{item.explanation}</p>
                    </div>
                  )}

                  {item.text_preview && (
                    <p className="text-xs text-muted-foreground leading-relaxed mt-3 line-clamp-4">
                      {item.text_preview}
                    </p>
                  )}

                  {item.explicit_outcome_phrase && (
                    <div className="mt-3 text-xs">
                      <span className="font-semibold text-foreground">Recorded outcome: </span>
                      <span className="text-muted-foreground">{item.explicit_outcome_phrase}</span>
                    </div>
                  )}

                  {(item.laws_cited.length > 0 || item.sections_cited.length > 0 || item.articles_cited.length > 0) && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.laws_cited.slice(0, 3).map((law) => <Badge key={`law-${law}`} label={law} />)}
                      {item.sections_cited.slice(0, 4).map((section) => <Badge key={`sec-${section}`} label={`Section ${section}`} />)}
                      {item.articles_cited.slice(0, 4).map((article) => <Badge key={`art-${article}`} label={`Article ${article}`} />)}
                    </div>
                  )}

                  {item.differences.length > 0 && (
                    <div className="mt-3 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">Important differences: </span>
                      {item.differences.slice(0, 2).join(' · ')}
                    </div>
                  )}

                  <div className="mt-3 text-[10px] text-muted-foreground break-all">
                    Source: {item.source_dataset} · {item.source_path}
                  </div>
                </Card>
              )
            })
          )}

          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Match Score is an explainable retrieval ranking from WakuLAW's indexed corpus. It is not a probability of winning, a legal conclusion, or a claim that two cases are identical.
          </p>
        </div>
      )}
    </div>
  )
}
