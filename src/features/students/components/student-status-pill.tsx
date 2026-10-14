import { cn } from '../../../shared/lib/cn'
import type { StudentStatus } from '../types/student'

/** Soft status pill with a dot, shared by the list and detail pages. */
export function StudentStatusPill({
  status,
  className,
}: {
  status: StudentStatus
  className?: string
}) {
  const active = status === 'active'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        active ? 'bg-brand-50 text-brand-700' : 'bg-canvas text-slate-500',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'size-1.5 rounded-full',
          active ? 'bg-brand-500' : 'bg-slate-400',
        )}
      />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}
