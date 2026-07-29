import { useQuery } from '@tanstack/react-query'

import { fetchAppointmentReport } from '../api/appointment-report-api'
import {
  appointmentReportQueryKeys,
  type AppointmentReportFilters,
} from '../api/appointment-report-query-keys'

export function useAppointmentReportQuery(
  filters: AppointmentReportFilters | null,
) {
  return useQuery({
    queryKey: filters
      ? appointmentReportQueryKeys.list(filters)
      : appointmentReportQueryKeys.all,
    queryFn: () => {
      if (!filters) {
        throw new Error('Appointment report filters are required')
      }

      return fetchAppointmentReport(filters)
    },
    enabled: Boolean(filters),
  })
}
