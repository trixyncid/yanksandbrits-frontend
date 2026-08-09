import { useQuery } from '@tanstack/react-query'

import { fetchProspectiveStudents } from '../api/prospective-students-api'
import {
  prospectiveStudentQueryKeys,
  type ProspectiveStudentListFilters,
} from '../api/prospective-student-query-keys'

export function useProspectiveStudentsQuery(filters: ProspectiveStudentListFilters = {}) {
  return useQuery({
    queryKey: prospectiveStudentQueryKeys.list(filters),
    queryFn: () => fetchProspectiveStudents(filters),
  })
}
