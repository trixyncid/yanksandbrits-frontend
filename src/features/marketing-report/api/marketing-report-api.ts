import { downloadBlob } from '../../../shared/api/download'
import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import { updateOpenPeriodSalaries } from '../../bookkeeping/api/bookkeeping-api'
import { OPEN_BOOKKEEPING_PERIOD } from '../../bookkeeping/components/bookkeeping-period-select'
import { fetchUsers, type UserListItem } from '../../users/api/users-api'
import type { MarketingReportListItem } from '../types/marketing-report'
import type { MarketingReportListFilters } from './marketing-report-query-keys'
import { adminPath } from '../../../shared/api/paths'

export type MarketingReportListResponse = {
  data: MarketingReportListItem[]
  meta: {
    total: number
    period: string
    startDate?: string
    endDate?: string
    isOpenPeriod: boolean
  }
}

type MarketingSalaryDto = {
  id: number | null
  marketing: number | null
  marketing_name?: string | null
  marketing_pin?: string | null
  marketing_email?: string | null
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
  source: MarketingReportListItem['source'],
): MarketingReportListItem {
  const marketerId = dto.marketing == null ? null : String(dto.marketing)
  const marketer = marketerId ? marketersById.get(marketerId) : null

  return {
    id:
      dto.id != null
        ? String(dto.id)
        : marketerId
          ? `open-${marketerId}`
          : `open-unknown-${dto.marketing_pin ?? 'x'}`,
    marketerId,
    marketerPin: dto.marketing_pin ?? marketer?.pin ?? '—',
    marketerName: dto.marketing_name ?? marketer?.fullName ?? '—',
    email: dto.marketing_email ?? marketer?.email ?? '—',
    totalStudent: dto.total_student ?? 0,
    mainSalary: dto.main_salary ?? 0,
    bonusSalary: dto.bonus_salary ?? 0,
    totalSalary:
      dto.total_salary ?? (dto.main_salary ?? 0) + (dto.bonus_salary ?? 0),
    branch: marketer?.branchName ?? '—',
    source,
  }
}

function formatBookkeepingPeriod(item: {
  startDate: string
  endDate: string
  title: string
}) {
  const title = item.title.trim()
  const range = `${item.startDate} – ${item.endDate}`
  return title ? `${title} (${range})` : range
}

export async function fetchMarketingReport(
  filters: MarketingReportListFilters = {},
): Promise<MarketingReportListResponse> {
  const bookkeepingId = filters.bookkeepingId ?? OPEN_BOOKKEEPING_PERIOD
  const marketersResult = await fetchUsers({ isMarketing: true })
  const marketersById = new Map(
    marketersResult.data.map((user) => [user.id, user]),
  )

  if (bookkeepingId === OPEN_BOOKKEEPING_PERIOD) {
    const { data } = await httpClient.get<
      ApiSuccessEnvelope<MarketingSalaryDto[]> & {
        meta: {
          total?: number
          period?: string
          start_date?: string
          end_date?: string
          is_open_period?: boolean
        } | null
      }
    >(adminPath('/marketing-salary-calculations/open-period'))

    const rows = Array.isArray(data.data) ? data.data : []
    const meta = data.meta ?? {}

    return {
      data: rows.map((dto) => mapMarketingSalary(dto, marketersById, 'open')),
      meta: {
        total: meta.total ?? rows.length,
        period: meta.period ?? 'Open period',
        startDate: meta.start_date,
        endDate: meta.end_date,
        isOpenPeriod: true,
      },
    }
  }

  const [{ items, total }, bookkeeping] = await Promise.all([
    fetchAllPages<MarketingSalaryDto>({
      client: httpClient,
      path: adminPath('/marketing-salary-calculations'),
      params: {
        bookkeeping: Number(bookkeepingId),
        search: filters.search?.trim() || undefined,
      },
    }),
    httpClient
      .get<
        ApiSuccessEnvelope<{
          start_date: string
          end_date: string
          title?: string
        }>
      >(adminPath(`/bookkeepings/${bookkeepingId}`))
      .then((response) => response.data.data)
      .catch(() => null),
  ])

  return {
    data: items.map((dto) =>
      mapMarketingSalary(dto, marketersById, 'bookkeeping'),
    ),
    meta: {
      total,
      period: bookkeeping
        ? formatBookkeepingPeriod({
            startDate: bookkeeping.start_date,
            endDate: bookkeeping.end_date,
            title: bookkeeping.title?.trim() || '',
          })
        : `Bookkeeping #${bookkeepingId}`,
      startDate: bookkeeping?.start_date,
      endDate: bookkeeping?.end_date,
      isOpenPeriod: false,
    },
  }
}

export async function downloadMarketingSalaryPdf(
  item: Pick<
    MarketingReportListItem,
    'id' | 'marketerId' | 'source' | 'marketerPin'
  >,
  filename?: string,
): Promise<void> {
  const path =
    item.source === 'open'
      ? adminPath(`/reports/marketing-salary/${item.marketerId}`)
      : adminPath(`/marketing-salary-calculations/${item.id}/pdf`)

  if (item.source === 'open' && !item.marketerId) {
    throw new Error('Marketer id is required for open-period PDF download.')
  }

  const { data } = await httpClient.get<Blob>(path, {
    responseType: 'blob',
    timeout: 60000,
  })
  await downloadBlob(
    data,
    filename ?? `marketing-salary-${item.marketerPin}.pdf`,
  )
}

export async function refreshMarketingSalaries(): Promise<void> {
  await updateOpenPeriodSalaries()
}
