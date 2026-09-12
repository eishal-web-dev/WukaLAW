import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, Briefcase, FileText } from 'lucide-react'
import { listCases, listDocuments, errorMessage } from '../lib/api'
import type { Case, DocumentMeta } from '../lib/api'
import { Badge } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'

type Category = 'All' | 'Cases' | 'Documents'

/**
 * Client-facing global Search. Replaces the raw Figma mock, which
 * returned the exact same 4 hardcoded fabricated results (a fake case
 * with an invented '82% win probability', a fake prediction, fake
 * '88% strength' evidence) no matter what was actually typed. This
 * searches the client's real cases and documents -- already correctly
 * scoped to them by the backend -- and returns nothing when nothing
 * genuinely matches, rather than always showing the same fake results.
 */
export default function ClientSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>('All')
  const [cases, setCases] = useState<Case[]>([])
  const [documents, setDocuments] = useState<DocumentMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([listCases(), listDocuments()])
      .then(([caseRes, docRes]) => {
        setCases(caseRes.items)
        setDocuments(docRes.items)
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const q = query.trim().toLowerCase()
  const matchedCases = q.length > 1 && category !== 'Documents'
    ? cases.filter((c) => c.title.toLowerCase().includes(q) || c.case_number.toLowerCase().includes(q))
    : []
  const matchedDocs = q.length > 1 && category !== 'Cases'
    ? documents.filter((d) => d.title.toLowerCase().includes(q) || d.filename.toLowerCase().includes(q))
    : []
  const hasResults = matchedCases.length > 0 || matchedDocs.length > 0

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-foreground tracking-tight mb-6">Search</h1>
      <div className="relative mb-4">
        <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your cases and documents…"
          className="w-full pl-11 pr-4 py-4 bg-card border border-border rounded-2xl text-base text-foreground placeholder-muted-foreground outline-none focus:border-primary/40 transition-colors"
        />
      </div>
      <div className="flex gap-2 mb-5">
        {(['All', 'Cases', 'Documents'] as Category[]).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={
              category === c
                ? { background: 'var(--primary)', color: '#fff' }
                : { background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }
            }
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-10 flex justify-center"><Spinner label="Loading…" /></div>
      ) : error ? (
        <ErrorAlert message={error} />
      ) : q.length === 0 ? (
        <div className="text-center py-16">
          <SearchIcon size={28} className="mx-auto mb-3 text-muted-foreground" />
          <div className="text-sm font-semibold text-foreground mb-1">Search your cases and documents</div>
          <p className="text-xs text-muted-foreground">Start typing to find something specific.</p>
        </div>
      ) : !hasResults ? (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground">No results for "{query}".</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {matchedCases.map((c) => (
            <button
              key={`case-${c.id}`}
              onClick={() => navigate(`/client/cases/${c.id}/workspace`)}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all text-left w-full"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#8B5CF615' }}>
                <Briefcase size={14} color="#8B5CF6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{c.title}</div>
                <div className="text-xs text-muted-foreground">{c.case_number} · {c.status}</div>
              </div>
              <Badge label="Case" />
            </button>
          ))}
          {matchedDocs.map((d) => (
            <button
              key={`doc-${d.id}`}
              onClick={() => navigate(`/documents/${d.id}`)}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all text-left w-full"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#F8717115' }}>
                <FileText size={14} color="#F87171" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{d.title}</div>
                <div className="text-xs text-muted-foreground">{d.filename}</div>
              </div>
              <Badge label="Document" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
