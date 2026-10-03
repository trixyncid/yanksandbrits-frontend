import {
  courseLabel,
  mapGenderFromApi,
  mapGenderToApi,
  mapResponseStatusFromApi,
  mapResponseStatusToApi,
  type CourseCode,
  type LanguageTestCode,
  type TeleMarketingCode,
} from '../../../shared/api/choices'
import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import type {
  ProspectiveStudentFormValues,
  ProspectiveStudentListItem,
} from '../types/prospective-student'
import type { ProspectiveStudentListFilters } from './prospective-student-query-keys'
import { adminPath } from '../../../shared/api/paths'

export type ProspectiveStudentListResponse = {
  data: ProspectiveStudentListItem[]
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
  sr_number?: string | null
  date?: string | null
  resource?: number | null
  resource_name?: string | null
  tele_marketing?: TeleMarketingCode | null
  age?: number | null
  address?: string | null
  language_test?: LanguageTestCode | null
  listening?: string | number | null
  speaking?: string | number | null
  reading?: string | number | null
  writing?: string | number | null
  is_student: boolean
  is_consult?: boolean
  can_enroll?: boolean
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

function scoreToFormValue(value: string | number | null | undefined): string {
  if (value == null || value === '') {
    return ''
  }
  return String(value)
}

function scoreToApiValue(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  return trimmed
}

function mapItem(dto: ProspectiveStudentListDto): ProspectiveStudentListItem {
  const languageTest = dto.language_test ?? ''

  return {
    id: String(dto.id),
    fullName: dto.full_name,
    email: dto.email ?? '',
    phone: dto.phone ?? '',
    gender: dto.gender ? mapGenderFromApi(dto.gender) : null,
    course: dto.course,
    status: mapResponseStatusFromApi(dto.status),
    srNumber: dto.sr_number ?? '',
    date: dto.date ?? '',
    resourceId: dto.resource == null ? null : String(dto.resource),
    resource: dto.resource_name ?? '',
    teleMarketing: (dto.tele_marketing as TeleMarketingCode | null) ?? '',
    age: dto.age ?? null,
    address: dto.address ?? '',
    languageTest,
    listening: scoreToFormValue(dto.listening),
    speaking: scoreToFormValue(dto.speaking),
    reading: scoreToFormValue(dto.reading),
    writing: scoreToFormValue(dto.writing),
    educationCounsellor: dto.marketing_name ?? '—',
    marketingId: dto.marketing == null ? null : String(dto.marketing),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at ?? dto.created_at,
    branch: dto.branch_name ?? '—',
    branchId: dto.branch == null ? null : String(dto.branch),
    isStudent: dto.is_student,
    isConsult: Boolean(dto.is_consult),
    canEnroll: Boolean(dto.can_enroll),
  }
}

function toWritePayload(values: ProspectiveStudentFormValues) {
  const hasTakenLanguageTest = values.hasTakenLanguageTest

  return {
    full_name: values.fullName.trim(),
    email: values.email.trim() || null,
    phone: values.phone.trim(),
    gender: mapGenderToApi(values.gender),
    status: mapResponseStatusToApi(values.status),
    course: values.course as CourseCode,
    sr_number: values.srNumber.trim() || null,
    date: values.date.trim() || null,
    resource: values.resourceId ? Number(values.resourceId) : null,
    tele_marketing: values.teleMarketing || null,
    age: values.age.trim() ? Number(values.age.trim()) : null,
    address: values.address.trim() || null,
    language_test: hasTakenLanguageTest ? values.languageTest || null : null,
    listening: hasTakenLanguageTest ? scoreToApiValue(values.listening) : null,
    speaking: hasTakenLanguageTest ? scoreToApiValue(values.speaking) : null,
    reading: hasTakenLanguageTest ? scoreToApiValue(values.reading) : null,
    writing: hasTakenLanguageTest ? scoreToApiValue(values.writing) : null,
    marketing: values.marketingId ? Number(values.marketingId) : null,
    branch: values.branchId ? Number(values.branchId) : null,
  }
}

function filterListItems(
  items: ProspectiveStudentListItem[],
  filters: ProspectiveStudentListFilters,
) {
  return items.filter((student) => {
    if (filters.statuses?.length) {
      if (!filters.statuses.includes(student.status)) {
        return false
      }
    } else if (
      filters.status &&
      filters.status !== 'all' &&
      student.status !== filters.status
    ) {
      return false
    }

    if (filters.branchId && student.branchId !== filters.branchId) {
      return false
    }

    if (
      filters.counsellorId &&
      student.marketingId !== filters.counsellorId
    ) {
      return false
    }

    return true
  })
}

export async function fetchProspectiveStudents(
  filters: ProspectiveStudentListFilters = {},
): Promise<ProspectiveStudentListResponse> {
  const params: Record<string, unknown> = {
    search: filters.search?.trim() || undefined,
    branch: filters.branchId ? Number(filters.branchId) : undefined,
    marketing: filters.counsellorId ? Number(filters.counsellorId) : undefined,
  }

  if (filters.statuses?.length) {
    params.status = filters.statuses
      .map((status) => mapResponseStatusToApi(status))
      .join(',')
  } else if (filters.status && filters.status !== 'all') {
    params.status = mapResponseStatusToApi(filters.status)
  }

  const { items } = await fetchAllPages<ProspectiveStudentListDto>({
    client: httpClient,
    path: adminPath('/prospective-students'),
    params,
  })

  const data = filterListItems(items.map(mapItem), filters)

  return {
    data,
    meta: { total: data.length },
  }
}

export async function fetchProspectiveStudent(id: string): Promise<ProspectiveStudentListItem> {
  const { data } = await httpClient.get<
    ApiSuccessEnvelope<ProspectiveStudentDetailDto>
  >(adminPath(`/prospective-students/${id}`))
  return mapItem(data.data)
}

export async function createProspectiveStudent(
  values: ProspectiveStudentFormValues,
): Promise<ProspectiveStudentListItem> {
  const { data } = await httpClient.post<
    ApiSuccessEnvelope<Partial<ProspectiveStudentDetailDto>>
  >(adminPath('/prospective-students'), toWritePayload(values))

  if (data.data?.id != null) {
    return fetchProspectiveStudent(String(data.data.id))
  }

  return {
    id: '',
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    gender: values.gender === 'female' ? 'female' : 'male',
    course: values.course,
    status: values.status,
    srNumber: values.srNumber.trim(),
    date: values.date,
    resourceId: values.resourceId || null,
    resource: '',
    teleMarketing: values.teleMarketing,
    age: values.age.trim() ? Number(values.age.trim()) : null,
    address: values.address.trim(),
    languageTest: values.hasTakenLanguageTest ? values.languageTest : '',
    listening: values.hasTakenLanguageTest ? values.listening : '',
    speaking: values.hasTakenLanguageTest ? values.speaking : '',
    reading: values.hasTakenLanguageTest ? values.reading : '',
    writing: values.hasTakenLanguageTest ? values.writing : '',
    educationCounsellor: '—',
    marketingId: values.marketingId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branch: '—',
    branchId: values.branchId || null,
    isStudent: false,
    isConsult:
      values.status === 'consult' ||
      values.status === 'prediction_test' ||
      values.status === 'enrolled',
    canEnroll: false,
  }
}

export async function updateProspectiveStudent(
  id: string,
  values: ProspectiveStudentFormValues,
): Promise<ProspectiveStudentListItem> {
  await httpClient.patch(adminPath(`/prospective-students/${id}`), toWritePayload(values))
  return fetchProspectiveStudent(id)
}

export async function deleteProspectiveStudent(id: string): Promise<void> {
  await httpClient.delete(adminPath(`/prospective-students/${id}`))
}

export function prospectiveStudentToFormValues(
  student: ProspectiveStudentListItem,
): ProspectiveStudentFormValues {
  return {
    fullName: student.fullName,
    email: student.email,
    phone: student.phone,
    gender: student.gender ?? '',
    course: (student.course as CourseCode) || '',
    status: student.status,
    srNumber: student.srNumber,
    date: student.date,
    resourceId: student.resourceId ?? '',
    teleMarketing: student.teleMarketing || '',
    age: student.age == null ? '' : String(student.age),
    address: student.address,
    hasTakenLanguageTest: Boolean(student.languageTest),
    languageTest: student.languageTest,
    listening: student.listening,
    speaking: student.speaking,
    reading: student.reading,
    writing: student.writing,
    marketingId: student.marketingId ?? '',
    branchId: student.branchId ?? '',
  }
}

function todayDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function emptyProspectiveStudentFormValues(): ProspectiveStudentFormValues {
  return {
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    course: '',
    status: 'consult',
    srNumber: '',
    date: todayDateString(),
    resourceId: '',
    teleMarketing: '',
    age: '',
    address: '',
    hasTakenLanguageTest: false,
    languageTest: '',
    listening: '',
    speaking: '',
    reading: '',
    writing: '',
    marketingId: '',
    branchId: '',
  }
}

export { courseLabel }
