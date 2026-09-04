/**
 * WakuLaw API client.
 *
 * Base URL comes from VITE_API_BASE_URL and defaults to the local
 * FastAPI backend at http://localhost:8000/api/v1.
 */

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:8000/api/v1'

// ---------------------------------------------------------------------------
// Auth token storage
// ---------------------------------------------------------------------------

const TOKEN_KEY = 'wakulaw_token'
const USER_KEY = 'wakulaw_user'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function setAuthStorage(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuthStorage(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * A protected endpoint rejected our token: clear the session and send the
 * user to the login page. Auth endpoints (`/auth/*`) are exempt — a 401
 * there means "wrong credentials", not "session expired".
 */
function handleSessionExpired(): ApiError {
  clearAuthStorage()
  window.location.assign('/login')
  return new ApiError('Your session has expired. Please sign in again.', 401)
}

// ---------------------------------------------------------------------------
// Types (mirror the backend contract exactly)
// ---------------------------------------------------------------------------

export interface User {
  id: number
  email: string
  name: string
  role: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface DocumentMeta {
  id: number
  filename: string
  title: string
  size_bytes: number
  num_chunks: number
  created_at: string
  has_summary: boolean
  ocr_used: boolean
}

export interface Summary {
  main_issue: string
  key_facts: string[]
  legal_points: string[]
  outcome: string
  short_summary: string
}

export interface Document extends DocumentMeta {
  text: string
  summary: Summary | null
}

export interface Source {
  document_id: number
  document_title: string
  chunk_id: number
  text: string
  score: number
}

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface Confidence {
  level: ConfidenceLevel
  reason: string
}

export interface HealthResponse {
  status: string
}

export interface DocumentListResponse {
  items: DocumentMeta[]
  total: number
}

export interface SummarizeResponse {
  document_id: number
  summary: Summary
}

export interface AskResponse {
  answer: string
  confidence: Confidence
  sources: Source[]
  model: string
}

export interface SimilarCasesResponse {
  results: Source[]
}

export type CaseStatus = 'Active' | 'Review' | 'On Hold' | 'Closed'
export type CasePriority = 'Low' | 'Medium' | 'High' | 'Critical'

export interface Case {
  id: number
  case_number: string
  title: string
  case_type: string
  status: CaseStatus
  priority: CasePriority
  description: string | null
  deadline: string | null
  num_documents: number
  created_at: string
}

export interface CaseListResponse {
  items: Case[]
  total: number
}

export interface CaseCreatePayload {
  title: string
  case_type: string
  status?: CaseStatus
  priority?: CasePriority
  description?: string
  deadline?: string
}

export type CaseUpdatePayload = Partial<CaseCreatePayload>

export interface TimelineEvent {
  /** ISO date (YYYY-MM-DD) used for chronological ordering. */
  date: string
  /** The date exactly as written in the source document. */
  date_text: string
  /** The sentence describing the event. */
  text: string
  document_id: number
  document_title: string
}

export interface TimelineResponse {
  events: TimelineEvent[]
}

export type CitationType = 'statute' | 'constitution' | 'case_law'

export interface Citation {
  type: CitationType
  text: string
  context: string
}

export interface CitationsResponse {
  citations: Citation[]
}

export interface ContradictionStatement {
  document_id: number
  document_title: string
  text: string
}

export interface ContradictionPair {
  a: ContradictionStatement
  b: ContradictionStatement
  /** Conflict score in [0, 1]. */
  score: number
}

export interface ContradictionsResponse {
  pairs: ContradictionPair[]
  documents_analyzed: number
  disclaimer: string
}

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Extract the FastAPI-style `detail` message from an error body, if any. */
function detailFromBody(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'detail' in body) {
    const detail = (body as { detail: unknown }).detail
    if (typeof detail === 'string' && detail.trim().length > 0) return detail
    if (detail != null) return JSON.stringify(detail)
  }
  return fallback
}

/** Turn any thrown value into a readable message for the UI. */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return 'Something went wrong. Please try again.'
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...authHeaders(),
        ...(init?.headers as Record<string, string> | undefined),
      },
    })
  } catch {
    throw new ApiError(
      'Could not reach the WakuLaw API. Make sure the backend is running.',
      0,
    )
  }

  if (res.status === 401 && !path.startsWith('/auth/')) {
    throw handleSessionExpired()
  }

  if (!res.ok) {
    const fallback = `Request failed with status ${res.status}`
    let message = fallback
    try {
      message = detailFromBody(await res.json(), fallback)
    } catch {
      // Non-JSON error body — keep the fallback message.
    }
    throw new ApiError(message, res.status)
  }

  return (await res.json()) as T
}

function postJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function patchJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/** DELETE helper for endpoints that return 204 No Content. */
async function del(path: string): Promise<void> {
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
  } catch {
    throw new ApiError(
      'Could not reach the WakuLaw API. Make sure the backend is running.',
      0,
    )
  }
  if (res.status === 401) throw handleSessionExpired()
  if (!res.ok) {
    const fallback = `Request failed with status ${res.status}`
    let message = fallback
    try {
      message = detailFromBody(await res.json(), fallback)
    } catch {
      // Non-JSON error body — keep the fallback message.
    }
    throw new ApiError(message, res.status)
  }
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

/** POST /auth/register */
export function registerAccount(
  email: string,
  name: string,
  password: string,
): Promise<AuthResponse> {
  return postJson<AuthResponse>('/auth/register', { email, name, password })
}

/** POST /auth/login */
export function loginAccount(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return postJson<AuthResponse>('/auth/login', { email, password })
}

/** GET /auth/me */
export function getMe(): Promise<User> {
  return request<User>('/auth/me')
}

/** GET /health */
export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/health')
}

/** GET /documents */
export function listDocuments(): Promise<DocumentListResponse> {
  return request<DocumentListResponse>('/documents')
}

/** GET /documents/{id} */
export function getDocument(id: number | string): Promise<Document> {
  return request<Document>(`/documents/${id}`)
}

/** POST /documents/{id}/summarize */
export function summarizeDocument(
  id: number | string,
): Promise<SummarizeResponse> {
  return request<SummarizeResponse>(`/documents/${id}/summarize`, {
    method: 'POST',
  })
}

/** A prior conversation turn sent to the RAG assistant for context. */
export interface ChatTurnInput {
  role: 'user' | 'ai'
  content: string
}

/** POST /ask */
export async function askQuestion(
  question: string,
  history: ChatTurnInput[] = [],
): Promise<AskResponse> {
  const res = await fetch('http://127.0.0.1:8000/api/rag/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
      top_k: 10,
      score_threshold: null,
      filters: {},
      use_legal_intelligence: false,
      history,
    }),
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(errorBody || `RAG request failed with status ${res.status}`)
  }

  const data = await res.json()

  return {
    answer: data.answer,
    confidence: {
      level:
        data.confidence === 'high'
          ? 'high'
          : data.confidence === 'medium'
            ? 'medium'
            : 'low',
      reason:
        data.pipeline_warnings?.length > 0
          ? data.pipeline_warnings.join(' ')
          : `Validation: ${data.validation_status}`,
    },
    sources: (data.retrieved_chunks ?? []).map((chunk: any) => ({
      chunk_id: chunk.canonical_chunk_id,
      document_id: chunk.document_id,
      document_title: chunk.title || 'Untitled legal source',
      text: chunk.text_preview || '',
      score: chunk.score,
    })),
    model: data.llm_provider || 'rag',
  }
}

/** POST /similar-cases */
export function findSimilarCases(
  query: string,
  topK?: number,
): Promise<SimilarCasesResponse> {
  const body: { query: string; top_k?: number } = { query }
  if (topK !== undefined) body.top_k = topK
  return postJson<SimilarCasesResponse>('/similar-cases', body)
}

/** PATCH /documents/{id} — reassign to a case and/or retitle. */
export function updateDocument(
  id: number | string,
  payload: { case_id?: number | null; title?: string },
): Promise<DocumentMeta> {
  return patchJson<DocumentMeta>(`/documents/${id}`, payload)
}

/** POST /cases */
export function createCase(payload: CaseCreatePayload): Promise<Case> {
  return postJson<Case>('/cases', payload)
}

/** GET /cases */
export function listCases(): Promise<CaseListResponse> {
  return request<CaseListResponse>('/cases')
}

// ---------------------------------------------------------------------------
// Admin (requires role === 'admin' on the backend; returns 403 otherwise)
// ---------------------------------------------------------------------------

export interface AdminStats {
  total_users: number
  total_cases: number
  total_documents: number
  active_cases: number
}

export interface AdminUser {
  id: number
  email: string
  name: string
  role: string
  created_at: string
  case_count: number
  document_count: number
}

/** GET /admin/stats */
export function adminGetStats(): Promise<AdminStats> {
  return request<AdminStats>('/admin/stats')
}

/** GET /admin/users */
export function adminListUsers(): Promise<AdminUser[]> {
  return request<AdminUser[]>('/admin/users')
}

/** GET /cases/{id} */
export function getCase(id: number | string): Promise<Case> {
  return request<Case>(`/cases/${id}`)
}

/** PATCH /cases/{id} */
export function updateCase(
  id: number | string,
  payload: CaseUpdatePayload,
): Promise<Case> {
  return patchJson<Case>(`/cases/${id}`, payload)
}

/** DELETE /cases/{id} → 204 */
export function deleteCase(id: number | string): Promise<void> {
  return del(`/cases/${id}`)
}

/** GET /cases/{id}/documents */
export function listCaseDocuments(
  id: number | string,
): Promise<DocumentListResponse> {
  return request<DocumentListResponse>(`/cases/${id}/documents`)
}

/** GET /documents/{id}/timeline — dated events extracted from one document. */
export function getDocumentTimeline(
  id: number | string,
): Promise<TimelineResponse> {
  return request<TimelineResponse>(`/documents/${id}/timeline`)
}

/**
 * GET /cases/{id}/timeline — events merged & chronologically sorted across
 * all of the case's documents.
 */
export function getCaseTimeline(
  id: number | string,
): Promise<TimelineResponse> {
  return request<TimelineResponse>(`/cases/${id}/timeline`)
}

/** GET /documents/{id}/citations — legal citations detected in a document. */
export function getDocumentCitations(
  id: number | string,
): Promise<CitationsResponse> {
  return request<CitationsResponse>(`/documents/${id}/citations`)
}

/**
 * POST /cases/{id}/contradictions — cross-document contradiction analysis.
 * Can take ~10-30s on the first run; callers should show an analyzing state.
 */
export function analyzeCaseContradictions(
  id: number | string,
): Promise<ContradictionsResponse> {
  return request<ContradictionsResponse>(`/cases/${id}/contradictions`, {
    method: 'POST',
  })
}

/**
 * POST /documents/upload — multipart form field "file".
 *
 * Uses XMLHttpRequest so upload progress can be reported (fetch has no
 * standard upload-progress API).
 */
export function uploadDocument(
  file: File,
  onProgress?: (percent: number) => void,
  caseId?: number,
): Promise<Document> {
  return new Promise<Document>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE_URL}/documents/upload`)
    xhr.responseType = 'json'
    const token = getStoredToken()
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response as Document)
      } else if (xhr.status === 401) {
        reject(handleSessionExpired())
      } else {
        const fallback = `Upload failed with status ${xhr.status}`
        reject(new ApiError(detailFromBody(xhr.response, fallback), xhr.status))
      }
    }

    xhr.onerror = () =>
      reject(
        new ApiError(
          'Could not reach the WakuLaw API. Make sure the backend is running.',
          0,
        ),
      )
    xhr.onabort = () => reject(new ApiError('Upload was cancelled.', 0))

    const form = new FormData()
    form.append('file', file)
    if (caseId !== undefined) form.append('case_id', String(caseId))
    xhr.send(form)
  })
}
