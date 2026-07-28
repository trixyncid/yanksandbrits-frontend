export type ClassroomListFilters = {
  search?: string
  isActive?: 'all' | 'active' | 'inactive'
  branchId?: string
}

export const classroomQueryKeys = {
  all: ['classrooms'] as const,
  lists: () => [...classroomQueryKeys.all, 'list'] as const,
  list: (filters: ClassroomListFilters = {}) =>
    [...classroomQueryKeys.lists(), filters] as const,
}
