import {
  CalendarDays,
  CreditCard,
  GraduationCap,
  Plane,
  Settings2,
  type LucideIcon,
} from 'lucide-react'

import type { NotificationCategory } from '../types/notification'

export const notificationCategoryMeta: Record<
  NotificationCategory,
  {
    label: string
    icon: LucideIcon
    tone: string
  }
> = {
  payment: {
    label: 'Payment',
    icon: CreditCard,
    tone: 'bg-emerald-50 text-emerald-700',
  },
  schedule: {
    label: 'Schedule',
    icon: CalendarDays,
    tone: 'bg-brand-100 text-brand-700',
  },
  student: {
    label: 'Student',
    icon: GraduationCap,
    tone: 'bg-amber-50 text-amber-700',
  },
  leave: {
    label: 'Leave',
    icon: Plane,
    tone: 'bg-brand-gray-soft text-ink',
  },
  system: {
    label: 'System',
    icon: Settings2,
    tone: 'bg-canvas text-slate-600',
  },
}
