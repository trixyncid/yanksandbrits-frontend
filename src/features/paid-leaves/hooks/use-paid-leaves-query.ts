import { useQuery } from '@tanstack/react-query'

import { fetchPaidLeaves } from '../api/paid-leaves-api'
import {
  paidLeaveQueryKeys,
  type PaidLeaveListFilters,
} from '../api/paid-leave-query-keys'

export function usePaidLeavesQuery(filters: PaidLeaveListFilters = {}) {
  return useQuery({
    queryKey: paidLeaveQueryKeys.list(filters),
    queryFn: () => fetchPaidLeaves(filters),
  })
}
