export type DayScheduleFilters = {
  date: string
  branchId: string
}

export const scheduleQueryKeys = {
  all: ['schedules'] as const,
  days: () => [...scheduleQueryKeys.all, 'day'] as const,
  day: (filters: DayScheduleFilters) =>
    [...scheduleQueryKeys.days(), filters] as const,
  details: () => [...scheduleQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...scheduleQueryKeys.details(), id] as const,
}
