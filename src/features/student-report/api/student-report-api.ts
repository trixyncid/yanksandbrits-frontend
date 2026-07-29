import { httpClient } from '../../../shared/api/http-client'
import { studentReportPlaceholderRows } from '../data/student-report-placeholder'
import type { StudentReportRow } from '../types/student-report'
import type { StudentReportFilters } from './student-report-query-keys'

export type StudentReportResponse = {
  data: StudentReportRow[]
  meta: {
    total: number
    source: 'api' | 'placeholder'
    branchLabel: string
    startDate: string
    endDate: string
  }
}

const PLACEHOLDER_DELAY_MS = 450

const branchLabels: Record<string, string> = {
  main: 'Main Branch',
  west: 'West Branch',
  south: 'South Branch',
}

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function filterPlaceholderRows(
  rows: StudentReportRow[],
  filters: StudentReportFilters,
) {
  const start = new Date(filters.startDate)
  const end = new Date(filters.endDate)

  return rows.filter((row) => {
    if (row.branchId !== filters.branchId) {
      return false
    }

    const enrollment = new Date(row.enrollmentDate)
    return enrollment >= start && enrollment <= end
  })
}

async function fetchStudentReportFromApi(
  filters: StudentReportFilters,
): Promise<StudentReportResponse> {
  const { data } = await httpClient.get<StudentReportResponse>(
    '/api/reports/students',
    { params: filters },
  )

  return data
}

async function fetchStudentReportPlaceholder(
  filters: StudentReportFilters,
): Promise<StudentReportResponse> {
  await delay(PLACEHOLDER_DELAY_MS)

  const data = filterPlaceholderRows(studentReportPlaceholderRows, filters)

  return {
    data,
    meta: {
      total: data.length,
      source: 'placeholder',
      branchLabel: branchLabels[filters.branchId] ?? filters.branchId,
      startDate: filters.startDate,
      endDate: filters.endDate,
    },
  }
}

export async function fetchStudentReport(
  filters: StudentReportFilters,
): Promise<StudentReportResponse> {
  const hasApiBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL)

  if (hasApiBaseUrl) {
    try {
      return await fetchStudentReportFromApi(filters)
    } catch {
      return fetchStudentReportPlaceholder(filters)
    }
  }

  return fetchStudentReportPlaceholder(filters)
}
