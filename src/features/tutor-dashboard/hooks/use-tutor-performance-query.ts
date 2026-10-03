import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { fetchTutorPerformanceMetrics } from '../api/tutor-dashboard-api'

export const AUTO_BOOKKEEPING_PERIOD = 'auto' as const

export const tutorDashboardQueryKeys = {
  all: ['tutor-dashboard'] as const,
  metrics: (bookkeepingId: string) =>
    [...tutorDashboardQueryKeys.all, 'metrics', bookkeepingId] as const,
}

export function useTutorPerformanceQuery(bookkeepingId: string) {
  return useQuery({
    queryKey: tutorDashboardQueryKeys.metrics(bookkeepingId),
    queryFn: () => fetchTutorPerformanceMetrics(bookkeepingId),
    enabled: Boolean(bookkeepingId),
    placeholderData: keepPreviousData,
  })
}
