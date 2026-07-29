import { httpClient } from '../../../shared/api/http-client'
import { branchListPlaceholder } from '../data/branches-placeholder'
import type { BranchListItem } from '../types/branch'
import type { BranchListFilters } from './branch-query-keys'

export type BranchListResponse = {
  data: BranchListItem[]
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

function filterPlaceholderBranches(
  branches: BranchListItem[],
  filters: BranchListFilters,
) {
  const search = filters.search?.trim().toLowerCase()

  if (!search) {
    return branches
  }

  return branches.filter((item) => {
    const haystack = [
      item.name,
      item.phone,
      item.address,
      String(item.totalStudent),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
}

async function fetchBranchesFromApi(
  filters: BranchListFilters,
): Promise<BranchListResponse> {
  const { data } = await httpClient.get<BranchListResponse>('/api/branches', {
    params: filters,
  })

  return data
}

async function fetchBranchesPlaceholder(
  filters: BranchListFilters,
): Promise<BranchListResponse> {
  await delay(PLACEHOLDER_DELAY_MS)

  const data = filterPlaceholderBranches(branchListPlaceholder, filters)

  return {
    data,
    meta: {
      total: data.length,
      source: 'placeholder',
    },
  }
}

export async function fetchBranches(
  filters: BranchListFilters = {},
): Promise<BranchListResponse> {
  const hasApiBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL)

  if (hasApiBaseUrl) {
    try {
      return await fetchBranchesFromApi(filters)
    } catch {
      return fetchBranchesPlaceholder(filters)
    }
  }

  return fetchBranchesPlaceholder(filters)
}
