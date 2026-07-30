import type { AxiosInstance } from 'axios'

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

export async function fetchAllPages<TDto>(
  options: FetchAllPagesOptions,
): Promise<{ items: TDto[]; total: number }> {
  const { client, path, params = {}, pageSize = 100 } = options

  const first = await client.get<
    ApiSuccessEnvelope<TDto[]> & { meta: PaginatedMeta | null }
  >(path, {
    params: { ...params, page: 1, page_size: pageSize },
  })

  const items = [...(first.data.data ?? [])]
  const total = first.data.meta?.count ?? items.length
  let page = 2

  while (items.length < total) {
    const next = await client.get<
      ApiSuccessEnvelope<TDto[]> & { meta: PaginatedMeta | null }
    >(path, {
      params: { ...params, page, page_size: pageSize },
    })
    const batch = next.data.data ?? []
    if (batch.length === 0) break
    items.push(...batch)
    page += 1
  }

  return { items, total }
}
