import { Plus, RefreshCw } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { staffListColumns } from '../components/staff-list-columns'
import {
  StaffListErrorState,
  StaffListLoadingState,
} from '../components/staff-list-states'
import { useStaffQuery } from '../hooks/use-staff-query'
import type { StaffListItem } from '../types/staff'

function filterStaff(row: StaffListItem, search: string) {
  const haystack = [
    row.pin,
    row.fullName,
    row.email,
    row.gender,
    row.position,
    row.branch,
    row.isActive ? 'active' : 'inactive',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function StaffListPage() {
  const staffQuery = useStaffQuery()

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
        {staffQuery.isLoading ? <StaffListLoadingState /> : null}

        {staffQuery.isError ? (
          <StaffListErrorState onRetry={() => void staffQuery.refetch()} />
        ) : null}

        {staffQuery.isSuccess ? (
          <DataTable
            title="Staff List"
            description="Manage staff accounts and roles."
            totalLabel="accounts"
            columns={staffListColumns}
            data={staffQuery.data.data}
            searchPlaceholder="Search by pin, name, position, branch..."
            globalFilterFn={filterStaff}
            initialPageSize={10}
            pageSizeOptions={[10, 20, 50]}
            emptyMessage="No staff accounts found"
            toolbarActions={
              <>
                <Button
                  variant="secondary"
                  disabled={staffQuery.isFetching}
                  onClick={() => {
                    void staffQuery.refetch().then(() => {
                      notify('success', {
                        title: 'Staff list refreshed',
                        description: 'Latest staff data has been loaded.',
                      })
                    })
                  }}
                >
                  <RefreshCw
                    className={`size-4 ${staffQuery.isFetching ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
                <Button
                  onClick={() =>
                    notify('info', {
                      title: 'Add account',
                      description:
                        'The create staff account form will be added later.',
                    })
                  }
                >
                  <Plus className="size-4" />
                  Add New Account
                </Button>
              </>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
