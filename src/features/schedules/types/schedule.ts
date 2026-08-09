export type ScheduleStatusCode = '1_ON' | '2_FN' | '3_CN'
export type ScheduleStatusUi = 'ongoing' | 'finished' | 'cancelled'

export type ScheduleParticipantType = 'student' | 'group'

export type ScheduleFormValues = {
  programId: string
  classroomId: string
  tutorId: string
  participantType: ScheduleParticipantType
  studentId: string
  studentGroupId: string
  description: string
  date: string
  startTime: string
  endTime: string
  status: ScheduleStatusUi
}

export type ScheduleFormErrors = Partial<
  Record<keyof ScheduleFormValues, string>
>

export type ScheduleDetail = {
  id: string
  programId: string | null
  classroomId: string | null
  tutorId: string | null
  studentId: string | null
  studentGroupId: string | null
  description: string
  startTime: string
  endTime: string
  status: ScheduleStatusUi
}

export const SCHEDULE_STATUS_OPTIONS: {
  value: ScheduleStatusUi
  label: string
}[] = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'finished', label: 'Finished' },
  { value: 'cancelled', label: 'Cancelled' },
]

const scheduleStatusFromApi: Record<string, ScheduleStatusUi> = {
  '1_ON': 'ongoing',
  '2_FN': 'finished',
  '3_CN': 'cancelled',
  ongoing: 'ongoing',
  finished: 'finished',
  cancelled: 'cancelled',
  ONGOING: 'ongoing',
  FINISHED: 'finished',
  CANCELLED: 'cancelled',
  Ongoing: 'ongoing',
  Finished: 'finished',
  Cancelled: 'cancelled',
}

const scheduleStatusToApi: Record<ScheduleStatusUi, ScheduleStatusCode> = {
  ongoing: '1_ON',
  finished: '2_FN',
  cancelled: '3_CN',
}

export function mapScheduleStatusFromApi(
  status: string | null | undefined,
): ScheduleStatusUi {
  if (!status) {
    return 'ongoing'
  }

  const normalized = status.trim()
  if (normalized in scheduleStatusFromApi) {
    return scheduleStatusFromApi[normalized]
  }

  const lower = normalized.toLowerCase()
  if (lower === 'ongoing' || lower === '1_on' || lower === 'on') {
    return 'ongoing'
  }
  if (lower === 'finished' || lower === '2_fn' || lower === 'fn') {
    return 'finished'
  }
  if (
    lower === 'cancelled' ||
    lower === 'canceled' ||
    lower === '3_cn' ||
    lower === 'cn'
  ) {
    return 'cancelled'
  }

  return 'ongoing'
}

export function mapScheduleStatusToApi(
  status: ScheduleStatusUi,
): ScheduleStatusCode {
  return scheduleStatusToApi[status]
}
