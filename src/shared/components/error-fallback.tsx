import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from './ui/button'

type ErrorFallbackProps = {
  title?: string
  description?: string
  error?: unknown
  onRetry?: () => void
  onGoHome?: () => void
}

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }
  if (typeof error === 'string' && error.trim()) {
    return error
  }
  return null
}

export function ErrorFallback({
  title = 'Something went wrong',
  description = 'An unexpected error stopped this screen from loading. You can try again or return to the dashboard.',
  error,
  onRetry,
  onGoHome,
}: ErrorFallbackProps) {
  const detail = errorMessage(error)

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC] px-6 py-16 text-slate-900">
      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
        <div className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
          <AlertTriangle className="size-6" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {description}
        </p>
        {detail && import.meta.env.DEV ? (
          <pre className="mt-4 max-h-32 overflow-auto rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-left text-xs text-slate-600">
            {detail}
          </pre>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {onRetry ? (
            <Button onClick={onRetry}>
              <RefreshCw className="size-4" />
              Try again
            </Button>
          ) : null}
          {onGoHome ? (
            <Button variant="secondary" onClick={onGoHome}>
              <Home className="size-4" />
              Go to dashboard
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

type CompactErrorFallbackProps = {
  title?: string
  description?: string
  onRetry?: () => void
  children?: ReactNode
}

export function CompactErrorFallback({
  title = 'Unable to load this page',
  description = 'Something went wrong while rendering this screen.',
  onRetry,
  children,
}: CompactErrorFallbackProps) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-20 text-center">
      <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <AlertTriangle className="size-5" />
      </div>
      <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      {children}
      {onRetry ? (
        <Button className="mt-6" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Try again
        </Button>
      ) : null}
    </div>
  )
}
