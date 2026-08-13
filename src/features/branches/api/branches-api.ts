import { httpClient } from '../../../shared/api/http-client'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import type { BranchFormValues, BranchListItem } from '../types/branch'
import type { BranchListFilters } from './branch-query-keys'
import { adminPath } from '../../../shared/api/paths'

export type BranchListResponse = {
  data: BranchListItem[]
  meta: {
    total: number
  }
}

type BranchDto = {
  id: number
  name: string
  address: string | null
  phone: string | null
  created_at: string
  updated_at: string
  created_by: number | null
  created_by_name: string | null
  updated_by: number | null
  updated_by_name: string | null
  total_student: number
}

type PaginatedMeta = {
  count?: number
  next?: string | null
  previous?: string | null
  page?: number
  page_size?: number
}

function mapBranch(dto: BranchDto): BranchListItem {
  return {
    id: String(dto.id),
    name: dto.name,
    phone: dto.phone ?? '',
    address: dto.address ?? '',
    totalStudent: dto.total_student,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    createdBy: dto.created_by_name,
    updatedBy: dto.updated_by_name,
  }
}

function toWritePayload(values: BranchFormValues) {
  return {
    name: values.name.trim(),
    phone: values.phone.trim() || null,
    address: values.address.trim() || null,
  }
}

async function fetchBranchPage(params: {
  page: number
  page_size: number
  search?: string
}) {
  const { data } = await httpClient.get<
    ApiSuccessEnvelope<BranchDto[]> & { meta: PaginatedMeta | null }
  >(adminPath('/branches'), { params })

  return {
    items: (data.data ?? []).map(mapBranch),
    total: data.meta?.count ?? data.data?.length ?? 0,
  }
}

export async function fetchBranches(
  filters: BranchListFilters = {},
): Promise<BranchListResponse> {
  const search = filters.search?.trim() || undefined
  const pageSize = 100
  const first = await fetchBranchPage({
    page: 1,
    page_size: pageSize,
    search,
  })

  const items = [...first.items]
  let page = 2

  while (items.length < first.total) {
    const next = await fetchBranchPage({
      page,
      page_size: pageSize,
      search,
    })
    if (next.items.length === 0) break
    items.push(...next.items)
    page += 1
  }

  return {
    data: items,
    meta: { total: first.total },
  }
}

export async function fetchBranch(id: string): Promise<BranchListItem> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<BranchDto>>(
    adminPath(`/branches/${id}`),
  )
  return mapBranch(data.data)
}

export async function createBranch(
  values: BranchFormValues,
): Promise<BranchListItem> {
  const { data } = await httpClient.post<ApiSuccessEnvelope<BranchDto>>(
    adminPath('/branches'),
    toWritePayload(values),
  )
  return mapBranch(data.data)
}

export async function updateBranch(
  id: string,
  values: BranchFormValues,
): Promise<BranchListItem> {
  const { data } = await httpClient.patch<ApiSuccessEnvelope<BranchDto>>(
    adminPath(`/branches/${id}`),
    toWritePayload(values),
  )
  return mapBranch(data.data)
}

export async function deleteBranch(id: string): Promise<void> {
  await httpClient.delete(adminPath(`/branches/${id}`))
}

export function branchToFormValues(branch: BranchListItem): BranchFormValues {
  return {
    name: branch.name,
    phone: branch.phone,
    address: branch.address,
  }
}

export const emptyBranchFormValues: BranchFormValues = {
  name: '',
  phone: '',
  address: '',
}
