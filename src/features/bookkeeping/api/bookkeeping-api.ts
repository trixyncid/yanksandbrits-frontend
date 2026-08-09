import {
  mapApprovalStatusFromApi,
  mapApprovalStatusToApi,
  type ApprovalStatusUi,
} from '../../../shared/api/choices'
import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import type { BookkeepingListItem } from '../types/bookkeeping'
import type { BookkeepingListFilters } from './bookkeeping-query-keys'
import { adminPath } from '../../../shared/api/paths'

export type BookkeepingListResponse = {
  data: BookkeepingListItem[]
  meta: { total: number }
}

export type BookkeepingFormValues = {
  startDate: string
  endDate: string
  title?: string
  status: ApprovalStatusUi
  branchId?: string
  brandId?: string
}

type BookkeepingDto = {
  id: number
  start_date: string
  end_date: string
  title?: string
  status: string
  branch: number | null
  brand: number | null
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
  created_by_name?: string | null
}

function mapBookkeeping(dto: BookkeepingDto): BookkeepingListItem {
  return {
    id: String(dto.id),
    startDate: dto.start_date,
    endDate: dto.end_date,
    status: mapApprovalStatusFromApi(dto.status),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    createdBy:
      dto.created_by_name ??
      (dto.created_by == null ? '—' : String(dto.created_by)),
  }
}

function toWritePayload(values: BookkeepingFormValues) {
  return {
    start_date: values.startDate,
    end_date: values.endDate,
    title: values.title?.trim() || '',
    status: mapApprovalStatusToApi(values.status),
    branch: values.branchId ? Number(values.branchId) : null,
    brand: values.brandId ? Number(values.brandId) : null,
  }
}

export async function fetchBookkeeping(
  filters: BookkeepingListFilters = {},
): Promise<BookkeepingListResponse> {
  const params: Record<string, unknown> = {
    search: filters.search?.trim() || undefined,
  }

  if (filters.status && filters.status !== 'all') {
    params.status = mapApprovalStatusToApi(filters.status)
  }

  const { items, total } = await fetchAllPages<BookkeepingDto>({
    client: httpClient,
    path: adminPath('/bookkeepings'),
    params,
  })

  return {
    data: items.map(mapBookkeeping),
    meta: { total },
  }
}

export async function fetchBookkeepingItem(
  id: string,
): Promise<BookkeepingListItem> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<BookkeepingDto>>(
    adminPath(`/bookkeepings/${id}`),
  )
  return mapBookkeeping(data.data)
}

export async function createBookkeeping(
  values: BookkeepingFormValues,
): Promise<BookkeepingListItem> {
  const { data } = await httpClient.post<ApiSuccessEnvelope<BookkeepingDto>>(
    adminPath('/bookkeepings'),
    toWritePayload(values),
  )
  return mapBookkeeping(data.data)
}

export async function updateBookkeeping(
  id: string,
  values: BookkeepingFormValues,
): Promise<BookkeepingListItem> {
  const { data } = await httpClient.patch<ApiSuccessEnvelope<BookkeepingDto>>(
    adminPath(`/bookkeepings/${id}`),
    toWritePayload(values),
  )
  return mapBookkeeping(data.data)
}

export async function deleteBookkeeping(id: string): Promise<void> {
  await httpClient.delete(adminPath(`/bookkeepings/${id}`))
}

export async function recalculateBookkeeping(id: string): Promise<void> {
  await httpClient.post(adminPath(`/bookkeepings/${id}/recalculate`))
}

export async function updateOpenPeriodSalaries(): Promise<void> {
  await httpClient.post(adminPath('/bookkeepings/update-open-period-salaries'))
}
