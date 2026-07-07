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

/** POST /ask */
export function askQuestion(question: string): Promise<AskResponse> {
  return postJson<AskResponse>('/ask', { question })
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

/**
 * POST /documents/upload — multipart form field "file".
 *
 * Uses XMLHttpRequest so upload progress can be reported (fetch has no
 * standard upload-progress API).
 */
export function uploadDocument(
  file: File,
  onProgress?: (percent: number) => void,
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
    xhr.send(form)
  })
}
