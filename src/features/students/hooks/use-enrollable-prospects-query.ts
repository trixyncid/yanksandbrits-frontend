import { useQuery } from '@tanstack/react-query'

import { prospectiveStudentQueryKeys } from '../../prospective-students/api/prospective-student-query-keys'
import { fetchEnrollableProspectOptions } from '../../prospective-students/api/prospective-students-api'

export function useEnrollableProspectsQuery(enabled = true) {
  return useQuery({
    queryKey: [...prospectiveStudentQueryKeys.all, 'enrollable'] as const,
    queryFn: fetchEnrollableProspectOptions,
    enabled,
  })
}
