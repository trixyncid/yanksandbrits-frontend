import { downloadBlob } from '../../../shared/api/download'
import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import { updateOpenPeriodSalaries } from '../../bookkeeping/api/bookkeeping-api'
import { fetchUsers, type UserListItem } from '../../users/api/users-api'
import type { MarketingReportListItem } from '../types/marketing-report'
import type { MarketingReportListFilters } from './marketing-report-query-keys'
import { adminPath } from '../../../shared/api/paths'

export type MarketingReportListResponse = {
  data: MarketingReportListItem[]
  meta: {
    total: number
    period: string
  }
}

type MarketingSalaryDto = {
  id: number
  marketing: number | null
  main_salary: number
  paid_leave: number
  bonus_salary: number
  total_student: number
  total_salary?: number
  bookkeeping: number | null
}

function mapMarketingSalary(
  dto: MarketingSalaryDto,
  marketersById: Map<string, UserListItem>,
): MarketingReportListItem {
  const marketer =
    dto.marketing == null ? null : marketersById.get(String(dto.marketing))

  return {
    id: String(dto.id),
    marketerPin: marketer?.pin ?? '—',
    marketerName: marketer?.fullName ?? '—',
    email: marketer?.email ?? '—',
    totalStudent: dto.total_student ?? 0,
    mainSalary: dto.main_salary ?? 0,
    bonusSalary: dto.bonus_salary ?? 0,
    totalSalary:
      dto.total_salary ?? (dto.main_salary ?? 0) + (dto.bonus_salary ?? 0),
    branch: marketer?.branchName ?? '—',
  }
}

export async function fetchMarketingReport(
  filters: MarketingReportListFilters = {},
): Promise<MarketingReportListResponse> {
  const params: Record<string, unknown> = {
    search: filters.search?.trim() || undefined,
  }

  const [{ items, total }, marketersResult] = await Promise.all([
    fetchAllPages<MarketingSalaryDto>({
      client: httpClient,
      path: adminPath('/marketing-salary-calculations'),
      params,
    }),
    fetchUsers({ isMarketing: true }),
  ])

  const marketersById = new Map(
    marketersResult.data.map((user) => [user.id, user]),
  )
  const data = items.map((dto) => mapMarketingSalary(dto, marketersById))

  return {
    data,
    meta: {
      total,
      period: 'Current calculations',
    },
  }
}

export async function downloadMarketingSalaryPdf(
  id: string,
  filename?: string,
): Promise<void> {
  const { data } = await httpClient.get<Blob>(
    adminPath(`/marketing-salary-calculations/${id}/pdf`),
    { responseType: 'blob', timeout: 60000 },
  )
  await downloadBlob(data, filename ?? `marketing-salary-${id}.pdf`)
}

export async function refreshMarketingSalaries(): Promise<void> {
  await updateOpenPeriodSalaries()
}
