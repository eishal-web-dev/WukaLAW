import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock3,
  History,
  Route,
} from 'lucide-react'
import { Badge, Card, G } from './design'
import Spinner from './Spinner'
import ErrorAlert from './ErrorAlert'
import { getCasePathwayIntelligence } from '../lib/casePathway'
import type { CasePathwayResponse, JourneyStep } from '../lib/casePathway'

function confidenceText(value: string): string {
  if (value === 'high') return 'Strong stage match'
  if (value === 'moderate') return 'Likely stage'
  return 'More information needed'
}

function StepIcon({ step }: { step: JourneyStep }) {
  if (step.state === 'current') {
    return (
      <span className="w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-[0_0_20px_rgba(212,175,55,0.18)]" style={{ borderColor: G, backgroundColor: `${G}18`, color: G }}>
        <Circle size={9} fill="currentColor" />
      </span>
    )
  }
  if (step.state === 'confirmed') {
    return <span className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"><Check size={13} /></span>
  }
  if (step.state === 'next') {
    return <span className="w-7 h-7 rounded-full flex items-center justify-center border border-white/15 bg-white/[0.025] text-foreground"><ArrowRight size={12} /></span>
  }
  return <span className="w-7 h-7 rounded-full border border-white/[0.08] bg-white/[0.015]" />
}

function daysText(value: number | null | undefined): string {
  if (value == null) return '—'
  if (value < 60) return `${Math.round(value)} days`
  const months = value / 30.44
  if (months < 18) return `${months.toFixed(1)} months`
  return `${(value / 365.25).toFixed(1)} years`
}

export default function CasePathwayIntelligence({ caseId }: { caseId: number | string }) {
  const [data, setData] = useState<CasePathwayResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      setOpen(false)
      setHistoryOpen(false)
      try {
        setData(await getCasePathwayIntelligence(caseId))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'We could not work out where this case is right now.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [caseId])

  const visibleJourney = useMemo(() => {
    if (!data?.journey_steps?.length) return []
    const currentIndex = data.journey_steps.findIndex((step) => step.state === 'current')
    if (currentIndex < 0) return data.journey_steps.slice(0, 6)
    const start = Math.max(0, currentIndex - 3)
    const end = Math.min(data.journey_steps.length, currentIndex + 4)
    return data.journey_steps.slice(start, end)
  }, [data])

  if (loading) return <Card className="p-5"><Spinner label="Reading your case journey and similar completed cases…" /></Card>
  if (error) return <ErrorAlert message={error} />
  if (!data) return null

  const stageKnown = data.current_stage.key !== 'unknown'
  const position = data.court_process_position ?? data.overall_progress
  const historical = data.historical_pathway
  const historicalTop = historical?.most_common_next_stage
  const timing = data.historical_timing

  return (
    <Card className="p-4 md:p-5 border-[#D4AF37]/15 overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${G}15`, color: G }}><Route size={17} /></div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Your case journey</div>
            <div className="text-base font-semibold text-foreground truncate mt-0.5">{data.current_stage.label}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{stageKnown ? 'This is the latest court stage WukaLAW could verify from your record.' : 'Add the latest order or hearing details to place your case on the journey.'}</div>
          </div>
        </div>

        <div className="flex items-center gap-5 ml-auto">
          {stageKnown && (
            <div className="text-right">
              <div className="text-xl font-bold tabular-nums" style={{ color: G }}>{position}</div>
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground">position / 100</div>
            </div>
          )}
          <div className="hidden sm:block h-9 w-px bg-white/[0.08]" />
          <div className="hidden sm:block max-w-[230px]">
            <div className="text-[9px] uppercase tracking-wide text-muted-foreground">Generic next court step</div>
            <div className="text-xs font-semibold text-foreground mt-1 flex items-center gap-1.5"><ArrowRight size={12} style={{ color: G }} />{data.next_generic_stage?.label ?? 'We need more information'}</div>
          </div>
        </div>
      </div>

      {data.detected_issues.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {data.detected_issues.map((item) => <Badge key={item.issue} label={item.issue} />)}
          <Badge label={confidenceText(data.stage_confidence)} />
        </div>
      )}

      {stageKnown && visibleJourney.length > 0 && (
        <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 md:p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Court journey</div>
            <div className="text-[10px] text-muted-foreground">Only ✓ steps were actually found in your record</div>
          </div>
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-max items-start">
              {visibleJourney.map((step, index) => (
                <div key={step.key} className="flex items-start">
                  <div className="w-28 md:w-32 text-center">
                    <div className="flex justify-center"><StepIcon step={step} /></div>
                    <div className={`text-[10px] mt-2 leading-tight ${step.state === 'current' ? 'font-semibold text-foreground' : step.state === 'confirmed' ? 'text-foreground/80' : 'text-muted-foreground'}`}>{step.label}</div>
                    {step.state === 'current' && <div className="text-[9px] font-semibold mt-1" style={{ color: G }}>YOU ARE HERE</div>}
                    {step.state === 'next' && <div className="text-[9px] text-muted-foreground mt-1">NEXT</div>}
                  </div>
                  {index < visibleJourney.length - 1 && <div className="w-6 md:w-10 h-px bg-white/[0.08] mt-3.5" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {historical && (
        <div className="mt-4 rounded-xl border border-[#D4AF37]/15 bg-[#D4AF37]/[0.025] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${G}12`, color: G }}><History size={15} /></div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">What happened next in similar cases?</div>
                {historical.available && historicalTop ? (
                  <>
                    <div className="text-sm font-semibold text-foreground mt-1">{historicalTop.stage_label}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">Visible in {historicalTop.count} of {historical.cases_with_later_stage} comparable records that showed a later stage.</div>
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground mt-1">{historical.reason || 'Not enough historical pathway evidence yet.'}</div>
                )}
              </div>
            </div>
            {historical.available && historicalTop && (
              <div className="text-right">
                <div className="text-xl font-bold tabular-nums" style={{ color: G }}>{Math.round(historicalTop.share * 100)}%</div>
                <div className="text-[9px] uppercase tracking-wide text-muted-foreground">of usable records</div>
              </div>
            )}
          </div>

          {historical.available && historical.distribution.length > 0 && (
            <>
              <div className="mt-3 space-y-2">
                {historical.distribution.slice(0, 3).map((item) => (
                  <div key={item.stage_key} className="grid grid-cols-[1fr_auto] gap-3 items-center">
                    <div>
                      <div className="flex items-center justify-between gap-2 text-[11px]"><span className="text-foreground">{item.stage_label}</span><span className="text-muted-foreground">{item.count}</span></div>
                      <div className="h-1 rounded-full bg-white/[0.06] mt-1 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.max(3, item.share * 100)}%`, backgroundColor: G }} /></div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setHistoryOpen((value) => !value)} className="mt-3 text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors">
                {historyOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}{historyOpen ? 'Hide historical details' : 'See the historical basis'}
              </button>
              {historyOpen && (
                <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-2.5"><div className="text-sm font-semibold text-foreground">{historical.comparable_cases_reviewed}</div><div className="text-[9px] text-muted-foreground">similar cases reviewed</div></div>
                    <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-2.5"><div className="text-sm font-semibold text-foreground">{historical.cases_with_later_stage}</div><div className="text-[9px] text-muted-foreground">showed a later stage</div></div>
                    <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-2.5"><div className="text-sm font-semibold text-foreground">{historical.cases_without_later_stage}</div><div className="text-[9px] text-muted-foreground">not enough pathway text</div></div>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{historical.disclaimer}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {timing && (
        <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.018] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/[0.035] text-foreground"><Clock3 size={15} /></div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">How long did similar cases take to move on?</div>
                {timing.available ? (
                  <>
                    <div className="text-sm font-semibold text-foreground mt-1">Median observed gap: {daysText(timing.median_days)}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">Middle half of dated records: {daysText(timing.typical_low_days)} – {daysText(timing.typical_high_days)}</div>
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground mt-1">{timing.reason || 'Not enough dated historical records yet.'}</div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-foreground tabular-nums">{timing.dated_transitions_found}</div>
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground">dated transitions</div>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground mt-3 leading-relaxed">{timing.disclaimer}</div>
        </div>
      )}

      <div className="sm:hidden mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="text-[9px] uppercase tracking-wide text-muted-foreground">Generic next court step</div>
        <div className="text-xs font-semibold text-foreground mt-1">{data.next_generic_stage?.label ?? 'We need more information'}</div>
      </div>

      <button onClick={() => setOpen((value) => !value)} className="mt-4 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors">
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}{open ? 'Hide how we worked this out' : 'How did WukaLAW work this out?'}
      </button>

      {open && (
        <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-4">
          {data.confidence_reason && <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"><div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">How sure are we?</div><div className="text-xs text-foreground">{data.confidence_reason}</div></div>}
          {data.detected_stage_evidence.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Court steps found in your record</div>
              <div className="space-y-2">
                {data.detected_stage_evidence.map((stage) => (
                  <div key={stage.key} className="flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle2 size={13} className="mt-0.5 flex-shrink-0 text-emerald-400" /><div><span className="text-foreground font-medium">{stage.label}</span>{stage.evidence_terms.length > 0 && <span> — matched “{stage.evidence_terms.join('”, “')}”</span>}</div></div>
                ))}
              </div>
            </div>
          )}
          {data.warnings.length > 0 && <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3 space-y-1.5">{data.warnings.map((warning) => <div key={warning} className="flex items-start gap-2 text-[11px] text-muted-foreground"><AlertTriangle size={12} className="mt-0.5 text-amber-400 flex-shrink-0" /><span>{warning}</span></div>)}</div>}
          <p className="text-[10px] text-muted-foreground leading-relaxed">{data.progress_meaning} {data.disclaimer}</p>
        </div>
      )}
    </Card>
  )
}
