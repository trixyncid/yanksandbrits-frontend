import { httpClient } from '../../../shared/api/http-client'
import { adminPath } from '../../../shared/api/paths'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import type { ProgramFormValues, ProgramListItem } from '../types/program'
import type {
  ProgramFilteredFilters,
  ProgramListFilters,
} from './program-query-keys'

export type ProgramListResponse = {
  data: ProgramListItem[]
  meta: {
    total: number
  }
}

type ProgramDto = {
  id: number
  code: string
  title: string
  description: string | null
  is_active: boolean
  background_color: string | null
  text_color: string | null
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

function mapProgram(dto: ProgramDto): ProgramListItem {
  return {
    id: String(dto.id),
    code: dto.code,
    title: dto.title,
    description: dto.description ?? '',
    isActive: dto.is_active,
    backgroundColor: dto.background_color || '#FFFFFF',
    textColor: dto.text_color || '#000000',
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    createdBy: dto.created_by_name,
    updatedBy: dto.updated_by_name,
  }
}

function toWritePayload(values: ProgramFormValues) {
  return {
    code: values.code.trim(),
    title: values.title.trim(),
    description: values.description.trim() || null,
    is_active: values.isActive,
    background_color: values.backgroundColor.trim(),
    text_color: values.textColor.trim(),
  }
}

async function fetchProgramPage(params: {
  page: number
  page_size: number
  search?: string
  is_active?: boolean
}) {
  const { data } = await httpClient.get<
    ApiSuccessEnvelope<ProgramDto[]> & { meta: PaginatedMeta | null }
  >(adminPath('/programs'), { params })

  return {
    items: (data.data ?? []).map(mapProgram),
    total: data.meta?.count ?? data.data?.length ?? 0,
  }
}

type FilteredProgramDto = {
  id: number
  code: string
  title: string
}

export async function fetchFilteredPrograms(
  filters: ProgramFilteredFilters = {},
): Promise<ProgramListItem[]> {
  const { data } = await httpClient.get<
    ApiSuccessEnvelope<{ programs: FilteredProgramDto[] }>
  >(adminPath('/programs/filtered'), {
    params: {
      student_id: filters.studentId ? Number(filters.studentId) : undefined,
      student_group_id: filters.studentGroupId
        ? Number(filters.studentGroupId)
        : undefined,
    },
  })

  return (data.data?.programs ?? []).map((program) => ({
    id: String(program.id),
    code: program.code,
    title: program.title,
    description: '',
    isActive: true,
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    createdAt: '',
    updatedAt: '',
    createdBy: null,
    updatedBy: null,
  }))
}

export async function fetchPrograms(
  filters: ProgramListFilters = {},
): Promise<ProgramListResponse> {
  const search = filters.search?.trim() || undefined
  const isActive =
    filters.isActive === 'active'
      ? true
      : filters.isActive === 'inactive'
        ? false
        : undefined

  const pageSize = 100
  const first = await fetchProgramPage({
    page: 1,
    page_size: pageSize,
    search,
    is_active: isActive,
  })

  const items = [...first.items]
  let page = 2

  while (items.length < first.total) {
    const next = await fetchProgramPage({
      page,
      page_size: pageSize,
      search,
      is_active: isActive,
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

export async function fetchProgram(id: string): Promise<ProgramListItem> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<ProgramDto>>(
    adminPath(`/programs/${id}`),
  )
  return mapProgram(data.data)
}

export async function createProgram(
  values: ProgramFormValues,
): Promise<ProgramListItem> {
  const { data } = await httpClient.post<ApiSuccessEnvelope<ProgramDto>>(
    adminPath('/programs'),
    toWritePayload(values),
  )
  return mapProgram(data.data)
}

export async function updateProgram(
  id: string,
  values: ProgramFormValues,
): Promise<ProgramListItem> {
  const { data } = await httpClient.patch<ApiSuccessEnvelope<ProgramDto>>(
    adminPath(`/programs/${id}`),
    toWritePayload(values),
  )
  return mapProgram(data.data)
}

export async function deleteProgram(id: string): Promise<void> {
  await httpClient.delete(adminPath(`/programs/${id}`))
}

export function programToFormValues(
  program: ProgramListItem,
): ProgramFormValues {
  return {
    code: program.code,
    title: program.title,
    description: program.description,
    isActive: program.isActive,
    backgroundColor: program.backgroundColor,
    textColor: program.textColor,
  }
}

export const emptyProgramFormValues: ProgramFormValues = {
  code: '',
  title: '',
  description: '',
  isActive: true,
  backgroundColor: '#4274B9',
  textColor: '#FFFFFF',
}
