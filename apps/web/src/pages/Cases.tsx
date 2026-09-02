import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, Eye, X } from 'lucide-react'
import {
  listCases, createCase, updateCase, deleteCase, errorMessage,
} from '../lib/api'
import type { Case, CaseCreatePayload, CaseStatus, CasePriority } from '../lib/api'
import { formatDate } from '../lib/format'
import { Btn, Card, Badge, Input, G } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'
import Spinner from '../components/Spinner'

const STATUSES: CaseStatus[] = ['Active', 'Review', 'On Hold', 'Closed']
const PRIORITIES: CasePriority[] = ['Low', 'Medium', 'High', 'Critical']

interface CaseFormState {
  title: string
  case_type: string
  status: CaseStatus
  priority: CasePriority
  description: string
  deadline: string
}

const EMPTY_FORM: CaseFormState = {
  title: '', case_type: '', status: 'Active', priority: 'Medium', description: '', deadline: '',
}

function selectClass() {
  return 'w-full rounded-xl border border-border bg-muted/40 text-foreground text-sm px-4 py-2.5 focus:outline-none focus:border-primary/50 transition-colors'
}

function CaseFormDialog({
  title,
  initial,
  onClose,
  onSave,
}: {
  title: string
  initial: CaseFormState
  onClose: () => void
  onSave: (form: CaseFormState) => Promise<void>
}) {
  const [form, setForm] = useState<CaseFormState>(initial)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const set = <K extends keyof CaseFormState>(k: K) => (v: CaseFormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.title.trim() || !form.case_type.trim()) {
      setError('Title and case type are required.')
      return
    }
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch (err) {
      setError(errorMessage(err))
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50">
            <X size={16} />
          </button>
        </div>
        {error && <ErrorAlert message={error} />}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title *</label>
          <Input placeholder="Johnson v. MegaCorp Industries" value={form.title} onChange={set('title')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Case type *</label>
            <Input placeholder="Employment, IP, Commercial…" value={form.case_type} onChange={set('case_type')} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Deadline</label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => set('deadline')(e.target.value)}
              className={selectClass()}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
            <select value={form.status} onChange={(e) => set('status')(e.target.value as CaseStatus)} className={selectClass()}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Priority</label>
            <select value={form.priority} onChange={(e) => set('priority')(e.target.value as CasePriority)} className={selectClass()}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description')(e.target.value)}
            rows={3}
            placeholder="Brief description of the matter…"
            className={`${selectClass()} resize-y placeholder-muted-foreground`}
          />
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Case'}</Btn>
        </div>
      </form>
    </div>
  )
}

export default function Cases() {
  const navigate = useNavigate()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Case | null>(null)
  const [deleting, setDeleting] = useState<Case | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const res = await listCases()
      setCases(res.items)
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

  const statuses = ['All', ...STATUSES]
  const filtered = cases.filter(
    (c) =>
      (filterStatus === 'All' || c.status === filterStatus) &&
      (c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.case_number.toLowerCase().includes(search.toLowerCase())),
  )
  const activeCount = cases.filter((c) => c.status === 'Active').length

  const payloadFrom = (form: CaseFormState): CaseCreatePayload => ({
    title: form.title.trim(),
    case_type: form.case_type.trim(),
    status: form.status,
    priority: form.priority,
    ...(form.description.trim() ? { description: form.description.trim() } : {}),
    ...(form.deadline ? { deadline: form.deadline } : {}),
  })

  const confirmDelete = async () => {
    if (!deleting) return
    setDeleteBusy(true)
    try {
      await deleteCase(deleting.id)
      setDeleting(null)
      await refresh()
    } catch (err) {
      setError(errorMessage(err))
      setDeleting(null)
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <div className="p-8 space-y-7 overflow-y-auto h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Case Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {cases.length} total case{cases.length === 1 ? '' : 's'} · {activeCount} active
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Btn icon={<Plus size={14} />} onClick={() => setCreating(true)}>New Case</Btn>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input placeholder="Search cases..." value={search} onChange={setSearch} icon={<Search size={14} />} className="flex-1" />
          <div className="flex gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === s ? 'text-[#0D1117]' : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05] border border-white/10'}`}
                style={filterStatus === s ? { backgroundColor: G } : {}}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center"><Spinner label="Loading cases…" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {cases.length === 0 ? 'No cases yet — create your first case.' : 'No cases match your filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Case #', 'Title', 'Type', 'Status', 'Priority', 'Docs', 'Deadline', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}
                    onClick={() => navigate(`/cases/${c.id}`)}
                  >
                    <td className="px-4 py-3.5 text-xs font-mono" style={{ color: G }}>{c.case_number}</td>
                    <td className="px-4 py-3.5">
                      <div className="text-foreground text-xs font-medium">{c.title}</div>
                      {c.description && (
                        <div className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[240px]">{c.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{c.case_type}</td>
                    <td className="px-4 py-3.5"><Badge label={c.status} /></td>
                    <td className="px-4 py-3.5"><Badge label={c.priority} /></td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{c.num_documents}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{c.deadline ? formatDate(c.deadline) : '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          title="Open"
                          onClick={() => navigate(`/cases/${c.id}`)}
                          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          title="Edit"
                          onClick={() => setEditing(c)}
                          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setDeleting(c)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
          <span className="text-xs text-muted-foreground">
            Showing {filtered.length} of {cases.length} cases
          </span>
        </div>
      </Card>

      {creating && (
        <CaseFormDialog
          title="New Case"
          initial={EMPTY_FORM}
          onClose={() => setCreating(false)}
          onSave={async (form) => {
            await createCase(payloadFrom(form))
            await refresh()
          }}
        />
      )}

      {editing && (
        <CaseFormDialog
          title={`Edit ${editing.case_number}`}
          initial={{
            title: editing.title,
            case_type: editing.case_type,
            status: editing.status,
            priority: editing.priority,
            description: editing.description ?? '',
            deadline: editing.deadline ? editing.deadline.slice(0, 10) : '',
          }}
          onClose={() => setEditing(null)}
          onSave={async (form) => {
            await updateCase(editing.id, payloadFrom(form))
            await refresh()
          }}
        />
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-foreground">Delete case?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-mono" style={{ color: G }}>{deleting.case_number}</span> — {deleting.title}.
              Its documents are kept but detached from the case.
            </p>
            <div className="flex justify-end gap-3">
              <Btn variant="secondary" onClick={() => setDeleting(null)}>Cancel</Btn>
              <Btn variant="danger" onClick={confirmDelete} disabled={deleteBusy}>
                {deleteBusy ? 'Deleting…' : 'Delete'}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
