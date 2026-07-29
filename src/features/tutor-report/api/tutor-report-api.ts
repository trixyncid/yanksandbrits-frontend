import { httpClient } from '../../../shared/api/http-client'
import {
  tutorReportListPlaceholder,
  tutorReportPeriod,
} from '../data/tutor-report-placeholder'
import type { TutorReportListItem } from '../types/tutor-report'
import type { TutorReportListFilters } from './tutor-report-query-keys'

export type TutorReportListResponse = {
  data: TutorReportListItem[]
  meta: {
    total: number
    source: 'api' | 'placeholder'
    period: string
  }
}

const PLACEHOLDER_DELAY_MS = 450

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function filterPlaceholder(
  items: TutorReportListItem[],
  filters: TutorReportListFilters,
) {
  const search = filters.search?.trim().toLowerCase()

  if (!search) {
    return items
  }

  return items.filter((item) => {
    const haystack = [
      item.tutorPin,
      item.tutorName,
      item.tutorEmail,
      String(item.totalSalary),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
}

export async function fetchTutorReport(
  filters: TutorReportListFilters = {},
): Promise<TutorReportListResponse> {
  const hasApiBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL)

  if (hasApiBaseUrl) {
    try {
      const { data } = await httpClient.get<TutorReportListResponse>(
        '/api/reports/tutors',
        { params: filters },
      )
      return data
    } catch {
      // fall through
    }
  }

  await delay(PLACEHOLDER_DELAY_MS)
  const data = filterPlaceholder(tutorReportListPlaceholder, filters)

  return {
    data,
    meta: {
      total: data.length,
      source: 'placeholder',
      period: tutorReportPeriod,
    },
  }
}
