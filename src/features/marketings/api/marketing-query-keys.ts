export type MarketingListFilters = {
  search?: string
  isActive?: 'all' | 'active' | 'inactive'
  branchId?: string
}

export const marketingQueryKeys = {
  all: ['marketings'] as const,
  lists: () => [...marketingQueryKeys.all, 'list'] as const,
  list: (filters: MarketingListFilters = {}) =>
    [...marketingQueryKeys.lists(), filters] as const,
}
