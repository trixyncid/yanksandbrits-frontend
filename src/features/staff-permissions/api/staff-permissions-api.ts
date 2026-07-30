import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import type { StaffPermissionListItem } from '../types/staff-permission'
import type { StaffPermissionListFilters } from './staff-permission-query-keys'

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
}

function mapGroup(dto: GroupDto): StaffPermissionListItem {
  return {
    id: String(dto.id),
    name: dto.name,
    permissionCount: dto.permissions?.length ?? 0,
    memberCount: 0,
  }
}

export async function fetchStaffPermissions(
  filters: StaffPermissionListFilters = {},
): Promise<StaffPermissionListResponse> {
  const { items, total } = await fetchAllPages<GroupDto>({
    client: httpClient,
    path: '/users/groups',
    params: {
      search: filters.search?.trim() || undefined,
    },
  })

  return {
    data: items.map(mapGroup),
    meta: { total },
  }
}

export async function fetchStaffPermission(
  id: string,
): Promise<StaffPermissionListItem> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<GroupDto>>(
    `/users/groups/${id}`,
  )
  return mapGroup(data.data)
}

export async function deleteStaffPermission(id: string): Promise<void> {
  await httpClient.delete(`/users/groups/${id}`)
}
