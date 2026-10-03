import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import { adminPath } from '../../../shared/api/paths'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'

export type EmploymentType = 'FT' | 'PT'
export type WorkingDaysPerWeek = 5 | 6
export type PeriodWeeks = 4 | 5

export type TutorSalaryBonusTier = {
  id: string
  employmentType: EmploymentType
  workingDaysPerWeek: WorkingDaysPerWeek
  periodWeeks: PeriodWeeks
  minSessions: number
  maxSessions: number | null
  bonusAmount: number
}

export type TutorSalaryBonusTierFormValues = {
  minSessions: string
  maxSessions: string
  bonusAmount: string
}

type TutorSalaryBonusTierDto = {
  id: number
  employment_type: EmploymentType
  working_days_per_week: number
  period_weeks: number
  min_sessions: number
  max_sessions: number | null
  bonus_amount: number
}

function mapTier(dto: TutorSalaryBonusTierDto): TutorSalaryBonusTier {
  return {
    id: String(dto.id),
    employmentType: dto.employment_type,
    workingDaysPerWeek: dto.working_days_per_week as WorkingDaysPerWeek,
    periodWeeks: dto.period_weeks as PeriodWeeks,
    minSessions: dto.min_sessions ?? 0,
    maxSessions: dto.max_sessions,
    bonusAmount: dto.bonus_amount ?? 0,
  }
}

export async function fetchTutorSalaryBonusTiers(): Promise<
  TutorSalaryBonusTier[]
> {
  const { items } = await fetchAllPages<TutorSalaryBonusTierDto>({
    client: httpClient,
    path: adminPath('/tutor-salary-bonus-tiers'),
  })
  return items.map(mapTier)
}

export async function createTutorSalaryBonusTier(values: {
  employmentType: EmploymentType
  workingDaysPerWeek: WorkingDaysPerWeek
  periodWeeks: PeriodWeeks
  minSessions: string
  maxSessions: string
  bonusAmount: string
}): Promise<TutorSalaryBonusTier> {
  const { data } = await httpClient.post<
    ApiSuccessEnvelope<TutorSalaryBonusTierDto>
  >(adminPath('/tutor-salary-bonus-tiers'), {
    employment_type: values.employmentType,
    working_days_per_week: values.workingDaysPerWeek,
    period_weeks: values.periodWeeks,
    min_sessions: Number(values.minSessions) || 0,
    max_sessions: values.maxSessions.trim()
      ? Number(values.maxSessions)
      : null,
    bonus_amount: Number(values.bonusAmount) || 0,
  })
  return mapTier(data.data)
}

export async function updateTutorSalaryBonusTier(
  id: string,
  values: {
    employmentType: EmploymentType
    workingDaysPerWeek: WorkingDaysPerWeek
    periodWeeks: PeriodWeeks
    minSessions: string
    maxSessions: string
    bonusAmount: string
  },
): Promise<TutorSalaryBonusTier> {
  const { data } = await httpClient.patch<
    ApiSuccessEnvelope<TutorSalaryBonusTierDto>
  >(adminPath(`/tutor-salary-bonus-tiers/${id}`), {
    employment_type: values.employmentType,
    working_days_per_week: values.workingDaysPerWeek,
    period_weeks: values.periodWeeks,
    min_sessions: Number(values.minSessions) || 0,
    max_sessions: values.maxSessions.trim()
      ? Number(values.maxSessions)
      : null,
    bonus_amount: Number(values.bonusAmount) || 0,
  })
  return mapTier(data.data)
}

export async function deleteTutorSalaryBonusTier(id: string): Promise<void> {
  await httpClient.delete(adminPath(`/tutor-salary-bonus-tiers/${id}`))
}

export function tierToFormValues(
  tier: TutorSalaryBonusTier | null | undefined,
): TutorSalaryBonusTierFormValues {
  return {
    minSessions: tier == null ? '' : String(tier.minSessions),
    maxSessions: tier?.maxSessions == null ? '' : String(tier.maxSessions),
    bonusAmount: tier == null ? '' : String(tier.bonusAmount),
  }
}

export const employmentTypeLabels: Record<EmploymentType, string> = {
  FT: 'Full-time',
  PT: 'Part-time',
}
