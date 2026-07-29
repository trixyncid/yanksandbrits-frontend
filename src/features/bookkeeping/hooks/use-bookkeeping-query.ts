import { useQuery } from '@tanstack/react-query'

import { fetchBookkeeping } from '../api/bookkeeping-api'
import {
  bookkeepingQueryKeys,
  type BookkeepingListFilters,
} from '../api/bookkeeping-query-keys'

export function useBookkeepingQuery(filters: BookkeepingListFilters = {}) {
  return useQuery({
    queryKey: bookkeepingQueryKeys.list(filters),
    queryFn: () => fetchBookkeeping(filters),
  })
}
