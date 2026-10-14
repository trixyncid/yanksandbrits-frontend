import type { TutorAllocationListItem } from '../types/tutor-allocation'

/** Where a class is in the hand-off: approve → tutors → program assigned. */
export type AllocationStage = 'awaiting' | 'approved' | 'tutors' | 'assigned'

export function allocationStage(
  allocation: Pick<
    TutorAllocationListItem,
    'approved' | 'tutorsAllocated' | 'programsAssigned'
  >,
): AllocationStage {
  if (allocation.programsAssigned) return 'assigned'
  if (allocation.tutorsAllocated) return 'tutors'
  if (allocation.approved) return 'approved'
  return 'awaiting'
}

/** Short status label shown in lists and headers. */
export const ALLOCATION_STAGE_LABEL: Record<AllocationStage, string> = {
  awaiting: 'Awaiting approval',
  approved: 'Approved',
  tutors: 'Tutors assigned',
  assigned: 'Programs assigned',
}

/** A plainer second line for people who don't know the workflow. */
export const ALLOCATION_STAGE_HINT: Record<AllocationStage, string> = {
  awaiting: 'Needs a branch manager',
  approved: 'Needs tutors',
  tutors: 'Ready to assign program',
  assigned: 'Classes running',
}

export const ALLOCATION_STAGE_TONE: Record<
  AllocationStage,
  { pill: string; dot: string }
> = {
  awaiting: { pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  approved: { pill: 'bg-brand-50 text-brand-700', dot: 'bg-brand-500' },
  tutors: { pill: 'bg-sky-50 text-sky-700', dot: 'bg-sky-500' },
  assigned: { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
}
