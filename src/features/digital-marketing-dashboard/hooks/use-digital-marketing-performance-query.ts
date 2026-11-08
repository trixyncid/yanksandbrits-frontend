import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { fetchDigitalMarketingPerformanceMetrics } from '../api/digital-marketing-dashboard-api'

export const digitalMarketingDashboardQueryKeys = {
  all: ['digital-marketing-dashboard'] as const,
  metrics: (bookkeepingId: string) =>
    [...digitalMarketingDashboardQueryKeys.all, 'metrics', bookkeepingId] as const,
}

export function useDigitalMarketingPerformanceQuery(bookkeepingId: string) {
  return useQuery({
    queryKey: digitalMarketingDashboardQueryKeys.metrics(bookkeepingId),
    queryFn: () => fetchDigitalMarketingPerformanceMetrics(bookkeepingId),
    enabled: Boolean(bookkeepingId),
    placeholderData: keepPreviousData,
  })
}
