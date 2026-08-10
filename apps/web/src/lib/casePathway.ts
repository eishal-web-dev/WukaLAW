import { API_BASE_URL, getStoredToken } from './api'

export interface PathwayIssue {
  issue: string
  evidence_terms: string[]
}

export interface PathwayStage {
  key: string
  label: string
  progress: number
  position?: number
  evidence_terms: string[]
}

export interface JourneyStep {
  key: string
  label: string
  position: number
  state: 'confirmed' | 'current' | 'next' | 'not_seen' | 'later' | 'unknown' | string
  evidence_terms: string[]
}

export interface IssueProgress {
  issue: string
  progress: number
  basis: string
  evidence_terms: string[]
}

export interface HistoricalExample {
  document_id: string | null
  title: string
  court: string | null
  similarity_score: number | null
}

export interface HistoricalPathwayDistribution {
  stage_key: string
  stage_label: string
  count: number
  share: number
  examples: HistoricalExample[]
}

export interface HistoricalPathway {
  available: boolean
  reason: string | null
  current_stage_key: string
  comparable_cases_reviewed: number
  cases_with_later_stage: number
  cases_without_later_stage: number
  retrieval_candidates?: number
  most_common_next_stage: HistoricalPathwayDistribution | null
  distribution: HistoricalPathwayDistribution[]
  examples: HistoricalExample[]
  disclaimer: string
}

export interface HistoricalTiming {
  available: boolean
  reason: string | null
  comparable_cases_reviewed: number
  sample_size: number
  minimum_sample: number
  median_days: number | null
  iqr_days: [number, number] | null
  by_next_stage: Array<{ stage_label: string; sample_size: number; median_days: number }>
  examples: Array<{ document_id: string | null; title: string; next_stage_label: string; days: number; evidence: string }>
  disclaimer: string
}

export interface HistoricalOutcomes {
  available: boolean
  comparable_cases_reviewed: number
  usable_outcomes: number
  favorable: number
  partial_or_mixed: number
  unfavorable: number
  unclear: number
  client_alignment_available: boolean
  recorded_outcomes: Array<{ outcome: string; count: number }>
  reason: string | null
  disclaimer: string
}

export interface WatchNext {
  headline: string
  most_observed_next_step: string | null
  historical_support_text: string
  timing_text: string
  attention_points: string[]
  disclaimer: string
}
export interface CasePathwayResponse {
  detected_issues: PathwayIssue[]
  current_stage: PathwayStage
  overall_progress: number
  court_process_position?: number
  position_label?: string
  progress_meaning: string
  issue_progress: IssueProgress[]
  next_generic_stage: { key: string; label: string } | null
  stage_confidence: 'high' | 'moderate' | 'low' | string
  confidence_reason?: string
  documents_analyzed: number
  document_titles: string[]
  detected_stage_evidence: PathwayStage[]
  journey_steps?: JourneyStep[]
  historical_pathway?: HistoricalPathway
  historical_timing?: HistoricalTiming
  historical_outcomes?: HistoricalOutcomes
  what_to_watch_next?: WatchNext
  similar_cases_reviewed?: number
  warnings: string[]
  disclaimer: string
  source_case: {
    id: number
    case_number: string
    title: string
    case_type: string
    status: string
  }
}

export async function getCasePathwayIntelligence(caseId: number | string): Promise<CasePathwayResponse> {
  const token = getStoredToken()
  const response = await fetch(`${API_BASE_URL}/cases/${caseId}/pathway-intelligence`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) {
    const body = await response.text()
    let message = body || `Case pathway request failed with status ${response.status}`
    try {
      const parsed = JSON.parse(body)
      if (parsed?.detail) message = parsed.detail
    } catch {
      // keep raw message
    }
    throw new Error(message)
  }
  return response.json() as Promise<CasePathwayResponse>
}
