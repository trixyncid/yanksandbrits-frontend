import type { ErrorComponentProps } from '@tanstack/react-router'

import { ErrorFallback } from '../../shared/components/error-fallback'

export function RouteErrorScreen({ error, reset }: ErrorComponentProps) {
  return (
    <ErrorFallback
      title="This page failed to load"
      description="Something went wrong while opening this screen. You can retry or head back to the dashboard."
      error={error}
      onRetry={reset}
      onGoHome={() => {
        reset()
        window.location.assign('/dashboard')
      }}
    />
  )
}
