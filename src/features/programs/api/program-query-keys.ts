export type ProgramListFilters = {
  search?: string
  isActive?: 'all' | 'active' | 'inactive'
}

export type ProgramFilteredFilters = {
  studentId?: string
  studentGroupId?: string
}

export const programQueryKeys = {
  all: ['programs'] as const,
  lists: () => [...programQueryKeys.all, 'list'] as const,
  list: (filters: ProgramListFilters = {}) =>
    [...programQueryKeys.lists(), filters] as const,
  filtered: (filters: ProgramFilteredFilters = {}) =>
    [...programQueryKeys.all, 'filtered', filters] as const,
  details: () => [...programQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...programQueryKeys.details(), id] as const,
}
