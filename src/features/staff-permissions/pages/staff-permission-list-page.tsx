import { Plus, RefreshCw } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { staffPermissionListColumns } from '../components/staff-permission-list-columns'
import {
  StaffPermissionListErrorState,
  StaffPermissionListLoadingState,
} from '../components/staff-permission-list-states'
import { useStaffPermissionsQuery } from '../hooks/use-staff-permissions-query'
import type { StaffPermissionListItem } from '../types/staff-permission'

function filterStaffPermission(row: StaffPermissionListItem, search: string) {
  const haystack = [
    row.name,
    String(row.permissionCount),
    String(row.memberCount),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function StaffPermissionListPage() {
  const permissionsQuery = useStaffPermissionsQuery()

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
        {permissionsQuery.isLoading ? (
          <StaffPermissionListLoadingState />
        ) : null}

        {permissionsQuery.isError ? (
          <StaffPermissionListErrorState
            onRetry={() => void permissionsQuery.refetch()}
          />
        ) : null}

        {permissionsQuery.isSuccess ? (
          <DataTable
            title="Staff Group List"
            description="Manage staff permission groups."
            totalLabel="groups"
            columns={staffPermissionListColumns}
            data={permissionsQuery.data.data}
            searchPlaceholder="Search by group name..."
            globalFilterFn={filterStaffPermission}
            initialPageSize={10}
            pageSizeOptions={[10, 20, 50]}
            emptyMessage="No staff permission groups found"
            toolbarActions={
              <>
                <Button
                  variant="secondary"
                  disabled={permissionsQuery.isFetching}
                  onClick={() => {
                    void permissionsQuery.refetch().then(() => {
                      notify('success', {
                        title: 'Staff permissions refreshed',
                        description:
                          'Latest staff permission data has been loaded.',
                      })
                    })
                  }}
                >
                  <RefreshCw
                    className={`size-4 ${permissionsQuery.isFetching ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
                <Button
                  onClick={() =>
                    notify('info', {
                      title: 'Add group',
                      description:
                        'The create staff permission group form will be added later.',
                    })
                  }
                >
                  <Plus className="size-4" />
                  Add New Group
                </Button>
              </>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
