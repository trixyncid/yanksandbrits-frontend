import { RefreshCw } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
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
            description={`Current Period: ${query.data.meta.period}${
              query.data.meta.source === 'placeholder'
                ? ' · Placeholder data'
                : ''
            }`}
            totalLabel="tutors"
            columns={tutorReportListColumns}
            data={query.data.data}
            searchPlaceholder="Search by tutor, email..."
            globalFilterFn={filterTutorReport}
            initialPageSize={10}
            pageSizeOptions={[10, 20, 50]}
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
              </>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
