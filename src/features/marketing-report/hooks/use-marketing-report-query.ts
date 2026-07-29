import { useQuery } from '@tanstack/react-query'

import { fetchMarketingReport } from '../api/marketing-report-api'
import {
  marketingReportQueryKeys,
  type MarketingReportListFilters,
} from '../api/marketing-report-query-keys'

export function useMarketingReportQuery(
  filters: MarketingReportListFilters = {},
) {
  return useQuery({
    queryKey: marketingReportQueryKeys.list(filters),
    queryFn: () => fetchMarketingReport(filters),
  })
}
