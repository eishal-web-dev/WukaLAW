import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { errorMessage } from '../lib/api'
import type { Document } from '../lib/api'
import { uploadDocument } from '../lib/upload'
import { Btn, G } from './design'
import ErrorAlert from './ErrorAlert'

interface UploadingFile {
  name: string
  percent: number
}

/** Drag & drop / browse upload zone with per-file progress bars. */
export default function UploadZone({
  caseId,
  onUploaded,
}: {
  caseId?: number
  onUploaded?: (doc: Document) => void
}) {
  const [dragging, setDragging] = useState(false)
  const [uploads, setUploads] = useState<UploadingFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const uploadFiles = async (files: FileList | File[]) => {
    setError(null)
    for (const file of Array.from(files)) {
      setUploads((prev) => [...prev, { name: file.name, percent: 0 }])
      try {
        const doc = await uploadDocument(
          file,
          (percent) =>
            setUploads((prev) => prev.map((u) => (u.name === file.name ? { ...u, percent } : u))),
          caseId,
        )
        onUploaded?.(doc)
      } catch (err) {
        setError(errorMessage(err))
      } finally {
        setUploads((prev) => prev.filter((u) => u.name !== file.name))
      }
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${dragging ? 'border-[#D4AF37]/60 bg-[#D4AF37]/5' : 'border-white/10 hover:border-white/20'}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (e.dataTransfer.files.length) void uploadFiles(e.dataTransfer.files)
        }}
        onClick={() => fileInput.current?.click()}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: dragging ? `${G}20` : 'rgba(255,255,255,0.05)' }}
        >
          <Upload size={22} style={{ color: dragging ? G : '#B3B3B3' }} />
        </div>
        <div className="text-foreground font-medium mb-1">Drop files here to upload</div>
        <div className="text-sm text-muted-foreground">
          PDF, TXT, JPG, PNG and WEBP supported{caseId !== undefined ? ' · Files attach to this case' : ''}
        </div>
        <Btn variant="secondary" className="mt-4 mx-auto">Browse Files</Btn>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept=".pdf,.txt,.jpg,.jpeg,.png,.webp,application/pdf,text/plain,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void uploadFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {uploads.map((u) => (
        <div key={u.name} className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-foreground truncate">{u.name}</span>
            <span className="font-semibold" style={{ color: G }}>{u.percent < 35 ? 'Uploading document' : u.percent < 70 ? 'Reading document' : u.percent < 90 ? 'Scanning document' : u.percent < 100 ? 'Preparing for AI' : 'Ready'}</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${u.percent}%`, backgroundColor: G }}
            />
          </div>
        </div>
      ))}

      {error && <ErrorAlert message={error} />}
    </div>
  )
}
