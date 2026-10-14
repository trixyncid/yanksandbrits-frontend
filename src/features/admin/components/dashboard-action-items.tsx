import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowUpRight,
  BellRing,
  CalendarClock,
  CheckCircle2,
  CreditCard,
} from 'lucide-react'

import { cn } from '../../../shared/lib/cn'
import type { DashboardMetrics } from '../types/dashboard'
import { DashboardCardHeader, DashboardPanel } from './dashboard-section'

type ActionItem = {
  id: string
  label: string
  count: number
  detail: string
  icon: ReactNode
  tone: 'amber' | 'rose' | 'blue'
  to: '/student-payments' | '/prospective-students' | '/paid-leaves'
}

const toneDot = {
  amber: 'bg-amber-300 text-ink',
  rose: 'bg-rose-300 text-ink',
  blue: 'bg-brand-300 text-ink',
}

/**
 * The dashboard's one dark card: things someone should act on today, each a
 * rounded tile with a round arrow that opens the right list.
 */
export function DashboardActionItems({
  metrics,
  className,
}: {
  metrics: DashboardMetrics
  className?: string
}) {
  const items = [
    {
      id: 'payments',
      label: 'Payments to approve',
      count: metrics.actions.pendingPayments,
      detail: 'Waiting for a manager to approve',
      icon: <CreditCard className="size-4" />,
      tone: 'amber',
      to: '/student-payments',
    },
    {
      id: 'prospects',
      label: 'Leads going cold',
      count: metrics.actions.staleProspects,
      detail: 'No update in 14 days or more',
      icon: <AlertTriangle className="size-4" />,
      tone: 'rose',
      to: '/prospective-students',
    },
    {
      id: 'leave',
      label: 'Leave requests',
      count: metrics.actions.pendingLeave,
      detail: 'Staff time off waiting for a reply',
      icon: <CalendarClock className="size-4" />,
      tone: 'blue',
      to: '/paid-leaves',
    },
  ] satisfies ActionItem[]

  const visibleItems = items.filter((item) => item.count > 0)
  const total = visibleItems.reduce((sum, item) => sum + item.count, 0)

  return (
    <DashboardPanel variant="dark" className={cn('relative overflow-hidden', className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-brand-500/30 blur-3xl"
      />
      <div className="relative flex h-full flex-col">
        <DashboardCardHeader
          inverted
          title="Needs attention"
          description="Open items across payments, leads and leave."
          icon={<BellRing className="size-4" />}
        />

        <p className="text-5xl leading-none font-bold tracking-tight tabular-nums">
          {total}
        </p>
        <p className="mt-1 text-xs text-white/60">
          {total === 1 ? 'item is' : 'items are'} waiting on someone
        </p>

        {visibleItems.length === 0 ? (
          <div className="mt-5 flex flex-1 items-start gap-3 rounded-3xl bg-white/8 px-4 py-4">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-300 text-ink">
              <CheckCircle2 className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">You&apos;re all caught up</p>
              <p className="mt-0.5 text-xs text-white/60">
                No payments, cold leads or leave requests are waiting.
              </p>
            </div>
          </div>
        ) : (
          <ul className="mt-5 flex flex-1 flex-col gap-2">
            {visibleItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-3xl bg-white/8 py-2.5 pr-2.5 pl-3 transition hover:bg-white/12"
              >
                <span
                  className={cn(
                    'inline-flex size-9 shrink-0 items-center justify-center rounded-full',
                    toneDot[item.tone],
                  )}
                >
                  {item.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.label}</p>
                  <p className="truncate text-[11px] text-white/55">
                    {item.detail}
                  </p>
                </div>
                <span className="text-xl font-bold tabular-nums">{item.count}</span>
                <Link
                  to={item.to}
                  aria-label={`Open ${item.label.toLowerCase()}`}
                  title={`Open ${item.label.toLowerCase()}`}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-ink transition hover:-translate-y-0.5 hover:bg-brand-300"
                >
                  <ArrowUpRight className="size-4" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardPanel>
  )
}
