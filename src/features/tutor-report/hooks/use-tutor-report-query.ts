import { useQuery } from '@tanstack/react-query'

import { fetchTutorReport } from '../api/tutor-report-api'
import {
  tutorReportQueryKeys,
  type TutorReportListFilters,
} from '../api/tutor-report-query-keys'

export function useTutorReportQuery(filters: TutorReportListFilters = {}) {
  return useQuery({
    queryKey: tutorReportQueryKeys.list(filters),
    queryFn: () => fetchTutorReport(filters),
  })
}
