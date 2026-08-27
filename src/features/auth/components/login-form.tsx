import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import type { FormEvent } from 'react'

import ynbLogo from '../../../assets/branding/ynb-logo.png'
import { Button } from '../../../shared/components/ui/button'
import { Card } from '../../../shared/components/ui/card'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { PasswordInput } from '../../../shared/components/ui/password-input'
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
    <Card className="w-full max-w-md px-7 py-8 sm:px-9">
      <div className="mb-8 text-center">
        <img
          src={ynbLogo}
          alt="Yanks and Brits logo"
          className="mx-auto mb-5 h-28 w-auto object-contain"
        />
        <h2 className="text-2xl font-bold text-[#4274B9]">Welcome back!</h2>
        <p className="mt-2 text-sm text-slate-500">
          Enter your email and password to sign in.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2.5">
          <div className="pb-1">
            <Label htmlFor="email">Work email</Label>
          </div>
          <Input
            id="email"
            type="email"
            placeholder="admin@yanksandbrits.com"
            autoComplete="email"
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
          />
          <FieldError message={errors.email} />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-3 pb-1">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-[#4274B9] transition hover:text-[#2F5A94]"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="Enter your secure password"
            autoComplete="current-password"
            value={values.password}
            onChange={(event) => updateField('password', event.target.value)}
          />
          <FieldError message={errors.password} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="inline-flex items-center gap-3 text-sm text-slate-600">
            <input
              type="checkbox"
              className="size-4 rounded border-slate-300 bg-white text-[#4274B9] focus:ring-[#4274B9]/40"
              checked={values.rememberMe}
              onChange={(event) =>
                updateField('rememberMe', event.target.checked)
              }
            />
            Remember me
          </label>
        </div>

        <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
          <ArrowRight className="size-4" />
        </Button>
      </form>
    </Card>
  )
}
