import { format, isSameDay, startOfDay } from 'date-fns'

import type { TutorDaySession } from './map-tutor-day-sessions'

/**
 * Selected day → that day's classes.
 * Today → remaining from now (selected day first), then fill from later days
 * in `rangeSessions` up to `limit`.
 */
export function sessionsForUpcomingPanel(
  daySessions: TutorDaySession[],
  selectedDate: Date,
  rangeSessions: TutorDaySession[] = [],
  limit = 5,
  // Compare instants: API times carry +07:00, so string compare against a UTC ISO is wrong.
  nowMs = Date.now(),
): TutorDaySession[] {
  const today = startOfDay(new Date())
  const selected = startOfDay(selectedDate)

  if (!isSameDay(selected, today)) {
    return daySessions.slice(0, limit)
  }

  const remainingToday = daySessions.filter(
    (session) =>
      session.status !== 'cancelled' &&
      session.status !== 'finished' &&
      Date.parse(session.startAt) >= nowMs,
  )

  if (remainingToday.length >= limit) {
    return remainingToday.slice(0, limit)
  }

  const todayKey = format(today, 'yyyy-MM-dd')
  const later = rangeSessions.filter(
    (session) =>
      session.dateKey > todayKey &&
      session.status !== 'cancelled' &&
      session.status !== 'finished' &&
      Date.parse(session.startAt) >= nowMs,
  )

  const merged = [...remainingToday]
  for (const session of later) {
    if (merged.length >= limit) break
    if (merged.some((item) => item.id === session.id)) continue
    merged.push(session)
  }

  if (merged.length > 0) return merged

  return daySessions
    .filter((session) => session.status !== 'cancelled')
    .slice(0, limit)
}
