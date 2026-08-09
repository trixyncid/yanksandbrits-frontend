import { Plus, RefreshCw } from 'lucide-react'
import { useState } from 'react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { updateOpenPeriodSalaries } from '../api/bookkeeping-api'
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
  const [isUpdatingSalary, setIsUpdatingSalary] = useState(false)

  async function handleUpdateSalary() {
    setIsUpdatingSalary(true)
    try {
      await updateOpenPeriodSalaries()
      await query.refetch()
      notify('success', {
        title: 'Salaries updated',
        description: 'Open-period salary calculations have been refreshed.',
      })
    } catch (error) {
      notify('error', {
        title: 'Unable to update salaries',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsUpdatingSalary(false)
    }
  }

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
            description="Manage payroll bookkeeping periods."
            totalLabel="periods"
            columns={bookkeepingListColumns}
            data={query.data.data}
            searchPlaceholder="Search by status, creator, dates..."
            globalFilterFn={filterBookkeeping}
            initialPageSize={10}
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
                        description: 'Latest bookkeeping data has been loaded.',
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
                  disabled={isUpdatingSalary}
                  onClick={() => void handleUpdateSalary()}
                >
                  {isUpdatingSalary ? 'Updating…' : 'Update Salary'}
                </Button>
                <Button
                  onClick={() =>
                    notify('info', {
                      title: 'Add bookkeeping',
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
