import { cn } from '../../../shared/lib/cn'
import type { PredictionTestStatus } from '../types/prediction-test'

const STATUS_STYLES: Record<
  PredictionTestStatus,
  { label: string; longLabel: string; pill: string; dot: string }
> = {
  pending: {
    label: 'Pending',
    longLabel: 'Awaiting approval by Finance',
    pill: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  approved: {
    label: 'Approved',
    longLabel: 'Approved by Finance',
    pill: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  void: {
    label: 'Void',
    longLabel: 'Void',
    pill: 'bg-rose-50 text-rose-600',
    dot: 'bg-rose-500',
  },
}

/** Soft payment-status pill with a colored dot. */
export function PredictionTestStatusPill({
  status,
  long = false,
  className,
}: {
  status: PredictionTestStatus
  /** Use the descriptive label ("Approved by Finance"). */
  long?: boolean
  className?: string
}) {
  const style = STATUS_STYLES[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        style.pill,
        className,
      )}
    >
      <span aria-hidden className={cn('size-1.5 rounded-full', style.dot)} />
      {long ? style.longLabel : style.label}
    </span>
  )
}
