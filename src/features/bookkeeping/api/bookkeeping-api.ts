import { httpClient } from '../../../shared/api/http-client'
import { bookkeepingListPlaceholder } from '../data/bookkeeping-placeholder'
import type { BookkeepingListItem } from '../types/bookkeeping'
import type { BookkeepingListFilters } from './bookkeeping-query-keys'

export type BookkeepingListResponse = {
  data: BookkeepingListItem[]
  meta: { total: number; source: 'api' | 'placeholder' }
}

const PLACEHOLDER_DELAY_MS = 450

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function filterPlaceholder(
  items: BookkeepingListItem[],
  filters: BookkeepingListFilters,
) {
  const search = filters.search?.trim().toLowerCase()

  return items.filter((item) => {
    if (
      filters.status &&
      filters.status !== 'all' &&
      item.status !== filters.status
    ) {
      return false
    }

    if (!search) {
      return true
    }

    const haystack = [
      item.startDate,
      item.endDate,
      item.status,
      item.createdBy,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
}

export async function fetchBookkeeping(
  filters: BookkeepingListFilters = {},
): Promise<BookkeepingListResponse> {
  const hasApiBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL)

  if (hasApiBaseUrl) {
    try {
      const { data } = await httpClient.get<BookkeepingListResponse>(
        '/api/bookkeeping',
        { params: filters },
      )
      return data
    } catch {
      // fall through
    }
  }

  await delay(PLACEHOLDER_DELAY_MS)
  const data = filterPlaceholder(bookkeepingListPlaceholder, filters)

  return {
    data,
    meta: { total: data.length, source: 'placeholder' },
  }
}
