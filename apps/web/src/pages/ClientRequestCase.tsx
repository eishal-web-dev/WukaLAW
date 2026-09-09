import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilePlus2, CheckCircle2, AlertCircle } from 'lucide-react'
import { requestCase, errorMessage } from '../lib/api'
import { Card, G } from '../components/design'
import ErrorAlert from '../components/ErrorAlert'

const CASE_TYPES = [
  'Civil', 'Criminal', 'Family', 'Property', 'Corporate', 'Labour', 'Tax', 'Constitutional', 'Other',
]

export default function ClientRequestCase() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [caseType, setCaseType] = useState(CASE_TYPES[0])
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<{ caseNumber: string } | null>(null)

  const canSubmit = title.trim().length >= 3 && description.trim().length >= 10 && !submitting

  const submit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const result = await requestCase({
        title: title.trim(),
        case_type: caseType,
        description: description.trim(),
      })
      setSubmitted({ caseNumber: result.case_number })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="p-6 sm:p-8 max-w-lg mx-auto">
        <Card className="p-8 text-center space-y-3">
          <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
          <h2 className="text-lg font-bold text-foreground">Request submitted</h2>
          <p className="text-sm text-muted-foreground">
            Your case <span className="font-mono" style={{ color: G }}>{submitted.caseNumber}</span> has
            been submitted and is waiting for a lawyer to take it on. You'll get a notification once someone
            does.
          </p>
          <button
            onClick={() => navigate('/client/cases')}
            className="inline-block mt-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: G }}
          >
            View My Cases
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <FilePlus2 size={18} style={{ color: G }} />
        <h1 className="text-xl font-bold text-foreground tracking-tight">Request a New Case</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Tell us briefly what's going on. A lawyer will review your request and take it on — you'll be
        notified once that happens.
      </p>

      {error && <ErrorAlert message={error} />}

      <Card className="p-5 space-y-4">
        <div>
          <label htmlFor="request-title" className="text-xs font-semibold text-muted-foreground mb-1.5 block">
            Short title
          </label>
          <input
            id="request-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Landlord won't return my deposit"
            className="w-full px-3.5 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground outline-none focus:border-primary/40"
          />
        </div>

        <div>
          <label htmlFor="request-type" className="text-xs font-semibold text-muted-foreground mb-1.5 block">
            Type of matter
          </label>
          <select
            id="request-type"
            value={caseType}
            onChange={(e) => setCaseType(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground outline-none focus:border-primary/40"
          >
            {CASE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="request-description" className="text-xs font-semibold text-muted-foreground mb-1.5 block">
            What's happening?
          </label>
          <textarea
            id="request-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Describe your situation in a few sentences — dates, what happened, and what you're hoping to do about it."
            className="w-full px-3.5 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground outline-none focus:border-primary/40 resize-none"
          />
          {description.trim().length > 0 && description.trim().length < 10 && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-400">
              <AlertCircle size={12} /> A few more details would help a lawyer understand your situation.
            </div>
          )}
        </div>
      </Card>

      <button
        onClick={() => void submit()}
        disabled={!canSubmit}
        className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-40"
        style={{ background: G }}
      >
        {submitting ? 'Submitting…' : 'Submit Request'}
      </button>
    </div>
  )
}
