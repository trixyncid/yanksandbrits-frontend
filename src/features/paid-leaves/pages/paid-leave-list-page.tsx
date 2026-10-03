import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { AdminShell } from '../../admin/components/admin-shell'
import { Can } from '../../auth/components/can'
import { paidLeaveListColumns } from '../components/paid-leave-list-columns'
import {
  PaidLeaveListErrorState,
  PaidLeaveListLoadingState,
} from '../components/paid-leave-list-states'
import { PaidLeaveOverview } from '../components/paid-leave-overview'
import { usePaidLeavesQuery } from '../hooks/use-paid-leaves-query'
import type { PaidLeaveListItem } from '../types/paid-leave'

function filterPaidLeave(row: PaidLeaveListItem, search: string) {
  const haystack = [
    row.staffPin,
    row.staffName,
    row.staffEmail,
    row.branch,
    row.notes,
    row.status,
    String(row.totalDays),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function PaidLeaveListPage() {
  const navigate = useNavigate()
  const leavesQuery = usePaidLeavesQuery()

  function openCreate() {
    void navigate({
      to: '/paid-leaves/new',
      search: { userId: undefined },
    })
  }

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
              Paid Leave
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Track staff leave requests, approvals, and days taken.
            </p>
          </div>
          <Can module="paidLeaves" action="add">
            <Button
              onClick={openCreate}
              className="rounded-full bg-slate-900 px-4 text-white hover:bg-slate-800"
            >
              <Plus className="size-4" />
              Add New Record
            </Button>
          </Can>
        </div>

        {leavesQuery.isLoading ? <PaidLeaveListLoadingState /> : null}

        {leavesQuery.isError ? (
          <PaidLeaveListErrorState
            onRetry={() => void leavesQuery.refetch()}
          />
        ) : null}

        {leavesQuery.isSuccess ? (
          <div className="space-y-4">
            <PaidLeaveOverview leaves={leavesQuery.data.data} />

            <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both [animation-delay:220ms]">
              <DataTable
                title="Leave requests"
                description="Search and manage individual paid leave records."
                totalLabel="records"
                columns={paidLeaveListColumns}
                data={leavesQuery.data.data}
                searchPlaceholder="Search by staff, branch, status..."
                searchVariant="pill"
                globalFilterFn={filterPaidLeave}
                initialPageSize={10}
                emptyMessage="No paid leave records found"
                toolbarActions={
                  <Can module="paidLeaves" action="add">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={openCreate}
                      className="rounded-full"
                    >
                      <Plus className="size-3.5" />
                      Add record
                    </Button>
                  </Can>
                }
              />
            </div>
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
