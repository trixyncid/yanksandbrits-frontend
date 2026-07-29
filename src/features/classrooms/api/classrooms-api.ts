import { httpClient } from '../../../shared/api/http-client'
import { useClassroomsStore } from '../store/classrooms-store'
import type { ClassroomListItem } from '../types/classroom'
import type { ClassroomListFilters } from './classroom-query-keys'

export type ClassroomListResponse = {
  data: ClassroomListItem[]
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

function filterPlaceholderClassrooms(
  classrooms: ClassroomListItem[],
  filters: ClassroomListFilters,
) {
  const search = filters.search?.trim().toLowerCase()

  return classrooms.filter((classroom) => {
    if (filters.isActive === 'active' && !classroom.isActive) {
      return false
    }

    if (filters.isActive === 'inactive' && classroom.isActive) {
      return false
    }

    if (
      filters.branchId &&
      classroom.branch.toLowerCase() !== filters.branchId.toLowerCase()
    ) {
      return false
    }

    if (!search) {
      return true
    }

    const haystack = [
      classroom.code,
      classroom.className,
      classroom.branch,
      classroom.isActive ? 'active' : 'inactive',
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
}

async function fetchClassroomsFromApi(
  filters: ClassroomListFilters,
): Promise<ClassroomListResponse> {
  const { data } = await httpClient.get<ClassroomListResponse>(
    '/api/classrooms',
    { params: filters },
  )

  return data
}

async function fetchClassroomsPlaceholder(
  filters: ClassroomListFilters,
): Promise<ClassroomListResponse> {
  await delay(PLACEHOLDER_DELAY_MS)

  const data = filterPlaceholderClassrooms(
    useClassroomsStore.getState().items,
    filters,
  )

  return {
    data,
    meta: {
      total: data.length,
      source: 'placeholder',
    },
  }
}

export async function fetchClassrooms(
  filters: ClassroomListFilters = {},
): Promise<ClassroomListResponse> {
  const hasApiBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL)

  if (hasApiBaseUrl) {
    try {
      return await fetchClassroomsFromApi(filters)
    } catch {
      return fetchClassroomsPlaceholder(filters)
    }
  }

  return fetchClassroomsPlaceholder(filters)
}
