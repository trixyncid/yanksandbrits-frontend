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
    tone: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  },
  schedule: {
    label: 'Schedule',
    icon: CalendarDays,
    tone: 'bg-[#EDF4FF] text-[#2F5A94] ring-[#BED2F2]',
  },
  student: {
    label: 'Student',
    icon: GraduationCap,
    tone: 'bg-amber-50 text-amber-700 ring-amber-100',
  },
  leave: {
    label: 'Leave',
    icon: Plane,
    tone: 'bg-sky-50 text-sky-700 ring-sky-100',
  },
  system: {
    label: 'System',
    icon: Settings2,
    tone: 'bg-slate-100 text-slate-600 ring-slate-200',
  },
}
