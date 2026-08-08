import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowRight, CheckCircle2, Route } from 'lucide-react'
import { Badge, Card, G } from './design'
import Spinner from './Spinner'
import ErrorAlert from './ErrorAlert'
import { getCasePathwayIntelligence } from '../lib/casePathway'
import type { CasePathwayResponse } from '../lib/casePathway'

export default function CasePathwayIntelligence({ caseId }: { caseId: number | string }) {
  const [data, setData] = useState<CasePathwayResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
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
    <Card className="p-5 border-[#D4AF37]/15 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Route size={17} style={{ color: G }} />
            <h3 className="text-base font-semibold text-foreground">Case Pathway Intelligence</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Where this case appears to be in the litigation pathway, based only on the saved facts and uploaded documents.</p>
        </div>
        <Badge label={`${data.stage_confidence} confidence`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 md:col-span-2">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Current detected stage</div>
          <div className="text-sm font-semibold text-foreground">{data.current_stage.label}</div>
          {stageKnown && (
            <div className="mt-3">
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, data.overall_progress))}%`, backgroundColor: G }} />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Pathway position</span>
                <span>{data.overall_progress}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Next generic stage</div>
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            {data.next_generic_stage ? <><ArrowRight size={14} style={{ color: G }} />{data.next_generic_stage.label}</> : 'Not determined'}
          </div>
        </div>
      </div>

      {data.detected_issues.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Detected legal issues</div>
          <div className="flex flex-wrap gap-2">
            {data.detected_issues.map((item) => <Badge key={item.issue} label={item.issue} />)}
          </div>
        </div>
      )}

      {data.detected_stage_evidence.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Stages evidenced in the record</div>
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
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3 space-y-1">
          {data.warnings.map((warning) => (
            <div key={warning} className="flex items-start gap-2 text-[11px] text-muted-foreground">
              <AlertTriangle size={12} className="mt-0.5 text-amber-400 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground leading-relaxed">{data.progress_meaning} {data.disclaimer}</p>
    </Card>
  )
}
