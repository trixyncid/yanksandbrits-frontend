import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { refreshTutorSalaries } from '../api/tutor-report-api'
import { tutorReportListColumns } from '../components/tutor-report-list-columns'
import {
  TutorReportListErrorState,
  TutorReportListLoadingState,
} from '../components/tutor-report-list-states'
import { useTutorReportQuery } from '../hooks/use-tutor-report-query'
import type { TutorReportListItem } from '../types/tutor-report'

function filterTutorReport(row: TutorReportListItem, search: string) {
  const haystack = [
    row.tutorPin,
    row.tutorName,
    row.tutorEmail,
    String(row.totalSalary),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function TutorReportListPage() {
  const query = useTutorReportQuery()
  const [isUpdatingSalary, setIsUpdatingSalary] = useState(false)

  async function handleUpdateSalary() {
    setIsUpdatingSalary(true)
    try {
      await refreshTutorSalaries()
      await query.refetch()
      notify('success', {
        title: 'Salaries updated',
        description: 'Open-period tutor salaries have been recalculated.',
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
        {query.isLoading ? <TutorReportListLoadingState /> : null}
        {query.isError ? (
          <TutorReportListErrorState onRetry={() => void query.refetch()} />
        ) : null}
        {query.isSuccess ? (
          <DataTable
            title="Tutor Salary List"
            description={`Period: ${query.data.meta.period}`}
            totalLabel="tutors"
            columns={tutorReportListColumns}
            data={query.data.data}
            searchPlaceholder="Search by tutor, email..."
            globalFilterFn={filterTutorReport}
            initialPageSize={10}
            emptyMessage="No tutor salary data found"
            toolbarActions={
              <>
                <Button
                  variant="secondary"
                  disabled={query.isFetching}
                  onClick={() => {
                    void query.refetch().then(() => {
                      notify('success', {
                        title: 'Tutor report refreshed',
                        description: 'Latest salary data has been loaded.',
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
                  disabled={isUpdatingSalary}
                  onClick={() => void handleUpdateSalary()}
                >
                  {isUpdatingSalary ? 'Updating…' : 'Update Salary'}
                </Button>
              </>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
