import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { errorMessage } from '../lib/api'
import AuthShell from '../components/AuthShell'
import AuthField from '../components/AuthField'
import ErrorAlert from '../components/ErrorAlert'

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/
const MIN_PASSWORD_LENGTH = 8

export default function Signup() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    email?: string
    password?: string
  }>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const errors: typeof fieldErrors = {}
    if (!name.trim()) errors.name = 'Name is required.'
    if (!email.trim()) errors.email = 'Email is required.'
    else if (!EMAIL_PATTERN.test(email.trim()))
      errors.email = 'Enter a valid email address.'
    if (!password) errors.password = 'Password is required.'
    else if (password.length < MIN_PASSWORD_LENGTH)
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    setApiError(null)
    register(email.trim(), name.trim(), password)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch((err) => {
        setApiError(errorMessage(err))
        setSubmitting(false)
      })
  }

  return (
    <AuthShell
      heading="Create your account"
      subheading="Start researching with explainable AI."
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {apiError && <ErrorAlert message={apiError} />}

        <AuthField
          id="name"
          label="Full name"
          type="text"
          value={name}
          onChange={setName}
          placeholder="Adv. Ayesha Khan"
          autoComplete="name"
          error={fieldErrors.name}
        />
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
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={fieldErrors.password}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gold-bright py-2.5 text-sm font-bold text-navy-950 transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-gold hover:text-gold-light"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
