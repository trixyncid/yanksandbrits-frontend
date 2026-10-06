export const SCHEDULE_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

export type ScheduleDay = (typeof SCHEDULE_DAYS)[number]

export const SESSIONS_PER_WEEK_OPTIONS = [
  { value: '1', label: '1x' },
  { value: '2', label: '2x' },
  { value: '3', label: '3x' },
  { value: '4_6', label: '4-6x' },
] as const

export type SessionsPerWeek =
  (typeof SESSIONS_PER_WEEK_OPTIONS)[number]['value']

const WEEKDAY_SLOTS = [
  { code: '09_11', label: '9-11 am' },
  { code: '11_13', label: '11-1 pm' },
  { code: '14_16', label: '2-4 pm' },
  { code: '16_18', label: '4-6 pm' },
  { code: '18_20', label: '6-8 pm' },
  { code: '18_15_20_15', label: '6.15-8.15 pm' },
] as const

const SATURDAY_SLOTS = [
  { code: '09_11', label: '9-11 am' },
  { code: '11_13', label: '11-1 pm' },
  { code: '13_15', label: '1-3 pm' },
] as const

export type ScheduleSlotCode =
  | (typeof WEEKDAY_SLOTS)[number]['code']
  | (typeof SATURDAY_SLOTS)[number]['code']

export type ScheduleAvailability = Record<ScheduleDay, ScheduleSlotCode[]>

const DAY_LABELS: Record<ScheduleDay, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
}

export function emptyScheduleAvailability(): ScheduleAvailability {
  return {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  }
}

export function slotsForDay(day: ScheduleDay) {
  return day === 'saturday' ? SATURDAY_SLOTS : WEEKDAY_SLOTS
}

export function scheduleDayLabel(day: ScheduleDay) {
  return DAY_LABELS[day]
}

export function sessionsPerWeekLabel(value: string) {
  return (
    SESSIONS_PER_WEEK_OPTIONS.find((option) => option.value === value)?.label ??
    value
  )
}

export function scheduleSlotLabel(day: ScheduleDay, code: string) {
  return slotsForDay(day).find((slot) => slot.code === code)?.label ?? code
}

export function scheduleHasSlots(availability: ScheduleAvailability) {
  return SCHEDULE_DAYS.some((day) => availability[day].length > 0)
}

export function setScheduleSlot(
  availability: ScheduleAvailability,
  day: ScheduleDay,
  slot: ScheduleSlotCode,
  checked: boolean,
): ScheduleAvailability {
  const allowed = slotsForDay(day).map((item) => item.code)
  const next = new Set(availability[day])
  if (checked) {
    next.add(slot)
  } else {
    next.delete(slot)
  }
  return {
    ...availability,
    [day]: allowed.filter((code) => next.has(code)),
  }
}

export function scheduleAvailabilityFromApi(
  value: unknown,
): ScheduleAvailability {
  const availability = emptyScheduleAvailability()
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return availability
  }
  const record = value as Record<string, unknown>
  for (const day of SCHEDULE_DAYS) {
    const slots = record[day]
    if (!Array.isArray(slots)) {
      continue
    }
    const allowed = slotsForDay(day).map((item) => item.code)
    availability[day] = allowed.filter((code) => slots.includes(code))
  }
  return availability
}
