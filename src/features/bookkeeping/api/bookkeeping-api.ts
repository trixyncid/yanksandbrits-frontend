import {
  mapApprovalStatusFromApi,
  mapApprovalStatusToApi,
} from '../../../shared/api/choices'
import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import type {
  BookkeepingDetail,
  BookkeepingFormValues,
  BookkeepingListItem,
  BookkeepingMarketingSalaryItem,
  BookkeepingTutorSalaryItem,
  SalaryBreakdownMarketer,
  SalaryBreakdownMeta,
  SalaryBreakdownResponse,
} from '../types/bookkeeping'
import type { BookkeepingListFilters } from './bookkeeping-query-keys'
import { adminPath } from '../../../shared/api/paths'

export type BookkeepingListResponse = {
  data: BookkeepingListItem[]
  meta: { total: number }
}

export const emptyBookkeepingFormValues: BookkeepingFormValues = {
  startDate: '',
  endDate: '',
  title: '',
  status: 'approved',
  branchId: '',
}

export function bookkeepingToFormValues(
  item: BookkeepingDetail,
): BookkeepingFormValues {
  return {
    startDate: item.startDate,
    endDate: item.endDate,
    title: item.title,
    status: item.status,
    branchId: item.branchId ?? '',
  }
}

type BookkeepingDto = {
  id: number
  start_date: string
  end_date: string
  title?: string
  status: string
  branch: number | null
  branch_name?: string | null
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
  created_by_name?: string | null
}

type TutorSalaryDto = {
  id: number
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

type MarketingSalaryDto = {
  id: number
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

function mapBookkeeping(dto: BookkeepingDto): BookkeepingDetail {
  return {
    id: String(dto.id),
    startDate: dto.start_date,
    endDate: dto.end_date,
    title: dto.title?.trim() || '',
    status: mapApprovalStatusFromApi(dto.status),
    branchId: dto.branch == null ? null : String(dto.branch),
    branchName: dto.branch_name ?? '—',
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    createdBy:
      dto.created_by_name ??
      (dto.created_by == null ? '—' : String(dto.created_by)),
  }
}

function mapTutorSalary(dto: TutorSalaryDto): BookkeepingTutorSalaryItem {
  return {
    id: String(dto.id),
    tutorPin: dto.tutor_pin ?? '—',
    tutorName: dto.tutor_name ?? '—',
    tutorEmail: dto.tutor_email ?? '—',
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

function mapMarketingSalary(
  dto: MarketingSalaryDto,
): BookkeepingMarketingSalaryItem {
  return {
    id: String(dto.id),
    marketerPin: dto.marketing_pin ?? '—',
    marketerName: dto.marketing_name ?? '—',
    email: dto.marketing_email ?? '—',
    totalStudent: dto.total_student ?? 0,
    mainSalary: dto.main_salary ?? 0,
    bonusSalary: dto.bonus_salary ?? 0,
    totalSalary:
      dto.total_salary ?? (dto.main_salary ?? 0) + (dto.bonus_salary ?? 0),
  }
}

function toWritePayload(values: BookkeepingFormValues) {
  return {
    start_date: values.startDate,
    end_date: values.endDate,
    title: values.title.trim(),
    status: mapApprovalStatusToApi(values.status),
    branch: values.branchId ? Number(values.branchId) : null,
  }
}

export async function fetchBookkeeping(
  filters: BookkeepingListFilters = {},
): Promise<BookkeepingListResponse> {
  const params: Record<string, unknown> = {
    search: filters.search?.trim() || undefined,
  }

  if (filters.status && filters.status !== 'all') {
    params.status = mapApprovalStatusToApi(filters.status)
  }

  const { items, total } = await fetchAllPages<BookkeepingDto>({
    client: httpClient,
    path: adminPath('/bookkeepings'),
    params,
  })

  return {
    data: items.map(mapBookkeeping),
    meta: { total },
  }
}

export async function fetchBookkeepingItem(
  id: string,
): Promise<BookkeepingDetail> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<BookkeepingDto>>(
    adminPath(`/bookkeepings/${id}`),
  )
  return mapBookkeeping(data.data)
}

export async function fetchBookkeepingTutorSalaries(
  bookkeepingId: string,
): Promise<{ data: BookkeepingTutorSalaryItem[]; meta: { total: number } }> {
  const { items, total } = await fetchAllPages<TutorSalaryDto>({
    client: httpClient,
    path: adminPath('/tutor-salary-calculations'),
    params: { bookkeeping: Number(bookkeepingId) },
  })

  return {
    data: items.map(mapTutorSalary),
    meta: { total },
  }
}

export async function fetchBookkeepingMarketingSalaries(
  bookkeepingId: string,
): Promise<{
  data: BookkeepingMarketingSalaryItem[]
  meta: { total: number }
}> {
  const { items, total } = await fetchAllPages<MarketingSalaryDto>({
    client: httpClient,
    path: adminPath('/marketing-salary-calculations'),
    params: { bookkeeping: Number(bookkeepingId) },
  })

  return {
    data: items.map(mapMarketingSalary),
    meta: { total },
  }
}

type SalaryBreakdownMarketerDto = {
  marketing: number
  marketing_name?: string | null
  marketing_pin?: string | null
  marketing_email?: string | null
  main_salary: number
  consult_count: number
  consult_total: number
  enrollment_count: number
  enrollment_total: number
  fees_total: number
  spif_total?: number
  spif_prospect_count?: number
  spif_threshold?: number
  spif_units?: number
  period_type?: string | null
  range_amount?: number
  payout_amount?: number
  commission_percentage?: number
  tier_min_amount?: number | null
  tier_max_amount?: number | null
  commission_bonus?: number
  tier_bonus?: number
  bonus_tier_min_amount?: number | null
  bonus_tier_max_amount?: number | null
  expected_salary: number
  consults: Array<{
    id: number
    name: string
    date: string | null
    resource?: string | null
    amount: number
  }>
  enrollments: Array<{
    id: number
    name: string
    enrollment_date: string | null
    consult_date: string | null
    amount: number
  }>
}

type SalaryBreakdownMetaDto = {
  total: number
  start_date: string
  end_date: string
  period: string
  total_main_salary: number
  total_consult_fees: number
  total_enrollment_fees: number
  total_spif?: number
  total_commission_bonus?: number
  total_tier_bonus?: number
  total_range_amount?: number
  total_expected_salary: number
  consult_count: number
  enrollment_count: number
  spif_prospect_count?: number
}

function mapSalaryBreakdownMarketer(
  dto: SalaryBreakdownMarketerDto,
): SalaryBreakdownMarketer {
  return {
    marketerId: String(dto.marketing),
    marketerPin: dto.marketing_pin ?? '—',
    marketerName: dto.marketing_name ?? '—',
    email: dto.marketing_email ?? '—',
    mainSalary: dto.main_salary ?? 0,
    consultCount: dto.consult_count ?? 0,
    consultTotal: dto.consult_total ?? 0,
    enrollmentCount: dto.enrollment_count ?? 0,
    enrollmentTotal: dto.enrollment_total ?? 0,
    feesTotal: dto.fees_total ?? 0,
    spifTotal: dto.spif_total ?? 0,
    spifProspectCount: dto.spif_prospect_count ?? 0,
    spifThreshold: dto.spif_threshold ?? 0,
    spifUnits: dto.spif_units ?? 0,
    periodType: dto.period_type ?? '4W',
    rangeAmount: dto.range_amount ?? 0,
    payoutAmount: dto.payout_amount ?? 0,
    commissionPercentage: dto.commission_percentage ?? 0,
    tierMinAmount: dto.tier_min_amount ?? null,
    tierMaxAmount: dto.tier_max_amount ?? null,
    commissionBonus: dto.commission_bonus ?? 0,
    tierBonus: dto.tier_bonus ?? 0,
    bonusTierMinAmount: dto.bonus_tier_min_amount ?? null,
    bonusTierMaxAmount: dto.bonus_tier_max_amount ?? null,
    expectedSalary: dto.expected_salary ?? 0,
    consults: (dto.consults ?? []).map((item) => ({
      id: String(item.id),
      name: item.name,
      date: item.date,
      resource: item.resource ?? '',
      amount: item.amount ?? 0,
    })),
    enrollments: (dto.enrollments ?? []).map((item) => ({
      id: String(item.id),
      name: item.name,
      enrollmentDate: item.enrollment_date,
      consultDate: item.consult_date,
      amount: item.amount ?? 0,
    })),
  }
}

function mapSalaryBreakdownMeta(dto: SalaryBreakdownMetaDto): SalaryBreakdownMeta {
  return {
    total: dto.total ?? 0,
    startDate: dto.start_date,
    endDate: dto.end_date,
    period: dto.period,
    totalMainSalary: dto.total_main_salary ?? 0,
    totalConsultFees: dto.total_consult_fees ?? 0,
    totalEnrollmentFees: dto.total_enrollment_fees ?? 0,
    totalSpif: dto.total_spif ?? 0,
    totalCommissionBonus: dto.total_commission_bonus ?? 0,
    totalTierBonus: dto.total_tier_bonus ?? 0,
    totalRangeAmount: dto.total_range_amount ?? 0,
    totalExpectedSalary: dto.total_expected_salary ?? 0,
    consultCount: dto.consult_count ?? 0,
    enrollmentCount: dto.enrollment_count ?? 0,
    spifProspectCount: dto.spif_prospect_count ?? 0,
  }
}

export async function fetchBookkeepingSalaryBreakdown(
  bookkeepingId: string,
): Promise<SalaryBreakdownResponse> {
  const { data } = await httpClient.get<
    ApiSuccessEnvelope<SalaryBreakdownMarketerDto[]>
  >(adminPath(`/bookkeepings/${bookkeepingId}/salary-breakdown`))

  const meta = (data.meta ?? {}) as SalaryBreakdownMetaDto

  return {
    data: (data.data ?? []).map(mapSalaryBreakdownMarketer),
    meta: mapSalaryBreakdownMeta(meta),
  }
}

export async function fetchMarketerSalaryBreakdown(
  marketerId: string,
  period: string,
): Promise<SalaryBreakdownResponse> {
  const params: Record<string, string | number> = {
    marketing: Number(marketerId),
  }
  if (period && period !== 'open') {
    params.bookkeeping = Number(period)
  }

  const { data } = await httpClient.get<
    ApiSuccessEnvelope<SalaryBreakdownMarketerDto[]>
  >(adminPath('/marketing-salary-calculations/salary-breakdown'), { params })

  const meta = (data.meta ?? {}) as SalaryBreakdownMetaDto

  return {
    data: (data.data ?? []).map(mapSalaryBreakdownMarketer),
    meta: mapSalaryBreakdownMeta(meta),
  }
}

export async function createBookkeeping(
  values: BookkeepingFormValues,
): Promise<BookkeepingListItem> {
  const { data } = await httpClient.post<ApiSuccessEnvelope<BookkeepingDto>>(
    adminPath('/bookkeepings'),
    toWritePayload(values),
  )
  return mapBookkeeping(data.data)
}

export async function updateBookkeeping(
  id: string,
  values: BookkeepingFormValues,
): Promise<BookkeepingListItem> {
  const { data } = await httpClient.patch<ApiSuccessEnvelope<BookkeepingDto>>(
    adminPath(`/bookkeepings/${id}`),
    toWritePayload(values),
  )
  return mapBookkeeping(data.data)
}

export async function deleteBookkeeping(id: string): Promise<void> {
  await httpClient.delete(adminPath(`/bookkeepings/${id}`))
}

export async function recalculateBookkeeping(id: string): Promise<void> {
  await httpClient.post(adminPath(`/bookkeepings/${id}/recalculate`))
}

export async function updateOpenPeriodSalaries(): Promise<void> {
  await httpClient.post(adminPath('/bookkeepings/update-open-period-salaries'))
}
