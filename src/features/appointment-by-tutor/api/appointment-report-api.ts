import { downloadBlob } from '../../../shared/api/download'
import { httpClient } from '../../../shared/api/http-client'
import type { AppointmentReportFilters } from './appointment-report-query-keys'

function dateRangeParam(filters: AppointmentReportFilters) {
  return `${filters.startDate} to ${filters.endDate}`
}

export async function downloadAppointmentByTutorPdf(
  filters: AppointmentReportFilters,
): Promise<void> {
  const params: Record<string, string | number> = {
    date_range: dateRangeParam(filters),
    tutor: Number(filters.tutorId),
  }

  if (filters.branchId && filters.branchId !== 'all') {
    params.branch = Number(filters.branchId)
  }

  const { data } = await httpClient.get<Blob>(
    '/reports/appointments-by-tutor',
    {
      params,
      responseType: 'blob',
      timeout: 60000,
    },
  )

  await downloadBlob(
    data,
    `appointments-by-tutor-${filters.startDate}_${filters.endDate}.pdf`,
  )
}
