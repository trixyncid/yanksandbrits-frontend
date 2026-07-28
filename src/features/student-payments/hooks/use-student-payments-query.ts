import { useQuery } from '@tanstack/react-query'

import { fetchStudentPayments } from '../api/student-payments-api'
import {
  studentPaymentQueryKeys,
  type StudentPaymentListFilters,
} from '../api/student-payment-query-keys'

export function useStudentPaymentsQuery(
  filters: StudentPaymentListFilters = {},
) {
  return useQuery({
    queryKey: studentPaymentQueryKeys.list(filters),
    queryFn: () => fetchStudentPayments(filters),
  })
}
