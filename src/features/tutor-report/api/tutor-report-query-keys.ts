export type TutorReportListFilters = {
  search?: string
}

export const tutorReportQueryKeys = {
  all: ['tutor-report'] as const,
  lists: () => [...tutorReportQueryKeys.all, 'list'] as const,
  list: (filters: TutorReportListFilters = {}) =>
    [...tutorReportQueryKeys.lists(), filters] as const,
}
