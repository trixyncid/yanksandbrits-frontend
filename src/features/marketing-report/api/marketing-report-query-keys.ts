export type MarketingReportListFilters = {
  search?: string
}

export const marketingReportQueryKeys = {
  all: ['marketing-report'] as const,
  lists: () => [...marketingReportQueryKeys.all, 'list'] as const,
  list: (filters: MarketingReportListFilters = {}) =>
    [...marketingReportQueryKeys.lists(), filters] as const,
}
