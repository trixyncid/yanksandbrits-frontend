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
import { refreshMarketingSalaries } from '../api/marketing-report-api'
import { marketingReportListColumns } from '../components/marketing-report-list-columns'
import {
  MarketingReportListErrorState,
  MarketingReportListLoadingState,
} from '../components/marketing-report-list-states'
import { useMarketingReportQuery } from '../hooks/use-marketing-report-query'
import type { MarketingReportListItem } from '../types/marketing-report'

function filterMarketingReport(row: MarketingReportListItem, search: string) {
  const haystack = [
    row.marketerPin,
    row.marketerName,
    row.email,
    row.branch,
    String(row.totalSalary),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function MarketingReportListPage() {
  const [period, setPeriod] = useState<BookkeepingPeriodValue>(
    OPEN_BOOKKEEPING_PERIOD,
  )
  const periodsQuery = useBookkeepingQuery()
  const query = useMarketingReportQuery({ bookkeepingId: period })
  const [isUpdatingSalary, setIsUpdatingSalary] = useState(false)

  const periods = useMemo(() => {
    const rows = periodsQuery.data?.data ?? []
    return [...rows].sort((a, b) => b.endDate.localeCompare(a.endDate))
  }, [periodsQuery.data?.data])

  const isOpenPeriod = period === OPEN_BOOKKEEPING_PERIOD

  async function handleUpdateSalary() {
    setIsUpdatingSalary(true)
    try {
      await refreshMarketingSalaries()
      await query.refetch()
      notify('success', {
        title: 'Salaries updated',
        description: 'Open-period marketing salaries have been recalculated.',
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
          <MarketingReportListLoadingState />
        ) : null}
        {query.isError ? (
          <MarketingReportListErrorState
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {query.isSuccess ? (
          <DataTable
            title="Marketing Salary List"
            description={`Period: ${query.data.meta.period}`}
            totalLabel="marketers"
            columns={marketingReportListColumns}
            data={query.data.data}
            searchPlaceholder="Search by marketer, branch..."
            globalFilterFn={filterMarketingReport}
            initialPageSize={10}
            emptyMessage={
              isOpenPeriod
                ? 'No marketing salary activity in the open period yet'
                : 'No marketing salary data found for this bookkeeping period'
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
                      ? 'Refresh open-period salary preview'
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
