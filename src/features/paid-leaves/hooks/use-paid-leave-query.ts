import { useQuery } from '@tanstack/react-query'

import { fetchPaidLeave } from '../api/paid-leaves-api'
import { paidLeaveQueryKeys } from '../api/paid-leave-query-keys'

export function usePaidLeaveQuery(id: string) {
  return useQuery({
    queryKey: paidLeaveQueryKeys.detail(id),
    queryFn: () => fetchPaidLeave(id),
    enabled: Boolean(id),
  })
}
