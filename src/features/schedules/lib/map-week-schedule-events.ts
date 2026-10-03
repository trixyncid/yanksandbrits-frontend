import { addDays, format, parseISO } from 'date-fns'

import type { TimetableEvent, TimetableTone } from '../../../shared/components/timetable'
import { toneFromScheduleStatus } from '../../../shared/components/timetable'
import { formatHourLabel } from '../../../shared/components/timetable/utils'
import type { DayScheduleRow } from '../api/schedules-api'
import {
  mapScheduleStatusFromApi,
  type ScheduleStatusUi,
} from '../types/schedule'

const STATUS_LABEL: Record<ScheduleStatusUi, string> = {
  ongoing: 'ONGOING',
  finished: 'FINISHED',
  cancelled: 'CANCELLED',
}

export type WeekScheduleEvent = {
  id: string
  dateKey: string
  classroomId: string
  title: string
  subtitle: string
  startHour: number
  durationHours: number
  startLabel: string
  classroom: string
  tutor: string
  searchText: string
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  tone: TimetableTone
  status: string
  statusKey: ScheduleStatusUi
  programId: number | null
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

function withAlpha(hex: string, alphaHex: string) {
  const normalized = hex.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
    return `${normalized}${alphaHex}`
  }
  return normalized
}

function paletteForRow(row: DayScheduleRow) {
  const programBg = row.program_background_color?.trim()
  const programText = row.program_text_color?.trim()
  if (!programBg) {
    return null
  }
  return {
    background: programBg,
    text: programText || '#0F172A',
    border: withAlpha(programText || programBg, '40'),
  }
}

/** Monday–Sunday date keys for a week starting on `weekStart` (yyyy-MM-dd). */
export function weekDateKeys(weekStart: string): string[] {
  const start = parseISO(weekStart)
  return Array.from({ length: 7 }, (_, index) =>
    format(addDays(start, index), 'yyyy-MM-dd'),
  )
}

export function mapDayRowsToWeekEvents(
  rows: DayScheduleRow[],
  dateKey: string,
): WeekScheduleEvent[] {
  return rows
    .filter(
      (row) =>
        row.classroom_id != null &&
        Boolean(row.start_time) &&
        Boolean(row.end_time),
    )
    .map((row) => {
      const startHour = jakartaHourFromIso(row.start_time)
      const endHour = jakartaHourFromIso(row.end_time)
      const status = mapScheduleStatusFromApi(row.status)
      const palette = paletteForRow(row)
      const title =
        row.student_group ||
        row.student ||
        row.tutor ||
        row.description ||
        'Class'
      const program = row.program?.trim() || row.description?.trim() || ''
      const classroom = row.classroom ?? ''
      const tutor = row.tutor?.trim() ?? ''
      const subtitle =
        [program, tutor && tutor !== title ? tutor : null]
          .filter(Boolean)
          .join(' · ') || '—'
      const classroomId = String(row.classroom_id)

      return {
        id: String(row.id),
        dateKey,
        classroomId,
        title,
        subtitle,
        startHour,
        durationHours: Math.max(endHour - startHour, 0.5),
        startLabel: formatHourLabel(startHour),
        classroom,
        tutor,
        searchText: [
          title,
          subtitle,
          classroom,
          tutor,
          row.student ?? '',
          row.student_group ?? '',
          row.description ?? '',
          STATUS_LABEL[status],
        ]
          .join(' ')
          .toLowerCase(),
        backgroundColor: palette?.background,
        textColor: palette?.text,
        borderColor: palette?.border,
        tone: toneFromScheduleStatus(status),
        status: STATUS_LABEL[status],
        statusKey: status,
        programId: row.program_id,
      }
    })
}

export function weekEventToTimetableEvent(
  event: WeekScheduleEvent,
): TimetableEvent {
  return {
    id: event.id,
    columnId: event.classroomId,
    title: event.title,
    subtitle: event.subtitle,
    startHour: event.startHour,
    durationHours: event.durationHours,
    tone: event.tone,
    backgroundColor: event.backgroundColor,
    textColor: event.textColor,
    status: event.status,
    meta: event.classroom || event.tutor || undefined,
  }
}

/** Pack overlapping events into lanes within a day column. */
export function packEventLanes(events: WeekScheduleEvent[]): Array<
  WeekScheduleEvent & { lane: number; laneCount: number }
> {
  const sorted = [...events].sort((a, b) => {
    if (a.startHour !== b.startHour) return a.startHour - b.startHour
    return b.durationHours - a.durationHours
  })

  const laneEnds: number[] = []
  const placed: Array<WeekScheduleEvent & { lane: number }> = []

  for (const event of sorted) {
    const end = event.startHour + event.durationHours
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= event.startHour + 0.01)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(end)
    } else {
      laneEnds[lane] = end
    }
    placed.push({ ...event, lane })
  }

  // Cluster overlapping groups so laneCount is local to each cluster.
  const result: Array<WeekScheduleEvent & { lane: number; laneCount: number }> =
    []
  let cluster: typeof placed = []
  let clusterEnd = -Infinity

  function flushCluster() {
    if (cluster.length === 0) return
    const laneCount = Math.max(...cluster.map((item) => item.lane)) + 1
    for (const item of cluster) {
      result.push({ ...item, laneCount })
    }
    cluster = []
    clusterEnd = -Infinity
  }

  for (const item of placed) {
    const itemEnd = item.startHour + item.durationHours
    if (cluster.length > 0 && item.startHour >= clusterEnd - 0.01) {
      flushCluster()
    }
    cluster.push(item)
    clusterEnd = Math.max(clusterEnd, itemEnd)
  }
  flushCluster()

  return result
}
