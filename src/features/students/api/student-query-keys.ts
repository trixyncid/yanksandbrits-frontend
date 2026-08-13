export type StudentListFilters = {
  search?: string
  branchId?: string
  status?: 'active' | 'inactive' | 'all'
  counsellorId?: string
}

export const studentQueryKeys = {
  all: ['students'] as const,
  lists: () => [...studentQueryKeys.all, 'list'] as const,
  list: (filters: StudentListFilters = {}) =>
    [...studentQueryKeys.lists(), filters] as const,
  details: () => [...studentQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentQueryKeys.details(), id] as const,
}
