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

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
        {leavesQuery.isLoading ? <PaidLeaveListLoadingState /> : null}

        {leavesQuery.isError ? (
          <PaidLeaveListErrorState
            onRetry={() => void leavesQuery.refetch()}
          />
        ) : null}

        {leavesQuery.isSuccess ? (
          <DataTable
            title="Paid Leave List"
            description="Track staff paid leave requests."
            totalLabel="records"
            columns={paidLeaveListColumns}
            data={leavesQuery.data.data}
            searchPlaceholder="Search by staff, branch, status, notes..."
            globalFilterFn={filterPaidLeave}
            initialPageSize={10}
            emptyMessage="No paid leave records found"
            toolbarActions={
              <Can module="paidLeaves" action="add">
                <Button
                  onClick={() =>
                    void navigate({
                      to: '/paid-leaves/new',
                      search: { userId: undefined },
                    })
                  }
                >
                  <Plus className="size-4" />
                  Add New Record
                </Button>
              </Can>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
