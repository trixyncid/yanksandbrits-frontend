import {
  courseLabel,
  mapGenderFromApi,
  mapGenderToApi,
  mapResponseStatusFromApi,
  mapResponseStatusToApi,
  type CourseCode,
} from '../../../shared/api/choices'
import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import type {
  NewStudentFormValues,
  NewStudentListItem,
} from '../types/new-student'
import type { NewStudentListFilters } from './new-student-query-keys'

export type NewStudentListResponse = {
  data: NewStudentListItem[]
  meta: {
    total: number
  }
}

type ProspectiveStudentListDto = {
  id: number
  full_name: string
  email: string | null
  phone: string
  gender?: 'M' | 'F' | null
  status: string
  course: string
  is_student: boolean
  marketing: number | null
  marketing_name: string | null
  branch: number | null
  branch_name: string | null
  created_at: string
  updated_at?: string
}

type ProspectiveStudentDetailDto = ProspectiveStudentListDto & {
  gender: 'M' | 'F'
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

function mapItem(dto: ProspectiveStudentListDto): NewStudentListItem {
  return {
    id: String(dto.id),
    fullName: dto.full_name,
    email: dto.email ?? '',
    phone: dto.phone ?? '',
    gender: dto.gender ? mapGenderFromApi(dto.gender) : null,
    course: dto.course,
    status: mapResponseStatusFromApi(dto.status),
    educationCounsellor: dto.marketing_name ?? '—',
    marketingId: dto.marketing == null ? null : String(dto.marketing),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at ?? dto.created_at,
    branch: dto.branch_name ?? '—',
    branchId: dto.branch == null ? null : String(dto.branch),
    isStudent: dto.is_student,
  }
}

function toWritePayload(values: NewStudentFormValues) {
  return {
    full_name: values.fullName.trim(),
    email: values.email.trim() || null,
    phone: values.phone.trim(),
    gender: mapGenderToApi(values.gender),
    status: mapResponseStatusToApi(values.status),
    course: values.course as CourseCode,
    marketing: values.marketingId ? Number(values.marketingId) : null,
    branch: values.branchId ? Number(values.branchId) : null,
  }
}

function filterListItems(
  items: NewStudentListItem[],
  filters: NewStudentListFilters,
) {
  return items.filter((student) => {
    // Match Django list: exclude leads already moved to prediction test
    // unless the caller explicitly filters to that status.
    if (
      student.status === 'prediction_test' &&
      filters.status !== 'prediction_test'
    ) {
      return false
    }

    if (
      filters.status &&
      filters.status !== 'all' &&
      student.status !== filters.status
    ) {
      return false
    }

    if (filters.branchId && student.branchId !== filters.branchId) {
      return false
    }

    return true
  })
}

export async function fetchNewStudents(
  filters: NewStudentListFilters = {},
): Promise<NewStudentListResponse> {
  const params: Record<string, unknown> = {
    search: filters.search?.trim() || undefined,
    branch: filters.branchId ? Number(filters.branchId) : undefined,
  }

  if (filters.status && filters.status !== 'all') {
    params.status = mapResponseStatusToApi(filters.status)
  }

  const { items } = await fetchAllPages<ProspectiveStudentListDto>({
    client: httpClient,
    path: '/prospective-students',
    params,
  })

  const data = filterListItems(items.map(mapItem), filters)

  return {
    data,
    meta: { total: data.length },
  }
}

export async function fetchNewStudent(id: string): Promise<NewStudentListItem> {
  const { data } = await httpClient.get<
    ApiSuccessEnvelope<ProspectiveStudentDetailDto>
  >(`/prospective-students/${id}`)
  return mapItem(data.data)
}

export async function createNewStudent(
  values: NewStudentFormValues,
): Promise<NewStudentListItem> {
  const { data } = await httpClient.post<
    ApiSuccessEnvelope<Partial<ProspectiveStudentDetailDto>>
  >('/prospective-students', toWritePayload(values))

  if (data.data?.id != null) {
    return fetchNewStudent(String(data.data.id))
  }

  return {
    id: '',
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    gender: values.gender === 'female' ? 'female' : 'male',
    course: values.course,
    status: values.status,
    educationCounsellor: '—',
    marketingId: values.marketingId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branch: '—',
    branchId: values.branchId || null,
    isStudent: false,
  }
}

export async function updateNewStudent(
  id: string,
  values: NewStudentFormValues,
): Promise<NewStudentListItem> {
  await httpClient.patch(`/prospective-students/${id}`, toWritePayload(values))
  return fetchNewStudent(id)
}

export async function deleteNewStudent(id: string): Promise<void> {
  await httpClient.delete(`/prospective-students/${id}`)
}

export function newStudentToFormValues(
  student: NewStudentListItem,
): NewStudentFormValues {
  return {
    fullName: student.fullName,
    email: student.email,
    phone: student.phone,
    gender: student.gender ?? '',
    course: (student.course as CourseCode) || '',
    status: student.status,
    marketingId: student.marketingId ?? '',
    branchId: student.branchId ?? '',
  }
}

export const emptyNewStudentFormValues: NewStudentFormValues = {
  fullName: '',
  email: '',
  phone: '',
  gender: '',
  course: '',
  status: 'waiting',
  marketingId: '',
  branchId: '',
}

export { courseLabel }
