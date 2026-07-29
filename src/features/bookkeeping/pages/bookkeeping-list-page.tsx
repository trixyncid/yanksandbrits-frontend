import { Plus, RefreshCw } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { bookkeepingListColumns } from '../components/bookkeeping-list-columns'
import {
  BookkeepingListErrorState,
  BookkeepingListLoadingState,
} from '../components/bookkeeping-list-states'
import { useBookkeepingQuery } from '../hooks/use-bookkeeping-query'
import type { BookkeepingListItem } from '../types/bookkeeping'

function filterBookkeeping(row: BookkeepingListItem, search: string) {
  const haystack = [row.startDate, row.endDate, row.status, row.createdBy]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function BookkeepingListPage() {
  const query = useBookkeepingQuery()

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
        {query.isLoading ? <BookkeepingListLoadingState /> : null}
        {query.isError ? (
          <BookkeepingListErrorState onRetry={() => void query.refetch()} />
        ) : null}
        {query.isSuccess ? (
          <DataTable
            title="Bookkeeping List"
            description={
              query.data.meta.source === 'placeholder'
                ? 'Manage payroll bookkeeping periods. Currently using placeholder data until the API is connected.'
                : 'Manage payroll bookkeeping periods.'
            }
            totalLabel="periods"
            columns={bookkeepingListColumns}
            data={query.data.data}
            searchPlaceholder="Search by status, creator, dates..."
            globalFilterFn={filterBookkeeping}
            initialPageSize={10}
            pageSizeOptions={[10, 20, 50]}
            emptyMessage="No bookkeeping periods found"
            toolbarActions={
              <>
                <Button
                  variant="secondary"
                  disabled={query.isFetching}
                  onClick={() => {
                    void query.refetch().then(() => {
                      notify('success', {
                        title: 'Bookkeeping refreshed',
                        description: 'Latest placeholder data has been loaded.',
                      })
                    })
                  }}
                >
                  <RefreshCw
                    className={`size-4 ${query.isFetching ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    notify('info', {
                      title: 'Update salary placeholder',
                      description:
                        'Salary recalculation will be connected later.',
                    })
                  }
                >
                  Update Salary
                </Button>
                <Button
                  onClick={() =>
                    notify('info', {
                      title: 'Add bookkeeping placeholder',
                      description:
                        'The create bookkeeping form will be added later.',
                    })
                  }
                >
                  <Plus className="size-4" />
                  Add New Bookkeeping
                </Button>
              </>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
