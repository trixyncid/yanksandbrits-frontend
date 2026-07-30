import { useQuery } from '@tanstack/react-query'

import { fetchBrandOptions } from '../api/branches-api'
import { brandQueryKeys } from '../api/branch-query-keys'

export function useBrandOptionsQuery() {
  return useQuery({
    queryKey: brandQueryKeys.options(),
    queryFn: fetchBrandOptions,
  })
}
