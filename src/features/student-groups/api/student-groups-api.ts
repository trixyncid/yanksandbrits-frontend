import { httpClient } from '../../../shared/api/http-client'
import { studentGroupListPlaceholder } from '../data/student-groups-placeholder'
import type { StudentGroupListItem } from '../types/student-group'
import type { StudentGroupListFilters } from './student-group-query-keys'

export type StudentGroupListResponse = {
  data: StudentGroupListItem[]
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

function filterPlaceholderGroups(
  groups: StudentGroupListItem[],
  filters: StudentGroupListFilters,
) {
  const search = filters.search?.trim().toLowerCase()

  return groups.filter((group) => {
    if (filters.status && filters.status !== 'all' && group.status !== filters.status) {
      return false
    }

    if (
      filters.branchId &&
      group.branch.toLowerCase() !== filters.branchId.toLowerCase()
    ) {
      return false
    }

    if (!search) {
      return true
    }

    const haystack = [
      group.groupName,
      group.createdBy,
      group.branch,
      group.status,
      ...group.members.map((member) => `${member.fullName} ${member.pin}`),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
}

async function fetchStudentGroupsFromApi(
  filters: StudentGroupListFilters,
): Promise<StudentGroupListResponse> {
  const { data } = await httpClient.get<StudentGroupListResponse>(
    '/api/student-groups',
    { params: filters },
  )

  return data
}

async function fetchStudentGroupsPlaceholder(
  filters: StudentGroupListFilters,
): Promise<StudentGroupListResponse> {
  await delay(PLACEHOLDER_DELAY_MS)

  const data = filterPlaceholderGroups(studentGroupListPlaceholder, filters)

  return {
    data,
    meta: {
      total: data.length,
      source: 'placeholder',
    },
  }
}

export async function fetchStudentGroups(
  filters: StudentGroupListFilters = {},
): Promise<StudentGroupListResponse> {
  const hasApiBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL)

  if (hasApiBaseUrl) {
    try {
      return await fetchStudentGroupsFromApi(filters)
    } catch {
      return fetchStudentGroupsPlaceholder(filters)
    }
  }

  return fetchStudentGroupsPlaceholder(filters)
}
