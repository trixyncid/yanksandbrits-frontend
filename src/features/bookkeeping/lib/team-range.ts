import type { TeamRange, TeamRangeStep } from '../types/bookkeeping'

/** API shape of a Branch Manager's capped team range, which picks their tier bonus (see payroll/branch_manager_commission.py). */
export type TeamRangeDto = {
  cap: number | null
  range_amount: number
  raw_amount: number
  team_size: number
  contributions?: Array<{
    owner_id: number | null
    owner_name?: string | null
    is_manager: boolean
    amount: number
  }>
  removed?: Array<{
    key: string
    kind: 'prediction_test' | 'installment'
    owner_name?: string | null
    is_manager: boolean
    payment_id: number | null
    payment_title?: string | null
    student_name?: string | null
    amount: number
    date: string | null
    step: TeamRangeStep
  }>
  tier_bonus?: number
}

export function mapTeamRange(dto: TeamRangeDto | null | undefined): TeamRange | null {
  if (!dto) return null
  return {
    cap: dto.cap ?? null,
    rangeAmount: dto.range_amount ?? 0,
    rawAmount: dto.raw_amount ?? 0,
    teamSize: dto.team_size ?? 0,
    contributions: (dto.contributions ?? []).map((item) => ({
      ownerName: item.owner_name || 'Unknown',
      isManager: item.is_manager,
      amount: item.amount ?? 0,
    })),
    removed: (dto.removed ?? []).map((item) => ({
      key: item.key,
      kind: item.kind,
      ownerName: item.owner_name || 'Unknown',
      isManager: item.is_manager,
      paymentTitle: item.payment_title || '',
      studentName: item.student_name || '',
      amount: item.amount ?? 0,
      date: item.date,
      step: item.step,
    })),
    tierBonus: dto.tier_bonus ?? 0,
  }
}
