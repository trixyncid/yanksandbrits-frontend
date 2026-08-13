import { useQuery } from '@tanstack/react-query'

import { fetchDashboardMetrics } from '../api/dashboard-api'
import type { DashboardFilters } from '../types/dashboard'

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  metrics: (filters: DashboardFilters) =>
    [...dashboardQueryKeys.all, 'metrics', filters] as const,
}

export function useDashboardMetricsQuery(filters: DashboardFilters) {
  return useQuery({
    queryKey: dashboardQueryKeys.metrics(filters),
    queryFn: () => fetchDashboardMetrics(filters),
    enabled: Boolean(
      filters.branchId && filters.startDate && filters.endDate,
    ),
  })
}
