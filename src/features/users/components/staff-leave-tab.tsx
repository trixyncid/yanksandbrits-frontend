import { Link, useNavigate } from '@tanstack/react-router'
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Plus,
  Umbrella,
  XCircle,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import {
  DashboardEmptyState,
  DashboardPanel,
} from '../../admin/components/dashboard-section'
import { usePaidLeavesQuery } from '../../paid-leaves/hooks/use-paid-leaves-query'
import type { PaidLeaveStatus } from '../../paid-leaves/types/paid-leave'
import type { UserDetail } from '../api/users-api'
import { formatStaffDate } from './staff-detail-utils'

type StaffLeaveTabProps = {
  user: UserDetail
}

function statusLabel(status: PaidLeaveStatus) {
  if (status === 'approved') return 'Approved'
  if (status === 'pending') return 'Pending'
  return 'Void'
}

function statusIcon(status: PaidLeaveStatus): ReactNode {
  if (status === 'approved') return <CheckCircle2 className="size-4" />
  if (status === 'pending') return <Clock3 className="size-4" />
  return <XCircle className="size-4" />
}

function statusTone(status: PaidLeaveStatus) {
  if (status === 'approved') {
    return {
      badge: 'bg-emerald-50 text-emerald-700',
      bar: 'bg-emerald-400',
      icon: 'bg-emerald-50 text-emerald-600',
    }
  }
  if (status === 'pending') {
    return {
      badge: 'bg-[#E8EEFF] text-[#253CA1]',
      bar: 'bg-[#7B93E8]',
      icon: 'bg-[#E8EEFF] text-[#253CA1]',
    }
  }
  return {
    badge: 'bg-rose-50 text-rose-700',
    bar: 'bg-rose-300',
    icon: 'bg-rose-50 text-rose-600',
  }
}

export function StaffLeaveTab({ user }: StaffLeaveTabProps) {
  const navigate = useNavigate()
  const leavesQuery = usePaidLeavesQuery({ userId: user.id })

  const total = Math.max(user.paidLeaveTotal, 0)
  const remaining = Math.max(user.paidLeaveLeft, 0)
  const used = Math.max(total - remaining, 0)
  const remainingPct =
    total > 0 ? Math.min(Math.round((remaining / total) * 100), 100) : 0
  const usedPct =
    total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0

  function openRecordLeave() {
    void navigate({
      to: '/paid-leaves/new',
      search: { userId: user.id },
    })
  }

  return (
    <div className="space-y-4 p-4 sm:p-5">
      <div className="grid gap-3 lg:grid-cols-12 lg:items-start lg:gap-4">
        <DashboardPanel
          variant="navy"
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both lg:col-span-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-base font-bold text-white">Leave balance</p>
              <p className="mt-0.5 text-sm text-white/60">
                Remaining days vs annual entitlement
              </p>
            </div>
            <button
              type="button"
              onClick={openRecordLeave}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <Plus className="size-3.5" strokeWidth={2.5} />
              Record
            </button>
          </div>

          <ul className="mt-6 space-y-5">
            <li>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                    <Umbrella className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      Remaining
                    </p>
                    <p className="truncate text-xs text-white/55">
                      {remaining} / {total} days
                    </p>
                  </div>
                </div>
                <p className="shrink-0 text-sm font-bold tabular-nums text-white">
                  {remainingPct}%
                </p>
              </div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#7B93E8] transition-all duration-700 ease-out"
                  style={{ width: `${remainingPct}%` }}
                />
              </div>
            </li>

            <li>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                    <CalendarDays className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      Used
                    </p>
                    <p className="truncate text-xs text-white/55">
                      {used} day{used === 1 ? '' : 's'} taken
                    </p>
                  </div>
                </div>
                <p className="shrink-0 text-sm font-bold tabular-nums text-white">
                  {usedPct}%
                </p>
              </div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#A8B8F0] transition-all duration-700 ease-out"
                  style={{ width: `${usedPct}%` }}
                />
              </div>
            </li>
          </ul>

          <div className="mt-6 flex items-end justify-between gap-3 border-t border-white/10 pt-4">
            <div>
              <p className="text-xs font-medium text-white/55">Days left</p>
              <p className="mt-0.5 text-3xl font-bold tracking-tight tabular-nums text-white">
                {remaining}
                <span className="ml-1 text-sm font-semibold text-white/60">
                  days
                </span>
              </p>
            </div>
            <p className="text-xs font-medium tabular-nums text-white/55">
              of {total} total
            </p>
          </div>
        </DashboardPanel>

        <DashboardPanel
          variant="plump"
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both gap-0 overflow-hidden p-0 [animation-delay:80ms] lg:col-span-7"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-900">Leave history</p>
              <p className="mt-0.5 text-sm text-slate-400">
                Paid leave requests for this staff member
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={openRecordLeave}
              className="rounded-full"
            >
              <Plus className="size-3.5" />
              Record leave
            </Button>
          </div>

          {leavesQuery.isLoading ? (
            <ul className="divide-y divide-slate-100">
              {[0, 1, 2].map((index) => (
                <li key={index} className="px-4 py-3.5 sm:px-5">
                  <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                </li>
              ))}
            </ul>
          ) : null}

          {leavesQuery.isError ? (
            <div className="px-4 py-8 sm:px-5">
              <p className="text-center text-sm text-rose-600">
                Unable to load leave records.
              </p>
            </div>
          ) : null}

          {leavesQuery.isSuccess ? (
            leavesQuery.data.data.length === 0 ? (
              <div className="px-4 py-6 sm:px-5">
                <DashboardEmptyState message="No leave records yet. Record a paid leave request to get started." />
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {leavesQuery.data.data.map((leave) => {
                  const tone = statusTone(leave.status)
                  return (
                    <li key={leave.id}>
                      <Link
                        to="/paid-leaves/$leaveId/edit"
                        params={{ leaveId: leave.id }}
                        className={cn(
                          'group flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50/80 sm:px-5',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#253CA1]/30',
                        )}
                      >
                        <span
                          className={cn(
                            'inline-flex size-9 shrink-0 items-center justify-center rounded-xl',
                            tone.icon,
                          )}
                        >
                          {statusIcon(leave.status)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {formatStaffDate(leave.startDate)}
                              {leave.endDate !== leave.startDate
                                ? ` – ${formatStaffDate(leave.endDate)}`
                                : ''}
                            </p>
                            <span
                              className={cn(
                                'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                tone.badge,
                              )}
                            >
                              {statusLabel(leave.status)}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-slate-400">
                            {leave.totalDays} day
                            {leave.totalDays === 1 ? '' : 's'}
                            {leave.notes ? ` · ${leave.notes}` : ''}
                          </p>
                          <div className="mt-2 h-1.5 max-w-[12rem] overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={cn('h-full rounded-full', tone.bar)}
                              style={{
                                width:
                                  leave.status === 'approved'
                                    ? '100%'
                                    : leave.status === 'pending'
                                      ? '55%'
                                      : '20%',
                              }}
                            />
                          </div>
                        </div>
                        <ChevronRight className="size-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#253CA1]" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )
          ) : null}
        </DashboardPanel>
      </div>
    </div>
  )
}
