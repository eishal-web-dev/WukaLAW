import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { errorMessage } from '../lib/api'
import AuthShell from '../components/AuthShell'
import AuthField from '../components/AuthField'
import ErrorAlert from '../components/ErrorAlert'

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const errors: typeof fieldErrors = {}
    if (!email.trim()) errors.email = 'Email is required.'
    else if (!EMAIL_PATTERN.test(email.trim()))
      errors.email = 'Enter a valid email address.'
    if (!password) errors.password = 'Password is required.'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    setApiError(null)
    login(email.trim(), password)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch((err) => {
        setApiError(errorMessage(err))
        setSubmitting(false)
      })
  }

  return (
    <AuthShell
      heading="Welcome back"
      subheading="Sign in to your WakuLaw workspace."
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {apiError && <ErrorAlert message={apiError} />}

        <AuthField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@firm.pk"
          autoComplete="email"
          error={fieldErrors.email}
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
          error={fieldErrors.password}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gold-bright py-2.5 text-sm font-bold text-navy-950 transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="text-center text-sm text-neutral-500">
          New here?{' '}
          <Link
            to="/signup"
            className="font-semibold text-gold hover:text-gold-light"
          >
            Create account
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
