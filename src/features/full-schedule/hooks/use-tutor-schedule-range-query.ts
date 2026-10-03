import { useQuery } from '@tanstack/react-query'

import { fetchTutorSchedulesRange } from '../api/tutor-schedule-api'

export function useTutorScheduleRangeQuery(
  start: string | null,
  end: string | null,
) {
  return useQuery({
    queryKey: ['tutor-portal', 'schedules', 'range', start, end],
    queryFn: () => {
      if (!start || !end) {
        throw new Error('Schedule range is required')
      }
      return fetchTutorSchedulesRange(start, end)
    },
    enabled: Boolean(start && end),
  })
}
