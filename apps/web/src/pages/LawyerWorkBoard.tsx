import { Gavel, ListTodo } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import LawyerHearings from './LawyerHearings'
import LawyerTasks from './LawyerTasks'

type WorkView = 'tasks' | 'hearings'

export default function LawyerWorkBoard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const view: WorkView = searchParams.get('view') === 'hearings' ? 'hearings' : 'tasks'

  const selectView = (nextView: WorkView) => {
    const next = new URLSearchParams(searchParams)
    if (nextView === 'tasks') next.delete('view')
    else next.set('view', nextView)
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden">
      <header className="shrink-0 border-b border-border bg-card/40 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Task Board</h1>
            <p className="mt-1 text-sm text-muted-foreground">Plan case work and prepare upcoming hearings from one board.</p>
          </div>
          <div className="flex w-full rounded-xl border border-border bg-muted/30 p-1 sm:w-auto" role="tablist" aria-label="Task board views">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'tasks'}
              onClick={() => selectView('tasks')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${view === 'tasks' ? 'bg-[#D4AF37] text-[#0D1117]' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <ListTodo size={15} /> Tasks
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'hearings'}
              onClick={() => selectView('hearings')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${view === 'hearings' ? 'bg-[#D4AF37] text-[#0D1117]' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Gavel size={15} /> Hearings
            </button>
          </div>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-hidden">
        {view === 'tasks' ? <LawyerTasks embedded /> : <LawyerHearings embedded />}
      </div>
    </div>
  )
}
