import { useQuery } from '@tanstack/react-query'

import { fetchNewStudent } from '../api/new-students-api'
import { newStudentQueryKeys } from '../api/new-student-query-keys'

export function useNewStudentQuery(id: string) {
  return useQuery({
    queryKey: newStudentQueryKeys.detail(id),
    queryFn: () => fetchNewStudent(id),
    enabled: Boolean(id),
  })
}
