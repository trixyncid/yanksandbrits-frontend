import { httpClient } from '../../../shared/api/http-client'
import { adminPath } from '../../../shared/api/paths'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'

/** How the booking form's tutor field should behave for a student/group + program. */
export type BookingTutorOptions = {
  /** Tutors from the tutor allocation, with the sections they teach. */
  allocated: { tutorId: string; tutorPin: string; tutorName: string; sections: string[] }[]
  /** Switch approved, or the user can approve switches. */
  unlocked: boolean
  /** The program's subject, e.g. "English"; empty when it has none. */
  subject: string
  /** When unlocked: tutors who teach the program's subject (all tutors if no subject). */
  subjectTutors: { tutorId: string; tutorPin: string; tutorName: string }[]
  switchApproved: boolean
  canApprove: boolean
  pendingRequest: {
    id: string
    reason: string
    requestedByName: string
    createdAt: string
  } | null
}

export type TutorSwitchStatus = 'pending' | 'approved' | 'rejected'

export type TutorSwitchRequest = {
  id: string
  studentName: string
  studentGroupName: string
  programTitle: string
  programCode: string
  reason: string
  status: TutorSwitchStatus
  requestedByName: string
  decidedByName: string
  decidedAt: string | null
  createdAt: string
  allocatedTutors: { tutorName: string; sections: string[] }[]
}

type BookingTutorOptionsDto = {
  allocated: { tutor_id: number; tutor_pin?: string; tutor_name: string; sections: string[] }[]
  unlocked: boolean
  subject?: string
  subject_tutors?: { tutor_id: number; tutor_pin?: string; tutor_name: string }[]
  switch_approved: boolean
  can_approve: boolean
  pending_request: {
    id: number
    reason: string
    requested_by_name: string
    created_at: string
  } | null
}

type TutorSwitchRequestDto = {
  id: number
  student_name: string | null
  student_group_name: string | null
  program_title: string | null
  program_code: string | null
  reason: string
  status: '1_PD' | '2_AP' | '3_VD'
  requested_by_name: string | null
  decided_by_name: string | null
  decided_at: string | null
  created_at: string
  allocated_tutors?: { tutor_name: string; sections: string[] }[]
}

const STATUS_FROM_CODE: Record<TutorSwitchRequestDto['status'], TutorSwitchStatus> = {
  '1_PD': 'pending',
  '2_AP': 'approved',
  '3_VD': 'rejected',
}

function mapRequest(dto: TutorSwitchRequestDto): TutorSwitchRequest {
  return {
    id: String(dto.id),
    studentName: dto.student_name ?? '',
    studentGroupName: dto.student_group_name ?? '',
    programTitle: dto.program_title ?? '',
    programCode: dto.program_code ?? '',
    reason: dto.reason,
    status: STATUS_FROM_CODE[dto.status] ?? 'pending',
    requestedByName: dto.requested_by_name ?? '',
    decidedByName: dto.decided_by_name ?? '',
    decidedAt: dto.decided_at,
    createdAt: dto.created_at,
    allocatedTutors: (dto.allocated_tutors ?? []).map((item) => ({
      tutorName: item.tutor_name,
      sections: item.sections,
    })),
  }
}

export const tutorSwitchQueryKeys = {
  all: ['tutor-switch'] as const,
  options: (params: { studentId?: string; studentGroupId?: string; programId?: string }) =>
    [...tutorSwitchQueryKeys.all, 'options', params] as const,
  requests: (status: string) => [...tutorSwitchQueryKeys.all, 'requests', status] as const,
}

export async function fetchBookingTutorOptions(params: {
  studentId?: string
  studentGroupId?: string
  programId: string
}): Promise<BookingTutorOptions> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<BookingTutorOptionsDto>>(
    adminPath('/class-schedules/booking-tutors'),
    {
      params: {
        program: params.programId,
        student: params.studentId || undefined,
        student_group: params.studentGroupId || undefined,
      },
    },
  )
  const dto = data.data
  return {
    allocated: dto.allocated.map((item) => ({
      tutorId: String(item.tutor_id),
      tutorPin: item.tutor_pin ?? '',
      tutorName: item.tutor_name,
      sections: item.sections,
    })),
    unlocked: dto.unlocked,
    subject: dto.subject ?? '',
    subjectTutors: (dto.subject_tutors ?? []).map((item) => ({
      tutorId: String(item.tutor_id),
      tutorPin: item.tutor_pin ?? '',
      tutorName: item.tutor_name,
    })),
    switchApproved: dto.switch_approved,
    canApprove: dto.can_approve,
    pendingRequest: dto.pending_request
      ? {
          id: String(dto.pending_request.id),
          reason: dto.pending_request.reason,
          requestedByName: dto.pending_request.requested_by_name,
          createdAt: dto.pending_request.created_at,
        }
      : null,
  }
}

export async function createTutorSwitchRequest(values: {
  studentId?: string
  studentGroupId?: string
  programId: string
  reason: string
}) {
  const { data } = await httpClient.post<ApiSuccessEnvelope<TutorSwitchRequestDto>>(
    adminPath('/tutor-switch-requests'),
    {
      student: values.studentId ? Number(values.studentId) : null,
      student_group: values.studentGroupId ? Number(values.studentGroupId) : null,
      program: Number(values.programId),
      reason: values.reason.trim(),
    },
  )
  return mapRequest(data.data)
}

export async function fetchTutorSwitchRequests(status: '1_PD' | '' = '1_PD') {
  const { data } = await httpClient.get<ApiSuccessEnvelope<TutorSwitchRequestDto[]>>(
    adminPath('/tutor-switch-requests'),
    { params: { status: status || undefined } },
  )
  return (data.data ?? []).map(mapRequest)
}

export async function decideTutorSwitchRequest(
  id: string,
  decision: 'approve' | 'reject',
  note = '',
) {
  const { data } = await httpClient.post<ApiSuccessEnvelope<TutorSwitchRequestDto>>(
    adminPath(`/tutor-switch-requests/${id}/${decision}`),
    { note },
  )
  return mapRequest(data.data)
}
