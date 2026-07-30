import { downloadBlob } from '../../../shared/api/download'
import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import { updateOpenPeriodSalaries } from '../../bookkeeping/api/bookkeeping-api'
import { fetchUsers, type UserListItem } from '../../users/api/users-api'
import type { TutorReportListItem } from '../types/tutor-report'
import type { TutorReportListFilters } from './tutor-report-query-keys'

export type TutorReportListResponse = {
  data: TutorReportListItem[]
  meta: {
    total: number
    period: string
  }
}

type TutorSalaryDto = {
  id: number
  tutor: number | null
  working_days: number
  main_salary: number
  number_sessions: number
  session_salary: number
  overtime_sessions: number
  overtime_salary: number
  total_salary?: number
  bookkeeping: number | null
}

function mapTutorSalary(
  dto: TutorSalaryDto,
  tutorsById: Map<string, UserListItem>,
): TutorReportListItem {
  const tutor = dto.tutor == null ? null : tutorsById.get(String(dto.tutor))

  return {
    id: String(dto.id),
    tutorPin: tutor?.pin ?? '—',
    tutorName: tutor?.fullName ?? '—',
    tutorEmail: tutor?.email ?? '—',
    workingDays: dto.working_days ?? 0,
    mainSalary: dto.main_salary ?? 0,
    sessions: dto.number_sessions ?? 0,
    sessionSalary: dto.session_salary ?? 0,
    overtimeSessions: dto.overtime_sessions ?? 0,
    overtimeSalary: dto.overtime_salary ?? 0,
    totalSalary:
      dto.total_salary ??
      (dto.main_salary ?? 0) +
        (dto.session_salary ?? 0) +
        (dto.overtime_salary ?? 0),
  }
}

export async function fetchTutorReport(
  filters: TutorReportListFilters = {},
): Promise<TutorReportListResponse> {
  const params: Record<string, unknown> = {
    search: filters.search?.trim() || undefined,
  }

  const [{ items, total }, tutorsResult] = await Promise.all([
    fetchAllPages<TutorSalaryDto>({
      client: httpClient,
      path: '/tutor-salary-calculations',
      params,
    }),
    fetchUsers({ isTutor: true }),
  ])

  const tutorsById = new Map(
    tutorsResult.data.map((tutor) => [tutor.id, tutor]),
  )
  const data = items.map((dto) => mapTutorSalary(dto, tutorsById))

  return {
    data,
    meta: {
      total,
      period: 'Current calculations',
    },
  }
}

export async function downloadTutorSalaryPdf(
  id: string,
  filename?: string,
): Promise<void> {
  const { data } = await httpClient.get<Blob>(
    `/tutor-salary-calculations/${id}/pdf`,
    { responseType: 'blob', timeout: 60000 },
  )
  await downloadBlob(data, filename ?? `tutor-salary-${id}.pdf`)
}

export async function refreshTutorSalaries(): Promise<void> {
  await updateOpenPeriodSalaries()
}
