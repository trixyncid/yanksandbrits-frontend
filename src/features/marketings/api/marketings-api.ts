import { httpClient } from '../../../shared/api/http-client'
import { marketingListPlaceholder } from '../data/marketings-placeholder'
import type { MarketingListItem } from '../types/marketing'
import type { MarketingListFilters } from './marketing-query-keys'

export type MarketingListResponse = {
  data: MarketingListItem[]
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

function filterPlaceholderMarketings(
  marketings: MarketingListItem[],
  filters: MarketingListFilters,
) {
  const search = filters.search?.trim().toLowerCase()

  return marketings.filter((item) => {
    if (filters.isActive === 'active' && !item.isActive) {
      return false
    }

    if (filters.isActive === 'inactive' && item.isActive) {
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
      item.phone,
      item.gender,
      item.branch,
      item.isActive ? 'active' : 'inactive',
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
}

async function fetchMarketingsFromApi(
  filters: MarketingListFilters,
): Promise<MarketingListResponse> {
  const { data } = await httpClient.get<MarketingListResponse>(
    '/api/marketings',
    { params: filters },
  )

  return data
}

async function fetchMarketingsPlaceholder(
  filters: MarketingListFilters,
): Promise<MarketingListResponse> {
  await delay(PLACEHOLDER_DELAY_MS)

  const data = filterPlaceholderMarketings(marketingListPlaceholder, filters)

  return {
    data,
    meta: {
      total: data.length,
      source: 'placeholder',
    },
  }
}

export async function fetchMarketings(
  filters: MarketingListFilters = {},
): Promise<MarketingListResponse> {
  const hasApiBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL)

  if (hasApiBaseUrl) {
    try {
      return await fetchMarketingsFromApi(filters)
    } catch {
      return fetchMarketingsPlaceholder(filters)
    }
  }

  return fetchMarketingsPlaceholder(filters)
}
