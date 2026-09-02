import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Search, Sparkles, ScanText } from 'lucide-react'
import { listDocuments, errorMessage } from '../lib/api'
import type { DocumentMeta } from '../lib/api'
import { formatBytes, formatDate } from '../lib/format'
import { Card, Badge, Input } from '../components/design'
import UploadZone from '../components/UploadZone'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'

export default function Documents() {
  const navigate = useNavigate()
  const [docs, setDocs] = useState<DocumentMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const refresh = useCallback(async () => {
    try {
      const res = await listDocuments()
      setDocs(res.items)
      setError(null)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const filtered = docs.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.filename.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="p-8 space-y-7 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {docs.length} document{docs.length === 1 ? '' : 's'} in your library
          </p>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      <UploadZone onUploaded={() => void refresh()} />

      <div className="flex items-center gap-3">
        <Input
          placeholder="Search documents..."
          className="flex-1 max-w-xs"
          icon={<Search size={14} />}
          value={search}
          onChange={setSearch}
        />
      </div>

      {loading ? (
        <div className="py-10 flex justify-center"><Spinner label="Loading documents…" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          {docs.length === 0
            ? 'No documents yet — drop a file above to build your library.'
            : 'No documents match your search.'}
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((doc) => {
            const isPdf = doc.filename.toLowerCase().endsWith('.pdf')
            return (
              <Card
                key={doc.id}
                className="p-4 hover:border-white/10 transition-all cursor-pointer group"
              >
                <button className="text-left w-full" onClick={() => navigate(`/documents/${doc.id}`)}>
                  <div className={`w-10 h-12 rounded-lg flex items-center justify-center mb-3 ${isPdf ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                    <FileText size={20} className={isPdf ? 'text-red-400' : 'text-blue-400'} />
                  </div>
                  <div className="text-xs font-semibold text-foreground mb-1 truncate">{doc.title}</div>
                  <div className="text-[10px] text-muted-foreground mb-2">
                    {formatBytes(doc.size_bytes)} · {formatDate(doc.created_at)}
                  </div>
                  {doc.ocr_used && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2" title="Text was recovered from a scanned PDF via OCR">
                      <ScanText size={10} /> OCR
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge label={`${doc.num_chunks} chunks`} />
                    {doc.has_summary && (
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: '#D4AF37' }}>
                        <Sparkles size={10} /> Summary
                      </span>
                    )}
                  </div>
                </button>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
