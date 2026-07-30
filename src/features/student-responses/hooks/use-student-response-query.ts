import { useQuery } from '@tanstack/react-query'

import { fetchStudentResponse } from '../api/student-responses-api'
import { studentResponseQueryKeys } from '../api/student-response-query-keys'

export function useStudentResponseQuery(id: string) {
  return useQuery({
    queryKey: studentResponseQueryKeys.detail(id),
    queryFn: () => fetchStudentResponse(id),
    enabled: Boolean(id),
  })
}
