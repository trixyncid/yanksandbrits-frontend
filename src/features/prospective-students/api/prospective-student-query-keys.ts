export type ProspectiveStudentListFilters = {
  search?: string
  status?:
    | 'consult'
    | 'prediction_test'
    | 'cancelled'
    | 'enrolled'
    | 'all'
  /** When set, overrides ``status`` and requests multiple response statuses. */
  statuses?: Array<'consult' | 'prediction_test' | 'cancelled' | 'enrolled'>
  branchId?: string
  counsellorId?: string
}

export const prospectiveStudentQueryKeys = {
  all: ['prospective-students'] as const,
  lists: () => [...prospectiveStudentQueryKeys.all, 'list'] as const,
  list: (filters: ProspectiveStudentListFilters = {}) =>
    [...prospectiveStudentQueryKeys.lists(), filters] as const,
  details: () => [...prospectiveStudentQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...prospectiveStudentQueryKeys.details(), id] as const,
}
