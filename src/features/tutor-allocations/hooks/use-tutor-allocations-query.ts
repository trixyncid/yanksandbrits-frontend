import { useQuery } from '@tanstack/react-query'

import {
  fetchEligibleStudents,
  fetchTutorAllocations,
} from '../api/tutor-allocations-api'
import { tutorAllocationQueryKeys } from '../api/tutor-allocation-query-keys'

export function useTutorAllocationsQuery() {
  return useQuery({
    queryKey: tutorAllocationQueryKeys.list(),
    queryFn: fetchTutorAllocations,
  })
}

export function useEligibleStudentsQuery(program: string) {
  return useQuery({
    queryKey: tutorAllocationQueryKeys.eligibleStudents(program),
    queryFn: () => fetchEligibleStudents(program),
    enabled: Boolean(program),
  })
}
