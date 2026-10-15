import type { TutorDaySession } from './map-tutor-day-sessions'

export type TutorMonthDayMarker = {
  dateKey: string
  count: number
}

export function buildTutorMonthMarkers(
  sessions: TutorDaySession[],
): TutorMonthDayMarker[] {
  const byDay = new Map<string, TutorMonthDayMarker>()

  for (const session of sessions) {
    if (!session.dateKey || session.status === 'cancelled') continue
    const existing = byDay.get(session.dateKey)
    if (!existing) {
      byDay.set(session.dateKey, { dateKey: session.dateKey, count: 1 })
      continue
    }
    existing.count += 1
  }

  return [...byDay.values()]
}
