import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Download, Plus, AlertCircle, RefreshCw } from 'lucide-react'
import { listMyReports, getReport, errorMessage } from '../lib/api'
import type { ReportSummary } from '../lib/api'
import { formatDate } from '../lib/format'
import { Card, G } from '../components/design'
import Spinner from '../components/Spinner'

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = window.document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ClientDownloads() {
  const navigate = useNavigate()
  const [reports, setReports] = useState<ReportSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const load = () => {
    setError(null)
    listMyReports()
      .then((res) => setReports(res))
      .catch((err) => setError(errorMessage(err)))
  }

  useEffect(() => {
    load()
  }, [])

  const handleDownload = async (report: ReportSummary) => {
    setDownloadingId(report.id)
    try {
      const full = await getReport(report.id)
      downloadTextFile(`${full.case_number}-report.txt`, full.content)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setDownloadingId(null)
    }
  }

  if (reports === null && !error) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Spinner label="Loading your reports…" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle size={28} className="mx-auto mb-3 text-red-400" />
          <h2 className="text-base font-semibold text-foreground mb-1">Couldn't load your reports</h2>
          <p className="text-sm text-muted-foreground mb-5">{error}</p>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white mx-auto"
            style={{ background: G }}
          >
            <RefreshCw size={14} /> Try again
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Downloads</h1>
        <button
          onClick={() => navigate('/client/report-generator')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl text-white"
          style={{ background: G }}
        >
          <Plus size={13} /> New Report
        </button>
      </div>

      {reports && reports.length === 0 ? (
        <Card className="p-10 text-center space-y-3">
          <FileText size={28} className="mx-auto text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">No reports yet</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Generated reports for your cases will show up here once you create one.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Report', 'Case', 'Generated', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-muted-foreground font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports?.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-sidebar-accent transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F8717115' }}>
                        <FileText size={14} color="#F87171" />
                      </div>
                      <span className="text-xs font-medium text-foreground">{r.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{r.case_number}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{formatDate(r.created_at)}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => void handleDownload(r)}
                      disabled={downloadingId === r.id}
                      title="Download"
                      className="text-muted-foreground hover:text-foreground transition-colors p-1 disabled:opacity-50"
                    >
                      {downloadingId === r.id ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : (
                        <Download size={13} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
