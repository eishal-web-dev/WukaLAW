import { useEffect, useMemo, useState } from 'react'
import {
  BookOpenCheck,
  ChevronDown,
  ChevronUp,
  Database,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
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
import { getSimilarCaseFilters } from '../lib/similarCaseFilters'

type SearchMode = 'auto' | 'custom'

const INITIAL_RESULTS = 4
const SEARCH_RESULTS = 8

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
    specific_performance: 'Contract / Sale Agreement',
    tenancy_rent: 'Rent / Tenancy',
    judicial_review_199: 'Judicial Review',
    tax_assessment: 'Tax Assessment',
    termination_service: 'Employment / Service',
  }
  return labels[factor.value] ?? readableLabel(factor.value)
}

function shortReason(item: SimilarJudgment): string {
  const issue = issueLabel(item)
  const section = item.matching_factors.find((entry) => entry.factor === 'shared_section')?.value
  const domain = item.matching_factors.find((entry) => entry.factor === 'same_legal_domain')?.value
  if (issue && section) return `Same ${issue.toLowerCase()} issue, including Section ${section}.`
  if (issue) return `Deals with the same ${issue.toLowerCase()} issue.`
  if (domain) return `Comes from the same area of law: ${domain}.`
  return 'Its legal issue and facts are close to your case.'
}

function enoughFacts(text: string): boolean {
  const value = text.toLowerCase()
  const claim = /\b(divorce|khula|dowry|dower|mehr|maintenance|custody|murder|killed|fraud|property|bail|termination|claim|suit|petition|accused|recovery|inheritance|rent|agreement)\b/.test(value)
  const secondSignal = /\b(evidence|witness|cctv|receipt|section|article|served|written statement|issues framed|cross[- ]examination|arguments|appeal|defence|defense|alibi|cruelty|relief|decree|order|possession|payment)\b/.test(value)
  return text.trim().length >= 25 && claim && secondSignal
}

function detailLabel(item: SimilarJudgment): string {
  if (item.explicit_outcome_phrase) return 'Outcome available'
  if (item.laws_cited.length || item.sections_cited.length || item.articles_cited.length) return 'Legal references available'
  return 'Case details available'
}

export default function CaseSimilarJudgments({ caseId }: { caseId: number | string }) {
  const reduceMotion = useReducedMotion()
  const [data, setData] = useState<CaseSimilarResponse | null>(null)
  const [currentCase, setCurrentCase] = useState<Case | null>(null)
  const [mode, setMode] = useState<SearchMode>('auto')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [visibleCount, setVisibleCount] = useState(INITIAL_RESULTS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const groups = useMemo(
    () => getSimilarCaseFilters(currentCase?.case_type ?? '', currentCase?.description ?? ''),
    [currentCase],
  )
  const issueQueries = useMemo(() => new Set(groups[0]?.options.map((item) => item.query) ?? []), [groups])
  const hasIssue = selectedFilters.some((query) => issueQueries.has(query))
  const selectedLabels = useMemo(
    () => groups.flatMap((group) => group.options).filter((option) => selectedFilters.includes(option.query)).map((option) => option.label),
    [groups, selectedFilters],
  )

  const loadAuto = async () => {
    setLoading(true)
    setError(null)
    setVisibleCount(INITIAL_RESULTS)
    setExpanded(new Set())
    try {
      const [similar, caseRecord] = await Promise.all([
        getCaseSimilarJudgments(caseId, SEARCH_RESULTS),
        getCase(caseId),
      ])
      setData(similar)
      setCurrentCase(caseRecord)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not find similar cases right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMode('auto')
    setSelectedFilters([])
    void loadAuto()
  }, [caseId])

  const runCustom = async () => {
    if (!hasIssue) {
      setError('First choose what your case is about.')
      return
    }
    setLoading(true)
    setError(null)
    setVisibleCount(INITIAL_RESULTS)
    setExpanded(new Set())
    try {
      setData(await getCaseSimilarJudgmentsCustom(caseId, selectedFilters, SEARCH_RESULTS))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not search those details right now.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (next: SearchMode) => {
    setMode(next)
    setError(null)
    setExpanded(new Set())
    setVisibleCount(INITIAL_RESULTS)
    if (next === 'auto') {
      setSelectedFilters([])
      void loadAuto()
    } else {
      setData(null)
    }
  }

  const toggleFilter = (query: string) => {
    setError(null)
    setSelectedFilters((current) =>
      current.includes(query) ? current.filter((item) => item !== query) : [...current, query],
    )
  }

  const clearFilters = () => {
    setSelectedFilters([])
    setData(null)
    setError(null)
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
    mode === 'auto' && currentCase && currentCase.num_documents === 0 && !enoughFacts(currentCase.description ?? ''),
  )
  const bestScore = data?.results.length ? score100(data.results[0].similarity_score) : 0
  const visibleResults = data?.results.slice(0, visibleCount) ?? []

  const enter = reduceMotion ? {} : { opacity: 0, y: 10 }
  const animate = { opacity: 1, y: 0 }

  return (
    <div className="space-y-4">
      <motion.div initial={enter} animate={animate} transition={{ duration: 0.25 }}>
        <Card className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-foreground">Find cases like mine</div>
              <div className="text-xs text-muted-foreground mt-1">Let WukaLAW choose the details, or tell it exactly what matters.</div>
            </div>
            <div className="flex gap-2 rounded-xl bg-white/[0.025] p-1 border border-white/[0.06]">
              <motion.button whileTap={reduceMotion ? undefined : { scale: 0.97 }} onClick={() => switchMode('auto')} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${mode === 'auto' ? 'bg-[#D4AF37]/12 text-foreground border border-[#D4AF37]/35' : 'text-muted-foreground border border-transparent hover:text-foreground'}`}>
                <span className="inline-flex items-center gap-1.5"><Sparkles size={13} /> Find for me</span>
              </motion.button>
              <motion.button whileTap={reduceMotion ? undefined : { scale: 0.97 }} onClick={() => switchMode('custom')} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${mode === 'custom' ? 'bg-[#D4AF37]/12 text-foreground border border-[#D4AF37]/35' : 'text-muted-foreground border border-transparent hover:text-foreground'}`}>
                <span className="inline-flex items-center gap-1.5"><SlidersHorizontal size={13} /> Search my way</span>
              </motion.button>
            </div>
          </div>
        </Card>
      </motion.div>

      <AnimatePresence mode="wait">
        {mode === 'custom' && (
          <motion.div key="custom-filters" initial={enter} animate={animate} exit={reduceMotion ? {} : { opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            <Card className="p-5 border-[#D4AF37]/15">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <div className="text-sm font-semibold text-foreground">Make it specific</div>
                  <p className="text-xs text-muted-foreground mt-1">Start with the issue. Then add only the details that actually fit your case.</p>
                </div>
                {selectedFilters.length > 0 && (
                  <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"><RotateCcw size={12} /> Clear</button>
                )}
              </div>

              <div className="space-y-5">
                {groups.map((group, groupIndex) => {
                  const locked = groupIndex > 0 && !hasIssue
                  return (
                    <motion.div key={group.id} animate={{ opacity: locked ? 0.35 : 1 }}>
                      <div className="flex items-end justify-between gap-3 mb-2">
                        <div>
                          <div className="text-[11px] font-semibold text-foreground">{group.label}</div>
                          {group.helper && <div className="text-[10px] text-muted-foreground mt-0.5">{group.helper}</div>}
                        </div>
                        {locked && <span className="text-[10px] text-muted-foreground">Choose an issue first</span>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((option) => {
                          const active = selectedFilters.includes(option.query)
                          return (
                            <motion.button
                              key={option.query}
                              disabled={locked}
                              whileHover={locked || reduceMotion ? undefined : { y: -1 }}
                              whileTap={locked || reduceMotion ? undefined : { scale: 0.97 }}
                              onClick={() => toggleFilter(option.query)}
                              className={`px-3 py-2 rounded-lg text-xs border transition-colors disabled:cursor-not-allowed ${active ? 'border-[#D4AF37]/60 bg-[#D4AF37]/12 text-foreground shadow-[0_0_18px_rgba(212,175,55,0.06)]' : 'border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground hover:border-white/20'}`}
                            >
                              {active ? '✓ ' : ''}{option.label}
                            </motion.button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] text-muted-foreground">Your search</div>
                  <div className="text-xs text-foreground mt-0.5 truncate max-w-xl">{selectedLabels.length ? selectedLabels.join(' · ') : 'Choose an issue to begin'}</div>
                </div>
                <Btn icon={<Search size={13} />} onClick={() => void runCustom()} disabled={!hasIssue || loading}>Find cases like mine</Btn>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && <Card className="p-7"><Spinner label={mode === 'auto' ? 'Looking through Pakistani cases…' : 'Finding cases with those details…'} /></Card>}
      {error && <ErrorAlert message={error} />}

      {!loading && !error && !data && mode === 'custom' && (
        <motion.div initial={enter} animate={animate}>
          <Card className="p-7 text-center">
            <SlidersHorizontal size={23} className="mx-auto mb-3" style={{ color: G }} />
            <div className="text-sm font-semibold text-foreground">Start with your case type</div>
            <p className="text-xs text-muted-foreground mt-1">Choose the issue above, add any useful details, then search.</p>
          </Card>
        </motion.div>
      )}

      {!loading && !error && data && (
        <motion.div initial={enter} animate={animate} transition={{ duration: 0.25 }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <motion.div whileHover={reduceMotion ? undefined : { y: -2 }}>
              <Card className="p-4 h-full">
                <div className="text-2xl font-bold text-foreground tabular-nums">{data.total_candidates}</div>
                <div className="text-[10px] text-muted-foreground mt-1">Cases we checked</div>
              </Card>
            </motion.div>
            <motion.div whileHover={reduceMotion ? undefined : { y: -2 }}>
              <Card className="p-4 h-full">
                <div className="text-2xl font-bold tabular-nums" style={{ color: G }}>{bestScore}%</div>
                <div className="text-[10px] text-muted-foreground mt-1">{relatedOnly ? 'Closest related case' : 'Closest match'}</div>
              </Card>
            </motion.div>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">{relatedOnly ? 'Cases on the same issue' : mode === 'custom' ? 'Cases matching your choices' : 'Cases most like yours'}</h3>
              <p className="text-xs text-muted-foreground mt-1">The closest results first. Open a card only when you want more.</p>
            </div>
            {mode === 'auto' && <Btn variant="secondary" size="sm" icon={<RefreshCw size={12} />} onClick={() => void loadAuto()} disabled={loading}>Search again</Btn>}
          </div>

          {data.results.length === 0 ? (
            <Card className="p-7 text-center">
              <BookOpenCheck size={24} className="mx-auto mb-3 text-muted-foreground" />
              <div className="text-sm font-semibold text-foreground">We couldn't find a close case yet</div>
              <p className="text-xs text-muted-foreground mt-1">Try different details or add more information/documents to your case.</p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <AnimatePresence initial={false}>
                  {visibleResults.map((item, index) => {
                    const issue = issueLabel(item)
                    const open = expanded.has(item.document_id)
                    return (
                      <motion.div
                        key={`${item.document_id}-${item.rank}`}
                        layout={!reduceMotion}
                        initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, delay: reduceMotion ? 0 : Math.min(index * 0.035, 0.16) }}
                        whileHover={reduceMotion || open ? undefined : { y: -2 }}
                      >
                        <Card className={`p-4 h-full transition-colors ${open ? 'border-[#D4AF37]/20' : 'hover:border-white/[0.12]'}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                <span className="text-[10px] font-mono text-muted-foreground">#{item.rank}</span>
                                {item.court && <Badge label={item.court} />}
                                {issue && <Badge label={issue} />}
                              </div>
                              <h4 className="text-sm font-semibold text-foreground truncate">{item.title || item.case_number || 'Pakistani judgment'}</h4>
                              {item.case_number && item.case_number !== item.title && <div className="text-[11px] text-muted-foreground mt-1 truncate">{item.case_number}</div>}
                              <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{shortReason(item)}</p>
                              <div className="text-[10px] text-muted-foreground/70 mt-2">{detailLabel(item)}</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-2xl font-bold tabular-nums" style={{ color: G }}>{score100(item.similarity_score)}%</div>
                              <div className="text-[10px] text-muted-foreground">{relatedOnly ? 'related' : 'similar'}</div>
                            </div>
                          </div>

                          <motion.button whileTap={reduceMotion ? undefined : { scale: 0.99 }} onClick={() => toggleDetails(item.document_id)} className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.03] transition-colors">
                            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            {open ? 'Close details' : 'See what happened'}
                          </motion.button>

                          <AnimatePresence initial={false}>
                            {open && (
                              <motion.div initial={reduceMotion ? {} : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={reduceMotion ? {} : { opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                                <div className="mt-3 space-y-3 border-t border-white/[0.06] pt-3">
                                  <div className="rounded-lg bg-white/[0.025] border border-white/[0.06] p-3">
                                    <div className="text-[10px] text-muted-foreground mb-1">Why we picked this case</div>
                                    <p className="text-xs text-foreground leading-relaxed">{item.explanation || shortReason(item)}</p>
                                  </div>

                                  {item.explicit_outcome_phrase && (
                                    <div className="rounded-lg bg-white/[0.025] border border-white/[0.06] p-3">
                                      <div className="text-[10px] text-muted-foreground mb-1">What the court decided</div>
                                      <p className="text-xs text-foreground">{item.explicit_outcome_phrase}</p>
                                    </div>
                                  )}

                                  {(item.laws_cited.length > 0 || item.sections_cited.length > 0 || item.articles_cited.length > 0) && (
                                    <div>
                                      <div className="text-[10px] text-muted-foreground mb-2">Laws that mattered</div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {item.laws_cited.slice(0, 2).map((law) => <Badge key={`law-${law}`} label={law} />)}
                                        {item.sections_cited.slice(0, 3).map((section) => <Badge key={`sec-${section}`} label={`Section ${section}`} />)}
                                        {item.articles_cited.slice(0, 2).map((article) => <Badge key={`art-${article}`} label={`Article ${article}`} />)}
                                      </div>
                                    </div>
                                  )}

                                  {item.differences.length > 0 && <div className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">What's different: </span>{item.differences[0]}</div>}

                                  <div className="rounded-lg border border-sky-500/15 bg-sky-500/[0.025] p-3 flex items-start gap-2">
                                    <Database size={13} className="text-sky-400 mt-0.5 flex-shrink-0" />
                                    <div className="text-[10px] text-muted-foreground leading-relaxed">This match comes from WukaLAW's indexed Pakistani case library. Open the full case story only if you need deeper research.</div>
                                  </div>
                                  <PrecedentBrief caseId={caseId} documentId={item.document_id} />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              {visibleCount < data.results.length && (
                <div className="flex justify-center pt-1">
                  <Btn variant="secondary" onClick={() => setVisibleCount(data.results.length)}>Show {data.results.length - visibleCount} more cases</Btn>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </div>
  )
}
