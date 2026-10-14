import { cn } from '../../../shared/lib/cn'
import {
  ALLOCATION_STAGE_LABEL,
  ALLOCATION_STAGE_TONE,
  type AllocationStage,
} from '../lib/allocation-status'

export function AllocationStagePill({
  stage,
  className,
}: {
  stage: AllocationStage
  className?: string
}) {
  const tone = ALLOCATION_STAGE_TONE[stage]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        tone.pill,
        className,
      )}
    >
      <span aria-hidden className={cn('size-1.5 rounded-full', tone.dot)} />
      {ALLOCATION_STAGE_LABEL[stage]}
    </span>
  )
}
