import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import { mapProgramStatusFromApi } from '../../../shared/api/choices'
import type {
  StudentDetail,
  StudentFormValues,
  StudentListItem,
  StudentProgramItem,
} from '../types/student'
import type { StudentListFilters } from './student-query-keys'

export type StudentListResponse = {
  data: StudentListItem[]
  meta: {
    total: number
  }
}

type StudentListDto = {
  id: number
  pin: string
  full_name: string
  email: string | null
  mobile_phone: string | null
  is_active: boolean
  enrollment_date: string
  branch: number | null
  branch_name: string | null
  referral: number | null
  referral_name: string | null
  gender: 'M' | 'F'
  user: number | null
  has_account: boolean
}

type StudentDetailDto = StudentListDto & {
  birth_place: string | null
  birth_date: string | null
  address: string | null
  home_phone: string | null
  other_phone: string | null
  occupation: number | null
  occupation_name: string | null
  institution: number | null
  institution_name: string | null
  grn: string | null
  referral_marketing: string | null
  created_at: string
  updated_at: string
  created_by: number | null
  created_by_name?: string | null
  updated_by: number | null
  updated_by_name?: string | null
  account_active: boolean | null
  prospective_student?: number | null
  image?: string | null
}

type StudentProgramDto = {
  id: number
  student: number
  program: number
  program_title: string | null
  description: string | null
  session: number
  period: number
  status: string
  created_at: string
}

function mapListItem(dto: StudentListDto): StudentListItem {
  return {
    id: String(dto.id),
    pin: dto.pin,
    fullName: dto.full_name,
    email: dto.email ?? '',
    mobilePhone: dto.mobile_phone ?? '',
    gender: dto.gender,
    enrollmentDate: dto.enrollment_date,
    counsellor: dto.referral_name ?? '—',
    counsellorId: dto.referral == null ? null : String(dto.referral),
    branch: dto.branch_name ?? '—',
    branchId: dto.branch == null ? null : String(dto.branch),
    status: dto.is_active ? 'active' : 'inactive',
    hasAccount: dto.has_account,
  }
}

function mapProgram(dto: StudentProgramDto): StudentProgramItem {
  return {
    id: String(dto.id),
    studentId: String(dto.student),
    programId: String(dto.program),
    code: '',
    title: dto.program_title ?? 'Program',
    description: dto.description ?? '',
    period: dto.period,
    sessions: dto.session,
    status: mapProgramStatusFromApi(dto.status),
    createdAt: dto.created_at,
  }
}

function mapDetail(
  dto: StudentDetailDto,
  programs: StudentProgramItem[] = [],
): StudentDetail {
  return {
    id: String(dto.id),
    pin: dto.pin,
    fullName: dto.full_name,
    email: dto.email ?? '',
    gender: dto.gender,
    birthPlace: dto.birth_place ?? '',
    birthDate: dto.birth_date ?? '',
    address: dto.address ?? '',
    mobilePhone: dto.mobile_phone ?? '',
    homePhone: dto.home_phone ?? '',
    othersPhone: dto.other_phone ?? '',
    occupationId: dto.occupation == null ? null : String(dto.occupation),
    occupationName: dto.occupation_name ?? '',
    institutionId: dto.institution == null ? null : String(dto.institution),
    institutionName: dto.institution_name ?? '',
    enrollmentDate: dto.enrollment_date,
    status: dto.is_active ? 'active' : 'inactive',
    counsellorId: dto.referral == null ? null : String(dto.referral),
    counsellor: dto.referral_name ?? '—',
    referralMarketing: dto.referral_marketing ?? '',
    grn: dto.grn ?? '',
    branchId: dto.branch == null ? null : String(dto.branch),
    branch: dto.branch_name ?? '—',
    hasAccount: dto.has_account,
    accountActive: dto.account_active,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    createdBy: dto.created_by_name ?? '',
    updatedBy: dto.updated_by_name ?? '',
    programs,
  }
}

function emptyToNull(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

/** Normalize common Indonesian local numbers to E.164 (+62...). */
function normalizePhone(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  const digits = trimmed.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) {
    return digits
  }
  if (digits.startsWith('62')) {
    return `+${digits}`
  }
  if (digits.startsWith('0')) {
    return `+62${digits.slice(1)}`
  }
  return trimmed
}

function toWritePayload(values: StudentFormValues) {
  return {
    pin: values.pin.trim(),
    full_name: values.fullName.trim(),
    email: emptyToNull(values.email),
    gender: values.gender,
    birth_place: emptyToNull(values.birthPlace),
    birth_date: emptyToNull(values.birthDate),
    address: emptyToNull(values.address),
    mobile_phone: normalizePhone(values.mobilePhone),
    home_phone: normalizePhone(values.homePhone),
    other_phone: normalizePhone(values.othersPhone),
    occupation: values.occupationId ? Number(values.occupationId) : null,
    institution: values.institutionId ? Number(values.institutionId) : null,
    enrollment_date: values.enrollmentDate,
    is_active: values.status === 'active',
    referral: values.counsellorId ? Number(values.counsellorId) : null,
    referral_marketing: emptyToNull(values.referralMarketing),
    grn: emptyToNull(values.grn),
    branch: values.branchId ? Number(values.branchId) : null,
  }
}

export async function fetchStudents(
  filters: StudentListFilters = {},
): Promise<StudentListResponse> {
  const params: Record<string, unknown> = {
    search: filters.search?.trim() || undefined,
    branch: filters.branchId ? Number(filters.branchId) : undefined,
  }

  if (filters.status === 'active') params.is_active = true
  if (filters.status === 'inactive') params.is_active = false

  const { items, total } = await fetchAllPages<StudentListDto>({
    client: httpClient,
    path: '/students',
    params,
  })

  return {
    data: items.map(mapListItem),
    meta: { total },
  }
}

export async function fetchStudentPrograms(
  studentId: string,
): Promise<StudentProgramItem[]> {
  const { items } = await fetchAllPages<StudentProgramDto>({
    client: httpClient,
    path: '/student-programs',
    params: { student: Number(studentId) },
  })
  return items.map(mapProgram)
}

export async function fetchStudent(id: string): Promise<StudentDetail> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<StudentDetailDto>>(
    `/students/${id}`,
  )
  const programs = await fetchStudentPrograms(id)
  return mapDetail(data.data, programs)
}

export async function createStudent(
  values: StudentFormValues,
): Promise<StudentDetail> {
  const { data } = await httpClient.post<ApiSuccessEnvelope<StudentDetailDto>>(
    '/students',
    toWritePayload(values),
  )
  return mapDetail(data.data, [])
}

export async function updateStudent(
  id: string,
  values: StudentFormValues,
): Promise<StudentDetail> {
  const { data } = await httpClient.patch<ApiSuccessEnvelope<StudentDetailDto>>(
    `/students/${id}`,
    toWritePayload(values),
  )
  const programs = await fetchStudentPrograms(id)
  return mapDetail(data.data, programs)
}

export async function deleteStudent(id: string): Promise<void> {
  await httpClient.delete(`/students/${id}`)
}

export async function suggestStudentPin(params: {
  referralId: string
  branchId: string
}): Promise<string> {
  const { data } = await httpClient.get<
    ApiSuccessEnvelope<{ student_id?: string; pin?: string }>
  >('/students/suggest-pin', {
    params: {
      referral: Number(params.referralId),
      branch: Number(params.branchId),
    },
  })
  return String(data.data.student_id ?? data.data.pin ?? '')
}

export function studentToFormValues(student: StudentDetail): StudentFormValues {
  return {
    pin: student.pin,
    fullName: student.fullName,
    email: student.email,
    gender: student.gender,
    birthPlace: student.birthPlace,
    birthDate: student.birthDate,
    address: student.address,
    mobilePhone: student.mobilePhone,
    homePhone: student.homePhone,
    othersPhone: student.othersPhone,
    occupationId: student.occupationId ?? '',
    institutionId: student.institutionId ?? '',
    enrollmentDate: student.enrollmentDate,
    counsellorId: student.counsellorId ?? '',
    referralMarketing: student.referralMarketing,
    grn: student.grn,
    branchId: student.branchId ?? '',
    status: student.status,
  }
}

export const emptyStudentFormValues: StudentFormValues = {
  pin: '',
  fullName: '',
  email: '',
  gender: 'M',
  birthPlace: '',
  birthDate: '',
  address: '',
  mobilePhone: '',
  homePhone: '',
  othersPhone: '',
  occupationId: '',
  institutionId: '',
  enrollmentDate: '',
  counsellorId: '',
  referralMarketing: '',
  grn: '',
  branchId: '',
  status: 'active',
}

export function getStudentInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
