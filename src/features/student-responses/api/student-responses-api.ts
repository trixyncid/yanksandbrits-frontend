import {
  mapApprovalStatusFromApi,
  mapApprovalStatusToApi,
} from '../../../shared/api/choices'
import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import { fetchStudents } from '../../students/api/students-api'
import type { StudentListItem } from '../../students/types/student'
import {
  fetchStaffUserOptions,
  type StaffUserOption,
} from '../../users/api/users-api'
import type {
  StudentResponseFormValues,
  StudentResponseListItem,
} from '../types/student-response'
import type { StudentResponseListFilters } from './student-response-query-keys'

export type StudentResponseListResponse = {
  data: StudentResponseListItem[]
  meta: {
    total: number
  }
}

type StudentResponseDto = {
  id: number
  student: number
  title: string | null
  description: string | null
  tutor: number | null
  status: string
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

function mapResponse(
  dto: StudentResponseDto,
  studentsById: Map<string, StudentListItem>,
  tutorsById: Map<string, StaffUserOption>,
): StudentResponseListItem {
  const studentId = String(dto.student)
  const tutorId = dto.tutor == null ? null : String(dto.tutor)
  const student = studentsById.get(studentId)
  const tutor = tutorId ? tutorsById.get(tutorId) : undefined

  return {
    id: String(dto.id),
    studentId,
    studentPin: student?.pin ?? '',
    studentName: student?.fullName ?? '—',
    studentEmail: student?.email ?? '',
    studentPhone: student?.mobilePhone ?? '',
    title: dto.title ?? '',
    tutorId,
    tutorPin: tutor?.pin ?? '',
    tutorName: tutor?.fullName ?? '—',
    tutorEmail: tutor?.email ?? '',
    tutorPhone: '',
    description: dto.description ?? '',
    createdAt: dto.created_at,
    status: mapApprovalStatusFromApi(dto.status),
  }
}

function toWritePayload(values: StudentResponseFormValues) {
  return {
    student: Number(values.studentId),
    tutor: values.tutorId ? Number(values.tutorId) : null,
    title: values.title.trim(),
    description: values.description.trim() || null,
    status: mapApprovalStatusToApi(values.status),
  }
}

async function loadLookups() {
  const [studentsResult, tutors] = await Promise.all([
    fetchStudents(),
    fetchStaffUserOptions({ isTutor: true }),
  ])

  return {
    studentsById: new Map(
      studentsResult.data.map((student) => [student.id, student]),
    ),
    tutorsById: new Map(tutors.map((tutor) => [tutor.id, tutor])),
  }
}

export async function fetchStudentResponses(
  filters: StudentResponseListFilters = {},
): Promise<StudentResponseListResponse> {
  const params: Record<string, unknown> = {
    search: filters.search?.trim() || undefined,
  }

  if (filters.status && filters.status !== 'all') {
    params.status = mapApprovalStatusToApi(filters.status)
  }

  const [{ items, total }, lookups] = await Promise.all([
    fetchAllPages<StudentResponseDto>({
      client: httpClient,
      path: '/responses',
      params,
    }),
    loadLookups(),
  ])

  return {
    data: items.map((dto) =>
      mapResponse(dto, lookups.studentsById, lookups.tutorsById),
    ),
    meta: { total },
  }
}

export async function fetchStudentResponse(
  id: string,
): Promise<StudentResponseListItem> {
  const [{ data }, lookups] = await Promise.all([
    httpClient.get<ApiSuccessEnvelope<StudentResponseDto>>(`/responses/${id}`),
    loadLookups(),
  ])
  return mapResponse(data.data, lookups.studentsById, lookups.tutorsById)
}

export async function createStudentResponse(
  values: StudentResponseFormValues,
): Promise<StudentResponseListItem> {
  const { data } = await httpClient.post<
    ApiSuccessEnvelope<StudentResponseDto>
  >('/responses', toWritePayload(values))
  const lookups = await loadLookups()
  return mapResponse(data.data, lookups.studentsById, lookups.tutorsById)
}

export async function updateStudentResponse(
  id: string,
  values: StudentResponseFormValues,
): Promise<StudentResponseListItem> {
  const { data } = await httpClient.patch<
    ApiSuccessEnvelope<StudentResponseDto>
  >(`/responses/${id}`, toWritePayload(values))
  const lookups = await loadLookups()
  return mapResponse(data.data, lookups.studentsById, lookups.tutorsById)
}

export async function deleteStudentResponse(id: string): Promise<void> {
  await httpClient.delete(`/responses/${id}`)
}

export function studentResponseToFormValues(
  response: StudentResponseListItem,
): StudentResponseFormValues {
  return {
    studentId: response.studentId,
    tutorId: response.tutorId ?? '',
    title: response.title,
    description: response.description,
    status: response.status,
  }
}

export const emptyStudentResponseFormValues: StudentResponseFormValues = {
  studentId: '',
  tutorId: '',
  title: '',
  description: '',
  status: 'pending',
}
