import { Briefcase, FolderOpen } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import Cases from './Cases'
import LawyerWorkspace from './LawyerWorkspace'

type CasesView = 'management' | 'workspace'

export default function LawyerCases() {
  const [searchParams, setSearchParams] = useSearchParams()
  const view: CasesView = searchParams.get('view') === 'workspace' ? 'workspace' : 'management'

  const showManagement = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('view')
    next.delete('caseId')
    setSearchParams(next, { replace: true })
  }

  const showWorkspace = (caseId?: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('view', 'workspace')
    if (caseId) next.set('caseId', String(caseId))
    setSearchParams(next)
  }

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden">
      <header className="shrink-0 border-b border-border bg-card/40 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cases</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage a case, then continue its documents, timeline and work in one place.</p>
          </div>
          <div className="flex w-full rounded-xl border border-border bg-muted/30 p-1 sm:w-auto" role="tablist" aria-label="Case views">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'management'}
              onClick={showManagement}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${view === 'management' ? 'bg-[#D4AF37] text-[#0D1117]' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Briefcase size={15} /> All Cases
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'workspace'}
              onClick={() => showWorkspace()}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${view === 'workspace' ? 'bg-[#D4AF37] text-[#0D1117]' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <FolderOpen size={15} /> Workspace
            </button>
          </div>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-hidden">
        {view === 'management' ? <Cases embedded onOpenWorkspace={showWorkspace} /> : <LawyerWorkspace embedded />}
      </div>
    </div>
  )
}
