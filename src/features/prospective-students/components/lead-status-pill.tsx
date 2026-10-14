import { cn } from '../../../shared/lib/cn'
import { LEAD_STATUS_META } from '../lib/lead-status'
import type { ProspectiveStudentStatus } from '../types/prospective-student'

export function LeadStatusPill({
  status,
  className,
}: {
  status: ProspectiveStudentStatus
  className?: string
}) {
  const meta = LEAD_STATUS_META[status] ?? LEAD_STATUS_META.cancelled
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        meta.pill,
        className,
      )}
    >
      <span aria-hidden className={cn('size-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  )
}
