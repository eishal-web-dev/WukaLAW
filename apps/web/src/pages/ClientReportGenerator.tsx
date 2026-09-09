import { useEffect, useState } from 'react'
import { FileBarChart, CheckCircle2, Download, RefreshCw } from 'lucide-react'
import { listCases, generateReport, listCaseReports, errorMessage } from '../lib/api'
import type { Case, ReportSummary, ReportDetail } from '../lib/api'
import { formatDate } from '../lib/format'
import { Card, G } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'
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

export default function ClientReportGenerator() {
  const [cases, setCases] = useState<Case[]>([])
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null)
  const [loadingCases, setLoadingCases] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [latest, setLatest] = useState<ReportDetail | null>(null)

  const [previous, setPrevious] = useState<ReportSummary[]>([])
  const [loadingPrevious, setLoadingPrevious] = useState(false)

  useEffect(() => {
    let cancelled = false
    listCases()
      .then((res) => {
        if (cancelled) return
        setCases(res.items)
        if (res.items.length > 0) setSelectedCaseId(res.items[0].id)
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoadingCases(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const loadPrevious = (caseId: number) => {
    setLoadingPrevious(true)
    listCaseReports(caseId)
      .then((res) => setPrevious(res))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoadingPrevious(false))
  }

  useEffect(() => {
    if (selectedCaseId === null) return
    setLatest(null)
    loadPrevious(selectedCaseId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCaseId])

  const generate = async () => {
    if (!selectedCaseId || generating) return
    setGenerating(true)
    setError(null)
    try {
      const report = await generateReport(selectedCaseId, 'case_summary')
      setLatest(report)
      loadPrevious(selectedCaseId)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setGenerating(false)
    }
  }

  const selectedCase = cases.find((c) => c.id === selectedCaseId)

  if (loadingCases) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Spinner label="Loading your cases…" />
      </div>
    )
  }

  if (cases.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Card className="p-8 max-w-md text-center">
          <FileBarChart size={28} className="mx-auto mb-3 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground mb-1">No cases assigned yet</h2>
          <p className="text-sm text-muted-foreground">
            You'll be able to generate a report once a case is assigned to your account.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <FileBarChart size={18} style={{ color: G }} />
        <h1 className="text-xl font-bold text-foreground tracking-tight">Report Generator</h1>
      </div>

      {error && <ErrorAlert message={error} />}

      <Card className="p-5 space-y-4">
        <div>
          <label htmlFor="report-case-select" className="text-xs font-semibold text-muted-foreground mb-1.5 block">
            Case
          </label>
          <select
            id="report-case-select"
            value={selectedCaseId ?? ''}
            onChange={(e) => setSelectedCaseId(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground outline-none focus:border-primary/40"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.case_number} — {c.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-1.5">Report type</div>
          <div className="text-sm text-foreground">Case Summary Report</div>
          <p className="text-xs text-muted-foreground mt-1">
            Includes case details, document list, and any AI summaries already generated for this case.
          </p>
        </div>
        <button
          onClick={() => void generate()}
          disabled={generating}
          className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: G }}
        >
          {generating ? (
            <>
              <RefreshCw size={14} className="animate-spin" /> Generating…
            </>
          ) : (
            'Generate Report'
          )}
        </button>
      </Card>

      {latest && (
        <Card className="p-5" style={{ borderColor: '#34D39940' }}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span className="text-sm font-semibold text-foreground">{latest.title}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Generated {formatDate(latest.created_at)}</p>
          <button
            onClick={() => downloadTextFile(`${latest.case_number}-report.txt`, latest.content)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: G }}
          >
            <Download size={14} /> Download
          </button>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-sm font-bold text-foreground">
          Previous Reports {selectedCase ? `for ${selectedCase.case_number}` : ''}
        </div>
        {loadingPrevious ? (
          <div className="p-5 flex justify-center"><Spinner label="Loading…" /></div>
        ) : previous.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No reports generated for this case yet.</p>
        ) : (
          previous.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-5 py-3 border-b border-border last:border-0">
              <div>
                <div className="text-sm text-foreground">{r.title}</div>
                <div className="text-xs text-muted-foreground">{formatDate(r.created_at)}</div>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
