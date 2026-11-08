import type { ScheduleSession } from '../api/student-schedule-api'

export type ScheduleDay = {
  key: string
  /** "Today", "Tomorrow", "Yesterday" or the weekday. */
  label: string
  dateLabel: string
  sessions: ScheduleSession[]
}

export type ScheduleBucket = {
  key: string
  label: string
  days: ScheduleDay[]
}

function dayKey(value: Date) {
  return `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function daysBetween(from: Date, to: Date) {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000)
}

const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' })
const dateOnly = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' })
const timeOnly = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })

export function formatTimeRange(session: ScheduleSession) {
  return `${timeOnly.format(new Date(session.start))}–${timeOnly.format(new Date(session.end))}`
}

function relativeLabel(offset: number, date: Date) {
  if (offset === 0) return 'Today'
  if (offset === 1) return 'Tomorrow'
  if (offset === -1) return 'Yesterday'
  return weekday.format(date)
}

function bucketFor(offset: number, upcoming: boolean) {
  if (upcoming) {
    if (offset <= 1) return { key: 'soon', label: '' }
    if (offset <= 7) return { key: 'week', label: 'Next 7 days' }
    return { key: 'later', label: 'Later' }
  }
  if (offset >= -7) return { key: 'week', label: 'Last 7 days' }
  return { key: 'earlier', label: 'Earlier' }
}

/** Groups sessions into day cards inside Today/Tomorrow, the next week, then later. */
export function groupSessionsByDay(
  sessions: ScheduleSession[],
  upcoming: boolean,
  now = new Date(),
): ScheduleBucket[] {
  const buckets: ScheduleBucket[] = []
  for (const session of sessions) {
    const start = new Date(session.start)
    const offset = daysBetween(now, start)
    const target = bucketFor(offset, upcoming)
    let bucket = buckets.find((item) => item.key === target.key)
    if (!bucket) {
      bucket = { ...target, days: [] }
      buckets.push(bucket)
    }
    const key = dayKey(start)
    let day = bucket.days.find((item) => item.key === key)
    if (!day) {
      day = {
        key,
        label: relativeLabel(offset, start),
        dateLabel: dateOnly.format(start),
        sessions: [],
      }
      bucket.days.push(day)
    }
    day.sessions.push(session)
  }
  return buckets
}

/** Plain text a counsellor can paste into a chat with a parent. */
export function buildCopyText(
  sessions: ScheduleSession[],
  studentName: string | null,
) {
  const upcoming = sessions.filter((session) => session.status === 'ongoing')
  const title = studentName ? `${studentName}'s upcoming classes` : 'Upcoming classes'
  if (upcoming.length === 0) return `${title}: none booked yet.`
  const lines = upcoming.map((session) => {
    const start = new Date(session.start)
    const who = studentName
      ? ''
      : ` (${session.myStudents.map((student) => student.name).join(', ')})`
    const tutor = session.tutor ? ` with ${session.tutor}` : ''
    const room = session.classroom ? `, ${session.classroom}` : ''
    return `• ${weekday.format(start)} ${dateOnly.format(start)}, ${formatTimeRange(session)}: ${session.program || 'Class'}${tutor}${room}${who}`
  })
  return [`${title}:`, ...lines].join('\n')
}
