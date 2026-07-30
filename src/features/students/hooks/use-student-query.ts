import { useQuery } from '@tanstack/react-query'

import { fetchStudent } from '../api/students-api'
import { studentQueryKeys } from '../api/student-query-keys'

export function useStudentQuery(id: string) {
  return useQuery({
    queryKey: studentQueryKeys.detail(id),
    queryFn: () => fetchStudent(id),
    enabled: Boolean(id),
  })
}
