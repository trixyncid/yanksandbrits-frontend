import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { AdminShell } from '../../admin/components/admin-shell'
import { Can } from '../../auth/components/can'
import { marketingListColumns } from '../components/marketing-list-columns'
import {
  MarketingListErrorState,
  MarketingListLoadingState,
} from '../components/marketing-list-states'
import { useMarketingsQuery } from '../hooks/use-marketings-query'
import type { MarketingListItem } from '../types/marketing'

function filterMarketing(row: MarketingListItem, search: string) {
  const haystack = [
    row.pin,
    row.fullName,
    row.email,
    row.phone,
    row.gender,
    row.branch,
    ...row.roles.map((role) => role.name),
    row.isActive ? 'active' : 'inactive',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function MarketingListPage() {
  const navigate = useNavigate()
  const marketingsQuery = useMarketingsQuery()

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
        {marketingsQuery.isLoading ? <MarketingListLoadingState /> : null}

        {marketingsQuery.isError ? (
          <MarketingListErrorState
            onRetry={() => void marketingsQuery.refetch()}
          />
        ) : null}

        {marketingsQuery.isSuccess ? (
          <DataTable
            title="Education Counsellors"
            description="Manage education counsellors, branch managers, and salary settings."
            totalLabel="accounts"
            columns={marketingListColumns}
            data={marketingsQuery.data.data}
            searchPlaceholder="Search by pin, name, email, branch..."
            globalFilterFn={filterMarketing}
            initialPageSize={10}
            emptyMessage="No education counsellors found"
            toolbarActions={
              <Can module="users" action="add">
                <Button onClick={() => void navigate({ to: '/marketings/new' })}>
                  <Plus className="size-4" />
                  Add Education Counsellor
                </Button>
              </Can>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
