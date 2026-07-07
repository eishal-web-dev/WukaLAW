const QUESTIONS_KEY = 'wakulaw.questionsAsked'

/** Number of questions asked in this browser session (Ask AI page). */
export function getQuestionsAsked(): number {
  const raw = sessionStorage.getItem(QUESTIONS_KEY)
  const value = raw === null ? 0 : Number.parseInt(raw, 10)
  return Number.isFinite(value) && value >= 0 ? value : 0
}

export function incrementQuestionsAsked(): number {
  const next = getQuestionsAsked() + 1
  sessionStorage.setItem(QUESTIONS_KEY, String(next))
  return next
}
