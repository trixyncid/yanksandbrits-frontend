import type { ErrorComponentProps } from '@tanstack/react-router'

import { ErrorFallback } from '../../shared/components/error-fallback'
import { getDefaultStaffPath } from '../../features/auth/lib/route-access'
import { useAuthStore } from '../../features/auth/store/auth-store'

export function RouteErrorScreen({ error, reset }: ErrorComponentProps) {
  return (
    <ErrorFallback
      title="This page failed to load"
      description="Something went wrong while opening this screen. You can retry or head back to your home page."
      error={error}
      onRetry={reset}
      onGoHome={() => {
        reset()
        const user = useAuthStore.getState().user
        window.location.assign(getDefaultStaffPath(user))
      }}
    />
  )
}
