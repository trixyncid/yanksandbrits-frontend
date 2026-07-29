import { httpClient } from '../../../shared/api/http-client'
import { paidLeaveListPlaceholder } from '../data/paid-leaves-placeholder'
import type { PaidLeaveListItem } from '../types/paid-leave'
import type { PaidLeaveListFilters } from './paid-leave-query-keys'

export type PaidLeaveListResponse = {
  data: PaidLeaveListItem[]
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

function filterPlaceholderLeaves(
  leaves: PaidLeaveListItem[],
  filters: PaidLeaveListFilters,
) {
  const search = filters.search?.trim().toLowerCase()

  return leaves.filter((item) => {
    if (
      filters.status &&
      filters.status !== 'all' &&
      item.status !== filters.status
    ) {
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
      item.staffPin,
      item.staffName,
      item.staffEmail,
      item.branch,
      item.notes,
      item.status,
      String(item.totalDays),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
}

async function fetchPaidLeavesFromApi(
  filters: PaidLeaveListFilters,
): Promise<PaidLeaveListResponse> {
  const { data } = await httpClient.get<PaidLeaveListResponse>(
    '/api/paid-leaves',
    { params: filters },
  )

  return data
}

async function fetchPaidLeavesPlaceholder(
  filters: PaidLeaveListFilters,
): Promise<PaidLeaveListResponse> {
  await delay(PLACEHOLDER_DELAY_MS)

  const data = filterPlaceholderLeaves(paidLeaveListPlaceholder, filters)

  return {
    data,
    meta: {
      total: data.length,
      source: 'placeholder',
    },
  }
}

export async function fetchPaidLeaves(
  filters: PaidLeaveListFilters = {},
): Promise<PaidLeaveListResponse> {
  const hasApiBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL)

  if (hasApiBaseUrl) {
    try {
      return await fetchPaidLeavesFromApi(filters)
    } catch {
      return fetchPaidLeavesPlaceholder(filters)
    }
  }

  return fetchPaidLeavesPlaceholder(filters)
}
