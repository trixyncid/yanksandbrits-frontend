import { useQuery } from '@tanstack/react-query'

import { fetchNewStudents } from '../api/new-students-api'
import {
  newStudentQueryKeys,
  type NewStudentListFilters,
} from '../api/new-student-query-keys'

export function useNewStudentsQuery(filters: NewStudentListFilters = {}) {
  return useQuery({
    queryKey: newStudentQueryKeys.list(filters),
    queryFn: () => fetchNewStudents(filters),
  })
}
