import { useQuery } from '@tanstack/react-query'

import { fetchProspectiveStudent } from '../api/prospective-students-api'
import { prospectiveStudentQueryKeys } from '../api/prospective-student-query-keys'

export function useProspectiveStudentQuery(id: string) {
  return useQuery({
    queryKey: prospectiveStudentQueryKeys.detail(id),
    queryFn: () => fetchProspectiveStudent(id),
    enabled: Boolean(id),
  })
}
