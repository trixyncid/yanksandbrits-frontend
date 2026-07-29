export type BookkeepingListFilters = {
  search?: string
  status?: 'pending' | 'approved' | 'void' | 'all'
}

export const bookkeepingQueryKeys = {
  all: ['bookkeeping'] as const,
  lists: () => [...bookkeepingQueryKeys.all, 'list'] as const,
  list: (filters: BookkeepingListFilters = {}) =>
    [...bookkeepingQueryKeys.lists(), filters] as const,
}
