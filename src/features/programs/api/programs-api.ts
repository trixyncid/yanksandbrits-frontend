import { httpClient } from '../../../shared/api/http-client'
import { programListPlaceholder } from '../data/programs-placeholder'
import type { ProgramListItem } from '../types/program'
import type { ProgramListFilters } from './program-query-keys'

export type ProgramListResponse = {
  data: ProgramListItem[]
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

function filterPlaceholderPrograms(
  programs: ProgramListItem[],
  filters: ProgramListFilters,
) {
  const search = filters.search?.trim().toLowerCase()

  return programs.filter((program) => {
    if (filters.isActive === 'active' && !program.isActive) {
      return false
    }

    if (filters.isActive === 'inactive' && program.isActive) {
      return false
    }

    if (!search) {
      return true
    }

    const haystack = [
      program.code,
      program.title,
      program.description,
      program.isActive ? 'active' : 'inactive',
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
}

async function fetchProgramsFromApi(
  filters: ProgramListFilters,
): Promise<ProgramListResponse> {
  const { data } = await httpClient.get<ProgramListResponse>('/api/programs', {
    params: filters,
  })

  return data
}

async function fetchProgramsPlaceholder(
  filters: ProgramListFilters,
): Promise<ProgramListResponse> {
  await delay(PLACEHOLDER_DELAY_MS)

  const data = filterPlaceholderPrograms(programListPlaceholder, filters)

  return {
    data,
    meta: {
      total: data.length,
      source: 'placeholder',
    },
  }
}

export async function fetchPrograms(
  filters: ProgramListFilters = {},
): Promise<ProgramListResponse> {
  const hasApiBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL)

  if (hasApiBaseUrl) {
    try {
      return await fetchProgramsFromApi(filters)
    } catch {
      return fetchProgramsPlaceholder(filters)
    }
  }

  return fetchProgramsPlaceholder(filters)
}
