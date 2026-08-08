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
  }
}

export async function getCaseSimilarJudgments(
  caseId: number | string,
  topK = 8,
): Promise<CaseSimilarResponse> {
  const token = getStoredToken()
  const response = await fetch(`${API_BASE_URL}/cases/${caseId}/similar?top_k=${topK}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!response.ok) {
    const body = await response.text()
    let message = body || `Similar-case request failed with status ${response.status}`
    try {
      const parsed = JSON.parse(body)
      if (parsed?.detail) message = parsed.detail
    } catch {
      // Keep the raw body when it is not JSON.
    }
    throw new Error(message)
  }

  return response.json() as Promise<CaseSimilarResponse>
}
