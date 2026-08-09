import { useNavigate } from '@tanstack/react-router'
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
    row.code,
    row.description,
    String(row.permissionCount),
    String(row.memberCount),
    row.isSystem ? 'system' : '',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function StaffPermissionListPage() {
  const navigate = useNavigate()
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
            title="Roles"
            description="Create roles, attach Django permissions, then assign roles to user accounts."
            totalLabel="roles"
            columns={staffPermissionListColumns}
            data={permissionsQuery.data.data}
            searchPlaceholder="Search by name, code..."
            globalFilterFn={filterStaffPermission}
            initialPageSize={10}
            emptyMessage="No roles found"
            toolbarActions={
              <>
                <Button
                  variant="secondary"
                  disabled={permissionsQuery.isFetching}
                  onClick={() => {
                    void permissionsQuery.refetch().then(() => {
                      notify('success', {
                        title: 'Roles refreshed',
                        description: 'Latest role definitions have been loaded.',
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
                  onClick={() => void navigate({ to: '/staff-permissions/new' })}
                >
                  <Plus className="size-4" />
                  Add New Role
                </Button>
              </>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
