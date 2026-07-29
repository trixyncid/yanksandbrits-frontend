import { useQuery } from '@tanstack/react-query'

import { fetchBranches } from '../api/branches-api'
import {
  branchQueryKeys,
  type BranchListFilters,
} from '../api/branch-query-keys'

export function useBranchesQuery(filters: BranchListFilters = {}) {
  return useQuery({
    queryKey: branchQueryKeys.list(filters),
    queryFn: () => fetchBranches(filters),
  })
}
