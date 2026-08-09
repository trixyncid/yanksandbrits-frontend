import { useQuery } from '@tanstack/react-query'

import { fetchFilteredPrograms } from '../api/programs-api'
import {
  programQueryKeys,
  type ProgramFilteredFilters,
} from '../api/program-query-keys'

export function useFilteredProgramsQuery(
  filters: ProgramFilteredFilters,
  enabled = true,
) {
  const studentId = filters.studentId?.trim() || undefined
  const studentGroupId = filters.studentGroupId?.trim() || undefined
  const hasParticipant = Boolean(studentId || studentGroupId)

  return useQuery({
    queryKey: programQueryKeys.filtered({ studentId, studentGroupId }),
    queryFn: () =>
      fetchFilteredPrograms({
        studentId,
        studentGroupId,
      }),
    enabled: enabled && hasParticipant,
  })
}
