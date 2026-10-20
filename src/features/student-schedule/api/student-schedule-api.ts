import { httpClient } from '../../../shared/api/http-client'
import { adminPath } from '../../../shared/api/paths'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'

export type StudentScheduleRange = 'upcoming' | 'past'

export type ScheduleSessionStatus = 'ongoing' | 'finished' | 'cancelled'

export type ScheduleSession = {
  id: string
  start: string
  end: string
  status: ScheduleSessionStatus
  program: string
  tutor: string
  classroom: string
  kind: 'private' | 'group'
  groupName: string
  /** Everyone in the class, including other counsellors' students. */
  classSize: number
  /** Only the counsellor's own students are named. */
  myStudents: {
    id: string
    name: string
    /** Set once the class is finished. */
    attendance: 'present' | 'absent' | null
  }[]
}

export type AttentionKind = 'absent' | 'cancelled' | 'renewal' | 'unbooked'

export type AttentionItem = {
  studentId: string
  studentName: string
  kind: AttentionKind
  count: number | null
  used: number | null
  total: number | null
  program: string
}

export type StudentSchedule = {
  range: StudentScheduleRange
  windowDays: number
  sessions: ScheduleSession[]
  students: { id: string; pin: string; name: string }[]
  programs: { id: string; title: string }[]
  attention: AttentionItem[]
}

type StudentScheduleDto = {
  range: StudentScheduleRange
  window_days: number
  sessions: Array<{
    id: number
    start: string
    end: string
    status: string
    program: string
    tutor: string
    classroom: string
    kind: 'private' | 'group'
    group_name: string
    class_size: number
    my_students: Array<{ id: number; name: string; attendance: 'present' | 'absent' | null }>
  }>
  students: Array<{ id: number; pin: string; name: string }>
  programs: Array<{ id: number; title: string }>
  attention: Array<{
    student_id: number
    student_name: string
    kind: AttentionKind
    count: number | null
    used: number | null
    total: number | null
    program: string
  }>
}

function mapStatus(status: string): ScheduleSessionStatus {
  if (status === '2_FN') return 'finished'
  if (status === '3_CN') return 'cancelled'
  return 'ongoing'
}

export const studentScheduleQueryKeys = {
  all: ['student-schedule'] as const,
  list: (filters: StudentScheduleFilters) =>
    [...studentScheduleQueryKeys.all, filters] as const,
}

export type StudentScheduleFilters = {
  range: StudentScheduleRange
  student?: string
  program?: string
}

export async function fetchStudentSchedule(
  filters: StudentScheduleFilters,
): Promise<StudentSchedule> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<StudentScheduleDto>>(
    adminPath('/marketing-dashboard/student-schedule'),
    {
      params: {
        range: filters.range,
        student: filters.student || undefined,
        program: filters.program || undefined,
      },
    },
  )
  const dto = data.data
  return {
    range: dto.range,
    windowDays: dto.window_days,
    sessions: dto.sessions.map((session) => ({
      id: String(session.id),
      start: session.start,
      end: session.end,
      status: mapStatus(session.status),
      program: session.program,
      tutor: session.tutor,
      classroom: session.classroom,
      kind: session.kind,
      groupName: session.group_name,
      classSize: session.class_size,
      myStudents: session.my_students.map((student) => ({
        id: String(student.id),
        name: student.name,
        attendance: student.attendance,
      })),
    })),
    students: dto.students.map((student) => ({
      id: String(student.id),
      pin: student.pin,
      name: student.name,
    })),
    programs: dto.programs.map((program) => ({
      id: String(program.id),
      title: program.title,
    })),
    attention: dto.attention.map((item) => ({
      studentId: String(item.student_id),
      studentName: item.student_name,
      kind: item.kind,
      count: item.count,
      used: item.used,
      total: item.total,
      program: item.program,
    })),
  }
}
