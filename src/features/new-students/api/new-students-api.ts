import { httpClient } from '../../../shared/api/http-client'
import { useNewStudentsStore } from '../store/new-students-store'
import type { NewStudentListItem } from '../types/new-student'
import type { NewStudentListFilters } from './new-student-query-keys'

export type NewStudentListResponse = {
  data: NewStudentListItem[]
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

function filterPlaceholderStudents(
  students: NewStudentListItem[],
  filters: NewStudentListFilters,
) {
  const search = filters.search?.trim().toLowerCase()

  return students.filter((student) => {
    // Match Django list: exclude leads already moved to prediction test.
    if (student.status === 'prediction_test') {
      return false
    }

    if (
      filters.status &&
      filters.status !== 'all' &&
      student.status !== filters.status
    ) {
      return false
    }

    if (
      filters.branchId &&
      student.branch.toLowerCase() !== filters.branchId.toLowerCase()
    ) {
      return false
    }

    if (!search) {
      return true
    }

    const haystack = [
      student.fullName,
      student.email,
      student.phone,
      student.course,
      student.status,
      student.educationCounsellor,
      student.branch,
      student.gender,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
}

async function fetchNewStudentsFromApi(
  filters: NewStudentListFilters,
): Promise<NewStudentListResponse> {
  const { data } = await httpClient.get<NewStudentListResponse>(
    '/api/new-students',
    { params: filters },
  )

  return data
}

async function fetchNewStudentsPlaceholder(
  filters: NewStudentListFilters,
): Promise<NewStudentListResponse> {
  await delay(PLACEHOLDER_DELAY_MS)

  const data = filterPlaceholderStudents(
    useNewStudentsStore.getState().items,
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

export async function fetchNewStudents(
  filters: NewStudentListFilters = {},
): Promise<NewStudentListResponse> {
  const hasApiBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL)

  if (hasApiBaseUrl) {
    try {
      return await fetchNewStudentsFromApi(filters)
    } catch {
      return fetchNewStudentsPlaceholder(filters)
    }
  }

  return fetchNewStudentsPlaceholder(filters)
}
