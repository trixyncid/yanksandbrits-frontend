import { httpClient } from '../../../shared/api/http-client'
import { predictionTestListPlaceholder } from '../data/prediction-tests-placeholder'
import type { PredictionTestListItem } from '../types/prediction-test'
import type { PredictionTestListFilters } from './prediction-test-query-keys'

export type PredictionTestListResponse = {
  data: PredictionTestListItem[]
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

function filterPlaceholderTests(
  tests: PredictionTestListItem[],
  filters: PredictionTestListFilters,
) {
  const search = filters.search?.trim().toLowerCase()

  return tests.filter((test) => {
    if (
      filters.status &&
      filters.status !== 'all' &&
      test.status !== filters.status
    ) {
      return false
    }

    if (
      filters.branchId &&
      test.branch.toLowerCase() !== filters.branchId.toLowerCase()
    ) {
      return false
    }

    if (!search) {
      return true
    }

    const haystack = [
      test.studentName,
      test.studentEmail,
      test.studentPhone,
      test.description,
      test.educationCounsellor,
      test.branch,
      test.status,
      String(test.amount),
      test.score == null ? '' : String(test.score),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
}

async function fetchPredictionTestsFromApi(
  filters: PredictionTestListFilters,
): Promise<PredictionTestListResponse> {
  const { data } = await httpClient.get<PredictionTestListResponse>(
    '/api/prediction-tests',
    { params: filters },
  )

  return data
}

async function fetchPredictionTestsPlaceholder(
  filters: PredictionTestListFilters,
): Promise<PredictionTestListResponse> {
  await delay(PLACEHOLDER_DELAY_MS)

  const data = filterPlaceholderTests(predictionTestListPlaceholder, filters)

  return {
    data,
    meta: {
      total: data.length,
      source: 'placeholder',
    },
  }
}

export async function fetchPredictionTests(
  filters: PredictionTestListFilters = {},
): Promise<PredictionTestListResponse> {
  const hasApiBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL)

  if (hasApiBaseUrl) {
    try {
      return await fetchPredictionTestsFromApi(filters)
    } catch {
      return fetchPredictionTestsPlaceholder(filters)
    }
  }

  return fetchPredictionTestsPlaceholder(filters)
}
