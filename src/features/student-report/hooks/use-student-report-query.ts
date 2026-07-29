import { useQuery } from '@tanstack/react-query'

import { fetchStudentReport } from '../api/student-report-api'
import {
  studentReportQueryKeys,
  type StudentReportFilters,
} from '../api/student-report-query-keys'

export function useStudentReportQuery(
  filters: StudentReportFilters | null,
) {
  return useQuery({
    queryKey: filters
      ? studentReportQueryKeys.list(filters)
      : studentReportQueryKeys.all,
    queryFn: () => {
      if (!filters) {
        throw new Error('Student report filters are required')
      }

      return fetchStudentReport(filters)
    },
    enabled: Boolean(filters),
  })
}
