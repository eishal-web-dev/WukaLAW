import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowRight, ChevronDown, ChevronUp, CheckCircle2, Route } from 'lucide-react'
import { Badge, Card, G } from './design'
import Spinner from './Spinner'
import ErrorAlert from './ErrorAlert'
import { getCasePathwayIntelligence } from '../lib/casePathway'
import type { CasePathwayResponse } from '../lib/casePathway'

export default function CasePathwayIntelligence({ caseId }: { caseId: number | string }) {
  const [data, setData] = useState<CasePathwayResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      setOpen(false)
      try {
        setData(await getCasePathwayIntelligence(caseId))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not analyze case pathway.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [caseId])

  if (loading) return <Card className="p-5"><Spinner label="Analyzing current case stage…" /></Card>
  if (error) return <ErrorAlert message={error} />
  if (!data) return null

  const stageKnown = data.current_stage.key !== 'unknown'

  return (
    <Card className="p-4 border-[#D4AF37]/15">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${G}15`, color: G }}>
            <Route size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Current case stage</div>
            <div className="text-sm font-semibold text-foreground truncate">{data.current_stage.label}</div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="text-xl font-bold" style={{ color: G }}>{stageKnown ? `${data.overall_progress}%` : '—'}</div>
            <div className="text-[10px] text-muted-foreground">pathway position</div>
          </div>
          <div className="hidden sm:block h-9 w-px bg-white/[0.08]" />
          <div className="hidden sm:block">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Likely next stage</div>
            <div className="text-xs font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
              <ArrowRight size={12} style={{ color: G }} />
              {data.next_generic_stage?.label ?? 'Not determined'}
            </div>
          </div>
        </div>
      </div>

      {data.detected_issues.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {data.detected_issues.map((item) => <Badge key={item.issue} label={item.issue} />)}
          <Badge label={`${data.stage_confidence} confidence`} />
        </div>
      )}

      {stageKnown && (
        <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, data.overall_progress))}%`, backgroundColor: G }} />
        </div>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
        className="mt-3 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
      >
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {open ? 'Hide pathway details' : 'View pathway details'}
      </button>

      {open && (
        <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-4">
          <div className="sm:hidden rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Likely next stage</div>
            <div className="text-xs font-semibold text-foreground mt-1">{data.next_generic_stage?.label ?? 'Not determined'}</div>
          </div>

          {data.detected_stage_evidence.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Why WukaLAW detected this stage</div>
              <div className="space-y-2">
                {data.detected_stage_evidence.map((stage) => (
                  <div key={stage.key} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0 text-emerald-400" />
                    <div><span className="text-foreground font-medium">{stage.label}</span>{stage.evidence_terms.length > 0 && <span> — {stage.evidence_terms.join(', ')}</span>}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.warnings.length > 0 && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3 space-y-1">
              {data.warnings.map((warning) => (
                <div key={warning} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                  <AlertTriangle size={12} className="mt-0.5 text-amber-400 flex-shrink-0" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}

          <p className="text-[10px] text-muted-foreground leading-relaxed">{data.progress_meaning} {data.disclaimer}</p>
        </div>
      )}
    </Card>
  )
}
