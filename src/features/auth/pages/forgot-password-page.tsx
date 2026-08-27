import { useState, type FormEvent } from 'react'
import { Link } from '@tanstack/react-router'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button, buttonVariants } from '../../../shared/components/ui/button'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { requestPasswordReset } from '../api/auth-api'
import { PublicAuthShell } from '../components/public-auth-shell'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-rose-500">{message}</p>
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string>()
  const [submitError, setSubmitError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) {
      setEmailError('Enter a valid email address.')
      return
    }

    setIsSubmitting(true)
    setEmailError(undefined)
    setSubmitError(undefined)

    try {
      await requestPasswordReset(trimmed)
      setSent(true)
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, 'Unable to send reset instructions.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (sent) {
    return (
      <PublicAuthShell
        title="Check your email"
        description="If an account exists for this address, we sent a link to reset your password."
      >
        <p className="mb-6 rounded-xl bg-[#EDF4FF] px-4 py-3 text-sm font-medium text-[#2F5A94]">
          {email.trim()}
        </p>
        <Link to="/login" className={buttonVariants({ size: 'lg', fullWidth: true })}>
          Back to sign in
        </Link>
      </PublicAuthShell>
    )
  }

  return (
    <PublicAuthShell
      title="Forgot password?"
      description="Enter the email on your Yanks & Brits account. We will send a reset link if it matches an active login."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setEmailError(undefined)
            }}
          />
          <FieldError message={emailError} />
        </div>
        {submitError ? <FieldError message={submitError} /> : null}
        <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </Button>
        <p className="text-center text-sm text-slate-500">
          Remembered it?{' '}
          <Link
            to="/login"
            className="font-medium text-[#4274B9] hover:text-[#2F5A94]"
          >
            Sign in
          </Link>
        </p>
      </form>
    </PublicAuthShell>
  )
}
