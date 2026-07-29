import { httpClient } from '../../../shared/api/http-client'
import {
  marketingReportListPlaceholder,
  marketingReportPeriod,
} from '../data/marketing-report-placeholder'
import type { MarketingReportListItem } from '../types/marketing-report'
import type { MarketingReportListFilters } from './marketing-report-query-keys'

export type MarketingReportListResponse = {
  data: MarketingReportListItem[]
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
  items: MarketingReportListItem[],
  filters: MarketingReportListFilters,
) {
  const search = filters.search?.trim().toLowerCase()

  if (!search) {
    return items
  }

  return items.filter((item) => {
    const haystack = [
      item.marketerPin,
      item.marketerName,
      item.email,
      item.branch,
      String(item.totalSalary),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
}

export async function fetchMarketingReport(
  filters: MarketingReportListFilters = {},
): Promise<MarketingReportListResponse> {
  const hasApiBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL)

  if (hasApiBaseUrl) {
    try {
      const { data } = await httpClient.get<MarketingReportListResponse>(
        '/api/reports/marketing',
        { params: filters },
      )
      return data
    } catch {
      // fall through
    }
  }

  await delay(PLACEHOLDER_DELAY_MS)
  const data = filterPlaceholder(marketingReportListPlaceholder, filters)

  return {
    data,
    meta: {
      total: data.length,
      source: 'placeholder',
      period: marketingReportPeriod,
    },
  }
}
