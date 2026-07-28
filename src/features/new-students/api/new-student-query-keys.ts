export type NewStudentListFilters = {
  search?: string
  status?:
    | 'waiting'
    | 'follow_up'
    | 'consult'
    | 'prediction_test'
    | 'cancelled'
    | 'all'
  branchId?: string
}

export const newStudentQueryKeys = {
  all: ['new-students'] as const,
  lists: () => [...newStudentQueryKeys.all, 'list'] as const,
  list: (filters: NewStudentListFilters = {}) =>
    [...newStudentQueryKeys.lists(), filters] as const,
}
