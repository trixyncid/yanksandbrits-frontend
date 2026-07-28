import { httpClient } from '../../../shared/api/http-client'
import { studentResponseListPlaceholder } from '../data/student-responses-placeholder'
import type { StudentResponseListItem } from '../types/student-response'
import type { StudentResponseListFilters } from './student-response-query-keys'

export type StudentResponseListResponse = {
  data: StudentResponseListItem[]
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

function filterPlaceholderResponses(
  responses: StudentResponseListItem[],
  filters: StudentResponseListFilters,
) {
  const search = filters.search?.trim().toLowerCase()

  return responses.filter((response) => {
    if (
      filters.status &&
      filters.status !== 'all' &&
      response.status !== filters.status
    ) {
      return false
    }

    if (!search) {
      return true
    }

    const haystack = [
      response.studentPin,
      response.studentName,
      response.studentEmail,
      response.studentPhone,
      response.title,
      response.tutorPin,
      response.tutorName,
      response.description,
      response.status,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
}

async function fetchStudentResponsesFromApi(
  filters: StudentResponseListFilters,
): Promise<StudentResponseListResponse> {
  const { data } = await httpClient.get<StudentResponseListResponse>(
    '/api/student-responses',
    { params: filters },
  )

  return data
}

async function fetchStudentResponsesPlaceholder(
  filters: StudentResponseListFilters,
): Promise<StudentResponseListResponse> {
  await delay(PLACEHOLDER_DELAY_MS)

  const data = filterPlaceholderResponses(
    studentResponseListPlaceholder,
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

export async function fetchStudentResponses(
  filters: StudentResponseListFilters = {},
): Promise<StudentResponseListResponse> {
  const hasApiBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL)

  if (hasApiBaseUrl) {
    try {
      return await fetchStudentResponsesFromApi(filters)
    } catch {
      return fetchStudentResponsesPlaceholder(filters)
    }
  }

  return fetchStudentResponsesPlaceholder(filters)
}
