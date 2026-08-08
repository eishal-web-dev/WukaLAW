import { API_BASE_URL, getStoredToken } from './api'

export interface MatchingFactor {
  factor: string
  value: string
  weight: number
}

export interface SimilarJudgment {
  rank: number
  similarity_score: number
  similarity_label: string
  document_id: string
  title: string | null
  court: string | null
  jurisdiction: string | null
  case_category: string | null
  case_number: string | null
  decision_date: string | null
  judges: string[]
  source_path: string
  source_dataset: string
  text_preview: string
  explicit_outcome_phrase: string | null
  legal_citations: string[]
  laws_cited: string[]
  sections_cited: string[]
  articles_cited: string[]
  matching_factors: MatchingFactor[]
  differences: string[]
  explanation: string
  warnings: string[]
}

export interface CaseSimilarResponse {
  normalized_query: string
  total_candidates: number
  results: SimilarJudgment[]
  warnings: string[]
  processing_time_ms: number
  source_case: {
    id: number
    case_number: string
    title: string
    case_type: string
    documents_used: number
    search_mode?: 'auto' | 'custom'
    focus?: string
  }
}

export type ClientEffect = 'supports' | 'cautions' | 'mixed' | 'insufficient_client_facts'
export type ResearchStrength = 'strong' | 'moderate' | 'limited'

export interface PrecedentBrief {
  document_id: string
  title: string | null
  court: string | null
  case_number: string | null
  passages_reviewed: number
  record_source?: 'full_source_file' | 'indexed_passages'
  full_source_key?: string | null
  authority_note: string
  case_overview: string
  background_facts: string[]
  procedural_history: string[]
  legal_issues: string[]
  court_reasoning: string[]
  ratio_or_principle: string[]
  final_decision: string
  relief_or_order: string
  similarities_to_client: string[]
  important_differences: string[]
  how_it_may_help: string[]
  client_effect: ClientEffect
  research_strength: ResearchStrength
  research_strength_reason: string
  argument_to_consider: string[]
  opponent_distinction: string[]
  next_verification_steps: string[]
  key_laws: string[]
  evidence_limitations: string
  disclaimer: string
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function apiError(response: Response, fallback: string): Promise<Error> {
  const body = await response.text()
  let message = body || fallback
  try {
    const parsed = JSON.parse(body)
    if (parsed?.detail) message = parsed.detail
  } catch {
    // Keep raw response.
  }
  return new Error(message)
}

export async function getCaseSimilarJudgments(
  caseId: number | string,
  topK = 8,
): Promise<CaseSimilarResponse> {
  const response = await fetch(`${API_BASE_URL}/cases/${caseId}/similar?top_k=${topK}`, {
    headers: authHeaders(),
  })

  if (!response.ok) {
    throw await apiError(response, `Similar-case request failed with status ${response.status}`)
  }

  return response.json() as Promise<CaseSimilarResponse>
}

export async function getCaseSimilarJudgmentsCustom(
  caseId: number | string,
  focus: string[],
  topK = 8,
): Promise<CaseSimilarResponse> {
  const params = new URLSearchParams({
    focus: focus.join('; '),
    top_k: String(topK),
  })
  const response = await fetch(`${API_BASE_URL}/cases/${caseId}/similar-custom?${params.toString()}`, {
    headers: authHeaders(),
  })

  if (!response.ok) {
    throw await apiError(response, `Custom precedent search failed with status ${response.status}`)
  }

  return response.json() as Promise<CaseSimilarResponse>
}

export async function getPrecedentBrief(
  caseId: number | string,
  documentId: string,
): Promise<PrecedentBrief> {
  const params = new URLSearchParams({ document_id: documentId })
  const response = await fetch(`${API_BASE_URL}/cases/${caseId}/precedent-brief?${params.toString()}`, {
    headers: authHeaders(),
  })
  if (!response.ok) {
    throw await apiError(response, `Precedent brief failed with status ${response.status}`)
  }
  return response.json() as Promise<PrecedentBrief>
}
