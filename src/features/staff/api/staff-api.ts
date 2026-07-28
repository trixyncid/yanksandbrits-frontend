import { httpClient } from '../../../shared/api/http-client'
import { staffListPlaceholder } from '../data/staff-placeholder'
import type { StaffListItem } from '../types/staff'
import type { StaffListFilters } from './staff-query-keys'

export type StaffListResponse = {
  data: StaffListItem[]
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

function filterPlaceholderStaff(
  staff: StaffListItem[],
  filters: StaffListFilters,
) {
  const search = filters.search?.trim().toLowerCase()

  return staff.filter((item) => {
    if (filters.isActive === 'active' && !item.isActive) {
      return false
    }

    if (filters.isActive === 'inactive' && item.isActive) {
      return false
    }

    if (filters.position && item.position !== filters.position) {
      return false
    }

    if (
      filters.branchId &&
      item.branch.toLowerCase() !== filters.branchId.toLowerCase()
    ) {
      return false
    }

    if (!search) {
      return true
    }

    const haystack = [
      item.pin,
      item.fullName,
      item.email,
      item.gender,
      item.position,
      item.branch,
      item.isActive ? 'active' : 'inactive',
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
}

async function fetchStaffFromApi(
  filters: StaffListFilters,
): Promise<StaffListResponse> {
  const { data } = await httpClient.get<StaffListResponse>('/api/staff', {
    params: filters,
  })

  return data
}

async function fetchStaffPlaceholder(
  filters: StaffListFilters,
): Promise<StaffListResponse> {
  await delay(PLACEHOLDER_DELAY_MS)

  const data = filterPlaceholderStaff(staffListPlaceholder, filters)

  return {
    data,
    meta: {
      total: data.length,
      source: 'placeholder',
    },
  }
}

export async function fetchStaff(
  filters: StaffListFilters = {},
): Promise<StaffListResponse> {
  const hasApiBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL)

  if (hasApiBaseUrl) {
    try {
      return await fetchStaffFromApi(filters)
    } catch {
      return fetchStaffPlaceholder(filters)
    }
  }

  return fetchStaffPlaceholder(filters)
}
