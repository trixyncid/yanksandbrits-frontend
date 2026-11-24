import type { QueryClient } from '@tanstack/react-query'

export type PaidLeaveListFilters = {
  search?: string
  status?: 'pending' | 'approved' | 'void' | 'all'
  branchId?: string
  userId?: string
}

export const paidLeaveQueryKeys = {
  all: ['paid-leaves'] as const,
  lists: () => [...paidLeaveQueryKeys.all, 'list'] as const,
  list: (filters: PaidLeaveListFilters = {}) =>
    [...paidLeaveQueryKeys.lists(), filters] as const,
  details: () => [...paidLeaveQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...paidLeaveQueryKeys.details(), id] as const,
}

/** Leave changes move the remaining balance shown on staff, tutor and marketing pages. */
export function invalidatePaidLeaveQueries(queryClient: QueryClient) {
  return Promise.all(
    [paidLeaveQueryKeys.all, ['users'], ['staff'], ['tutors'], ['marketings']].map(
      (queryKey) => queryClient.invalidateQueries({ queryKey }),
    ),
  )
}
