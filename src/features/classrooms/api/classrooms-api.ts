import { httpClient } from '../../../shared/api/http-client'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import type {
  ClassroomFormValues,
  ClassroomListItem,
} from '../types/classroom'
import type { ClassroomListFilters } from './classroom-query-keys'
import { adminPath } from '../../../shared/api/paths'

export type ClassroomListResponse = {
  data: ClassroomListItem[]
  meta: {
    total: number
  }
}

type ClassroomDto = {
  id: number
  code: string
  class_name: string
  is_active: boolean
  branch: number | null
  branch_name: string | null
  created_at: string
  updated_at: string
  created_by: number | null
  created_by_name: string | null
  updated_by: number | null
  updated_by_name: string | null
}

type PaginatedMeta = {
  count?: number
  next?: string | null
  previous?: string | null
  page?: number
  page_size?: number
}

function mapClassroom(dto: ClassroomDto): ClassroomListItem {
  return {
    id: String(dto.id),
    code: dto.code,
    className: dto.class_name,
    isActive: dto.is_active,
    branchId: dto.branch == null ? null : String(dto.branch),
    branchName: dto.branch_name,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    createdBy: dto.created_by_name,
    updatedBy: dto.updated_by_name,
  }
}

function toWritePayload(values: ClassroomFormValues) {
  return {
    code: values.code.trim(),
    class_name: values.className.trim(),
    is_active: values.isActive,
    branch: values.branchId ? Number(values.branchId) : null,
  }
}

async function fetchClassroomPage(params: {
  page: number
  page_size: number
  search?: string
  is_active?: boolean
  branch?: number
}) {
  const { data } = await httpClient.get<
    ApiSuccessEnvelope<ClassroomDto[]> & { meta: PaginatedMeta | null }
  >(adminPath('/classrooms'), { params })

  return {
    items: (data.data ?? []).map(mapClassroom),
    total: data.meta?.count ?? data.data?.length ?? 0,
  }
}

export async function fetchClassrooms(
  filters: ClassroomListFilters = {},
): Promise<ClassroomListResponse> {
  const search = filters.search?.trim() || undefined
  const isActive =
    filters.isActive === 'active'
      ? true
      : filters.isActive === 'inactive'
        ? false
        : undefined
  const branch = filters.branchId ? Number(filters.branchId) : undefined

  const pageSize = 100
  const first = await fetchClassroomPage({
    page: 1,
    page_size: pageSize,
    search,
    is_active: isActive,
    branch,
  })

  const items = [...first.items]
  let page = 2

  while (items.length < first.total) {
    const next = await fetchClassroomPage({
      page,
      page_size: pageSize,
      search,
      is_active: isActive,
      branch,
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

export async function fetchClassroom(id: string): Promise<ClassroomListItem> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<ClassroomDto>>(
    adminPath(`/classrooms/${id}`),
  )
  return mapClassroom(data.data)
}

export async function createClassroom(
  values: ClassroomFormValues,
): Promise<ClassroomListItem> {
  const { data } = await httpClient.post<ApiSuccessEnvelope<ClassroomDto>>(
    adminPath('/classrooms'),
    toWritePayload(values),
  )
  return mapClassroom(data.data)
}

export async function updateClassroom(
  id: string,
  values: ClassroomFormValues,
): Promise<ClassroomListItem> {
  const { data } = await httpClient.patch<ApiSuccessEnvelope<ClassroomDto>>(
    adminPath(`/classrooms/${id}`),
    toWritePayload(values),
  )
  return mapClassroom(data.data)
}

export async function deleteClassroom(id: string): Promise<void> {
  await httpClient.delete(adminPath(`/classrooms/${id}`))
}

export function classroomToFormValues(
  classroom: ClassroomListItem,
): ClassroomFormValues {
  return {
    code: classroom.code,
    className: classroom.className,
    isActive: classroom.isActive,
    branchId: classroom.branchId ?? '',
  }
}

export const emptyClassroomFormValues: ClassroomFormValues = {
  code: '',
  className: '',
  isActive: true,
  branchId: '',
}
