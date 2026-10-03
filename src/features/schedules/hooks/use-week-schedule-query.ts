import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import { fetchDaySchedule } from '../api/schedules-api'
import { scheduleQueryKeys } from '../api/schedule-query-keys'
import {
  mapDayRowsToWeekEvents,
  weekDateKeys,
  type WeekScheduleEvent,
} from '../lib/map-week-schedule-events'

export type WeekScheduleQueryResult = {
  events: WeekScheduleEvent[]
  dateKeys: string[]
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  isSuccess: boolean
  refetch: () => void
}

export function useWeekScheduleQuery(
  weekStart: string | null,
  branchId: string | null,
): WeekScheduleQueryResult {
  const dateKeys = useMemo(
    () => (weekStart ? weekDateKeys(weekStart) : []),
    [weekStart],
  )

  const queries = useQueries({
    queries: dateKeys.map((date) => ({
      queryKey: scheduleQueryKeys.day({
        date,
        branchId: branchId ?? '',
      }),
      queryFn: () => fetchDaySchedule(date, branchId!),
      enabled: Boolean(weekStart && branchId),
    })),
  })

  const dataFingerprint = queries
    .map((query) => `${query.dataUpdatedAt}:${query.status}`)
    .join('|')

  const events = useMemo(() => {
    const merged: WeekScheduleEvent[] = []
    queries.forEach((query, index) => {
      const dateKey = dateKeys[index]
      if (!dateKey || !query.data?.rows) return
      merged.push(...mapDayRowsToWeekEvents(query.data.rows, dateKey))
    })
    return merged
    // Fingerprint tracks data/status changes without depending on the queries array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKeys, dataFingerprint])

  const isLoading = queries.some((query) => query.isLoading)
  const isFetching = queries.some((query) => query.isFetching)
  const isError = queries.some((query) => query.isError)
  const isSuccess =
    dateKeys.length > 0 &&
    queries.length === dateKeys.length &&
    queries.every((query) => query.isSuccess)

  return {
    events,
    dateKeys,
    isLoading,
    isFetching,
    isError,
    isSuccess,
    refetch: () => {
      for (const query of queries) {
        void query.refetch()
      }
    },
  }
}
