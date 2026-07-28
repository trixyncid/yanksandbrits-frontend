import { useQuery } from '@tanstack/react-query'

import { fetchStudentResponses } from '../api/student-responses-api'
import {
  studentResponseQueryKeys,
  type StudentResponseListFilters,
} from '../api/student-response-query-keys'

export function useStudentResponsesQuery(
  filters: StudentResponseListFilters = {},
) {
  return useQuery({
    queryKey: studentResponseQueryKeys.list(filters),
    queryFn: () => fetchStudentResponses(filters),
  })
}
