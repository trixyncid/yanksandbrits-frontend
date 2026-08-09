import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import type {
  PermissionOption,
  StaffPermissionDetail,
  StaffPermissionFormValues,
  StaffPermissionListItem,
} from '../types/staff-permission'
import type { StaffPermissionListFilters } from './staff-permission-query-keys'
import { adminPath } from '../../../shared/api/paths'

export type StaffPermissionListResponse = {
  data: StaffPermissionListItem[]
  meta: {
    total: number
  }
}

type GroupDto = {
  id: number
  name: string
  permissions: number[]
  code?: string
  description?: string
  is_system?: boolean
  member_count?: number
}

type PermissionDto = {
  id: number
  codename: string
  name: string
  content_type: {
    id: number
    app_label: string
    model: string
  }
}

function mapGroupListItem(dto: GroupDto): StaffPermissionListItem {
  return {
    id: String(dto.id),
    name: dto.name,
    code: dto.code ?? '',
    isSystem: Boolean(dto.is_system),
    description: dto.description ?? '',
    permissionCount: dto.permissions?.length ?? 0,
    memberCount: dto.member_count ?? 0,
  }
}

function mapGroupDetail(dto: GroupDto): StaffPermissionDetail {
  const permissionIds = (dto.permissions ?? []).map(String)
  return {
    id: String(dto.id),
    name: dto.name,
    code: dto.code ?? '',
    isSystem: Boolean(dto.is_system),
    description: dto.description ?? '',
    permissionIds,
    permissionCount: permissionIds.length,
    memberCount: dto.member_count ?? 0,
  }
}

function mapPermission(dto: PermissionDto): PermissionOption {
  return {
    id: String(dto.id),
    codename: dto.codename,
    name: dto.name,
    appLabel: dto.content_type.app_label,
    model: dto.content_type.model,
  }
}

function toWritePayload(values: StaffPermissionFormValues) {
  return {
    name: values.name.trim(),
    code: values.code.trim() || undefined,
    description: values.description.trim(),
    permissions: values.permissionIds.map(Number),
  }
}

export async function fetchStaffPermissions(
  filters: StaffPermissionListFilters = {},
): Promise<StaffPermissionListResponse> {
  const { items, total } = await fetchAllPages<GroupDto>({
    client: httpClient,
    path: adminPath('/users/groups'),
    params: {
      search: filters.search?.trim() || undefined,
    },
  })

  return {
    data: items.map(mapGroupListItem),
    meta: { total },
  }
}

export async function fetchStaffPermission(
  id: string,
): Promise<StaffPermissionDetail> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<GroupDto>>(
    adminPath(`/users/groups/${id}`),
  )
  return mapGroupDetail(data.data)
}

export async function fetchAllPermissions(): Promise<PermissionOption[]> {
  const { items } = await fetchAllPages<PermissionDto>({
    client: httpClient,
    path: adminPath('/users/permissions'),
  })
  return items.map(mapPermission)
}

export async function createStaffPermission(
  values: StaffPermissionFormValues,
): Promise<StaffPermissionDetail> {
  const { data } = await httpClient.post<ApiSuccessEnvelope<GroupDto>>(
    adminPath('/users/groups'),
    toWritePayload(values),
  )
  return mapGroupDetail(data.data)
}

export async function updateStaffPermission(
  id: string,
  values: StaffPermissionFormValues,
): Promise<StaffPermissionDetail> {
  const { data } = await httpClient.patch<ApiSuccessEnvelope<GroupDto>>(
    adminPath(`/users/groups/${id}`),
    toWritePayload(values),
  )
  return mapGroupDetail(data.data)
}

export async function deleteStaffPermission(id: string): Promise<void> {
  await httpClient.delete(adminPath(`/users/groups/${id}`))
}

export function staffPermissionToFormValues(
  group: StaffPermissionDetail,
): StaffPermissionFormValues {
  return {
    name: group.name,
    code: group.code,
    description: group.description,
    permissionIds: [...group.permissionIds],
  }
}

export const emptyStaffPermissionFormValues: StaffPermissionFormValues = {
  name: '',
  code: '',
  description: '',
  permissionIds: [],
}
