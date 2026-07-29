import { Plus, RefreshCw } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
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
            description={
              leavesQuery.data.meta.source === 'placeholder'
                ? 'Track staff paid leave requests. Currently using placeholder data until the API is connected.'
                : 'Track staff paid leave requests.'
            }
            totalLabel="records"
            columns={paidLeaveListColumns}
            data={leavesQuery.data.data}
            searchPlaceholder="Search by staff, branch, status, notes..."
            globalFilterFn={filterPaidLeave}
            initialPageSize={10}
            pageSizeOptions={[10, 20, 50]}
            emptyMessage="No paid leave records found"
            toolbarActions={
              <>
                <Button
                  variant="secondary"
                  disabled={leavesQuery.isFetching}
                  onClick={() => {
                    void leavesQuery.refetch().then(() => {
                      notify('success', {
                        title: 'Paid leave refreshed',
                        description: 'Latest placeholder data has been loaded.',
                      })
                    })
                  }}
                >
                  <RefreshCw
                    className={`size-4 ${leavesQuery.isFetching ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
                <Button
                  onClick={() =>
                    notify('info', {
                      title: 'Add paid leave placeholder',
                      description:
                        'The create paid leave form will be added later.',
                    })
                  }
                >
                  <Plus className="size-4" />
                  Add New Record
                </Button>
              </>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
