import { Plus, RefreshCw } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
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
    row.isActive ? 'active' : 'inactive',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function MarketingListPage() {
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
            title="Marketing List"
            description="Manage marketing counsellors and salary settings."
            totalLabel="accounts"
            columns={marketingListColumns}
            data={marketingsQuery.data.data}
            searchPlaceholder="Search by pin, name, email, branch..."
            globalFilterFn={filterMarketing}
            initialPageSize={10}
            pageSizeOptions={[10, 20, 50]}
            emptyMessage="No marketing accounts found"
            toolbarActions={
              <>
                <Button
                  variant="secondary"
                  disabled={marketingsQuery.isFetching}
                  onClick={() => {
                    void marketingsQuery.refetch().then(() => {
                      notify('success', {
                        title: 'Marketing list refreshed',
                        description: 'Latest marketing data has been loaded.',
                      })
                    })
                  }}
                >
                  <RefreshCw
                    className={`size-4 ${marketingsQuery.isFetching ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
                <Button
                  onClick={() =>
                    notify('info', {
                      title: 'Add marketing',
                      description:
                        'The create marketing form will be added later.',
                    })
                  }
                >
                  <Plus className="size-4" />
                  Add New Marketing
                </Button>
              </>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
