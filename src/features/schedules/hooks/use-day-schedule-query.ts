import { useQuery } from '@tanstack/react-query'

import { fetchDaySchedule } from '../api/schedules-api'
import {
  scheduleQueryKeys,
  type DayScheduleFilters,
} from '../api/schedule-query-keys'

export function useDayScheduleQuery(filters: DayScheduleFilters | null) {
  return useQuery({
    queryKey: filters
      ? scheduleQueryKeys.day(filters)
      : scheduleQueryKeys.days(),
    queryFn: () => {
      if (!filters) {
        throw new Error('Day schedule filters are required')
      }
      return fetchDaySchedule(filters.date, filters.branchId)
    },
    enabled: Boolean(filters?.date && filters.branchId),
  })
}
