import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { AdminShell } from '../../admin/components/admin-shell'
import { Can } from '../../auth/components/can'
import { branchListColumns } from '../components/branch-list-columns'
import {
  BranchListErrorState,
  BranchListLoadingState,
} from '../components/branch-list-states'
import { useBranchesQuery } from '../hooks/use-branches-query'
import type { BranchListItem } from '../types/branch'

function filterBranch(row: BranchListItem, search: string) {
  const haystack = [
    row.name,
    row.phone,
    row.address,
    String(row.totalStudent),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function BranchListPage() {
  const navigate = useNavigate()
  const branchesQuery = useBranchesQuery()

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
        {branchesQuery.isLoading ? <BranchListLoadingState /> : null}

        {branchesQuery.isError ? (
          <BranchListErrorState
            onRetry={() => void branchesQuery.refetch()}
          />
        ) : null}

        {branchesQuery.isSuccess ? (
          <DataTable
            title="Branch List"
            description="Manage branch locations and student counts."
            totalLabel="branches"
            columns={branchListColumns}
            data={branchesQuery.data.data}
            searchPlaceholder="Search by name, phone, address..."
            globalFilterFn={filterBranch}
            initialPageSize={10}
            emptyMessage="No branches found"
            toolbarActions={
              <Can module="branches" action="add">
                <Button
                  onClick={() => void navigate({ to: '/branches/new' })}
                >
                  <Plus className="size-4" />
                  Add New Branch
                </Button>
              </Can>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
