import { useNavigate } from '@tanstack/react-router'
import { Plus, RefreshCw } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { predictionTestListColumns } from '../components/prediction-test-list-columns'
import {
  PredictionTestListErrorState,
  PredictionTestListLoadingState,
} from '../components/prediction-test-list-states'
import { usePredictionTestsQuery } from '../hooks/use-prediction-tests-query'
import type { PredictionTestListItem } from '../types/prediction-test'

function filterPredictionTest(row: PredictionTestListItem, search: string) {
  const haystack = [
    row.studentName,
    row.studentEmail,
    row.studentPhone,
    row.description,
    row.educationCounsellor,
    row.branch,
    row.status,
    String(row.amount),
    row.score == null ? '' : String(row.score),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function PredictionTestListPage() {
  const navigate = useNavigate()
  const testsQuery = usePredictionTestsQuery()

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
        {testsQuery.isLoading ? <PredictionTestListLoadingState /> : null}

        {testsQuery.isError ? (
          <PredictionTestListErrorState
            onRetry={() => void testsQuery.refetch()}
          />
        ) : null}

        {testsQuery.isSuccess ? (
          <DataTable
            title="Prediction Test List"
            description={
              testsQuery.data.meta.source === 'placeholder'
                ? 'Review prediction test results and payments. Currently using placeholder data until the API is connected.'
                : 'Review prediction test results and payments.'
            }
            totalLabel="tests"
            columns={predictionTestListColumns}
            data={testsQuery.data.data}
            searchPlaceholder="Search by student, counsellor, status, branch..."
            globalFilterFn={filterPredictionTest}
            initialPageSize={10}
            pageSizeOptions={[10, 20, 50]}
            emptyMessage="No prediction tests found"
            toolbarActions={
              <>
                <Button
                  variant="secondary"
                  disabled={testsQuery.isFetching}
                  onClick={() => {
                    void testsQuery.refetch().then(() => {
                      notify('success', {
                        title: 'Prediction tests refreshed',
                        description: 'Latest placeholder data has been loaded.',
                      })
                    })
                  }}
                >
                  <RefreshCw
                    className={`size-4 ${testsQuery.isFetching ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
                <Button
                  onClick={() => void navigate({ to: '/prediction-tests/new' })}
                >
                  <Plus className="size-4" />
                  Add Prediction Test
                </Button>
              </>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
