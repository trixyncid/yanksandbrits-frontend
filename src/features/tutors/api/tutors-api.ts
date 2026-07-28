import { httpClient } from '../../../shared/api/http-client'
import { tutorListPlaceholder } from '../data/tutors-placeholder'
import type { TutorListItem } from '../types/tutor'
import type { TutorListFilters } from './tutor-query-keys'

export type TutorListResponse = {
  data: TutorListItem[]
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

function filterPlaceholderTutors(
  tutors: TutorListItem[],
  filters: TutorListFilters,
) {
  const search = filters.search?.trim().toLowerCase()

  return tutors.filter((item) => {
    if (filters.isActive === 'active' && !item.isActive) {
      return false
    }

    if (filters.isActive === 'inactive' && item.isActive) {
      return false
    }

    if (!search) {
      return true
    }

    const haystack = [
      item.pin,
      item.fullName,
      item.email,
      item.phone,
      item.gender,
      item.isActive ? 'active' : 'inactive',
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
}

async function fetchTutorsFromApi(
  filters: TutorListFilters,
): Promise<TutorListResponse> {
  const { data } = await httpClient.get<TutorListResponse>('/api/tutors', {
    params: filters,
  })

  return data
}

async function fetchTutorsPlaceholder(
  filters: TutorListFilters,
): Promise<TutorListResponse> {
  await delay(PLACEHOLDER_DELAY_MS)

  const data = filterPlaceholderTutors(tutorListPlaceholder, filters)

  return {
    data,
    meta: {
      total: data.length,
      source: 'placeholder',
    },
  }
}

export async function fetchTutors(
  filters: TutorListFilters = {},
): Promise<TutorListResponse> {
  const hasApiBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL)

  if (hasApiBaseUrl) {
    try {
      return await fetchTutorsFromApi(filters)
    } catch {
      return fetchTutorsPlaceholder(filters)
    }
  }

  return fetchTutorsPlaceholder(filters)
}
