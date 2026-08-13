import { downloadBlob } from '../../../shared/api/download'
import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import { updateOpenPeriodSalaries } from '../../bookkeeping/api/bookkeeping-api'
import { OPEN_BOOKKEEPING_PERIOD } from '../../bookkeeping/components/bookkeeping-period-select'
import { fetchUsers, type UserListItem } from '../../users/api/users-api'
import type { TutorReportListItem } from '../types/tutor-report'
import type { TutorReportListFilters } from './tutor-report-query-keys'
import { adminPath } from '../../../shared/api/paths'

export type TutorReportListResponse = {
  data: TutorReportListItem[]
  meta: {
    total: number
    period: string
    startDate?: string
    endDate?: string
    isOpenPeriod: boolean
  }
}

type TutorSalaryDto = {
  id: number | null
  tutor: number | null
  tutor_name?: string | null
  tutor_pin?: string | null
  tutor_email?: string | null
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
  source: TutorReportListItem['source'],
): TutorReportListItem {
  const tutorId = dto.tutor == null ? null : String(dto.tutor)
  const tutor = tutorId ? tutorsById.get(tutorId) : null

  return {
    id:
      dto.id != null
        ? String(dto.id)
        : tutorId
          ? `open-${tutorId}`
          : `open-unknown-${dto.tutor_pin ?? 'x'}`,
    tutorId,
    tutorPin: dto.tutor_pin ?? tutor?.pin ?? '—',
    tutorName: dto.tutor_name ?? tutor?.fullName ?? '—',
    tutorEmail: dto.tutor_email ?? tutor?.email ?? '—',
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

export async function fetchTutorReport(
  filters: TutorReportListFilters = {},
): Promise<TutorReportListResponse> {
  const bookkeepingId = filters.bookkeepingId ?? OPEN_BOOKKEEPING_PERIOD
  const tutorsResult = await fetchUsers({ isTutor: true })
  const tutorsById = new Map(
    tutorsResult.data.map((tutor) => [tutor.id, tutor]),
  )

  if (bookkeepingId === OPEN_BOOKKEEPING_PERIOD) {
    const { data } = await httpClient.get<
      ApiSuccessEnvelope<TutorSalaryDto[]> & {
        meta: {
          total?: number
          period?: string
          start_date?: string
          end_date?: string
          is_open_period?: boolean
        } | null
      }
    >(adminPath('/tutor-salary-calculations/open-period'))

    const rows = Array.isArray(data.data) ? data.data : []
    const meta = data.meta ?? {}

    return {
      data: rows.map((dto) => mapTutorSalary(dto, tutorsById, 'open')),
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
    fetchAllPages<TutorSalaryDto>({
      client: httpClient,
      path: adminPath('/tutor-salary-calculations'),
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
    data: items.map((dto) => mapTutorSalary(dto, tutorsById, 'bookkeeping')),
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

export async function downloadTutorSalaryPdf(
  item: Pick<TutorReportListItem, 'id' | 'tutorId' | 'source' | 'tutorPin'>,
  filename?: string,
): Promise<void> {
  const path =
    item.source === 'open'
      ? adminPath(`/reports/tutor-salary/${item.tutorId}`)
      : adminPath(`/tutor-salary-calculations/${item.id}/pdf`)

  if (item.source === 'open' && !item.tutorId) {
    throw new Error('Tutor id is required for open-period PDF download.')
  }

  const { data } = await httpClient.get<Blob>(path, {
    responseType: 'blob',
    timeout: 60000,
  })
  await downloadBlob(data, filename ?? `tutor-salary-${item.tutorPin}.pdf`)
}

export async function refreshTutorSalaries(): Promise<void> {
  await updateOpenPeriodSalaries()
}
