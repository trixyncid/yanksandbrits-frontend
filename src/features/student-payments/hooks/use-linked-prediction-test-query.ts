import { useQuery } from '@tanstack/react-query'

import { fetchLinkedPredictionTest } from '../api/student-payments-api'
import { studentPaymentQueryKeys } from '../api/student-payment-query-keys'

export function useLinkedPredictionTestQuery(params: {
  studentId: string
  prospectiveStudentId: string
  fullAmount: string
  paymentId?: string
}) {
  const ownerKey = params.studentId
    ? `student:${params.studentId}`
    : params.prospectiveStudentId
      ? `prospect:${params.prospectiveStudentId}`
      : ''
  const paymentId = params.paymentId ?? ''
  const enabled = Boolean(ownerKey)

  return useQuery({
    queryKey: studentPaymentQueryKeys.linkedPrediction(
      ownerKey,
      params.fullAmount,
      paymentId,
    ),
    queryFn: () =>
      fetchLinkedPredictionTest({
        studentId: params.studentId || undefined,
        prospectiveStudentId: params.prospectiveStudentId || undefined,
        paymentId: paymentId || undefined,
        fullAmount: params.fullAmount,
      }),
    enabled,
  })
}
