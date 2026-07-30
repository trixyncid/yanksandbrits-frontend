import { httpClient } from '../../../shared/api/http-client'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import { fetchAllPages } from '../../../shared/api/pagination'
import { mapGenderFromApi, mapGenderToApi } from '../../../shared/api/choices'

export type StaffUserOption = {
  id: string
  pin: string
  fullName: string
  email: string
  branchId: string | null
  branchName: string | null
}

export type UserListItem = {
  id: string
  pin: string
  fullName: string
  email: string
  phone: string
  gender: 'male' | 'female'
  isActive: boolean
  isTutor: boolean
  isMarketing: boolean
  isManager: boolean
  isSuperuser: boolean
  staffType: string | null
  paidLeaveTotal: number
  paidLeaveLeft: number
  lastLogin: string | null
  dateJoined: string
  branchId: string | null
  branchName: string | null
  hasWorkingSchedule: boolean
  hasSalary: boolean
}

export type UserDetail = UserListItem & {
  birthDate: string | null
  birthPlace: string | null
  address: string | null
  homePhone: string | null
  otherPhone: string | null
  position: string | null
  initial: string | null
  resignDate: string | null
  updatedAt: string | null
}

export type UserFormValues = {
  pin: string
  email: string
  fullName: string
  password: string
  initial: string
  gender: 'male' | 'female'
  birthPlace: string
  birthDate: string
  address: string
  mobilePhone: string
  homePhone: string
  otherPhone: string
  isActive: boolean
  isTutor: boolean
  isMarketing: boolean
  isManager: boolean
  staffType: string
  branchId: string
  paidLeave: string
  resignDate: string
}

export type UserFormErrors = Partial<Record<keyof UserFormValues, string>>

export const STAFF_TYPE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Mandarin', label: 'Mandarin' },
] as const

type UserListDto = {
  id: number
  pin: string
  email: string
  full_name: string
  initial?: string | null
  is_active: boolean
  is_tutor: boolean
  is_marketing: boolean
  is_manager: boolean
  is_superuser?: boolean
  staff_type: string | null
  branch: number | null
  branch_name?: string | null
  last_login?: string | null
  date_joined?: string
  paid_leave?: number
  check_paid_leave?: number
  mobile_phone?: string | null
  gender?: string | null
}

type UserDetailDto = UserListDto & {
  birth_place?: string | null
  birth_date?: string | null
  address?: string | null
  home_phone?: string | null
  other_phone?: string | null
  resign_date?: string | null
  check_position?: string | null
  updated_at?: string | null
  groups?: number[]
  user_permissions?: number[]
}

function mapUser(dto: UserListDto | UserDetailDto): UserListItem {
  return {
    id: String(dto.id),
    pin: dto.pin,
    fullName: dto.full_name,
    email: dto.email,
    phone: dto.mobile_phone ?? '',
    gender: mapGenderFromApi(dto.gender),
    isActive: dto.is_active,
    isTutor: dto.is_tutor,
    isMarketing: dto.is_marketing,
    isManager: dto.is_manager,
    isSuperuser: Boolean(dto.is_superuser),
    staffType: dto.staff_type,
    paidLeaveTotal: dto.paid_leave ?? 0,
    paidLeaveLeft: dto.check_paid_leave ?? dto.paid_leave ?? 0,
    lastLogin: dto.last_login ?? null,
    dateJoined: dto.date_joined ?? '',
    branchId: dto.branch == null ? null : String(dto.branch),
    branchName: dto.branch_name ?? null,
    hasWorkingSchedule: false,
    hasSalary: false,
  }
}

function mapUserDetail(dto: UserDetailDto): UserDetail {
  return {
    ...mapUser(dto),
    birthDate: dto.birth_date ?? null,
    birthPlace: dto.birth_place ?? null,
    address: dto.address ?? null,
    homePhone: dto.home_phone ?? null,
    otherPhone: dto.other_phone ?? null,
    position: dto.check_position ?? null,
    initial: dto.initial ?? null,
    resignDate: dto.resign_date ?? null,
    updatedAt: dto.updated_at ?? null,
  }
}

function emptyToNull(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function toWritePayload(values: UserFormValues, mode: 'create' | 'edit') {
  const payload: Record<string, unknown> = {
    pin: values.pin.trim(),
    email: values.email.trim(),
    full_name: values.fullName.trim(),
    initial: emptyToNull(values.initial),
    gender: mapGenderToApi(values.gender),
    birth_place: emptyToNull(values.birthPlace),
    birth_date: emptyToNull(values.birthDate),
    address: emptyToNull(values.address),
    mobile_phone: emptyToNull(values.mobilePhone),
    home_phone: emptyToNull(values.homePhone),
    other_phone: emptyToNull(values.otherPhone),
    is_active: values.isActive,
    is_tutor: values.isTutor,
    is_marketing: values.isMarketing,
    is_manager: values.isManager,
    staff_type: values.staffType.trim() || null,
    branch: values.branchId ? Number(values.branchId) : null,
    paid_leave: values.paidLeave ? Number(values.paidLeave) : 0,
    resign_date: emptyToNull(values.resignDate),
  }

  if (mode === 'create' || values.password.trim()) {
    payload.password = values.password
  }

  return payload
}

export type UserListFilters = {
  search?: string
  isActive?: 'active' | 'inactive' | 'all'
  isTutor?: boolean
  isMarketing?: boolean
  isManager?: boolean
  branchId?: string
}

export async function fetchUsers(
  filters: UserListFilters = {},
): Promise<{ data: UserListItem[]; meta: { total: number } }> {
  const params: Record<string, unknown> = {
    search: filters.search?.trim() || undefined,
    is_tutor: filters.isTutor,
    is_marketing: filters.isMarketing,
    is_manager: filters.isManager,
    branch: filters.branchId ? Number(filters.branchId) : undefined,
  }

  if (filters.isActive === 'active') params.is_active = true
  if (filters.isActive === 'inactive') params.is_active = false

  const { items, total } = await fetchAllPages<UserListDto>({
    client: httpClient,
    path: '/users',
    params,
  })

  return {
    data: items.map(mapUser),
    meta: { total },
  }
}

export async function fetchUser(id: string): Promise<UserDetail> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<UserDetailDto>>(
    `/users/${id}`,
  )
  return mapUserDetail(data.data)
}

export async function createUser(values: UserFormValues): Promise<UserListItem> {
  const { data } = await httpClient.post<ApiSuccessEnvelope<UserDetailDto>>(
    '/users',
    toWritePayload(values, 'create'),
  )
  return mapUser(data.data)
}

export async function updateUser(
  id: string,
  values: UserFormValues,
): Promise<UserListItem> {
  const { data } = await httpClient.patch<ApiSuccessEnvelope<UserDetailDto>>(
    `/users/${id}`,
    toWritePayload(values, 'edit'),
  )
  return mapUser(data.data)
}

export async function deleteUser(id: string): Promise<void> {
  await httpClient.delete(`/users/${id}`)
}

export async function fetchLatestUserPin(): Promise<string> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<{ pin?: string; latest_id?: string }>>(
    '/users/latest-id',
  )
  return String(data.data.pin ?? data.data.latest_id ?? '')
}

export async function fetchStaffUserOptions(filters: {
  isTutor?: boolean
  isMarketing?: boolean
} = {}): Promise<StaffUserOption[]> {
  const { data } = await fetchUsers({
    isActive: 'active',
    isTutor: filters.isTutor,
    isMarketing: filters.isMarketing,
  })

  return data.map((user) => ({
    id: user.id,
    pin: user.pin,
    fullName: user.fullName,
    email: user.email,
    branchId: user.branchId,
    branchName: user.branchName,
  }))
}

export function userToFormValues(user: UserDetail | UserListItem): UserFormValues {
  const detail = user as UserDetail

  return {
    pin: user.pin,
    email: user.email,
    fullName: user.fullName,
    password: '',
    initial: detail.initial ?? '',
    gender: user.gender,
    birthPlace: detail.birthPlace ?? '',
    birthDate: detail.birthDate ?? '',
    address: detail.address ?? '',
    mobilePhone: user.phone,
    homePhone: detail.homePhone ?? '',
    otherPhone: detail.otherPhone ?? '',
    isActive: user.isActive,
    isTutor: user.isTutor,
    isMarketing: user.isMarketing,
    isManager: user.isManager,
    staffType: user.staffType ?? 'English',
    branchId: user.branchId ?? '',
    paidLeave: String(user.paidLeaveTotal),
    resignDate: detail.resignDate ?? '',
  }
}

export const emptyUserFormValues: UserFormValues = {
  pin: '',
  email: '',
  fullName: '',
  password: '',
  initial: '',
  gender: 'male',
  birthPlace: '',
  birthDate: '',
  address: '',
  mobilePhone: '',
  homePhone: '',
  otherPhone: '',
  isActive: true,
  isTutor: false,
  isMarketing: false,
  isManager: false,
  staffType: 'English',
  branchId: '',
  paidLeave: '0',
  resignDate: '',
}

export function getUserInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function deriveStaffPosition(user: UserListItem) {
  if (user.isSuperuser) return 'superuser' as const
  if (user.isManager) return 'manager' as const
  if (user.isMarketing) return 'marketing' as const
  if (user.isTutor) return 'tutor' as const
  return 'staff' as const
}
