import { QueryClientProvider, QueryErrorResetBoundary } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

import { createAppQueryClient } from '../../shared/api/query-client'
import { ErrorBoundary } from '../../shared/components/error-boundary'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => createAppQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary onReset={reset}>{children}</ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </QueryClientProvider>
  )
}
