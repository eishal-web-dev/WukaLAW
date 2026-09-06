import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { listCases, uploadDocument, errorMessage } from '../lib/api'
import type { Case } from '../lib/api'
import { Card, G } from '../components/design'

const ALLOWED_TYPES = new Set(['application/pdf', 'text/plain'])
const ALLOWED_EXT = ['.pdf', '.txt']
const MAX_BYTES = 50 * 1024 * 1024 // 50MB

interface StagedFile {
  id: string
  file: File
  status: 'staged' | 'uploading' | 'done' | 'error'
  percent: number
  error?: string
}

export default function ClientUpload() {
  const navigate = useNavigate()
  const [cases, setCases] = useState<Case[]>([])
  const [casesLoading, setCasesLoading] = useState(true)
  const [casesError, setCasesError] = useState<string | null>(null)
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null)
  const [staged, setStaged] = useState<StagedFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadCases = useCallback(async () => {
    setCasesLoading(true)
    setCasesError(null)
    try {
      const res = await listCases()
      setCases(res.items)
      if (res.items.length > 0) setSelectedCaseId(res.items[0].id)
    } catch (err) {
      setCasesError(errorMessage(err))
    } finally {
      setCasesLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCases()
  }, [loadCases])

  const addFiles = (files: FileList | File[]) => {
    const next: StagedFile[] = []
    for (const file of Array.from(files)) {
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
      if (!ALLOWED_TYPES.has(file.type) && !ALLOWED_EXT.includes(ext)) {
        next.push({ id: crypto.randomUUID(), file, status: 'error', percent: 0, error: 'Only PDF and TXT files are supported.' })
        continue
      }
      if (file.size > MAX_BYTES) {
        next.push({ id: crypto.randomUUID(), file, status: 'error', percent: 0, error: 'File exceeds the 50 MB limit.' })
        continue
      }
      next.push({ id: crypto.randomUUID(), file, status: 'staged', percent: 0 })
    }
    setStaged((prev) => [...prev, ...next])
  }

  const removeStaged = (id: string) => {
    setStaged((prev) => prev.filter((s) => s.id !== id))
  }

  const submit = async () => {
    if (submitting || !selectedCaseId) return
    const toUpload = staged.filter((s) => s.status === 'staged')
    if (toUpload.length === 0) return
    setSubmitting(true)
    for (const item of toUpload) {
      setStaged((prev) => prev.map((s) => (s.id === item.id ? { ...s, status: 'uploading' } : s)))
      try {
        await uploadDocument(
          item.file,
          (percent) => setStaged((prev) => prev.map((s) => (s.id === item.id ? { ...s, percent } : s))),
          selectedCaseId,
        )
        setStaged((prev) => prev.map((s) => (s.id === item.id ? { ...s, status: 'done', percent: 100 } : s)))
      } catch (err) {
        setStaged((prev) => prev.map((s) => (s.id === item.id ? { ...s, status: 'error', error: errorMessage(err) } : s)))
      }
    }
    setSubmitting(false)
  }

  const hasStagedReady = staged.some((s) => s.status === 'staged')
  const allDone = staged.length > 0 && staged.every((s) => s.status === 'done')

  if (casesLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Loading your cases…</p>
      </div>
    )
  }

  if (casesError) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle size={28} className="mx-auto mb-3 text-red-400" />
          <h2 className="text-base font-semibold text-foreground mb-1">Couldn't load your cases</h2>
          <p className="text-sm text-muted-foreground mb-5">{casesError}</p>
          <button
            onClick={() => void loadCases()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white mx-auto"
            style={{ background: G }}
          >
            <RefreshCw size={14} /> Try again
          </button>
        </Card>
      </div>
    )
  }

  if (cases.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Card className="p-8 max-w-md text-center">
          <Upload size={28} className="mx-auto mb-3 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground mb-1">No cases to upload to yet</h2>
          <p className="text-sm text-muted-foreground">
            You need at least one case assigned to your account before you can upload documents.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight mb-1">Upload Documents</h1>
        <p className="text-sm text-muted-foreground">Add documents to one of your cases. PDF and TXT, up to 50 MB per file.</p>
      </div>

      <Card className="p-5">
        <label htmlFor="case-select" className="text-sm font-bold text-foreground mb-3 block">
          Which case is this for?
        </label>
        <select
          id="case-select"
          value={selectedCaseId ?? ''}
          onChange={(e) => setSelectedCaseId(Number(e.target.value))}
          className="w-full px-3.5 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground outline-none focus:border-primary/40"
        >
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.case_number} · {c.title}
            </option>
          ))}
        </select>
      </Card>

      <div
        role="button"
        tabIndex={0}
        aria-label="Choose files to upload"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            document.getElementById('client-upload-input')?.click()
          }
        }}
        onClick={() => document.getElementById('client-upload-input')?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
        }}
        className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all"
        style={{ borderColor: dragging ? G : 'var(--border)', background: dragging ? `${G}0d` : 'var(--card)' }}
      >
        <Upload size={26} style={{ color: G }} className="mx-auto mb-3" />
        <div className="text-sm font-semibold text-foreground mb-1">Drop files here or click to browse</div>
        <div className="text-xs text-muted-foreground">PDF, TXT — up to 50 MB per file</div>
        <input
          id="client-upload-input"
          type="file"
          multiple
          accept=".pdf,.txt,application/pdf,text/plain"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {staged.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-5 py-3 border-b border-border text-sm font-bold text-foreground">
            Files ({staged.length})
          </div>
          {staged.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0">
              <FileText size={15} className="text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground truncate">{s.file.name}</div>
                {s.status === 'uploading' && (
                  <div className="h-1 bg-sidebar-accent rounded-full overflow-hidden mt-1.5">
                    <div className="h-full rounded-full transition-all" style={{ width: `${s.percent}%`, background: G }} />
                  </div>
                )}
                {s.status === 'error' && <div className="text-xs text-red-400 mt-0.5">{s.error}</div>}
              </div>
              {s.status === 'done' ? (
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              ) : s.status === 'uploading' ? (
                <RefreshCw size={14} className="text-muted-foreground animate-spin flex-shrink-0" />
              ) : (
                <button
                  onClick={() => removeStaged(s.id)}
                  aria-label={`Remove ${s.file.name}`}
                  className="text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          ))}
        </Card>
      )}

      {allDone && (
        <Card className="p-4 flex items-center gap-2" style={{ borderColor: '#34D39940' }}>
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-sm text-foreground">Upload complete.</span>
          <button onClick={() => navigate('/client/cases')} className="ml-auto text-sm font-semibold" style={{ color: G }}>
            View case
          </button>
        </Card>
      )}

      {hasStagedReady && (
        <button
          onClick={() => void submit()}
          disabled={submitting}
          className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50"
          style={{ background: G }}
        >
          {submitting ? 'Uploading…' : `Upload ${staged.filter((s) => s.status === 'staged').length} file(s)`}
        </button>
      )}
    </div>
  )
}
