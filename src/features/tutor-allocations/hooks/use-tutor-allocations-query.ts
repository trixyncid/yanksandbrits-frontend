import { useQuery } from '@tanstack/react-query'

import {
  fetchEligibleStudents,
  fetchTutorAllocations,
} from '../api/tutor-allocations-api'
import { tutorAllocationQueryKeys } from '../api/tutor-allocation-query-keys'
import type { TutorAllocationClassType } from '../types/tutor-allocation'

export function useTutorAllocationsQuery() {
  return useQuery({
    queryKey: tutorAllocationQueryKeys.list(),
    queryFn: fetchTutorAllocations,
  })
}

export function useEligibleStudentsQuery(
  program: string,
  classType: TutorAllocationClassType,
  allocationId?: string,
) {
  return useQuery({
    queryKey: tutorAllocationQueryKeys.eligibleStudents(program, classType, allocationId),
    queryFn: () => fetchEligibleStudents(program, classType, allocationId),
    enabled: Boolean(program),
  })
}
