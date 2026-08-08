import { useEffect, useMemo, useState } from 'react'
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

interface Props {
  caseId: number | string
  caseType?: string
  caseDescription?: string
  documentCount?: number
}

export default function CaseSimilarJudgments({
  caseId,
  caseType = '',
  caseDescription = '',
  documentCount = 0,
}: Props) {
  const [data, setData] = useState<CaseSimilarResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const descriptionWords = useMemo(
    () => caseDescription.trim().split(/\s+/).filter(Boolean).length,
    [caseDescription],
  )

  // A case-type label alone can find the same legal topic, but it cannot support
  // a genuine fact-pattern comparison. We only call results "similar cases" when
  // there is a meaningful factual description or attached case material.
  const hasFactPattern = documentCount > 0 || descriptionWords >= 25
  const resultMode = hasFactPattern ? 'similar' : 'related'

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
            {resultMode === 'similar' ? 'Similar Pakistani Cases' : 'Related Pakistani Precedents'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {resultMode === 'similar'
              ? 'Historical Pakistani judgments ranked against the case fact pattern, legal issues, cited law and semantic relevance.'
              : `WakuLaw currently knows the legal topic (${caseType || 'this case'}) but not enough facts to claim that another case is factually similar.`}
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
          <Spinner
            label={
              resultMode === 'similar'
                ? 'Comparing the case fact pattern with Pakistani judgment history…'
                : 'Finding Pakistani precedents on the same legal issue…'
            }
          />
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

          {!hasFactPattern && (
            <Card className="p-4 border-amber-500/25 bg-amber-500/[0.05]">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertTriangle size={14} className="mt-0.5 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-foreground mb-1">Not enough case facts for true similarity matching</div>
                  <p>
                    These are related precedents, not claims that the historical cases have the same facts as yours. Add a factual case description or attach case documents. Useful facts include what happened, alleged offence/claim, evidence, relevant sections, procedural stage, disputed issue, defence and relief sought.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {data.results.length === 0 ? (
            <Card className="p-7 text-center">
              <BookOpenCheck size={24} className="mx-auto mb-3 text-muted-foreground" />
              <div className="text-sm font-semibold text-foreground">No sufficiently relevant historical match found</div>
              <p className="text-xs text-muted-foreground mt-1">
                Add a fuller case description or relevant documents and refresh the search.
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
                        <Badge label={resultMode === 'similar' ? readableLabel(item.similarity_label) : 'related precedent'} />
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
                      <div className="text-[10px] text-muted-foreground">
                        {resultMode === 'similar' ? 'match score / 100' : 'topic relevance / 100'}
                      </div>
                    </div>
                  </div>

                  {item.explanation && (
                    <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                        {resultMode === 'similar' ? 'Why it matches' : 'Why it is related'}
                      </div>
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

                  <div className="mt-3 text-[10px] text-muted-foreground">
                    Source corpus: Pakistani court judgments
                  </div>
                </Card>
              )
            })
          )}

          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {resultMode === 'similar'
              ? "Match Score ranks retrieved judgments against the available case facts. It is not a probability of winning or a legal conclusion."
              : "Topic Relevance ranks precedents on the same legal issue. WakuLaw will switch to fact-pattern similarity once the case contains enough factual detail."}
          </p>
        </div>
      )}
    </div>
  )
}
