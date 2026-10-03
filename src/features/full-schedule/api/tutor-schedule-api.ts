import { httpClient } from '../../../shared/api/http-client'
import { tutorPortalPath } from '../../../shared/api/paths'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import {
  mapScheduleStatusFromApi,
  type ScheduleStatusUi,
} from '../../schedules/types/schedule'
import {
  formatHourPill,
  type TutorDaySession,
} from '../lib/map-tutor-day-sessions'

export type TutorPortalScheduleDto = {
  id: number
  program: number | null
  program_title: string | null
  program_background_color?: string | null
  program_text_color?: string | null
  classroom: number | null
  classroom_name: string | null
  student: number | null
  student_name: string | null
  student_group: number | null
  student_group_name: string | null
  description: string | null
  start_time: string
  end_time: string
  status: string
  status_text?: string
  is_overtime: boolean
}

const STATUS_FALLBACK: Record<
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

function jakartaHourFromIso(iso: string | null | undefined): number {
  if (!iso) return 0
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso))

  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0')
  const minute = Number(
    parts.find((part) => part.type === 'minute')?.value ?? '0',
  )
  if (Number.isNaN(hour) || Number.isNaN(minute)) return 0
  return hour + minute / 60
}

export function jakartaDateKeyFromIso(iso: string | null | undefined): string {
  if (!iso) return ''
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(iso))

  const year = parts.find((part) => part.type === 'year')?.value ?? ''
  const month = parts.find((part) => part.type === 'month')?.value ?? ''
  const day = parts.find((part) => part.type === 'day')?.value ?? ''
  if (!year || !month || !day) return ''
  return `${year}-${month}-${day}`
}

function formatJakartaClock(iso: string | null | undefined): string {
  if (!iso) return '—'
  return formatHourPill(jakartaHourFromIso(iso))
}

function paletteForRow(row: TutorPortalScheduleDto) {
  const status = mapScheduleStatusFromApi(row.status)
  const programBg = row.program_background_color?.trim()
  const programText = row.program_text_color?.trim()

  if (programBg) {
    return {
      background: programBg,
      text: programText || '#0F172A',
      accent: programBg,
      status,
    }
  }

  return { ...STATUS_FALLBACK[status], status }
}

export function mapTutorPortalSchedules(
  rows: TutorPortalScheduleDto[],
): TutorDaySession[] {
  return rows
    .filter((row) => Boolean(row.start_time) && Boolean(row.end_time))
    .map((row) => {
      const palette = paletteForRow(row)
      const subtitle =
        row.student_group_name?.trim() ||
        row.student_name?.trim() ||
        row.description?.trim() ||
        '—'

      return {
        id: String(row.id),
        tutorId: '',
        title: row.program_title?.trim() || row.description?.trim() || 'Class',
        subtitle,
        classroom: row.classroom_name?.trim() || '—',
        startTimeLabel: formatJakartaClock(row.start_time),
        endTimeLabel: formatJakartaClock(row.end_time),
        startAt: row.start_time,
        dateKey: jakartaDateKeyFromIso(row.start_time),
        startHour: jakartaHourFromIso(row.start_time),
        endHour: jakartaHourFromIso(row.end_time),
        status: palette.status,
        backgroundColor: palette.background,
        textColor: palette.text,
        accentColor: palette.accent,
      }
    })
    .sort(
      (a, b) => a.startAt.localeCompare(b.startAt) || a.startHour - b.startHour,
    )
}

export async function fetchTutorDaySchedules(
  date: string,
): Promise<TutorDaySession[]> {
  const { data } = await httpClient.get<
    ApiSuccessEnvelope<TutorPortalScheduleDto[]>
  >(tutorPortalPath('/schedules'), {
    params: { schedule_date: date, page_size: 100 },
  })

  return mapTutorPortalSchedules(data.data ?? [])
}

export async function fetchTutorSchedulesRange(
  start: string,
  end: string,
): Promise<TutorDaySession[]> {
  const { data } = await httpClient.get<
    ApiSuccessEnvelope<TutorPortalScheduleDto[]>
  >(tutorPortalPath('/schedules'), {
    params: { start, end, page_size: 100 },
  })

  return mapTutorPortalSchedules(data.data ?? [])
}
