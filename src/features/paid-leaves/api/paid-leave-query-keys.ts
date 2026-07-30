export type PaidLeaveListFilters = {
  search?: string
  status?: 'pending' | 'approved' | 'void' | 'all'
  branchId?: string
}

export const paidLeaveQueryKeys = {
  all: ['paid-leaves'] as const,
  lists: () => [...paidLeaveQueryKeys.all, 'list'] as const,
  list: (filters: PaidLeaveListFilters = {}) =>
    [...paidLeaveQueryKeys.lists(), filters] as const,
  details: () => [...paidLeaveQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...paidLeaveQueryKeys.details(), id] as const,
}
