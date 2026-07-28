import { useQuery } from '@tanstack/react-query'

import { fetchMarketings } from '../api/marketings-api'
import {
  marketingQueryKeys,
  type MarketingListFilters,
} from '../api/marketing-query-keys'

export function useMarketingsQuery(filters: MarketingListFilters = {}) {
  return useQuery({
    queryKey: marketingQueryKeys.list(filters),
    queryFn: () => fetchMarketings(filters),
  })
}
