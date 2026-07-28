import { useQuery } from '@tanstack/react-query'

import { fetchStudentGroups } from '../api/student-groups-api'
import {
  studentGroupQueryKeys,
  type StudentGroupListFilters,
} from '../api/student-group-query-keys'

export function useStudentGroupsQuery(filters: StudentGroupListFilters = {}) {
  return useQuery({
    queryKey: studentGroupQueryKeys.list(filters),
    queryFn: () => fetchStudentGroups(filters),
  })
}
