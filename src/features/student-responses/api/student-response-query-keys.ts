export type StudentResponseListFilters = {
  search?: string
  status?: 'pending' | 'approved' | 'void' | 'all'
}

export const studentResponseQueryKeys = {
  all: ['student-responses'] as const,
  lists: () => [...studentResponseQueryKeys.all, 'list'] as const,
  list: (filters: StudentResponseListFilters = {}) =>
    [...studentResponseQueryKeys.lists(), filters] as const,
}
