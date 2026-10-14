import type { ErrorComponentProps } from '@tanstack/react-router'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

import { PageBackdrop } from '../../shared/components/page'
import { Button } from '../../shared/components/ui/button'
import { getDefaultStaffPath } from '../../features/auth/lib/route-access'
import { useAuthStore } from '../../features/auth/store/auth-store'

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }
  if (typeof error === 'string' && error.trim()) {
    return error
  }
  return null
}

export function RouteErrorScreen({ error, reset }: ErrorComponentProps) {
  const detail = errorMessage(error)

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-16 text-ink">
      <PageBackdrop theme="sky" pattern="waves" />
      <div className="relative w-full max-w-lg animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] bg-white p-8 text-center shadow-[0_32px_64px_-32px_rgba(20,27,58,0.45)]">
        <img
          src="/logo.svg"
          alt="Yanks and Brits"
          className="mx-auto h-12 w-auto object-contain"
        />
        <div className="mx-auto mt-6 inline-flex size-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertTriangle className="size-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Something went wrong while opening this screen. Try again, or head
          back to your home page.
        </p>
        {detail && import.meta.env.DEV ? (
          <pre className="mt-4 max-h-32 overflow-auto rounded-2xl bg-canvas px-3 py-2 text-left text-xs text-slate-600">
            {detail}
          </pre>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button onClick={reset}>
            <RefreshCw className="size-4" />
            Try again
          </Button>
          <Button
            variant="soft"
            onClick={() => {
              reset()
              const user = useAuthStore.getState().user
              window.location.assign(getDefaultStaffPath(user))
            }}
          >
            <Home className="size-4" />
            Go to home
          </Button>
        </div>
      </div>
    </div>
  )
}
