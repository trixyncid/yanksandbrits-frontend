import { httpClient } from '../../../shared/api/http-client'
import { adminPath } from '../../../shared/api/paths'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import type {
  TimetableColumn,
  TimetableEvent,
} from '../../../shared/components/timetable'
import { toneFromScheduleStatus } from '../../../shared/components/timetable'
import { fetchClassrooms } from '../../classrooms/api/classrooms-api'
import type {
  ScheduleDetail,
  ScheduleFormValues,
  ScheduleStatusUi,
} from '../types/schedule'
import {
  mapScheduleStatusFromApi,
  mapScheduleStatusToApi,
} from '../types/schedule'

export type DayScheduleRow = {
  id: number
  program_id: number | null
  program: string | null
  program_background_color?: string | null
  program_text_color?: string | null
  classroom_id: number | null
  classroom: string | null
  tutor_id: number | null
  tutor: string | null
  student_id: number | null
  student: string | null
  student_group_id: number | null
  student_group: string | null
  participants: { id: number; pin: string; full_name: string }[]
  start_time: string | null
  end_time: string | null
  status: string
  is_overtime: boolean
  description: string | null
}

export type DayScheduleResult = {
  rows: DayScheduleRow[]
  columns: TimetableColumn[]
  events: TimetableEvent[]
  stats: {
    sessionCount: number
    tutorCount: number
    classroomCount: number
  }
}

type ClassScheduleDetailDto = {
  id: number
  program: number | null
  classroom: number | null
  tutor: number | null
  student: number | null
  student_group: number | null
  description: string | null
  start_time: string
  end_time: string
  status: string
}

const STATUS_LABEL: Record<ScheduleStatusUi, string> = {
  ongoing: 'ONGOING',
  finished: 'FINISHED',
  cancelled: 'CANCELLED',
}

function hourFromIso(iso: string | null): number {
  if (!iso) return 0
  const date = new Date(iso)
  return date.getHours() + date.getMinutes() / 60
}

function pad2(value: number) {
  return String(value).padStart(2, '0')
}

/** Build Asia/Jakarta ISO datetime from local date + HH:mm. */
export function toScheduleDateTime(date: string, time: string) {
  return `${date}T${time}:00+07:00`
}

export function splitScheduleDateTime(iso: string): {
  date: string
  time: string
} {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) {
    return { date: '', time: '' }
  }

  // Format in Asia/Jakarta so edit form matches day board.
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(parsed)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`,
  }
}

function mapDayRows(
  rows: DayScheduleRow[],
  classroomColumns: TimetableColumn[] = [],
): {
  columns: TimetableColumn[]
  events: TimetableEvent[]
  stats: DayScheduleResult['stats']
} {
  const columnMap = new Map<string, TimetableColumn>()
  const tutorIds = new Set<string>()

  for (const column of classroomColumns) {
    columnMap.set(column.id, column)
  }

  for (const row of rows) {
    if (row.classroom_id == null) continue
    const columnId = String(row.classroom_id)
    if (!columnMap.has(columnId)) {
      columnMap.set(columnId, {
        id: columnId,
        label: row.classroom ?? `Classroom ${columnId}`,
      })
    }
    if (row.tutor_id != null) {
      tutorIds.add(String(row.tutor_id))
    }
  }

  const columns = [...columnMap.values()].sort((a, b) =>
    a.label.localeCompare(b.label),
  )

  const events: TimetableEvent[] = rows
    .filter((row) => row.classroom_id != null && row.start_time && row.end_time)
    .map((row) => {
      const columnId = String(row.classroom_id)
      const startHour = hourFromIso(row.start_time)
      const endHour = hourFromIso(row.end_time)
      const title =
        row.student_group ||
        row.student ||
        row.tutor ||
        row.description ||
        'Class'
      const participantCount = row.participants?.length ?? 0

      const status = mapScheduleStatusFromApi(row.status)
      const backgroundColor = row.program_background_color?.trim() || undefined
      const textColor = row.program_text_color?.trim() || undefined

      return {
        id: String(row.id),
        columnId,
        title,
        subtitle: row.program ?? row.description ?? '—',
        startHour,
        durationHours: Math.max(endHour - startHour, 0.5),
        tone: toneFromScheduleStatus(status),
        backgroundColor,
        textColor,
        status: STATUS_LABEL[status],
        meta:
          participantCount > 0
            ? `${participantCount} students`
            : row.tutor
              ? `Tutor: ${row.tutor}`
              : undefined,
      }
    })

  return {
    columns,
    events,
    stats: {
      sessionCount: rows.length,
      tutorCount: tutorIds.size,
      classroomCount: columnMap.size,
    },
  }
}

function mapScheduleDetail(dto: ClassScheduleDetailDto): ScheduleDetail {
  return {
    id: String(dto.id),
    programId: dto.program == null ? null : String(dto.program),
    classroomId: dto.classroom == null ? null : String(dto.classroom),
    tutorId: dto.tutor == null ? null : String(dto.tutor),
    studentId: dto.student == null ? null : String(dto.student),
    studentGroupId:
      dto.student_group == null ? null : String(dto.student_group),
    description: dto.description ?? '',
    startTime: dto.start_time,
    endTime: dto.end_time,
    status: mapScheduleStatusFromApi(dto.status),
  }
}

function toWritePayload(values: ScheduleFormValues) {
  return {
    program: Number(values.programId),
    classroom: Number(values.classroomId),
    tutor: values.tutorId ? Number(values.tutorId) : null,
    student:
      values.participantType === 'student' && values.studentId
        ? Number(values.studentId)
        : null,
    student_group:
      values.participantType === 'group' && values.studentGroupId
        ? Number(values.studentGroupId)
        : null,
    description: values.description.trim() || null,
    start_time: toScheduleDateTime(values.date, values.startTime),
    end_time: toScheduleDateTime(values.date, values.endTime),
    status: mapScheduleStatusToApi(values.status),
  }
}

export async function fetchDaySchedule(
  date: string,
  branchId: string,
): Promise<DayScheduleResult> {
  const [scheduleResponse, classrooms] = await Promise.all([
    httpClient.get<ApiSuccessEnvelope<DayScheduleRow[]>>(
      adminPath('/class-schedules/day'),
      {
        params: {
          schedule_date: date,
          branch: branchId ? Number(branchId) : undefined,
        },
      },
    ),
    fetchClassrooms({
      branchId,
      isActive: 'active',
    }),
  ])

  const rows = scheduleResponse.data.data ?? []
  const classroomColumns: TimetableColumn[] = classrooms.data.map(
    (classroom) => ({
      id: classroom.id,
      label: classroom.className || classroom.code || `Classroom ${classroom.id}`,
    }),
  )
  const mapped = mapDayRows(rows, classroomColumns)

  return {
    rows,
    ...mapped,
  }
}

export async function fetchClassSchedule(id: string): Promise<ScheduleDetail> {
  const { data } = await httpClient.get<
    ApiSuccessEnvelope<ClassScheduleDetailDto>
  >(adminPath(`/class-schedules/${id}`))
  return mapScheduleDetail(data.data)
}

export async function createClassSchedule(
  values: ScheduleFormValues,
): Promise<ScheduleDetail> {
  const { data } = await httpClient.post<
    ApiSuccessEnvelope<ClassScheduleDetailDto>
  >(adminPath('/class-schedules'), toWritePayload(values))
  return mapScheduleDetail(data.data)
}

export async function updateClassSchedule(
  id: string,
  values: ScheduleFormValues,
): Promise<ScheduleDetail> {
  const { data } = await httpClient.patch<
    ApiSuccessEnvelope<ClassScheduleDetailDto>
  >(adminPath(`/class-schedules/${id}`), toWritePayload(values))
  return mapScheduleDetail(data.data)
}

export async function deleteClassSchedule(id: string): Promise<void> {
  await httpClient.delete(adminPath(`/class-schedules/${id}`))
}

export function scheduleToFormValues(
  schedule: ScheduleDetail,
): ScheduleFormValues {
  const start = splitScheduleDateTime(schedule.startTime)
  const end = splitScheduleDateTime(schedule.endTime)

  return {
    programId: schedule.programId ?? '',
    classroomId: schedule.classroomId ?? '',
    tutorId: schedule.tutorId ?? '',
    participantType: schedule.studentGroupId ? 'group' : 'student',
    studentId: schedule.studentId ?? '',
    studentGroupId: schedule.studentGroupId ?? '',
    description: schedule.description,
    date: start.date,
    startTime: start.time,
    endTime: end.time,
    // Normalize again in case cached/partial payloads still carry API codes.
    status: mapScheduleStatusFromApi(schedule.status),
  }
}

export function emptyScheduleFormValues(overrides: Partial<ScheduleFormValues> = {}): ScheduleFormValues {
  return {
    programId: '',
    classroomId: '',
    tutorId: '',
    participantType: 'student',
    studentId: '',
    studentGroupId: '',
    description: '',
    date: '',
    startTime: '08:00',
    endTime: '09:00',
    status: 'ongoing',
    ...overrides,
  }
}

export function hourToTimeString(hour: number) {
  const whole = Math.floor(hour)
  const minutes = Math.round((hour - whole) * 60)
  return `${pad2(whole)}:${pad2(minutes)}`
}
