import { useEffect, useMemo, useState } from 'react'
import {
  BookOpenCheck,
  ChevronDown,
  ChevronUp,
  Database,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import { Card, Badge, Btn, G } from './design'
import ErrorAlert from './ErrorAlert'
import Spinner from './Spinner'
import PrecedentBrief from './PrecedentBrief'
import { getCase } from '../lib/api'
import type { Case } from '../lib/api'
import {
  getCaseSimilarJudgments,
  getCaseSimilarJudgmentsCustom,
} from '../lib/caseSimilar'
import type { CaseSimilarResponse, SimilarJudgment } from '../lib/caseSimilar'

type SearchMode = 'auto' | 'custom'
type FilterOption = { label: string; query: string }
type FilterGroup = { label: string; options: FilterOption[] }

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
    bail: 'Bail',
    fraud_forgery: 'Fraud / Forgery',
    custody_guardianship: 'Custody / Guardianship',
    maintenance: 'Maintenance',
    dissolution_khula: 'Divorce / Khula',
    dower_mehr: 'Dower / Mehr',
    dowry_gifts: 'Dowry / Bridal Gifts',
    inheritance_partition: 'Inheritance / Partition',
    specific_performance: 'Specific Performance',
    tenancy_rent: 'Tenancy / Rent',
    judicial_review_199: 'Judicial Review',
    tax_assessment: 'Tax Assessment',
    termination_service: 'Employment / Service',
  }
  return labels[factor.value] ?? readableLabel(factor.value)
}

function shortReason(item: SimilarJudgment): string {
  const issue = issueLabel(item)
  const domain = item.matching_factors.find((entry) => entry.factor === 'same_legal_domain')?.value
  const section = item.matching_factors.find((entry) => entry.factor === 'shared_section')?.value
  if (issue && section) return `Same ${issue.toLowerCase()} issue with Section ${section} overlap.`
  if (issue) return `Same ${issue.toLowerCase()} issue in a Pakistani judgment.`
  if (domain) return `Strong ${domain} legal-domain overlap with the selected case.`
  return 'Strong semantic and legal-issue overlap with the selected case.'
}

function enoughFacts(text: string): boolean {
  const value = text.toLowerCase()
  const claim = /\b(divorce|khula|dowry|dower|mehr|maintenance|custody|murder|killed|fraud|property|bail|termination|claim|suit|petition|accused|recovery)\b/.test(value)
  const secondSignal = /\b(evidence|witness|cctv|receipt|section|article|served|written statement|issues framed|cross[- ]examination|arguments|appeal|defence|defense|alibi|cruelty|relief|decree|order)\b/.test(value)
  return text.trim().length >= 25 && claim && secondSignal
}

const FAMILY_FILTERS: FilterGroup[] = [
  {
    label: 'Issue',
    options: [
      { label: 'Divorce / Khula', query: 'dissolution of marriage khula divorce' },
      { label: 'Dowry recovery', query: 'dowry articles bridal gifts jahez recovery' },
      { label: 'Dower / Mehr', query: 'dower haq mehr meher unpaid dower' },
      { label: 'Maintenance', query: 'maintenance allowance wife child maintenance' },
      { label: 'Child custody', query: 'child custody guardianship visitation minor child' },
    ],
  },
  {
    label: 'Deep filter · facts',
    options: [
      { label: 'Cruelty', query: 'cruelty mental cruelty physical cruelty matrimonial' },
      { label: 'Non-maintenance', query: 'failure to maintain non payment maintenance' },
      { label: 'Dowry retained', query: 'husband retained dowry articles return recovery' },
      { label: 'Receipts', query: 'receipts documentary proof dowry purchase evidence' },
      { label: 'Witnesses', query: 'family witnesses witness testimony evidence' },
      { label: 'Nikahnama', query: 'nikahnama marriage contract dower terms' },
    ],
  },
  {
    label: 'Deep filter · stage',
    options: [
      { label: 'Family Court', query: 'Family Court trial proceedings' },
      { label: 'Evidence stage', query: 'evidence recorded cross examination witnesses' },
      { label: 'Final arguments', query: 'final arguments arguments concluded judgment reserved' },
      { label: 'Appeal', query: 'family appeal appellate court High Court' },
      { label: 'Execution', query: 'execution enforcement decree recovery proceedings' },
    ],
  },
]

const CRIMINAL_FILTERS: FilterGroup[] = [
  {
    label: 'Issue',
    options: [
      { label: 'Murder / Homicide', query: 'murder homicide qatl qatal section 302 PPC' },
      { label: 'Bail', query: 'pre arrest bail post arrest bail criminal bail' },
      { label: 'Fraud / Forgery', query: 'fraud forgery cheating forged document deception' },
    ],
  },
  {
    label: 'Deep filter · intent / method',
    options: [
      { label: 'Intentional', query: 'intentional murder premeditated deliberate intention motive' },
      { label: 'Accidental', query: 'accidental killing accidental death no intention' },
      { label: 'Firearm', query: 'firearm gun pistol shooting weapon recovery' },
      { label: 'Knife / sharp weapon', query: 'knife dagger sharp edged weapon stabbing' },
      { label: 'Blunt weapon', query: 'blunt weapon blunt force injury' },
    ],
  },
  {
    label: 'Deep filter · evidence / defence',
    options: [
      { label: 'Eyewitness', query: 'eyewitness ocular account eye witness testimony' },
      { label: 'Circumstantial', query: 'circumstantial evidence chain of circumstances' },
      { label: 'CCTV', query: 'CCTV video footage electronic evidence' },
      { label: 'Forensic', query: 'forensic ballistic DNA medical evidence' },
      { label: 'Confession', query: 'confession admission judicial confession extra judicial confession' },
      { label: 'Alibi', query: 'plea of alibi not present crime scene' },
      { label: 'Self-defence', query: 'self defence private defence right of private defence' },
      { label: 'False implication', query: 'false implication falsely implicated enmity' },
    ],
  },
]

const CIVIL_FILTERS: FilterGroup[] = [
  {
    label: 'Issue',
    options: [
      { label: 'Property ownership', query: 'property ownership title possession land' },
      { label: 'Inheritance', query: 'inheritance succession legal heirs partition' },
      { label: 'Specific performance', query: 'specific performance agreement to sell contract' },
      { label: 'Injunction', query: 'injunction temporary injunction permanent injunction' },
    ],
  },
  {
    label: 'Deep filter',
    options: [
      { label: 'Documentary evidence', query: 'documentary evidence title documents agreement record' },
      { label: 'Witnesses', query: 'witness testimony oral evidence' },
      { label: 'Interim order', query: 'interim order stay temporary injunction' },
      { label: 'Appeal', query: 'civil appeal appellate court High Court' },
      { label: 'Execution', query: 'execution decree enforcement possession recovery' },
    ],
  },
]

function filterGroups(caseType: string, facts: string): FilterGroup[] {
  const value = `${caseType} ${facts}`.toLowerCase()
  if (/family|divorce|khula|dowry|mehr|maintenance|custody/.test(value)) return FAMILY_FILTERS
  if (/criminal|murder|homicide|bail|fraud|forgery|accused/.test(value)) return CRIMINAL_FILTERS
  return CIVIL_FILTERS
}

export default function CaseSimilarJudgments({ caseId }: { caseId: number | string }) {
  const [data, setData] = useState<CaseSimilarResponse | null>(null)
  const [currentCase, setCurrentCase] = useState<Case | null>(null)
  const [mode, setMode] = useState<SearchMode>('auto')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const groups = useMemo(
    () => filterGroups(currentCase?.case_type ?? '', currentCase?.description ?? ''),
    [currentCase],
  )

  const loadAuto = async () => {
    setLoading(true)
    setError(null)
    try {
      const [similar, caseRecord] = await Promise.all([
        getCaseSimilarJudgments(caseId, 8),
        getCase(caseId),
      ])
      setData(similar)
      setCurrentCase(caseRecord)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not search similar judgments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMode('auto')
    setSelectedFilters([])
    setExpanded(new Set())
    void loadAuto()
  }, [caseId])

  const runCustom = async () => {
    if (!selectedFilters.length) {
      setError('Choose at least one custom filter first.')
      return
    }
    setLoading(true)
    setError(null)
    setExpanded(new Set())
    try {
      setData(await getCaseSimilarJudgmentsCustom(caseId, selectedFilters, 8))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not run the custom precedent search.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (next: SearchMode) => {
    setMode(next)
    setError(null)
    setExpanded(new Set())
    if (next === 'auto') void loadAuto()
    else setData(null)
  }

  const toggleFilter = (query: string) => {
    setSelectedFilters((current) =>
      current.includes(query) ? current.filter((item) => item !== query) : [...current, query],
    )
  }

  const toggleDetails = (documentId: string) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(documentId)) next.delete(documentId)
      else next.add(documentId)
      return next
    })
  }

  const relatedOnly = Boolean(
    mode === 'auto' &&
    currentCase &&
    currentCase.num_documents === 0 &&
    !enoughFacts(currentCase.description ?? ''),
  )

  const bestScore = data?.results.length ? score100(data.results[0].similarity_score) : 0

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">Precedent Search</div>
            <div className="text-xs text-muted-foreground mt-1">Dataset-powered retrieval. No LLM is used for normal matching.</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => switchMode('auto')}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${mode === 'auto' ? 'border-[#D4AF37]/50 bg-[#D4AF37]/10 text-foreground' : 'border-white/10 text-muted-foreground hover:text-foreground'}`}
            >
              <span className="inline-flex items-center gap-1.5"><Sparkles size={13} /> Auto Search</span>
            </button>
            <button
              onClick={() => switchMode('custom')}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${mode === 'custom' ? 'border-[#D4AF37]/50 bg-[#D4AF37]/10 text-foreground' : 'border-white/10 text-muted-foreground hover:text-foreground'}`}
            >
              <span className="inline-flex items-center gap-1.5"><SlidersHorizontal size={13} /> Custom Search</span>
            </button>
          </div>
        </div>
      </Card>

      {mode === 'custom' && (
        <Card className="p-5 space-y-5 border-[#D4AF37]/15">
          <div>
            <div className="text-sm font-semibold text-foreground">Super filters</div>
            <p className="text-xs text-muted-foreground mt-1">Pick the exact issue, then add deep fact/evidence filters. WukaLAW searches the judgment corpus around only that focus.</p>
          </div>
          {groups.map((group) => (
            <div key={group.label}>
              <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-2">{group.label}</div>
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => {
                  const active = selectedFilters.includes(option.query)
                  return (
                    <button
                      key={option.query}
                      onClick={() => toggleFilter(option.query)}
                      className={`px-3 py-2 rounded-lg text-xs border transition-all ${active ? 'border-[#D4AF37]/60 bg-[#D4AF37]/12 text-foreground' : 'border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground hover:border-white/20'}`}
                    >
                      {active ? '✓ ' : ''}{option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 flex-wrap border-t border-white/[0.06] pt-4">
            <span className="text-xs text-muted-foreground">{selectedFilters.length} filter{selectedFilters.length === 1 ? '' : 's'} selected</span>
            <Btn icon={<Search size={13} />} onClick={() => void runCustom()} disabled={!selectedFilters.length || loading}>
              Search selected facts
            </Btn>
          </div>
        </Card>
      )}

      {loading && <Card className="p-7"><Spinner label={mode === 'auto' ? 'Auto-searching Pakistani judgments…' : 'Searching your selected fact pattern…'} /></Card>}
      {error && <ErrorAlert message={error} />}

      {!loading && !error && !data && mode === 'custom' && (
        <Card className="p-8 text-center">
          <SlidersHorizontal size={24} className="mx-auto mb-3" style={{ color: G }} />
          <div className="text-sm font-semibold text-foreground">Choose your filters</div>
          <p className="text-xs text-muted-foreground mt-1">Example: Murder / Homicide + Firearm + Alibi + CCTV.</p>
        </Card>
      )}

      {!loading && !error && data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <Card className="p-4">
              <div className="text-2xl font-bold text-foreground">{data.total_candidates}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">judgments checked</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold" style={{ color: G }}>{bestScore}%</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">best {relatedOnly ? 'topic match' : 'similarity'}</div>
            </Card>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">{relatedOnly ? 'Related Pakistani Precedents' : mode === 'custom' ? 'Custom Similar Cases' : 'Similar Pakistani Cases'}</h3>
              <p className="text-xs text-muted-foreground mt-1">Compact results first. Open a card only when you want more.</p>
            </div>
            {mode === 'auto' && (
              <Btn variant="secondary" icon={<RefreshCw size={13} />} onClick={() => void loadAuto()} disabled={loading}>Refresh</Btn>
            )}
          </div>

          {data.results.length === 0 ? (
            <Card className="p-7 text-center">
              <BookOpenCheck size={24} className="mx-auto mb-3 text-muted-foreground" />
              <div className="text-sm font-semibold text-foreground">No strong match found</div>
              <p className="text-xs text-muted-foreground mt-1">Try another deep filter combination or add more case documents.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {data.results.map((item) => {
                const issue = issueLabel(item)
                const open = expanded.has(item.document_id)
                return (
                  <Card key={`${item.document_id}-${item.rank}`} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          <span className="text-[10px] font-mono text-muted-foreground">#{item.rank}</span>
                          {item.court && <Badge label={item.court} />}
                          {issue && <Badge label={issue} />}
                        </div>
                        <h4 className="text-sm font-semibold text-foreground truncate">{item.title || item.case_number || 'Pakistani judgment'}</h4>
                        {item.case_number && <div className="text-[11px] text-muted-foreground mt-1 truncate">{item.case_number}</div>}
                        <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{shortReason(item)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold" style={{ color: G }}>{score100(item.similarity_score)}%</div>
                        <div className="text-[10px] text-muted-foreground">{relatedOnly ? 'topic match' : 'similarity'}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleDetails(item.document_id)}
                      className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.03] transition-colors"
                    >
                      {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      {open ? 'Hide details' : 'View details'}
                    </button>

                    {open && (
                      <div className="mt-3 space-y-3 border-t border-white/[0.06] pt-3">
                        <div className="rounded-lg bg-white/[0.025] border border-white/[0.06] p-3">
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Why this matched</div>
                          <p className="text-xs text-foreground leading-relaxed">{item.explanation || shortReason(item)}</p>
                        </div>

                        {item.explicit_outcome_phrase && (
                          <div className="rounded-lg bg-white/[0.025] border border-white/[0.06] p-3">
                            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Recorded outcome</div>
                            <p className="text-xs text-foreground">{item.explicit_outcome_phrase}</p>
                          </div>
                        )}

                        {(item.laws_cited.length > 0 || item.sections_cited.length > 0 || item.articles_cited.length > 0) && (
                          <div>
                            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Key legal references</div>
                            <div className="flex flex-wrap gap-1.5">
                              {item.laws_cited.slice(0, 2).map((law) => <Badge key={`law-${law}`} label={law} />)}
                              {item.sections_cited.slice(0, 3).map((section) => <Badge key={`sec-${section}`} label={`Section ${section}`} />)}
                              {item.articles_cited.slice(0, 2).map((article) => <Badge key={`art-${article}`} label={`Article ${article}`} />)}
                            </div>
                          </div>
                        )}

                        {item.differences.length > 0 && (
                          <div className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Main difference: </span>{item.differences[0]}</div>
                        )}

                        <div className="rounded-lg border border-sky-500/15 bg-sky-500/[0.025] p-3 flex items-start gap-2">
                          <Database size={13} className="text-sky-400 mt-0.5 flex-shrink-0" />
                          <div className="text-[10px] text-muted-foreground leading-relaxed">
                            Matching above comes from WukaLAW's indexed dataset. The optional Full Case Brief below uses Groq only when you open it.
                          </div>
                        </div>

                        <PrecedentBrief caseId={caseId} documentId={item.document_id} />
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
