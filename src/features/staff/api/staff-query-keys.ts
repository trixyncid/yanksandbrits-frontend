export type StaffListFilters = {
  search?: string
  isActive?: 'all' | 'active' | 'inactive'
  position?: string
  branchId?: string
}

export const staffQueryKeys = {
  all: ['staff'] as const,
  lists: () => [...staffQueryKeys.all, 'list'] as const,
  list: (filters: StaffListFilters = {}) =>
    [...staffQueryKeys.lists(), filters] as const,
}
