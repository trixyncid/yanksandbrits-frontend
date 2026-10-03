import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { fetchMarketingPerformanceMetrics } from '../api/marketing-dashboard-api'

export const AUTO_BOOKKEEPING_PERIOD = 'auto' as const

export const marketingDashboardQueryKeys = {
  all: ['marketing-dashboard'] as const,
  metrics: (bookkeepingId: string) =>
    [...marketingDashboardQueryKeys.all, 'metrics', bookkeepingId] as const,
}

export function useMarketingPerformanceQuery(bookkeepingId: string) {
  return useQuery({
    queryKey: marketingDashboardQueryKeys.metrics(bookkeepingId),
    queryFn: () => fetchMarketingPerformanceMetrics(bookkeepingId),
    enabled: Boolean(bookkeepingId),
    placeholderData: keepPreviousData,
  })
}
