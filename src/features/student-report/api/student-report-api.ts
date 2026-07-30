import { downloadBlob } from '../../../shared/api/download'
import { httpClient } from '../../../shared/api/http-client'
import type { StudentReportFilters } from './student-report-query-keys'

function dateRangeParam(filters: StudentReportFilters) {
  return `${filters.startDate} to ${filters.endDate}`
}

export async function downloadStudentRegistrationPdf(
  filters: StudentReportFilters,
): Promise<void> {
  const { data } = await httpClient.get<Blob>(
    '/reports/student-registrations',
    {
      params: {
        date_range: dateRangeParam(filters),
        branch: Number(filters.branchId),
      },
      responseType: 'blob',
      timeout: 60000,
    },
  )

  await downloadBlob(
    data,
    `student-registrations-${filters.startDate}_${filters.endDate}.pdf`,
  )
}
