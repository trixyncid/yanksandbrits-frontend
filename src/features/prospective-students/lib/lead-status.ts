import type { ProspectiveStudentStatus } from '../types/prospective-student'

export const LEAD_STATUS_META: Record<
  ProspectiveStudentStatus,
  { label: string; pill: string; dot: string }
> = {
  consult: {
    label: 'Consult',
    pill: 'bg-brand-50 text-brand-700',
    dot: 'bg-brand-500',
  },
  prediction_test: {
    label: 'Pre-Test',
    pill: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  enrolled: {
    label: 'Enrolled',
    pill: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Cancelled',
    pill: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
}

/** Two-letter monogram for avatars, e.g. "Andrea Putri" → "AP". */
export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
}
