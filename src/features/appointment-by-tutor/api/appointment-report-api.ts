import { httpClient } from '../../../shared/api/http-client'
import {
  appointmentReportPlaceholderRows,
  appointmentTutorOptions,
} from '../data/appointment-placeholder'
import type { AppointmentReportRow } from '../types/appointment-report'
import type { AppointmentReportFilters } from './appointment-report-query-keys'

export type AppointmentReportResponse = {
  data: AppointmentReportRow[]
  meta: {
    total: number
    source: 'api' | 'placeholder'
    tutorLabel: string
    branchLabel: string
    startDate: string
    endDate: string
  }
}

const PLACEHOLDER_DELAY_MS = 450

const branchLabels: Record<string, string> = {
  all: 'All Branch',
  main: 'Main Branch',
  west: 'West Branch',
  south: 'South Branch',
}

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function filterPlaceholder(
  rows: AppointmentReportRow[],
  filters: AppointmentReportFilters,
) {
  const start = new Date(filters.startDate)
  const end = new Date(`${filters.endDate}T23:59:59`)

  return rows.filter((row) => {
    if (row.tutorId !== filters.tutorId) {
      return false
    }

    if (
      filters.branchId !== 'all' &&
      row.branch.toLowerCase() !==
        (branchLabels[filters.branchId] ?? '').toLowerCase()
    ) {
      return false
    }

    const appointmentDate = new Date(row.appointmentTime)
    return appointmentDate >= start && appointmentDate <= end
  })
}

export async function fetchAppointmentReport(
  filters: AppointmentReportFilters,
): Promise<AppointmentReportResponse> {
  const hasApiBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL)

  if (hasApiBaseUrl) {
    try {
      const { data } = await httpClient.get<AppointmentReportResponse>(
        '/api/reports/appointments',
        { params: filters },
      )
      return data
    } catch {
      // fall through
    }
  }

  await delay(PLACEHOLDER_DELAY_MS)
  const data = filterPlaceholder(appointmentReportPlaceholderRows, filters)
  const tutor = appointmentTutorOptions.find(
    (option) => option.value === filters.tutorId,
  )

  return {
    data,
    meta: {
      total: data.length,
      source: 'placeholder',
      tutorLabel: tutor?.label ?? filters.tutorId,
      branchLabel: branchLabels[filters.branchId] ?? filters.branchId,
      startDate: filters.startDate,
      endDate: filters.endDate,
    },
  }
}
