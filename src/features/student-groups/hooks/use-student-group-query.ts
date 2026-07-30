import { useQuery } from '@tanstack/react-query'

import { fetchStudentGroup } from '../api/student-groups-api'
import { studentGroupQueryKeys } from '../api/student-group-query-keys'

export function useStudentGroupQuery(id: string) {
  return useQuery({
    queryKey: studentGroupQueryKeys.detail(id),
    queryFn: () => fetchStudentGroup(id),
    enabled: Boolean(id),
  })
}
