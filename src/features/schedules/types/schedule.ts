export type ScheduleStatusCode = '1_ON' | '2_FN' | '3_CN'

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
  status: ScheduleStatusCode
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
  status: ScheduleStatusCode
}

export const SCHEDULE_STATUS_OPTIONS: {
  value: ScheduleStatusCode
  label: string
}[] = [
  { value: '1_ON', label: 'Ongoing' },
  { value: '2_FN', label: 'Finished' },
  { value: '3_CN', label: 'Cancelled' },
]
