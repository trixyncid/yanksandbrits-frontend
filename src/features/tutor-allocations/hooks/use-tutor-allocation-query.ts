import { useQuery } from '@tanstack/react-query'

import { fetchTutorAllocation } from '../api/tutor-allocations-api'
import { tutorAllocationQueryKeys } from '../api/tutor-allocation-query-keys'

export function useTutorAllocationQuery(id: string) {
  return useQuery({
    queryKey: tutorAllocationQueryKeys.detail(id),
    queryFn: () => fetchTutorAllocation(id),
    enabled: Boolean(id),
  })
}
