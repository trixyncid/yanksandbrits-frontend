import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CreditCard,
} from 'lucide-react'

import { cn } from '../../../shared/lib/cn'
import type { DashboardMetrics } from '../types/dashboard'

type ActionItem = {
  id: string
  label: string
  count: number
  detail: string
  icon: ReactNode
  tone: 'amber' | 'rose' | 'blue'
  to: '/student-payments' | '/prospective-students' | '/paid-leaves'
}

const toneStyles = {
  amber: {
    card: 'border-amber-200/80 bg-amber-50 text-amber-950',
    icon: 'bg-amber-100 text-amber-700',
    count: 'text-[#9A3412]',
  },
  rose: {
    card: 'border-rose-200/80 bg-rose-50 text-rose-950',
    icon: 'bg-rose-100 text-rose-700',
    count: 'text-[#6E2433]',
  },
  blue: {
    card: 'border-[#D8E6FA] bg-[#F5F9FF] text-[#2F5A94]',
    icon: 'bg-white text-[#2F5A94]',
    count: 'text-[#2F5A94]',
  },
}

export function DashboardActionItems({ metrics }: { metrics: DashboardMetrics }) {
  const items = [
    {
      id: 'payments',
      label: 'Pending payments',
      count: metrics.actions.pendingPayments,
      detail: 'Awaiting approval',
      icon: <CreditCard className="size-4" />,
      tone: 'amber',
      to: '/student-payments',
    },
    {
      id: 'prospects',
      label: 'Stale prospects',
      count: metrics.actions.staleProspects,
      detail: 'No movement in 14+ days',
      icon: <AlertTriangle className="size-4" />,
      tone: 'rose',
      to: '/prospective-students',
    },
    {
      id: 'leave',
      label: 'Pending leave',
      count: metrics.actions.pendingLeave,
      detail: 'Staff leave requests',
      icon: <CalendarClock className="size-4" />,
      tone: 'blue',
      to: '/paid-leaves',
    },
  ] satisfies ActionItem[]

  const visibleItems = items.filter((item) => item.count > 0)

  if (visibleItems.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-[1.5rem] border border-[#CFE9DC] bg-[#F4FBF7] px-5 py-4">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#3D9B6E]" />
        <div>
          <p className="text-sm font-semibold text-[#1F5A3D]">
            You&apos;re all caught up
          </p>
          <p className="mt-1 text-sm text-[#2F6B4C]">
            No pending payments, stale prospects, or leave requests right now.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid items-stretch gap-4 md:grid-cols-3">
      {visibleItems.map((item) => (
        <Link
          key={item.id}
          to={item.to}
          className={cn(
            'group flex h-full flex-col rounded-[1.5rem] border px-5 py-5 transition hover:-translate-y-0.5',
            toneStyles[item.tone].card,
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div
              className={cn(
                'inline-flex size-9 items-center justify-center rounded-xl',
                toneStyles[item.tone].icon,
              )}
            >
              {item.icon}
            </div>
            <ArrowRight className="size-4 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
          </div>
          <p className="mt-4 text-sm font-semibold">{item.label}</p>
          <p
            className={cn(
              'mt-1 text-3xl font-bold tabular-nums',
              toneStyles[item.tone].count,
            )}
          >
            {item.count}
          </p>
          <p className="mt-1 text-xs opacity-80">{item.detail}</p>
        </Link>
      ))}
    </div>
  )
}
