import { httpClient } from '../../../shared/api/http-client'
import { useStudentsStore } from '../store/students-store'
import type { StudentListItem } from '../types/student'
import type { StudentListFilters } from './student-query-keys'

export type StudentListResponse = {
  data: StudentListItem[]
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
  students: StudentListItem[],
  filters: StudentListFilters,
) {
  const search = filters.search?.trim().toLowerCase()

  return students.filter((student) => {
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
      student.pin,
      student.fullName,
      student.email,
      student.mobilePhone,
      student.counsellor,
      student.branch,
      student.status,
      student.gender === 'M' ? 'male' : 'female',
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
}

async function fetchStudentsFromApi(
  filters: StudentListFilters,
): Promise<StudentListResponse> {
  const { data } = await httpClient.get<StudentListResponse>('/api/students', {
    params: filters,
  })

  return data
}

async function fetchStudentsPlaceholder(
  filters: StudentListFilters,
): Promise<StudentListResponse> {
  await delay(PLACEHOLDER_DELAY_MS)

  const data = filterPlaceholderStudents(
    useStudentsStore.getState().list(),
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

/**
 * Student list fetch layer.
 * Uses the real API when `VITE_API_BASE_URL` is configured,
 * otherwise falls back to local placeholder data.
 */
export async function fetchStudents(
  filters: StudentListFilters = {},
): Promise<StudentListResponse> {
  const hasApiBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL)

  if (hasApiBaseUrl) {
    try {
      return await fetchStudentsFromApi(filters)
    } catch {
      return fetchStudentsPlaceholder(filters)
    }
  }

  return fetchStudentsPlaceholder(filters)
}
