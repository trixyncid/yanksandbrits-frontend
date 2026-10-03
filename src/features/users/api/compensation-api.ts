import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import { adminPath } from '../../../shared/api/paths'

export type TutorWorkingSchedule = {
  id: string
  tutorId: string
  mainSalary: number
  salaryPerSession: number
  overtimeMultiplier: number
  mondayIn: string
  mondayOut: string
  tuesdayIn: string
  tuesdayOut: string
  wednesdayIn: string
  wednesdayOut: string
  thursdayIn: string
  thursdayOut: string
  fridayIn: string
  fridayOut: string
  saturdayIn: string
  saturdayOut: string
  sundayIn: string
  sundayOut: string
}

export type TutorWorkingScheduleFormValues = {
  mainSalary: string
  salaryPerSession: string
  overtimeMultiplier: string
  mondayIn: string
  mondayOut: string
  tuesdayIn: string
  tuesdayOut: string
  wednesdayIn: string
  wednesdayOut: string
  thursdayIn: string
  thursdayOut: string
  fridayIn: string
  fridayOut: string
  saturdayIn: string
  saturdayOut: string
  sundayIn: string
  sundayOut: string
}

export const COMMISSION_PERIOD_TYPES = ['4W', '5W'] as const

export type CommissionPeriodType = (typeof COMMISSION_PERIOD_TYPES)[number]

export const commissionPeriodLabels: Record<CommissionPeriodType, string> = {
  '4W': '4 weeks period',
  '5W': '5 weeks period',
}

export type MarketingCommissionTier = {
  id: string
  marketingSalaryId: string
  periodType: CommissionPeriodType
  minAmount: number
  /** null means the tier is open-ended upwards. */
  maxAmount: number | null
  percentage: number
}

export type MarketingCommissionTierFormValues = {
  minAmount: string
  maxAmount: string
  percentage: string
}

export type MarketingBonusTier = {
  id: string
  marketingSalaryId: string
  periodType: CommissionPeriodType
  minAmount: number
  /** null means the tier is open-ended upwards. */
  maxAmount: number | null
  bonusAmount: number
}

export type MarketingBonusTierFormValues = {
  minAmount: string
  maxAmount: string
  bonusAmount: string
}

export type MarketingSalary = {
  id: string
  marketingId: string
  mainSalary: number
  commissionTiers: MarketingCommissionTier[]
  bonusTiers: MarketingBonusTier[]
}

export type MarketingSalaryFormValues = {
  mainSalary: string
}

type TutorWorkingScheduleDto = {
  id: number
  tutor: number
  main_salary: number
  salary_per_session: number
  overtime_multiplier: number
  monday_in: string | null
  monday_out: string | null
  tuesday_in: string | null
  tuesday_out: string | null
  wednesday_in: string | null
  wednesday_out: string | null
  thursday_in: string | null
  thursday_out: string | null
  friday_in: string | null
  friday_out: string | null
  saturday_in: string | null
  saturday_out: string | null
  sunday_in: string | null
  sunday_out: string | null
}

type MarketingCommissionTierDto = {
  id: number
  marketing_salary: number
  period_type: CommissionPeriodType
  min_amount: number
  max_amount: number | null
  percentage: number
}

type MarketingBonusTierDto = {
  id: number
  marketing_salary: number
  period_type: CommissionPeriodType
  min_amount: number
  max_amount: number | null
  bonus_amount: number
}

type MarketingSalaryDto = {
  id: number
  marketing: number
  main_salary: number
  commission_tiers?: MarketingCommissionTierDto[]
  bonus_tiers?: MarketingBonusTierDto[]
}

function timeValue(value: string | null | undefined) {
  return value ? value.slice(0, 5) : ''
}

function nullIfEmpty(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function mapSchedule(dto: TutorWorkingScheduleDto): TutorWorkingSchedule {
  return {
    id: String(dto.id),
    tutorId: String(dto.tutor),
    mainSalary: dto.main_salary ?? 0,
    salaryPerSession: dto.salary_per_session ?? 0,
    overtimeMultiplier: dto.overtime_multiplier ?? 0,
    mondayIn: timeValue(dto.monday_in),
    mondayOut: timeValue(dto.monday_out),
    tuesdayIn: timeValue(dto.tuesday_in),
    tuesdayOut: timeValue(dto.tuesday_out),
    wednesdayIn: timeValue(dto.wednesday_in),
    wednesdayOut: timeValue(dto.wednesday_out),
    thursdayIn: timeValue(dto.thursday_in),
    thursdayOut: timeValue(dto.thursday_out),
    fridayIn: timeValue(dto.friday_in),
    fridayOut: timeValue(dto.friday_out),
    saturdayIn: timeValue(dto.saturday_in),
    saturdayOut: timeValue(dto.saturday_out),
    sundayIn: timeValue(dto.sunday_in),
    sundayOut: timeValue(dto.sunday_out),
  }
}

function mapCommissionTier(
  dto: MarketingCommissionTierDto,
): MarketingCommissionTier {
  return {
    id: String(dto.id),
    marketingSalaryId: String(dto.marketing_salary),
    periodType: dto.period_type,
    minAmount: dto.min_amount ?? 0,
    maxAmount: dto.max_amount ?? null,
    percentage: dto.percentage ?? 0,
  }
}

function mapBonusTier(dto: MarketingBonusTierDto): MarketingBonusTier {
  return {
    id: String(dto.id),
    marketingSalaryId: String(dto.marketing_salary),
    periodType: dto.period_type,
    minAmount: dto.min_amount ?? 0,
    maxAmount: dto.max_amount ?? null,
    bonusAmount: dto.bonus_amount ?? 0,
  }
}

function mapMarketingSalary(dto: MarketingSalaryDto): MarketingSalary {
  return {
    id: String(dto.id),
    marketingId: String(dto.marketing),
    mainSalary: dto.main_salary ?? 0,
    commissionTiers: (dto.commission_tiers ?? []).map(mapCommissionTier),
    bonusTiers: (dto.bonus_tiers ?? []).map(mapBonusTier),
  }
}

function scheduleToPayload(
  tutorId: string,
  values: TutorWorkingScheduleFormValues,
) {
  return {
    tutor: Number(tutorId),
    main_salary: Number(values.mainSalary) || 0,
    salary_per_session: Number(values.salaryPerSession) || 0,
    overtime_multiplier: Number(values.overtimeMultiplier) || 0,
    monday_in: nullIfEmpty(values.mondayIn),
    monday_out: nullIfEmpty(values.mondayOut),
    tuesday_in: nullIfEmpty(values.tuesdayIn),
    tuesday_out: nullIfEmpty(values.tuesdayOut),
    wednesday_in: nullIfEmpty(values.wednesdayIn),
    wednesday_out: nullIfEmpty(values.wednesdayOut),
    thursday_in: nullIfEmpty(values.thursdayIn),
    thursday_out: nullIfEmpty(values.thursdayOut),
    friday_in: nullIfEmpty(values.fridayIn),
    friday_out: nullIfEmpty(values.fridayOut),
    saturday_in: nullIfEmpty(values.saturdayIn),
    saturday_out: nullIfEmpty(values.saturdayOut),
    sunday_in: nullIfEmpty(values.sundayIn),
    sunday_out: nullIfEmpty(values.sundayOut),
  }
}

export function scheduleToFormValues(
  schedule: TutorWorkingSchedule | null | undefined,
): TutorWorkingScheduleFormValues {
  if (!schedule) {
    return emptyScheduleFormValues
  }

  return {
    mainSalary: String(schedule.mainSalary),
    salaryPerSession: String(schedule.salaryPerSession),
    overtimeMultiplier: String(schedule.overtimeMultiplier),
    mondayIn: schedule.mondayIn,
    mondayOut: schedule.mondayOut,
    tuesdayIn: schedule.tuesdayIn,
    tuesdayOut: schedule.tuesdayOut,
    wednesdayIn: schedule.wednesdayIn,
    wednesdayOut: schedule.wednesdayOut,
    thursdayIn: schedule.thursdayIn,
    thursdayOut: schedule.thursdayOut,
    fridayIn: schedule.fridayIn,
    fridayOut: schedule.fridayOut,
    saturdayIn: schedule.saturdayIn,
    saturdayOut: schedule.saturdayOut,
    sundayIn: schedule.sundayIn,
    sundayOut: schedule.sundayOut,
  }
}

export const emptyScheduleFormValues: TutorWorkingScheduleFormValues = {
  mainSalary: '',
  salaryPerSession: '',
  overtimeMultiplier: '',
  mondayIn: '',
  mondayOut: '',
  tuesdayIn: '',
  tuesdayOut: '',
  wednesdayIn: '',
  wednesdayOut: '',
  thursdayIn: '',
  thursdayOut: '',
  fridayIn: '',
  fridayOut: '',
  saturdayIn: '',
  saturdayOut: '',
  sundayIn: '',
  sundayOut: '',
}

export async function fetchTutorWorkingSchedule(
  userId: string,
): Promise<TutorWorkingSchedule | null> {
  const { items } = await fetchAllPages<TutorWorkingScheduleDto>({
    client: httpClient,
    path: adminPath('/tutor-working-schedules'),
    params: { tutor: Number(userId) },
  })
  return items[0] ? mapSchedule(items[0]) : null
}

export async function createTutorWorkingSchedule(
  tutorId: string,
  values: TutorWorkingScheduleFormValues,
): Promise<TutorWorkingSchedule> {
  const { data } = await httpClient.post<
    ApiSuccessEnvelope<TutorWorkingScheduleDto>
  >(adminPath('/tutor-working-schedules'), scheduleToPayload(tutorId, values))
  return mapSchedule(data.data)
}

export async function updateTutorWorkingSchedule(
  scheduleId: string,
  tutorId: string,
  values: TutorWorkingScheduleFormValues,
): Promise<TutorWorkingSchedule> {
  const { data } = await httpClient.patch<
    ApiSuccessEnvelope<TutorWorkingScheduleDto>
  >(
    adminPath(`/tutor-working-schedules/${scheduleId}`),
    scheduleToPayload(tutorId, values),
  )
  return mapSchedule(data.data)
}

export async function fetchMarketingSalary(
  userId: string,
): Promise<MarketingSalary | null> {
  const { items } = await fetchAllPages<MarketingSalaryDto>({
    client: httpClient,
    path: adminPath('/marketing-salaries'),
    params: { marketing: Number(userId) },
  })
  return items[0] ? mapMarketingSalary(items[0]) : null
}

export async function createMarketingSalary(
  marketingId: string,
  values: MarketingSalaryFormValues,
): Promise<MarketingSalary> {
  const { data } = await httpClient.post<ApiSuccessEnvelope<MarketingSalaryDto>>(
    adminPath('/marketing-salaries'),
    {
      marketing: Number(marketingId),
      main_salary: Number(values.mainSalary) || 0,
    },
  )
  return mapMarketingSalary(data.data)
}

export async function updateMarketingSalary(
  salaryId: string,
  marketingId: string,
  values: MarketingSalaryFormValues,
): Promise<MarketingSalary> {
  const { data } = await httpClient.patch<
    ApiSuccessEnvelope<MarketingSalaryDto>
  >(adminPath(`/marketing-salaries/${salaryId}`), {
    marketing: Number(marketingId),
    main_salary: Number(values.mainSalary) || 0,
  })
  return mapMarketingSalary(data.data)
}

export function marketingSalaryToFormValues(
  salary: MarketingSalary | null | undefined,
): MarketingSalaryFormValues {
  return {
    mainSalary: String(salary?.mainSalary ?? 0),
  }
}

function commissionTierToPayload(values: MarketingCommissionTierFormValues) {
  const maxAmount = values.maxAmount.trim()
  return {
    min_amount: Number(values.minAmount) || 0,
    max_amount: maxAmount ? Number(maxAmount) : null,
    percentage: Number(values.percentage) || 0,
  }
}

export async function createMarketingCommissionTier(
  marketingSalaryId: string,
  periodType: CommissionPeriodType,
  values: MarketingCommissionTierFormValues,
): Promise<MarketingCommissionTier> {
  const { data } = await httpClient.post<
    ApiSuccessEnvelope<MarketingCommissionTierDto>
  >(adminPath('/marketing-commission-tiers'), {
    marketing_salary: Number(marketingSalaryId),
    period_type: periodType,
    ...commissionTierToPayload(values),
  })
  return mapCommissionTier(data.data)
}

export async function updateMarketingCommissionTier(
  tierId: string,
  values: MarketingCommissionTierFormValues,
): Promise<MarketingCommissionTier> {
  const { data } = await httpClient.patch<
    ApiSuccessEnvelope<MarketingCommissionTierDto>
  >(adminPath(`/marketing-commission-tiers/${tierId}`), commissionTierToPayload(values))
  return mapCommissionTier(data.data)
}

export async function deleteMarketingCommissionTier(
  tierId: string,
): Promise<void> {
  await httpClient.delete(adminPath(`/marketing-commission-tiers/${tierId}`))
}

export function commissionTierToFormValues(
  tier: MarketingCommissionTier | null | undefined,
): MarketingCommissionTierFormValues {
  return {
    minAmount: String(tier?.minAmount ?? 0),
    maxAmount: tier?.maxAmount == null ? '' : String(tier.maxAmount),
    percentage: String(tier?.percentage ?? 0),
  }
}

function bonusTierToPayload(values: MarketingBonusTierFormValues) {
  const maxAmount = values.maxAmount.trim()
  return {
    min_amount: Number(values.minAmount) || 0,
    max_amount: maxAmount ? Number(maxAmount) : null,
    bonus_amount: Number(values.bonusAmount) || 0,
  }
}

export async function createMarketingBonusTier(
  marketingSalaryId: string,
  periodType: CommissionPeriodType,
  values: MarketingBonusTierFormValues,
): Promise<MarketingBonusTier> {
  const { data } = await httpClient.post<
    ApiSuccessEnvelope<MarketingBonusTierDto>
  >(adminPath('/marketing-bonus-tiers'), {
    marketing_salary: Number(marketingSalaryId),
    period_type: periodType,
    ...bonusTierToPayload(values),
  })
  return mapBonusTier(data.data)
}

export async function updateMarketingBonusTier(
  tierId: string,
  values: MarketingBonusTierFormValues,
): Promise<MarketingBonusTier> {
  const { data } = await httpClient.patch<
    ApiSuccessEnvelope<MarketingBonusTierDto>
  >(adminPath(`/marketing-bonus-tiers/${tierId}`), bonusTierToPayload(values))
  return mapBonusTier(data.data)
}

export async function deleteMarketingBonusTier(
  tierId: string,
): Promise<void> {
  await httpClient.delete(adminPath(`/marketing-bonus-tiers/${tierId}`))
}

export function bonusTierToFormValues(
  tier: MarketingBonusTier | null | undefined,
): MarketingBonusTierFormValues {
  return {
    minAmount: String(tier?.minAmount ?? 0),
    maxAmount: tier?.maxAmount == null ? '' : String(tier.maxAmount),
    bonusAmount: String(tier?.bonusAmount ?? 0),
  }
}

export type TutorProgramSalary = {
  id: string
  tutorId: string
  programId: string | null
  programTitle: string | null
  salaryPerSession: number
  overtimeMultiplier: number
}

export type TutorProgramSalaryFormValues = {
  salaryPerSession: string
  overtimeMultiplier: string
}

type TutorProgramSalaryDto = {
  id: number
  tutor: number
  program: number | null
  program_title: string | null
  salary_per_session: number
  overtime_multiplier: number
}

function mapProgramSalary(dto: TutorProgramSalaryDto): TutorProgramSalary {
  return {
    id: String(dto.id),
    tutorId: String(dto.tutor),
    programId: dto.program == null ? null : String(dto.program),
    programTitle: dto.program_title,
    salaryPerSession: dto.salary_per_session ?? 0,
    overtimeMultiplier: dto.overtime_multiplier ?? 0,
  }
}

export async function fetchTutorProgramSalaries(
  userId: string,
): Promise<TutorProgramSalary[]> {
  const { items } = await fetchAllPages<TutorProgramSalaryDto>({
    client: httpClient,
    path: adminPath('/tutor-salary-class-based'),
    params: { tutor: Number(userId) },
  })
  return items.map(mapProgramSalary)
}

export async function createTutorProgramSalary(
  tutorId: string,
  programId: string,
  values: TutorProgramSalaryFormValues,
): Promise<TutorProgramSalary> {
  const { data } = await httpClient.post<
    ApiSuccessEnvelope<TutorProgramSalaryDto>
  >(adminPath('/tutor-salary-class-based'), {
    tutor: Number(tutorId),
    program: Number(programId),
    salary_per_session: Number(values.salaryPerSession) || 0,
    overtime_multiplier: Number(values.overtimeMultiplier) || 0,
  })
  return mapProgramSalary(data.data)
}

export async function updateTutorProgramSalary(
  salaryId: string,
  tutorId: string,
  programId: string | null,
  values: TutorProgramSalaryFormValues,
): Promise<TutorProgramSalary> {
  const { data } = await httpClient.patch<
    ApiSuccessEnvelope<TutorProgramSalaryDto>
  >(adminPath(`/tutor-salary-class-based/${salaryId}`), {
    tutor: Number(tutorId),
    program: programId == null ? null : Number(programId),
    salary_per_session: Number(values.salaryPerSession) || 0,
    overtime_multiplier: Number(values.overtimeMultiplier) || 0,
  })
  return mapProgramSalary(data.data)
}

export async function deleteTutorProgramSalary(salaryId: string): Promise<void> {
  await httpClient.delete(adminPath(`/tutor-salary-class-based/${salaryId}`))
}

export function programSalaryToFormValues(
  salary: TutorProgramSalary | null | undefined,
): TutorProgramSalaryFormValues {
  return {
    salaryPerSession:
      salary == null ? '' : String(salary.salaryPerSession),
    overtimeMultiplier:
      salary == null ? '' : String(salary.overtimeMultiplier),
  }
}
