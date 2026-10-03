import { useQuery } from '@tanstack/react-query'

import { fetchTutorDaySchedules } from '../api/tutor-schedule-api'

export function useTutorDayScheduleQuery(date: string | null) {
  return useQuery({
    queryKey: ['tutor-portal', 'schedules', 'day', date],
    queryFn: () => {
      if (!date) {
        throw new Error('Schedule date is required')
      }
      return fetchTutorDaySchedules(date)
    },
    enabled: Boolean(date),
  })
}
