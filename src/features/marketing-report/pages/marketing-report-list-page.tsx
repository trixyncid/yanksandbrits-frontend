import { RefreshCw } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
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
  const query = useMarketingReportQuery()

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
        {query.isLoading ? <MarketingReportListLoadingState /> : null}
        {query.isError ? (
          <MarketingReportListErrorState
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {query.isSuccess ? (
          <DataTable
            title="Marketing Salary List"
            description={`Current Period: ${query.data.meta.period}${
              query.data.meta.source === 'placeholder'
                ? ' · Placeholder data'
                : ''
            }`}
            totalLabel="marketers"
            columns={marketingReportListColumns}
            data={query.data.data}
            searchPlaceholder="Search by marketer, branch..."
            globalFilterFn={filterMarketingReport}
            initialPageSize={10}
            pageSizeOptions={[10, 20, 50]}
            emptyMessage="No marketing salary data found"
            toolbarActions={
              <Button
                variant="secondary"
                disabled={query.isFetching}
                onClick={() => {
                  void query.refetch().then(() => {
                    notify('success', {
                      title: 'Marketing report refreshed',
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
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
