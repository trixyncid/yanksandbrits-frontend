import { useNavigate } from '@tanstack/react-router'
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

function filterUsers(row: StaffListItem, search: string) {
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
  const navigate = useNavigate()
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
            title="Users"
            description="Manage login accounts across staff and students."
            totalLabel="accounts"
            columns={staffListColumns}
            data={staffQuery.data.data}
            searchPlaceholder="Search by pin, name, email, role, branch..."
            globalFilterFn={filterUsers}
            initialPageSize={10}
            emptyMessage="No user accounts found"
            toolbarActions={
              <>
                <Button
                  variant="secondary"
                  disabled={staffQuery.isFetching}
                  onClick={() => {
                    void staffQuery.refetch().then(() => {
                      notify('success', {
                        title: 'User list refreshed',
                        description: 'Latest account data has been loaded.',
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
                  onClick={() => void navigate({ to: '/users/new' })}
                >
                  <Plus className="size-4" />
                  Add Staff Account
                </Button>
              </>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
