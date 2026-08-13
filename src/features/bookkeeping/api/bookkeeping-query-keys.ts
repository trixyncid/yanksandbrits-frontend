export type BookkeepingListFilters = {
  search?: string
  status?: 'pending' | 'approved' | 'void' | 'all'
}

export const bookkeepingQueryKeys = {
  all: ['bookkeeping'] as const,
  lists: () => [...bookkeepingQueryKeys.all, 'list'] as const,
  list: (filters: BookkeepingListFilters = {}) =>
    [...bookkeepingQueryKeys.lists(), filters] as const,
  details: () => [...bookkeepingQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookkeepingQueryKeys.details(), id] as const,
  tutorSalaries: (id: string) =>
    [...bookkeepingQueryKeys.detail(id), 'tutor-salaries'] as const,
  marketingSalaries: (id: string) =>
    [...bookkeepingQueryKeys.detail(id), 'marketing-salaries'] as const,
}
