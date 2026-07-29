export type StudentReportFilters = {
  branchId: string
  startDate: string
  endDate: string
}

export const studentReportQueryKeys = {
  all: ['student-report'] as const,
  lists: () => [...studentReportQueryKeys.all, 'list'] as const,
  list: (filters: StudentReportFilters) =>
    [...studentReportQueryKeys.lists(), filters] as const,
}
