import { useState, type FormEvent } from 'react'
import { Link, useParams } from '@tanstack/react-router'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button, buttonVariants } from '../../../shared/components/ui/button'
import { Label } from '../../../shared/components/ui/label'
import { PasswordInput } from '../../../shared/components/ui/password-input'
import { resetPassword } from '../api/auth-api'
import { PublicAuthShell } from '../components/public-auth-shell'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-rose-500">{message}</p>
}

export default function ResetPasswordPage() {
  const { uid, token } = useParams({ strict: false }) as {
    uid: string
    token: string
  }

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{
    newPassword?: string
    confirmPassword?: string
    form?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  function validate(): boolean {
    const next: typeof errors = {}
    if (!newPassword.trim()) {
      next.newPassword = 'New password is required.'
    } else if (newPassword.length < 8) {
      next.newPassword = 'New password must be at least 8 characters.'
    }
    if (!confirmPassword.trim()) {
      next.confirmPassword = 'Please confirm your new password.'
    } else if (newPassword !== confirmPassword) {
      next.confirmPassword = 'Passwords do not match.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting || !validate()) return

    setIsSubmitting(true)
    setErrors({})

    try {
      await resetPassword({
        uid,
        token,
        new_password: newPassword,
      })
      setDone(true)
    } catch (error) {
      setErrors({
        form: getApiErrorMessage(
          error,
          'This reset link is invalid or has expired.',
        ),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (done) {
    return (
      <PublicAuthShell
        title="Password updated"
        description="You can close this page and sign in on the Yanks & Brits app. Staff can also sign in to the admin panel."
      >
        <Link to="/login" className={buttonVariants({ size: 'lg', fullWidth: true })}>
          Staff sign in
        </Link>
      </PublicAuthShell>
    )
  }

  return (
    <PublicAuthShell
      title="Choose a new password"
      description="Enter a new password for your Yanks & Brits account."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2.5">
          <Label htmlFor="new-password">New password</Label>
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <FieldError message={errors.newPassword} />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <PasswordInput
            id="confirm-password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          <FieldError message={errors.confirmPassword} />
        </div>
        <FieldError message={errors.form} />
        <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Update password'}
        </Button>
      </form>
    </PublicAuthShell>
  )
}
