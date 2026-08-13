import { useMemo, useState } from 'react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import {
  BookkeepingPeriodSelect,
  OPEN_BOOKKEEPING_PERIOD,
  type BookkeepingPeriodValue,
} from '../../bookkeeping/components/bookkeeping-period-select'
import { useBookkeepingQuery } from '../../bookkeeping/hooks/use-bookkeeping-query'
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
  const [period, setPeriod] = useState<BookkeepingPeriodValue>(
    OPEN_BOOKKEEPING_PERIOD,
  )
  const periodsQuery = useBookkeepingQuery()
  const query = useTutorReportQuery({ bookkeepingId: period })
  const [isUpdatingSalary, setIsUpdatingSalary] = useState(false)

  const periods = useMemo(() => {
    const rows = periodsQuery.data?.data ?? []
    return [...rows].sort((a, b) => b.endDate.localeCompare(a.endDate))
  }, [periodsQuery.data?.data])

  const isOpenPeriod = period === OPEN_BOOKKEEPING_PERIOD

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
        {query.isLoading || periodsQuery.isLoading ? (
          <TutorReportListLoadingState />
        ) : null}
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
            emptyMessage={
              isOpenPeriod
                ? 'No tutor salary activity in the open period yet'
                : 'No tutor salary data found for this bookkeeping period'
            }
            toolbarActions={
              <>
                <BookkeepingPeriodSelect
                  value={period}
                  periods={periods}
                  disabled={periodsQuery.isLoading}
                  onChange={setPeriod}
                />
                <Button
                  disabled={isUpdatingSalary || !isOpenPeriod}
                  title={
                    isOpenPeriod
                      ? 'Recalculate session rates for the open period'
                      : 'Update Salary only applies to the open period'
                  }
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
