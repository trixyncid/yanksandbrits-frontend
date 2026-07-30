import { useQuery } from '@tanstack/react-query'

import { fetchBranch } from '../api/branches-api'
import { branchQueryKeys } from '../api/branch-query-keys'

export function useBranchQuery(id: string) {
  return useQuery({
    queryKey: branchQueryKeys.detail(id),
    queryFn: () => fetchBranch(id),
    enabled: Boolean(id),
  })
}
