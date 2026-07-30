import { useQuery } from '@tanstack/react-query'

import { fetchStudentPayment } from '../api/student-payments-api'
import { studentPaymentQueryKeys } from '../api/student-payment-query-keys'

export function useStudentPaymentQuery(id: string) {
  return useQuery({
    queryKey: studentPaymentQueryKeys.detail(id),
    queryFn: () => fetchStudentPayment(id),
    enabled: Boolean(id),
  })
}
