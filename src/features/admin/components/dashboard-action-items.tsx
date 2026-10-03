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
    card: 'border-[#D8E6FA] bg-[#F5F9FF] text-[#1B2A5A]',
    icon: 'bg-white text-[#1B2A5A]',
    count: 'text-[#1B2A5A]',
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
      <div className="flex items-start gap-2.5 rounded-xl border border-[#CFE9DC] bg-[#F4FBF7] px-3 py-2.5">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#3D9B6E]" />
        <div>
          <p className="text-sm font-semibold text-[#1F5A3D]">
            You&apos;re all caught up
          </p>
          <p className="mt-0.5 text-xs text-[#2F6B4C]">
            No pending payments, stale prospects, or leave requests right now.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid items-stretch gap-2 md:grid-cols-3">
      {visibleItems.map((item) => (
        <Link
          key={item.id}
          to={item.to}
          className={cn(
            'group flex h-full flex-col rounded-xl border px-3 py-3 transition hover:-translate-y-0.5',
            toneStyles[item.tone].card,
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div
              className={cn(
                'inline-flex size-7 items-center justify-center rounded-md',
                toneStyles[item.tone].icon,
              )}
            >
              {item.icon}
            </div>
            <ArrowRight className="size-3.5 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
          </div>
          <p className="mt-2.5 text-sm font-semibold">{item.label}</p>
          <p
            className={cn(
              'mt-0.5 text-2xl font-bold tabular-nums',
              toneStyles[item.tone].count,
            )}
          >
            {item.count}
          </p>
          <p className="mt-0.5 text-[11px] opacity-80">{item.detail}</p>
        </Link>
      ))}
    </div>
  )
}
