import { ArrowRight, Loader2 } from 'lucide-react'
import type { FormEvent } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { PasswordInput } from '../../../shared/components/ui/password-input'
import { SupportedBy } from '../../../shared/components/branding/supported-by'
import { useLoginForm } from '../hooks/use-login-form'

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-xs text-rose-500">{message}</p>
}

export function LoginForm() {
  const {
    values,
    errors,
    isSubmitting,
    updateField,
    submit,
  } = useLoginForm()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await submit()
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2">
      <div className="mb-8">
        <img
          src="/logo.svg"
          alt=""
          aria-hidden
          className="mb-6 hidden h-16 w-auto object-contain lg:block"
        />
        <h2 className="text-3xl font-bold tracking-tight text-ink">
          Welcome back
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Sign in with your Yanks &amp; Brits staff email and password.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@yanksandbrits.com"
            autoComplete="email"
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
          />
          <FieldError message={errors.email} />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              className="text-xs font-semibold text-brand-500 transition hover:text-brand-700"
            >
              Forgot password?
            </button>
          </div>
          <PasswordInput
            id="password"
            placeholder="Your password"
            autoComplete="current-password"
            value={values.password}
            onChange={(event) => updateField('password', event.target.value)}
          />
          <FieldError message={errors.password} />
        </div>

        <label className="flex w-fit cursor-pointer items-center gap-3 rounded-full bg-canvas py-2 pr-4 pl-3 text-sm font-medium text-slate-600">
          <input
            type="checkbox"
            className="size-4 rounded border-slate-300 bg-white text-brand-500 focus:ring-brand-500/40"
            checked={values.rememberMe}
            onChange={(event) =>
              updateField('rememberMe', event.target.checked)
            }
          />
          Keep me signed in
        </label>

        <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          {isSubmitting ? 'Signing in...' : 'Sign in'}
          {isSubmitting ? null : <ArrowRight className="size-4" />}
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-slate-400">
        Can't sign in? Please check with the IT Team.
      </p>

      <div className="mt-10 flex justify-center">
        <SupportedBy />
      </div>
    </div>
  )
}
