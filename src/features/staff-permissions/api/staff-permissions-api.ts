import { httpClient } from '../../../shared/api/http-client'
import { staffPermissionListPlaceholder } from '../data/staff-permissions-placeholder'
import type { StaffPermissionListItem } from '../types/staff-permission'
import type { StaffPermissionListFilters } from './staff-permission-query-keys'

export type StaffPermissionListResponse = {
  data: StaffPermissionListItem[]
  meta: {
    total: number
    source: 'api' | 'placeholder'
  }
}

const PLACEHOLDER_DELAY_MS = 450

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function filterPlaceholderGroups(
  groups: StaffPermissionListItem[],
  filters: StaffPermissionListFilters,
) {
  const search = filters.search?.trim().toLowerCase()

  if (!search) {
    return groups
  }

  return groups.filter((group) => {
    const haystack = [
      group.name,
      String(group.permissionCount),
      String(group.memberCount),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
}

async function fetchStaffPermissionsFromApi(
  filters: StaffPermissionListFilters,
): Promise<StaffPermissionListResponse> {
  const { data } = await httpClient.get<StaffPermissionListResponse>(
    '/api/staff-permissions',
    { params: filters },
  )

  return data
}

async function fetchStaffPermissionsPlaceholder(
  filters: StaffPermissionListFilters,
): Promise<StaffPermissionListResponse> {
  await delay(PLACEHOLDER_DELAY_MS)

  const data = filterPlaceholderGroups(staffPermissionListPlaceholder, filters)

  return {
    data,
    meta: {
      total: data.length,
      source: 'placeholder',
    },
  }
}

export async function fetchStaffPermissions(
  filters: StaffPermissionListFilters = {},
): Promise<StaffPermissionListResponse> {
  const hasApiBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL)

  if (hasApiBaseUrl) {
    try {
      return await fetchStaffPermissionsFromApi(filters)
    } catch {
      return fetchStaffPermissionsPlaceholder(filters)
    }
  }

  return fetchStaffPermissionsPlaceholder(filters)
}
