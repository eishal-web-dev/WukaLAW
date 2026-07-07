import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { uploadDocument, errorMessage } from '../lib/api'
import type { Document } from '../lib/api'
import { formatBytes } from '../lib/format'
import PageHeader from '../components/PageHeader'
import ErrorAlert from '../components/ErrorAlert'

const MAX_SIZE_BYTES = 20 * 1024 * 1024 // 20 MB
const ALLOWED_EXTENSIONS = ['.txt', '.pdf']

type UploadState =
  | { phase: 'idle' }
  | { phase: 'uploading'; filename: string; percent: number }
  | { phase: 'success'; document: Document }
  | { phase: 'error'; message: string }

function validate(file: File): string | null {
  const name = file.name.toLowerCase()
  if (!ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return `Unsupported file type. Only ${ALLOWED_EXTENSIONS.join(' and ')} files are allowed.`
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File is too large (${formatBytes(file.size)}). Maximum size is 20 MB.`
  }
  if (file.size === 0) {
    return 'File is empty.'
  }
  return null
}

export default function Upload() {
  const [state, setState] = useState<UploadState>({ phase: 'idle' })
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    const validationError = validate(file)
    if (validationError) {
      setState({ phase: 'error', message: validationError })
      return
    }
    setState({ phase: 'uploading', filename: file.name, percent: 0 })
    uploadDocument(file, (percent) =>
      setState({ phase: 'uploading', filename: file.name, percent }),
    )
      .then((document) => setState({ phase: 'success', document }))
      .catch((err) => setState({ phase: 'error', message: errorMessage(err) }))
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    if (state.phase === 'uploading') return
    const file = event.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) handleFile(file)
    // Allow re-selecting the same file after an error.
    event.target.value = ''
  }

  const uploading = state.phase === 'uploading'

  return (
    <div>
      <PageHeader
        title="Upload Document"
        subtitle="Add a legal document (.txt or .pdf, up to 20 MB) to your workspace."
      />

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a document: drag and drop or press Enter to browse"
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(event) => {
          if ((event.key === 'Enter' || event.key === ' ') && !uploading) {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          if (!uploading) setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-panel border-2 border-dashed px-6 py-16 text-center transition-colors ${
          dragActive
            ? 'border-gold bg-gold/5'
            : 'border-line bg-ink-900 hover:border-neutral-600'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <span
          aria-hidden="true"
          className="inline-flex size-12 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-xl text-gold"
        >
          ⇪
        </span>
        <p className="text-sm font-medium text-neutral-200">
          Drag and drop a file here, or{' '}
          <span className="text-gold">browse</span>
        </p>
        <p className="text-xs text-neutral-500">
          Accepted: .txt, .pdf — maximum 20 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.pdf,text/plain,application/pdf"
          className="hidden"
          onChange={onInputChange}
        />
      </div>

      {/* Status */}
      <div className="mt-6 space-y-4">
        {state.phase === 'uploading' && (
          <div className="rounded-card border border-line bg-ink-900 p-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="truncate font-medium text-neutral-200">
                Uploading {state.filename}…
              </span>
              <span className="ml-3 shrink-0 text-neutral-400">
                {state.percent}%
              </span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-ink-800"
              role="progressbar"
              aria-valuenow={state.percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-gold transition-all duration-200"
                style={{ width: `${Math.max(state.percent, 4)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Extracting and indexing text may take a moment after the upload
              completes.
            </p>
          </div>
        )}

        {state.phase === 'success' && (
          <div className="rounded-card border border-emerald-500/30 bg-emerald-500/10 p-5">
            <p className="text-sm font-semibold text-emerald-400">
              Upload complete
            </p>
            <p className="mt-1 text-sm text-neutral-300">
              “{state.document.title}” was processed into{' '}
              {state.document.num_chunks} searchable chunks.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to={`/documents/${state.document.id}`}
                className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-light"
              >
                View document
              </Link>
              <button
                type="button"
                onClick={() => setState({ phase: 'idle' })}
                className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:border-gold/40 hover:text-gold"
              >
                Upload another
              </button>
            </div>
          </div>
        )}

        {state.phase === 'error' && <ErrorAlert message={state.message} />}
      </div>
    </div>
  )
}
