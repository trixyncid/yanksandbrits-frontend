import { httpClient } from '../../../shared/api/http-client'
import { adminPath } from '../../../shared/api/paths'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'

export type NavBadges = {
  predictionTestsPending: number
  studentPaymentsPending: number
  tutorSwitchesPending: number
  tutorAllocationsPending: number
}

type NavBadgesDto = {
  prediction_tests_pending: number
  student_payments_pending: number
  tutor_switches_pending?: number
  tutor_allocations_pending?: number
}

export async function fetchNavBadges(): Promise<NavBadges> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<NavBadgesDto>>(
    adminPath('/dashboard/nav-badges'),
  )
  const payload = data.data
  return {
    predictionTestsPending: payload.prediction_tests_pending ?? 0,
    studentPaymentsPending: payload.student_payments_pending ?? 0,
    tutorSwitchesPending: payload.tutor_switches_pending ?? 0,
    tutorAllocationsPending: payload.tutor_allocations_pending ?? 0,
  }
}

/** Map nav leaf `id` → pending count. */
export function badgeCountForNavItem(
  itemId: string,
  badges: NavBadges | undefined,
): number {
  if (!badges) return 0
  if (itemId === 'prediction-test') return badges.predictionTestsPending
  if (itemId === 'student-payment') return badges.studentPaymentsPending
  if (itemId === 'full-schedule') return badges.tutorSwitchesPending
  if (itemId === 'tutor-allocation') return badges.tutorAllocationsPending
  return 0
}
