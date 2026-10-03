import type { DayScheduleRow } from '../../schedules/api/schedules-api'
import { splitScheduleDateTime } from '../../schedules/api/schedules-api'
import {
  mapScheduleStatusFromApi,
  type ScheduleStatusUi,
} from '../../schedules/types/schedule'

export type TutorDaySession = {
  id: string
  tutorId: string
  title: string
  subtitle: string
  classroom: string
  startTimeLabel: string
  endTimeLabel: string
  /** ISO start timestamp for ordering / “upcoming” filters. */
  startAt: string
  /** Calendar day key in Asia/Jakarta (`yyyy-MM-dd`). */
  dateKey: string
  startHour: number
  endHour: number
  status: ScheduleStatusUi
  backgroundColor: string
  textColor: string
  accentColor: string
}

const STATUS_PALETTE: Record<
  ScheduleStatusUi,
  { background: string; text: string; accent: string }
> = {
  ongoing: {
    background: '#E8EEFF',
    text: '#1B2A5A',
    accent: '#253CA1',
  },
  finished: {
    background: '#E8F7EF',
    text: '#1F5A3D',
    accent: '#3D9B6E',
  },
  cancelled: {
    background: '#FCEEF1',
    text: '#6E2433',
    accent: '#C45B6E',
  },
}

const PROGRAM_FALLBACKS = [
  { background: '#FCE8F0', text: '#6B2140', accent: '#D45B8C' },
  { background: '#EDE8FF', text: '#3B2A7A', accent: '#6B5BD4' },
  { background: '#E5F4FF', text: '#1A4A6B', accent: '#3D9BD4' },
  { background: '#E6F7F0', text: '#1F5A3D', accent: '#3D9B6E' },
  { background: '#FFF3E5', text: '#7A4A1A', accent: '#E09A3D' },
] as const

function hourFromIso(iso: string | null): number {
  if (!iso) return 0
  const date = new Date(iso)
  return date.getHours() + date.getMinutes() / 60
}

function formatClock(iso: string | null): string {
  if (!iso) return '—'
  const { time } = splitScheduleDateTime(iso)
  if (!time) return '—'
  const [hoursRaw, minutes] = time.split(':')
  const hours = Number(hoursRaw)
  if (Number.isNaN(hours)) return time
  const period = hours >= 12 ? 'pm' : 'am'
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${String(hour12).padStart(2, '0')}:${minutes} ${period}`
}

function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return hex
  const r = Number.parseInt(normalized.slice(0, 2), 16)
  const g = Number.parseInt(normalized.slice(2, 4), 16)
  const b = Number.parseInt(normalized.slice(4, 6), 16)
  if ([r, g, b].some((channel) => Number.isNaN(channel))) return hex
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function paletteForRow(row: DayScheduleRow, index: number) {
  const status = mapScheduleStatusFromApi(row.status)
  const programBg = row.program_background_color?.trim()
  const programText = row.program_text_color?.trim()

  if (programBg) {
    return {
      background: withAlpha(programBg, 0.18),
      text: programText || '#1E293B',
      accent: programBg,
      status,
    }
  }

  if (status === 'cancelled' || status === 'finished') {
    return { ...STATUS_PALETTE[status], status }
  }

  const fallback = PROGRAM_FALLBACKS[index % PROGRAM_FALLBACKS.length]!
  return { ...fallback, status }
}

export function mapTutorDaySessions(
  rows: DayScheduleRow[],
  tutorUserId: number | string,
): TutorDaySession[] {
  const tutorKey = String(tutorUserId)

  return rows
    .filter(
      (row) =>
        row.tutor_id != null &&
        String(row.tutor_id) === tutorKey &&
        Boolean(row.start_time) &&
        Boolean(row.end_time),
    )
    .map((row, index) => {
      const palette = paletteForRow(row, index)
      const subtitle =
        row.student_group?.trim() ||
        row.student?.trim() ||
        (row.participants?.length
          ? `${row.participants.length} students`
          : row.description?.trim()) ||
        '—'

      return {
        id: String(row.id),
        tutorId: String(row.tutor_id),
        title: row.program?.trim() || row.description?.trim() || 'Class',
        subtitle,
        classroom: row.classroom?.trim() || '—',
        startTimeLabel: formatClock(row.start_time),
        endTimeLabel: formatClock(row.end_time),
        startAt: row.start_time ?? '',
        dateKey: row.start_time
          ? row.start_time.slice(0, 10)
          : '',
        startHour: hourFromIso(row.start_time),
        endHour: hourFromIso(row.end_time),
        status: palette.status,
        backgroundColor: palette.background,
        textColor: palette.text,
        accentColor: palette.accent,
      }
    })
    .sort((a, b) => a.startHour - b.startHour)
}

/** Weekday / Sunday operating hours. Saturday closes earlier. */
export const TUTOR_WEEKDAY_START_HOUR = 9
export const TUTOR_WEEKDAY_END_HOUR = 20
export const TUTOR_SATURDAY_START_HOUR = 9
export const TUTOR_SATURDAY_END_HOUR = 15

export function getTutorDayHours(date: Date): { startHour: number; endHour: number } {
  const isSaturday = date.getDay() === 6
  if (isSaturday) {
    return {
      startHour: TUTOR_SATURDAY_START_HOUR,
      endHour: TUTOR_SATURDAY_END_HOUR,
    }
  }
  return {
    startHour: TUTOR_WEEKDAY_START_HOUR,
    endHour: TUTOR_WEEKDAY_END_HOUR,
  }
}

export function buildTutorTimeMarkers(date: Date): number[] {
  const { startHour, endHour } = getTutorDayHours(date)
  return Array.from(
    { length: endHour - startHour + 1 },
    (_, index) => startHour + index,
  )
}

export function formatHourPill(hour: number): string {
  const whole = Math.floor(hour)
  const minutes = Math.round((hour - whole) * 60)
  const period = whole >= 12 ? 'pm' : 'am'
  const hour12 = whole % 12 === 0 ? 12 : whole % 12
  return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`
}

export function formatTutorHoursLabel(date: Date): string {
  const { startHour, endHour } = getTutorDayHours(date)
  return `${formatHourPill(startHour)} – ${formatHourPill(endHour)}`
}
