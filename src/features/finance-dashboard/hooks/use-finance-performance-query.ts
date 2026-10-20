import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { fetchFinancePerformanceMetrics } from '../api/finance-dashboard-api'

export const AUTO_BOOKKEEPING_PERIOD = 'auto' as const

export const financeDashboardQueryKeys = {
  all: ['finance-dashboard'] as const,
  metrics: (bookkeepingId: string) =>
    [...financeDashboardQueryKeys.all, 'metrics', bookkeepingId] as const,
}

export function useFinancePerformanceQuery(bookkeepingId: string) {
  return useQuery({
    queryKey: financeDashboardQueryKeys.metrics(bookkeepingId),
    queryFn: () => fetchFinancePerformanceMetrics(bookkeepingId),
    enabled: Boolean(bookkeepingId),
    placeholderData: keepPreviousData,
  })
}
