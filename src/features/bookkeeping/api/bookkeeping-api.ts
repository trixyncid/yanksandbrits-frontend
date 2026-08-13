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
