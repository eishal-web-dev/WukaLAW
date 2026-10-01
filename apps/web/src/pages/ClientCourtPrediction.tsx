import { useEffect, useState } from 'react'
import {
  Scale, AlertTriangle, CheckCircle2, ListChecks, CalendarClock,
  BriefcaseBusiness, ShieldCheck, TrendingUp, FileSearch, ChevronDown,
} from 'lucide-react'
import { listCases, getCasePrediction, errorMessage } from '../lib/api'
import type { Case, CasePrediction } from '../lib/api'
import { Card, G } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'

function scoreColour(score: number) {
  if (score >= 70) return '#34D399'
  if (score >= 45) return '#FBBF24'
  return '#F87171'
}

function sampleLabel(sampleSize: number, minimum: number) {
  if (sampleSize >= Math.max(30, minimum * 3)) return 'Larger historical sample'
  if (sampleSize >= minimum) return 'Minimum sample met'
  return 'Insufficient data'
}

function ScoreRing({ value, label, range }: { value: number; label: string; range?: string }) {
  const score = Math.max(0, Math.min(100, value))
  const colour = scoreColour(score)
  return (
    <div className="relative grid h-44 w-44 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(${colour} ${score * 3.6}deg, rgba(255,255,255,.07) 0deg)` }}>
      <div className="grid h-36 w-36 place-items-center rounded-full bg-card text-center shadow-inner">
        <div>
          <div className="text-4xl font-black tabular-nums text-foreground">{score}<span className="text-lg text-muted-foreground">/100</span></div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: colour }}>{label}</div>
          {range && <div className="mt-1 text-[10px] text-muted-foreground">{range}</div>}
        </div>
      </div>
    </div>
  )
}

function MetricBar({ label, value, maximum = 100, colour = G }: { label: string; value: number; maximum?: number; colour?: string }) {
  const width = maximum > 0 ? Math.max(0, Math.min(100, (value / maximum) * 100)) : 0
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">{value}/{maximum}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${width}%`, backgroundColor: colour }} />
      </div>
    </div>
  )
}

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
  const [partyRole, setPartyRole] = useState<'initiating' | 'defending'>('defending')
  const [claimFocus, setClaimFocus] = useState('')

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

  const estimateOutlook = async () => {
    if (selectedCaseId === null) return
    if (claimFocus.trim().length < 3) {
      setError('Describe the specific claim you want to estimate first.')
      return
    }
    setError(null)
    setLoadingPrediction(true)
    try {
      setPrediction(await getCasePrediction(selectedCaseId, { partyRole, claimFocus: claimFocus.trim() }))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoadingPrediction(false)
    }
  }

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
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Scale size={18} style={{ color: G }} />
          <h1 className="text-xl font-bold text-foreground tracking-tight">AI Case Assessment</h1>
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

      <Card className="overflow-hidden border-[#D4AF37]/15">
        <div className="flex items-center gap-3 border-b border-border bg-[#D4AF37]/[0.04] px-5 py-4">
          <div className="rounded-xl bg-[#D4AF37]/10 p-2 text-[#D4AF37]"><FileSearch size={17} /></div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Choose the result to assess</h2>
            <p className="text-xs text-muted-foreground">Each claim is assessed separately from this case's saved record.</p>
          </div>
        </div>
        <div className="p-5">
        <div className="grid gap-3 sm:grid-cols-[160px_1fr] mt-4">
          <select
            value={partyRole}
            onChange={(event) => setPartyRole(event.target.value as 'initiating' | 'defending')}
            className="text-sm px-3 py-2.5 rounded-xl border border-border bg-card text-foreground outline-none focus:border-primary/40"
          >
            <option value="defending">I am defending it</option>
            <option value="initiating">I brought the claim</option>
          </select>
          <input
            value={claimFocus}
            onChange={(event) => setClaimFocus(event.target.value)}
            placeholder="Example: defending the alleged PKR 14 lac loan claim"
            maxLength={500}
            className="text-sm px-3 py-2.5 rounded-xl border border-border bg-card text-foreground outline-none focus:border-primary/40"
          />
        </div>
        <button
          type="button"
          disabled={loadingPrediction || claimFocus.trim().length < 3}
          onClick={() => void estimateOutlook()}
          className="mt-3 rounded-lg bg-[#D4AF37] px-4 py-2 text-xs font-bold text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          Calculate from matched cases
        </button>
        </div>
      </Card>

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
      ) : prediction && prediction.available && prediction.probability === null ? (
        <div className="space-y-4">
          {prediction.outcome_estimate?.available && (() => {
            const estimate = prediction.outcome_estimate
            const sampleSize = estimate.sample_size ?? 0
            const sampleDescription = sampleLabel(sampleSize, estimate.minimum_sample)
            return (
              <Card className="overflow-hidden border-border bg-muted/[0.02]">
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-bold text-foreground">Historical matched-case benchmark</h2>
                      <p className="mt-1 text-xs text-muted-foreground">Observed outcomes in retrieved judgments—not your probability of winning.</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold tabular-nums text-foreground">{estimate.estimate ?? 0}% historically supportive</div>
                      {estimate.range_low != null && estimate.range_high != null && (
                        <div className="text-[10px] text-muted-foreground">Sample-only statistical range {estimate.range_low}–{estimate.range_high}%</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#D4AF37]/10 px-3 py-1 text-xs font-bold text-[#D4AF37]">{sampleDescription}</span>
                      <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground">{sampleSize} matched outcomes</span>
                      <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground">{estimate.party_role === 'initiating' ? 'Bringing claim' : 'Defending claim'}</span>
                    </div>
                    <h2 className="mt-4 text-lg font-bold text-foreground">{estimate.claim_focus}</h2>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.05] p-4">
                        <div className="text-2xl font-bold text-emerald-400">{estimate.supporting_outcomes}</div>
                        <div className="text-[11px] text-muted-foreground">supportive outcomes</div>
                      </div>
                      <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-4">
                        <div className="text-2xl font-bold text-foreground">{sampleSize - (estimate.supporting_outcomes ?? 0)}</div>
                        <div className="text-[11px] text-muted-foreground">other outcomes</div>
                      </div>
                    </div>
                  </div>
                </div>
                <details className="group border-t border-border px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold text-muted-foreground">
                    How this score was calculated <ChevronDown size={15} className="transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{estimate.method}</p>
                  <p className="mt-2 text-[10px] text-amber-300/80">Similarity, evidence quality, legal comparability and judicial discretion are not measured by this range. {estimate.warning}</p>
                </details>
              </Card>
            )
          })()}
          {prediction.outcome_estimate && !prediction.outcome_estimate.available && prediction.outcome_estimate.claim_focus && (
            <Card className="p-5 border-amber-400/20 bg-amber-400/[0.025]">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber-400/10 text-amber-400"><AlertTriangle size={20} /></div>
                <div><h2 className="text-sm font-bold text-foreground">More matched outcomes needed</h2>
                <p className="text-xs text-muted-foreground mt-1">{prediction.outcome_estimate.reason}</p></div>
              </div>
            </Card>
          )}
          {prediction.case_preparation && (
            <Card className="overflow-hidden border-emerald-400/20">
              <div className="flex items-center gap-3 border-b border-border px-6 py-4">
                <ShieldCheck size={18} className="text-emerald-400" />
                <div><h2 className="text-sm font-bold text-foreground">Evidence readiness</h2><p className="text-[11px] text-muted-foreground">Strength of the information currently saved for this case</p></div>
              </div>
              <div className="grid gap-7 p-6 md:grid-cols-[190px_1fr] md:items-center">
                <ScoreRing value={prediction.case_preparation.score} label={prediction.case_preparation.level} />
                <div className="space-y-4">
                  {prediction.case_preparation.components.map((component) => (
                    <MetricBar
                      key={component.key}
                      label={component.label}
                      value={component.earned}
                      maximum={component.maximum}
                      colour={component.earned >= component.maximum ? '#34D399' : '#FBBF24'}
                    />
                  ))}
                </div>
              </div>
              {prediction.case_preparation.priority_actions.length > 0 && (
                <div className="border-t border-white/[0.06] bg-emerald-400/[0.02] p-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground"><TrendingUp size={16} className="text-emerald-400" /> Best ways to strengthen this case</h3>
                  <ul className="grid gap-3 md:grid-cols-2">
                    {prediction.case_preparation.priority_actions.slice(0, 5).map((action) => (
                      <li key={action.category} className="rounded-xl border border-white/[0.05] bg-card p-4 text-xs">
                        <div className="flex items-center justify-between gap-3"><span className="font-semibold text-foreground">{action.category}</span><span className="flex-shrink-0 rounded-full bg-emerald-400/10 px-2 py-0.5 font-semibold text-emerald-400">+{action.possible_points}</span></div>
                        <p className="mt-2 leading-relaxed text-muted-foreground">{action.label}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="border-t border-border px-6 py-3 text-[10px] text-muted-foreground">{prediction.case_preparation.warning}</p>
            </Card>
          )}
          {prediction.historical_outlook?.corpus_available && (
            <Card className="p-5 border-border bg-muted/[0.02]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale size={17} style={{ color: G }} />
                    <h2 className="text-sm font-bold text-foreground">Historical matched-case benchmark</h2>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{prediction.historical_outlook.meaning}</p>
                </div>
                <div className="text-right">
                  {prediction.historical_outlook.score_available ? (
                    <>
                      <div className="text-lg font-semibold tabular-nums text-foreground">{prediction.historical_outlook.favourable_ratio}% historically favourable</div>
                      <div className="text-[10px] font-medium text-amber-400">Not your probability of winning</div>
                      {prediction.historical_outlook.confidence_interval_low !== null && prediction.historical_outlook.confidence_interval_high !== null && (
                        <div className="text-[10px] text-muted-foreground mt-1">
                          Sample-only statistical range {prediction.historical_outlook.confidence_interval_low}–{prediction.historical_outlook.confidence_interval_high}%
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="max-w-[190px]">
                      <div className="text-sm font-semibold text-amber-400">
                        {prediction.historical_outlook.outcomes_available === 0 ? 'No countable outcomes in the matches' : 'Not enough outcomes for a reliable score'}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {prediction.historical_outlook.favourable} favourable out of {prediction.historical_outlook.outcomes_available} known outcomes · minimum {prediction.historical_outlook.minimum_sample} required for a percentage
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="rounded-lg bg-emerald-500/[0.05] p-3"><div className="font-bold text-emerald-400">{prediction.historical_outlook.favourable}</div><div className="text-[10px] text-muted-foreground">Favourable</div></div>
                <div className="rounded-lg bg-red-500/[0.05] p-3"><div className="font-bold text-red-400">{prediction.historical_outlook.unfavourable}</div><div className="text-[10px] text-muted-foreground">Unfavourable</div></div>
                <div className="rounded-lg bg-amber-500/[0.05] p-3"><div className="font-bold text-amber-400">{prediction.historical_outlook.partial_or_mixed}</div><div className="text-[10px] text-muted-foreground">Partial / mixed</div></div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">
                Sample: {prediction.historical_outlook.outcomes_available} outcome-known matched judgment{prediction.historical_outlook.outcomes_available === 1 ? '' : 's'}. Similarity, evidence, judicial discretion and legal comparability are not measured by this range. {prediction.historical_outlook.warning}
              </p>
            </Card>
          )}
          {prediction.historical_outlook && !prediction.historical_outlook.corpus_available && (
            <Card className="p-5 border-amber-400/20">
              <div className="flex items-start gap-2">
                <AlertTriangle size={15} className="text-amber-400 mt-0.5" />
                <div>
                  <h2 className="text-sm font-bold text-foreground">Historical score unavailable</h2>
                  <p className="text-xs text-muted-foreground mt-1">The Pakistani judgment collection is not reachable. The evidence assessment below still uses this case record, but no percentage will be invented.</p>
                </div>
              </div>
            </Card>
          )}
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-6 py-4">
              <Scale size={17} style={{ color: G }} />
              <h2 className="text-sm font-bold text-foreground">Evidence-grounded assessment</h2>
            </div>
            <details className="group p-6" open>
              <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold text-muted-foreground">View detailed explanation <ChevronDown size={15} className="transition-transform group-open:rotate-180" /></summary>
              <p className="mt-4 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{prediction.assessment}</p>
            </details>
            {(prediction.case_stage || prediction.matter) && (
              <div className="flex flex-wrap gap-2 border-t border-border px-6 py-4 text-xs">
                {prediction.case_stage && <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">{prediction.case_stage}</span>}
                {prediction.matter && <span className="rounded-full bg-muted px-3 py-1 text-foreground">{prediction.matter}</span>}
              </div>
            )}
          </Card>
          {(prediction.next_steps?.length ?? 0) > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><CalendarClock size={15} style={{ color: G }} /> What is likely to happen next</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                {prediction.next_steps?.map((item, index) => <li key={item} className="flex gap-3"><span className="font-bold text-primary">{index + 1}.</span><span>{item}</span></li>)}
              </ol>
            </Card>
          )}
          {(prediction.preparation_checklist?.length ?? 0) > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><BriefcaseBusiness size={15} className="text-emerald-400" /> What you should prepare now</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {prediction.preparation_checklist?.map((item) => <li key={item} className="flex gap-2"><span className="text-emerald-400">✓</span><span>{item}</span></li>)}
              </ul>
            </Card>
          )}
          {(prediction.needs_confirmation?.length ?? 0) > 0 && (
            <Card className="p-5 border-amber-400/20">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><AlertTriangle size={15} className="text-amber-400" /> Confirm from the latest order</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {prediction.needs_confirmation?.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </Card>
          )}
          {((prediction.supporting_factors?.length ?? 0) > 0 || (prediction.missing_information?.length ?? 0) > 0) && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-5 border-emerald-400/15">
                <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Available evidence</h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {prediction.supporting_factors?.map((item) => <li key={item} className="rounded-lg bg-emerald-400/[0.04] p-3">{item}</li>)}
                  {!prediction.supporting_factors?.length && <li className="text-muted-foreground">No verified supporting items yet.</li>}
                </ul>
              </Card>
              <Card className="p-5 border-amber-400/15">
                <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><ListChecks size={14} className="text-amber-400" /> Missing or unverified</h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {prediction.missing_information?.map((item) => <li key={item} className="rounded-lg bg-amber-400/[0.04] p-3">{item}</li>)}
                  {!prediction.missing_information?.length && <li className="text-muted-foreground">No priority gaps detected.</li>}
                </ul>
              </Card>
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center">{prediction.disclaimer}</p>
        </div>
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
