export type StudentPaymentListFilters = {
  search?: string
  status?: 'pending' | 'approved' | 'void' | 'all'
  branchId?: string
  studentId?: string
}

export const studentPaymentQueryKeys = {
  all: ['student-payments'] as const,
  lists: () => [...studentPaymentQueryKeys.all, 'list'] as const,
  list: (filters: StudentPaymentListFilters = {}) =>
    [...studentPaymentQueryKeys.lists(), filters] as const,
  details: () => [...studentPaymentQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentPaymentQueryKeys.details(), id] as const,
}
