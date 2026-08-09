import { API_BASE_URL, getStoredToken } from './api'

export interface PathwayIssue {
  issue: string
  evidence_terms: string[]
}

export interface PathwayStage {
  key: string
  label: string
  progress: number
  evidence_terms: string[]
}

export interface IssueProgress {
  issue: string
  progress: number
  basis: string
  evidence_terms: string[]
}

export interface CasePathwayResponse {
  detected_issues: PathwayIssue[]
  current_stage: PathwayStage
  overall_progress: number
  progress_meaning: string
  issue_progress: IssueProgress[]
  next_generic_stage: { key: string; label: string } | null
  stage_confidence: 'high' | 'moderate' | 'low' | string
  documents_analyzed: number
  document_titles: string[]
  detected_stage_evidence: PathwayStage[]
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
