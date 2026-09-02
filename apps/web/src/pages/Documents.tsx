import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Search, Sparkles, ScanText, Database, Grid as GridIcon, List as ListIcon, Eye } from 'lucide-react'
import { listDocuments, errorMessage } from '../lib/api'
import type { DocumentMeta } from '../lib/api'
import { formatBytes, formatDate } from '../lib/format'
import { Card, Badge, Input, KPICard, G } from '../components/design'
import UploadZone from '../components/UploadZone'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'

export default function Documents() {
  const navigate = useNavigate()
  const [docs, setDocs] = useState<DocumentMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'table'>('grid')

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

  const totalBytes = useMemo(() => docs.reduce((sum, d) => sum + d.size_bytes, 0), [docs])
  const summarizedCount = docs.filter((d) => d.has_summary).length
  const ocrCount = docs.filter((d) => d.ocr_used).length

  return (
    <div className="p-8 space-y-7 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Document Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {docs.length} document{docs.length === 1 ? '' : 's'} · {formatBytes(totalBytes)} total
          </p>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-white/10">
          <button
            onClick={() => setView('grid')}
            title="Grid view"
            className="p-2"
            style={view === 'grid' ? { backgroundColor: G, color: '#0D1117' } : { color: 'var(--muted-foreground)' }}
          >
            <GridIcon size={14} />
          </button>
          <button
            onClick={() => setView('table')}
            title="Table view"
            className="p-2"
            style={view === 'table' ? { backgroundColor: G, color: '#0D1117' } : { color: 'var(--muted-foreground)' }}
          >
            <ListIcon size={14} />
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      <UploadZone onUploaded={() => void refresh()} />

      {/* KPI row — every value computed live from your real document library */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard icon={<FileText size={18} />} label="Total Documents" value={loading ? '…' : String(docs.length)} sub="In your library" />
        <KPICard icon={<Database size={18} />} label="Storage Used" value={loading ? '…' : formatBytes(totalBytes)} sub="All files combined" />
        <KPICard icon={<Sparkles size={18} />} label="Summarized" value={loading ? '…' : String(summarizedCount)} sub="AI summary available" />
        <KPICard icon={<ScanText size={18} />} label="OCR Recovered" value={loading ? '…' : String(ocrCount)} sub="From scanned PDFs" />
      </div>

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
      ) : view === 'table' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Name', 'Size', 'Chunks', 'Uploaded', 'Summary', 'OCR', ''].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc, i) => {
                  const isPdf = doc.filename.toLowerCase().endsWith('.pdf')
                  return (
                    <tr
                      key={doc.id}
                      className={`border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}
                      onClick={() => navigate(`/documents/${doc.id}`)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isPdf ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                            <FileText size={13} className={isPdf ? 'text-red-400' : 'text-blue-400'} />
                          </div>
                          <div className="text-foreground text-xs font-medium truncate max-w-[220px]">{doc.title}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">{formatBytes(doc.size_bytes)}</td>
                      <td className="px-4 py-3.5"><Badge label={`${doc.num_chunks} chunks`} /></td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">{formatDate(doc.created_at)}</td>
                      <td className="px-4 py-3.5">
                        {doc.has_summary ? (
                          <span className="flex items-center gap-1 text-[11px]" style={{ color: G }}>
                            <Sparkles size={11} /> Yes
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {doc.ocr_used ? (
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <ScanText size={11} /> Yes
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            title="Open"
                            onClick={() => navigate(`/documents/${doc.id}`)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.08] text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Eye size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
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
