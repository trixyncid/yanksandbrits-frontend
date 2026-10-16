import { isAxiosError, type AxiosInstance } from 'axios'

import type { ApiSuccessEnvelope } from './types'

export type PaginatedMeta = {
  count?: number
  next?: string | null
  previous?: string | null
  page?: number
  page_size?: number
}

type FetchAllPagesOptions = {
  client: AxiosInstance
  path: string
  params?: Record<string, unknown>
  pageSize?: number
}

type PageEnvelope<TDto> = ApiSuccessEnvelope<TDto[]> & {
  meta: PaginatedMeta | null
}

/**
 * Requests in flight at once after the first page. Enough to hide network
 * latency, and keeps a large list well under the API's per-user rate limit.
 */
const MAX_PARALLEL_PAGES = 4

export async function fetchAllPages<TDto>(
  options: FetchAllPagesOptions,
): Promise<{ items: TDto[]; total: number }> {
  const { client, path, params = {}, pageSize = 100 } = options

  const fetchPage = async (page: number) => {
    try {
      const { data } = await client.get<PageEnvelope<TDto>>(path, {
        params: { ...params, page, page_size: pageSize },
      })
      return data.data ?? []
    } catch (error) {
      // Rows deleted since page 1 can leave the last page past the end (404).
      if (isAxiosError(error) && error.response?.status === 404) return []
      throw error
    }
  }

  // The first page tells us how many pages exist; fetch the rest in parallel.
  const first = await client.get<PageEnvelope<TDto>>(path, {
    params: { ...params, page: 1, page_size: pageSize },
  })
  const firstItems = first.data.data ?? []
  const total = first.data.meta?.count ?? firstItems.length
  // The server caps page_size, so count pages with the size it really used.
  const servedPageSize = first.data.meta?.page_size || firstItems.length || pageSize
  const pageCount = Math.ceil(total / servedPageSize)

  const remaining = Array.from({ length: Math.max(pageCount - 1, 0) }, (_, i) => i + 2)
  const pages: TDto[][] = new Array(remaining.length)
  let cursor = 0

  // A fixed pool of workers, each taking the next page number until none are
  // left; results are stored by position, so the order matches the server's.
  const worker = async () => {
    while (cursor < remaining.length) {
      const index = cursor++
      pages[index] = await fetchPage(remaining[index])
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(MAX_PARALLEL_PAGES, remaining.length) }, worker),
  )

  return { items: firstItems.concat(...pages), total }
}
