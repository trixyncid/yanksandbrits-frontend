export type ProspectiveStudentListFilters = {
  search?: string
  status?:
    | 'waiting'
    | 'follow_up'
    | 'consult'
    | 'prediction_test'
    | 'cancelled'
    | 'enrolled'
    | 'all'
  branchId?: string
}

export const prospectiveStudentQueryKeys = {
  all: ['prospective-students'] as const,
  lists: () => [...prospectiveStudentQueryKeys.all, 'list'] as const,
  list: (filters: ProspectiveStudentListFilters = {}) =>
    [...prospectiveStudentQueryKeys.lists(), filters] as const,
  details: () => [...prospectiveStudentQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...prospectiveStudentQueryKeys.details(), id] as const,
}
