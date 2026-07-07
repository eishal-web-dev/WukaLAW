import { useState } from 'react'
import type { FormEvent } from 'react'
import { askQuestion, errorMessage } from '../lib/api'
import type { AskResponse } from '../lib/api'
import { incrementQuestionsAsked } from '../lib/session'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'
import ErrorAlert from '../components/ErrorAlert'
import ConfidenceBadge from '../components/ConfidenceBadge'
import SourceCard from '../components/SourceCard'
import Disclaimer from '../components/Disclaimer'

export default function Ask() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<AskResponse | null>(null)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = question.trim()
    if (!trimmed || loading) return
    setLoading(true)
    setError(null)
    setResponse(null)
    askQuestion(trimmed)
      .then((res) => {
        setResponse(res)
        incrementQuestionsAsked()
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }

  return (
    <div>
      <PageHeader
        title="Ask AI"
        subtitle="Questions are answered only from your uploaded documents — every answer shows its sources."
      />

      {/* Question form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <label htmlFor="question" className="sr-only">
          Your question
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={4}
          placeholder="e.g. What was the court's reasoning for granting bail?"
          className="w-full resize-y rounded-card border border-line bg-ink-900 px-5 py-4 text-sm leading-relaxed text-neutral-200 placeholder:text-neutral-600 focus:border-gold/50 focus:outline-none"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-600">
            Answers are grounded in retrieved passages, not general knowledge.
          </p>
          <button
            type="submit"
            disabled={loading || question.trim().length === 0}
            className="rounded-xl bg-gold px-6 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Thinking…' : 'Ask'}
          </button>
        </div>
      </form>

      <div className="mt-8 space-y-6">
        {loading && (
          <div className="rounded-card border border-line bg-ink-900 p-6">
            <Spinner label="Retrieving sources and generating an answer…" />
          </div>
        )}

        {error && <ErrorAlert message={error} />}

        {response && (
          <>
            {/* Answer card */}
            <article className="rounded-card border border-line bg-ink-900 p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-neutral-100">
                  Answer
                </h2>
                <span className="text-xs text-neutral-600">
                  Model: {response.model}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">
                {response.answer}
              </p>
              <div className="mt-5 border-t border-line pt-4">
                <ConfidenceBadge confidence={response.confidence} />
              </div>
            </article>

            {/* Sources */}
            <section>
              <h2 className="mb-3 text-base font-semibold text-neutral-100">
                Sources ({response.sources.length})
              </h2>
              {response.sources.length > 0 ? (
                <div className="space-y-3">
                  {response.sources.map((source) => (
                    <SourceCard
                      key={`${source.document_id}-${source.chunk_id}`}
                      source={source}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-card border border-line bg-ink-900 px-5 py-4 text-sm text-neutral-500">
                  No supporting sources were found for this answer — treat it
                  with extra caution.
                </p>
              )}
            </section>

            <Disclaimer />
          </>
        )}
      </div>
    </div>
  )
}
