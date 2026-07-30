export type StudentGroupListFilters = {
  search?: string
  status?: 'active' | 'inactive' | 'all'
  branchId?: string
}

export const studentGroupQueryKeys = {
  all: ['student-groups'] as const,
  lists: () => [...studentGroupQueryKeys.all, 'list'] as const,
  list: (filters: StudentGroupListFilters = {}) =>
    [...studentGroupQueryKeys.lists(), filters] as const,
  details: () => [...studentGroupQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentGroupQueryKeys.details(), id] as const,
}
