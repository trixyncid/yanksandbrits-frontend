import { useQuery } from '@tanstack/react-query'

import { fetchStudents } from '../api/students-api'
import {
  studentQueryKeys,
  type StudentListFilters,
} from '../api/student-query-keys'

export function useStudentsQuery(filters: StudentListFilters = {}) {
  return useQuery({
    queryKey: studentQueryKeys.list(filters),
    queryFn: () => fetchStudents(filters),
  })
}
