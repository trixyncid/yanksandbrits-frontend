import { useQuery } from '@tanstack/react-query'

import {
  fetchBookkeeping,
  fetchBookkeepingItem,
  fetchBookkeepingMarketingSalaries,
  fetchBookkeepingTutorSalaries,
} from '../api/bookkeeping-api'
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

export function useBookkeepingItemQuery(id: string) {
  return useQuery({
    queryKey: bookkeepingQueryKeys.detail(id),
    queryFn: () => fetchBookkeepingItem(id),
    enabled: Boolean(id),
  })
}

export function useBookkeepingTutorSalariesQuery(id: string) {
  return useQuery({
    queryKey: bookkeepingQueryKeys.tutorSalaries(id),
    queryFn: () => fetchBookkeepingTutorSalaries(id),
    enabled: Boolean(id),
  })
}

export function useBookkeepingMarketingSalariesQuery(id: string) {
  return useQuery({
    queryKey: bookkeepingQueryKeys.marketingSalaries(id),
    queryFn: () => fetchBookkeepingMarketingSalaries(id),
    enabled: Boolean(id),
  })
}
