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
  if (value === 'supports') return 'Could help your case'
  if (value === 'cautions') return 'Could work against your case'
  if (value === 'mixed') return 'Helpful in some ways'
  return 'We need more facts from your case'
}

function strengthLabel(value: Brief['research_strength']): string {
  if (value === 'strong') return 'Very useful match'
  if (value === 'moderate') return 'Useful match'
  return 'Somewhat useful match'
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
      setError(err instanceof Error ? err.message : 'We could not prepare the full case story.')
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
        {open ? 'Close full story' : 'See the full story'}
      </Btn>

      {open && (
        <div className="mt-3">
          {loading && (
            <Card className="p-5">
              <Spinner label="Reading this case and turning it into a simple summaryâ€¦" />
            </Card>
          )}
          {error && <ErrorAlert message={error} />}
          {!loading && !error && brief && (
            <Card className="p-5 space-y-5 border-[#D4AF37]/15 bg-[#D4AF37]/[0.02]">
              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">What happened in this earlier case</div>
                <h5 className="text-sm font-semibold text-foreground mt-1">{brief.title || brief.case_number || 'Pakistani judgment'}</h5>
                <div className="text-[11px] text-muted-foreground mt-1">
                  {[brief.court, brief.case_number].filter(Boolean).join(' Â· ')} Â· {brief.record_source === 'full_source_file' ? 'full judgment checked' : `${brief.passages_reviewed} useful parts checked`}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge label={brief.brief_source === 'ai_enhanced' ? 'AI-enhanced brief' : 'Extracted case brief'} />
                  <Badge label={strengthLabel(brief.research_strength)} />
                  <Badge label={effectLabel(brief.client_effect)} />
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-foreground mb-1.5">The story in simple words</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{brief.case_overview}</p>
              </div>

              <ListBlock title="What happened" items={brief.background_facts} />
              <ListBlock title="How the case moved through court" items={brief.procedural_history} />
              <ListBlock title="What the judges had to decide" items={brief.legal_issues} />
              <ListBlock title="Why the judges decided that way" items={brief.court_reasoning} />
              <ListBlock title="Main legal rule from this case" items={brief.ratio_or_principle} />

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="text-xs font-semibold text-foreground mb-1">What the court decided</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{brief.final_decision}</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="text-xs font-semibold text-foreground mb-1">What happened after the decision</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{brief.relief_or_order}</p>
                </div>
              </div>

              <div className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/[0.035] p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Scale size={15} style={{ color: G }} />
                  <div className="text-sm font-semibold text-foreground">How useful is this case?</div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{brief.authority_note}</p>
                <div>
                  <div className="text-xs font-semibold text-foreground mb-1">Why WukaLAW thinks this match is {strengthLabel(brief.research_strength).toLowerCase()}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{brief.research_strength_reason}</p>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.03] p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-emerald-400" />
                  <div className="text-sm font-semibold text-foreground">How this could affect your case</div>
                </div>
                <ListBlock title="What looks similar" items={brief.similarities_to_client} />
                <ListBlock title="What is different" items={brief.important_differences} />
                <ListBlock title="How this may help or hurt" items={brief.how_it_may_help} />
              </div>

              <div className="rounded-xl border border-sky-500/15 bg-sky-500/[0.03] p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Swords size={15} className="text-sky-400" />
                  <div className="text-sm font-semibold text-foreground">What your lawyer may want to consider</div>
                </div>
                <ListBlock title="Possible argument" items={brief.argument_to_consider} />
                <ListBlock title="What the other side may say" items={brief.opponent_distinction} />
                <ListBlock title="Things to check before using this case" items={brief.next_verification_steps} />
              </div>

              <ListBlock title="Important laws mentioned" items={brief.key_laws} />

              <div className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">What we could not confirm: </span>
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
