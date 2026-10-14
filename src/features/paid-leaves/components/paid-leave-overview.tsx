import { CheckCircle2, Clock3, ClipboardList, XCircle } from 'lucide-react'
import { useMemo } from 'react'

import { cn } from '../../../shared/lib/cn'
import { DashboardPanel } from '../../admin/components/dashboard-section'
import type { PaidLeaveListItem } from '../types/paid-leave'

type PaidLeaveOverviewProps = {
  leaves: PaidLeaveListItem[]
  className?: string
}

export function PaidLeaveOverview({
  leaves,
  className,
}: PaidLeaveOverviewProps) {
  const stats = useMemo(() => {
    let pending = 0
    let approved = 0
    let voided = 0
    let totalDays = 0
    let approvedDays = 0

    for (const leave of leaves) {
      totalDays += leave.totalDays
      if (leave.status === 'pending') pending += 1
      else if (leave.status === 'approved') {
        approved += 1
        approvedDays += leave.totalDays
      } else voided += 1
    }

    const total = leaves.length
    const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0
    const approvedPct = total > 0 ? Math.round((approved / total) * 100) : 0
    const voidPct = total > 0 ? Math.round((voided / total) * 100) : 0

    return {
      total,
      pending,
      approved,
      voided,
      totalDays,
      approvedDays,
      pendingPct,
      approvedPct,
      voidPct,
    }
  }, [leaves])

  const statusRows = [
    {
      id: 'pending',
      label: 'Pending',
      count: stats.pending,
      pct: stats.pendingPct,
      icon: <Clock3 className="size-4" />,
      bar: 'bg-brand-400',
    },
    {
      id: 'approved',
      label: 'Approved',
      count: stats.approved,
      pct: stats.approvedPct,
      icon: <CheckCircle2 className="size-4" />,
      bar: 'bg-emerald-300/90',
    },
    {
      id: 'void',
      label: 'Void',
      count: stats.voided,
      pct: stats.voidPct,
      icon: <XCircle className="size-4" />,
      bar: 'bg-rose-300/80',
    },
  ]

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid gap-3 lg:grid-cols-12 lg:items-stretch">
        <DashboardPanel
          variant="plump"
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both p-4 sm:p-5 [animation-delay:140ms] lg:col-span-7"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-base font-bold text-ink">Days off</p>
              <p className="mt-0.5 text-sm text-slate-500">
                How many leave days have been asked for and approved
              </p>
            </div>
            {stats.pending > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                <Clock3 className="size-3" />
                {stats.pending} waiting for approval
              </span>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-6">
            <div>
              <p className="text-xs font-medium text-slate-500">Approved days</p>
              <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums text-ink">
                {stats.approvedDays}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Total requested
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums text-ink">
                {stats.totalDays}
              </p>
            </div>
            <div className="ml-auto flex min-w-[10rem] flex-1 flex-col gap-2 sm:max-w-xs">
              <div className="flex h-2.5 overflow-hidden rounded-full bg-canvas">
                {stats.total > 0 ? (
                  <>
                    <div
                      className="bg-brand-400 transition-all duration-700"
                      style={{ width: `${stats.pendingPct}%` }}
                      title={`Pending ${stats.pendingPct}%`}
                    />
                    <div
                      className="bg-emerald-400 transition-all duration-700"
                      style={{ width: `${stats.approvedPct}%` }}
                      title={`Approved ${stats.approvedPct}%`}
                    />
                    <div
                      className="bg-rose-300 transition-all duration-700"
                      style={{ width: `${stats.voidPct}%` }}
                      title={`Void ${stats.voidPct}%`}
                    />
                  </>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3 text-[11px] font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-brand-400" />
                  Pending
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Approved
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-rose-300" />
                  Void
                </span>
              </div>
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel
          variant="navy"
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both [animation-delay:180ms] lg:col-span-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-bold text-white">Status mix</p>
              <p className="mt-0.5 text-sm text-white/60">
                Share of requests in each status
              </p>
            </div>
            <span className="inline-flex size-9 items-center justify-center rounded-2xl bg-white/10 text-white">
              <ClipboardList className="size-4" />
            </span>
          </div>

          <ul className="mt-6 space-y-5">
            {statusRows.map((row) => (
              <li key={row.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                      {row.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {row.label}
                      </p>
                      <p className="truncate text-xs text-white/55">
                        {row.count} request{row.count === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-bold tabular-nums text-white">
                    {row.pct}%
                  </p>
                </div>
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700 ease-out',
                      row.bar,
                    )}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </DashboardPanel>
      </div>
    </div>
  )
}
