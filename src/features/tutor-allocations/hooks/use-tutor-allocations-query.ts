import { useQuery } from '@tanstack/react-query'

import { fetchTutorAllocations } from '../api/tutor-allocations-api'
import { tutorAllocationQueryKeys } from '../api/tutor-allocation-query-keys'

export function useTutorAllocationsQuery() {
  return useQuery({
    queryKey: tutorAllocationQueryKeys.list(),
    queryFn: fetchTutorAllocations,
  })
}
