import {
  API_BASE_URL,
  ApiError,
  clearAuthStorage,
  getStoredToken,
  notifyNotificationsChanged,
} from './api'
import type { Document } from './api'

interface PresignedUploadResponse {
  upload_url: string
  object_key: string
  expires_in: number
  headers: Record<string, string>
}

const UPLOAD_MODE =
  ((import.meta.env.VITE_UPLOAD_MODE as string | undefined) ?? 'local').toLowerCase()

function authHeaders(): Record<string, string> {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function detailFromBody(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'detail' in body) {
    const detail = (body as { detail: unknown }).detail
    if (typeof detail === 'string' && detail.trim()) return detail
    if (detail != null) return JSON.stringify(detail)
  }
  return fallback
}

async function apiJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Could not reach the WakuLaw API.', 0)
  }

  if (response.status === 401) {
    clearAuthStorage()
    window.location.assign('/login')
    throw new ApiError('Your session has expired. Please sign in again.', 401)
  }

  if (!response.ok) {
    const fallback = `Request failed with status ${response.status}`
    let message = fallback
    try {
      message = detailFromBody(await response.json(), fallback)
    } catch {
      // Keep fallback for non-JSON responses.
    }
    throw new ApiError(message, response.status)
  }

  return (await response.json()) as T
}

function uploadWithXhr(
  method: 'POST' | 'PUT',
  url: string,
  body: Document | Blob | FormData,
  headers: Record<string, string>,
  onProgress?: (percent: number) => void,
  progressScale = 100,
): Promise<XMLHttpRequest> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url)
    Object.entries(headers).forEach(([key, value]) => xhr.setRequestHeader(key, value))

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * progressScale))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr)
      } else {
        reject(new ApiError(`Upload failed with status ${xhr.status}`, xhr.status))
      }
    }
    xhr.onerror = () => reject(new ApiError('Network error during upload.', 0))
    xhr.onabort = () => reject(new ApiError('Upload was cancelled.', 0))
    xhr.send(body as XMLHttpRequestBodyInit)
  })
}

async function uploadDocumentS3(
  file: File,
  onProgress?: (percent: number) => void,
  caseId?: number,
): Promise<Document> {
  const contentType = file.type || 'application/octet-stream'
  const presigned = await apiJson<PresignedUploadResponse>('/documents/presign-upload', {
    filename: file.name,
    content_type: contentType,
    size_bytes: file.size,
  })

  await uploadWithXhr(
    'PUT',
    presigned.upload_url,
    file,
    presigned.headers,
    onProgress,
    90,
  )

  onProgress?.(94)
  const document = await apiJson<Document>('/documents/complete-s3-upload', {
    object_key: presigned.object_key,
    filename: file.name,
    case_id: caseId,
  })
  notifyNotificationsChanged()
  onProgress?.(100)
  return document
}

function uploadDocumentLocal(
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
        notifyNotificationsChanged()
        resolve(xhr.response as Document)
      } else if (xhr.status === 401) {
        clearAuthStorage()
        window.location.assign('/login')
        reject(new ApiError('Your session has expired. Please sign in again.', 401))
      } else {
        const fallback = `Upload failed with status ${xhr.status}`
        reject(new ApiError(detailFromBody(xhr.response, fallback), xhr.status))
      }
    }

    xhr.onerror = () => reject(new ApiError('Could not reach the WakuLaw API.', 0))
    xhr.onabort = () => reject(new ApiError('Upload was cancelled.', 0))

    const form = new FormData()
    form.append('file', file)
    if (caseId !== undefined) form.append('case_id', String(caseId))
    xhr.send(form)
  })
}

/**
 * Upload a user document using the configured frontend mode.
 *
 * - local: browser -> FastAPI multipart (development fallback)
 * - s3: browser -> private S3 using a short-lived presigned URL, then FastAPI
 *   verifies and indexes the uploaded object.
 */
export function uploadDocument(
  file: File,
  onProgress?: (percent: number) => void,
  caseId?: number,
): Promise<Document> {
  if (UPLOAD_MODE === 's3') {
    return uploadDocumentS3(file, onProgress, caseId)
  }
  return uploadDocumentLocal(file, onProgress, caseId)
}
