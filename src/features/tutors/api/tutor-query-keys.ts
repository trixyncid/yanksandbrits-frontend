export type TutorListFilters = {
  search?: string
  isActive?: 'all' | 'active' | 'inactive'
}

export const tutorQueryKeys = {
  all: ['tutors'] as const,
  lists: () => [...tutorQueryKeys.all, 'list'] as const,
  list: (filters: TutorListFilters = {}) =>
    [...tutorQueryKeys.lists(), filters] as const,
}
