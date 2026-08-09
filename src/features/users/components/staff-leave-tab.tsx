import { Link, useNavigate } from '@tanstack/react-router'
import { CalendarDays } from 'lucide-react'

import { DataTableBadge } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { usePaidLeavesQuery } from '../../paid-leaves/hooks/use-paid-leaves-query'
import type { PaidLeaveStatus } from '../../paid-leaves/types/paid-leave'
import type { UserDetail } from '../api/users-api'
import { formatStaffDate } from './staff-detail-utils'

type StaffLeaveTabProps = {
  user: UserDetail
}

function statusTone(status: PaidLeaveStatus) {
  if (status === 'approved') return 'success' as const
  if (status === 'pending') return 'info' as const
  return 'danger' as const
}

function statusLabel(status: PaidLeaveStatus) {
  if (status === 'approved') return 'Approved'
  if (status === 'pending') return 'Pending'
  return 'Void'
}

export function StaffLeaveTab({ user }: StaffLeaveTabProps) {
  const navigate = useNavigate()
  const leavesQuery = usePaidLeavesQuery({ userId: user.id })

  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-[linear-gradient(165deg,#4274B9_0%,#2F5A94_100%)] p-5 text-white shadow-lg shadow-[#4274B9]/20">
          <p className="text-sm font-medium text-white/75">Leave remaining</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">
            {user.paidLeaveLeft}
            <span className="ml-1 text-lg font-semibold text-white/70">
              days
            </span>
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
          <p className="text-sm text-slate-500">Annual leave total</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            {user.paidLeaveTotal}
            <span className="ml-1 text-lg font-semibold text-slate-400">
              days
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-bold text-slate-900">Leave history</h4>
          <p className="mt-1 text-sm text-slate-500">
            Paid leave requests linked to this staff member.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            void navigate({
              to: '/paid-leaves/new',
              search: { userId: user.id },
            })
          }
        >
          Record leave
        </Button>
      </div>

      {leavesQuery.isLoading ? (
        <p className="py-8 text-center text-sm text-slate-500">
          Loading leave records...
        </p>
      ) : null}

      {leavesQuery.isError ? (
        <p className="py-8 text-center text-sm text-rose-600">
          Unable to load leave records.
        </p>
      ) : null}

      {leavesQuery.isSuccess ? (
        leavesQuery.data.data.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center">
            <CalendarDays className="size-5 text-slate-400" />
            <p className="mt-3 text-sm font-semibold text-slate-800">
              No leave records
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Paid leave requests for this person will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                <tr>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Days</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {leavesQuery.data.data.map((leave) => (
                  <tr key={leave.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      <Link
                        to="/paid-leaves/$leaveId/edit"
                        params={{ leaveId: leave.id }}
                        className="hover:text-[#4274B9]"
                      >
                        {formatStaffDate(leave.startDate)}
                        {leave.endDate !== leave.startDate
                          ? ` – ${formatStaffDate(leave.endDate)}`
                          : ''}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {leave.totalDays}
                    </td>
                    <td className="px-4 py-3">
                      <DataTableBadge tone={statusTone(leave.status)}>
                        {statusLabel(leave.status)}
                      </DataTableBadge>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-slate-500">
                      {leave.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </div>
  )
}
