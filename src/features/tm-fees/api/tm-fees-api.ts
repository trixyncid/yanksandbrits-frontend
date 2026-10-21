import { httpClient } from '../../../shared/api/http-client'
import { adminPath } from '../../../shared/api/paths'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'

export type TmFeePeriod = {
  id: string
  title: string
  startDate: string
  endDate: string
  branchName: string
  consultFee: number
  studentDealFee: number
}

/** The one TM fee setting, the period(s) it prices now, and every period's amounts. */
export type TmFees = {
  consultFee: number
  studentDealFee: number
  updatedAt: string | null
  updatedBy: string
  currentPeriods: TmFeePeriod[]
  periods: TmFeePeriod[]
}

type TmFeePeriodDto = {
  id: number
  title?: string
  start_date: string
  end_date: string
  branch_name?: string | null
  tm_consult_fee: number
  tm_student_deal_fee: number
}

type TmFeesDto = {
  consult_fee: number
  student_deal_fee: number
  updated_at: string | null
  updated_by_name: string | null
  current_periods: TmFeePeriodDto[]
  periods: TmFeePeriodDto[]
}

export const tmFeeQueryKeys = {
  all: ['tm-fees'] as const,
}

function mapPeriod(dto: TmFeePeriodDto): TmFeePeriod {
  return {
    id: String(dto.id),
    title: dto.title?.trim() || '',
    startDate: dto.start_date,
    endDate: dto.end_date,
    branchName: dto.branch_name ?? '',
    consultFee: dto.tm_consult_fee,
    studentDealFee: dto.tm_student_deal_fee,
  }
}

function mapFees(dto: TmFeesDto): TmFees {
  return {
    consultFee: dto.consult_fee,
    studentDealFee: dto.student_deal_fee,
    updatedAt: dto.updated_at,
    updatedBy: dto.updated_by_name ?? '',
    currentPeriods: dto.current_periods.map(mapPeriod),
    periods: dto.periods.map(mapPeriod),
  }
}

export async function fetchTmFees(): Promise<TmFees> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<TmFeesDto>>(
    adminPath('/bookkeepings/tm-fees'),
  )
  return mapFees(data.data)
}

export async function updateTmFees(fees: {
  consultFee: number
  studentDealFee: number
}): Promise<TmFees> {
  const { data } = await httpClient.patch<ApiSuccessEnvelope<TmFeesDto>>(
    adminPath('/bookkeepings/tm-fees'),
    {
      consult_fee: fees.consultFee,
      student_deal_fee: fees.studentDealFee,
    },
  )
  return mapFees(data.data)
}
