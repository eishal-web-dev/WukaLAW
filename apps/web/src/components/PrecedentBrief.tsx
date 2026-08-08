import { useState } from 'react'
import { BookOpen, ChevronUp, ShieldCheck, Scale, Swords } from 'lucide-react'
import { Btn, Card, G, Badge } from './design'
import ErrorAlert from './ErrorAlert'
import Spinner from './Spinner'
import { getPrecedentBrief } from '../lib/caseSimilar'
import type { PrecedentBrief as Brief } from '../lib/caseSimilar'

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null
  return (
    <div>
      <div className="text-xs font-semibold text-foreground mb-1.5">{title}</div>
      <ol className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="flex gap-2">
            <span className="font-mono text-[10px] mt-0.5" style={{ color: G }}>{index + 1}.</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function effectLabel(value: Brief['client_effect']): string {
  if (value === 'supports') return 'May support client'
  if (value === 'cautions') return 'May caution client'
  if (value === 'mixed') return 'Mixed value'
  return 'More client facts needed'
}

function strengthLabel(value: Brief['research_strength']): string {
  if (value === 'strong') return 'Strong research match'
  if (value === 'moderate') return 'Moderate research match'
  return 'Limited research match'
}

export default function PrecedentBrief({ caseId, documentId }: { caseId: number | string; documentId: string }) {
  const [open, setOpen] = useState(false)
  const [brief, setBrief] = useState<Brief | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = async () => {
    if (open) {
      setOpen(false)
      return
    }
    setOpen(true)
    if (brief || loading) return
    setLoading(true)
    setError(null)
    try {
      setBrief(await getPrecedentBrief(caseId, documentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate the precedent brief.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 border-t border-white/[0.06] pt-4">
      <Btn
        variant="secondary"
        icon={open ? <ChevronUp size={13} /> : <BookOpen size={13} />}
        onClick={() => void toggle()}
      >
        {open ? 'Hide full case brief' : 'View full case brief'}
      </Btn>

      {open && (
        <div className="mt-3">
          {loading && (
            <Card className="p-5">
              <Spinner label="Reading the historical judgment and preparing a case brief…" />
            </Card>
          )}
          {error && <ErrorAlert message={error} />}
          {!loading && !error && brief && (
            <Card className="p-5 space-y-5 border-[#D4AF37]/15 bg-[#D4AF37]/[0.02]">
              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Historical case brief</div>
                <h5 className="text-sm font-semibold text-foreground mt-1">{brief.title || brief.case_number || 'Pakistani judgment'}</h5>
                <div className="text-[11px] text-muted-foreground mt-1">
                  {[brief.court, brief.case_number].filter(Boolean).join(' · ')} · {brief.record_source === 'full_source_file' ? 'full source judgment reviewed' : `${brief.passages_reviewed} indexed passages reviewed`}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge label={strengthLabel(brief.research_strength)} />
                  <Badge label={effectLabel(brief.client_effect)} />
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-foreground mb-1.5">What happened in this case</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{brief.case_overview}</p>
              </div>

              <ListBlock title="Background facts" items={brief.background_facts} />
              <ListBlock title="How the case progressed through the courts" items={brief.procedural_history} />
              <ListBlock title="Questions the court had to decide" items={brief.legal_issues} />
              <ListBlock title="How the court reasoned" items={brief.court_reasoning} />
              <ListBlock title="Legal principle / ratio indicated by the record" items={brief.ratio_or_principle} />

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="text-xs font-semibold text-foreground mb-1">Final decision</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{brief.final_decision}</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="text-xs font-semibold text-foreground mb-1">Order / relief</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{brief.relief_or_order}</p>
                </div>
              </div>

              <div className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/[0.035] p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Scale size={15} style={{ color: G }} />
                  <div className="text-sm font-semibold text-foreground">Authority & research strength</div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{brief.authority_note}</p>
                <div>
                  <div className="text-xs font-semibold text-foreground mb-1">Why WakuLAW rates this research match {brief.research_strength}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{brief.research_strength_reason}</p>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.03] p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-emerald-400" />
                  <div className="text-sm font-semibold text-foreground">How this precedent relates to your case</div>
                </div>
                <ListBlock title="Similarities supported by both records" items={brief.similarities_to_client} />
                <ListBlock title="Important differences / limits" items={brief.important_differences} />
                <ListBlock title="How it may help or caution the client" items={brief.how_it_may_help} />
              </div>

              <div className="rounded-xl border border-sky-500/15 bg-sky-500/[0.03] p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Swords size={15} className="text-sky-400" />
                  <div className="text-sm font-semibold text-foreground">Lawyer strategy note</div>
                </div>
                <ListBlock title="Argument counsel may consider" items={brief.argument_to_consider} />
                <ListBlock title="How the other side may distinguish this precedent" items={brief.opponent_distinction} />
                <ListBlock title="Verify before relying on it" items={brief.next_verification_steps} />
              </div>

              <ListBlock title="Key laws / sections found in the judgment" items={brief.key_laws} />

              <div className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Evidence limitations: </span>
                {brief.evidence_limitations}
              </div>
              <div className="text-[10px] text-muted-foreground leading-relaxed border-t border-white/[0.06] pt-3">
                {brief.disclaimer}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
