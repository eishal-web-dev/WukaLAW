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

export interface HistoricalTimingObservation {
  document_id: string | null
  title: string
  court: string | null
  next_stage_key: string
  next_stage_label: string
  days: number
}

export interface HistoricalTiming {
  available: boolean
  reason: string | null
  current_stage_key: string
  current_stage_label?: string
  records_reviewed: number
  dated_transitions_found: number
  minimum_sample: number
  median_days: number | null
  typical_low_days: number | null
  typical_high_days: number | null
  observations: HistoricalTimingObservation[]
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
