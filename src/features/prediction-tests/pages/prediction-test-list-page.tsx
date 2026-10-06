import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { DataTable, ListToolbarFilters } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { useSessionState } from '../../../shared/hooks/use-session-state'
import { AdminShell } from '../../admin/components/admin-shell'
import { Can } from '../../auth/components/can'
import {
  useIsAcademicLeader,
  useIsMarketing,
  useIsProgramReviewer,
  useIsTutorReviewer,
  useLocksPaymentStatus,
  useModulePermissions,
} from '../../auth/hooks/use-permissions'
import type { PredictionTestListFilters } from '../api/prediction-test-query-keys'
import { PredictionTestBulkStatusBar } from '../components/prediction-test-bulk-status-bar'
import { PredictionTestListFiltersMenu } from '../components/prediction-test-list-filters'
import { getPredictionTestListColumns } from '../components/prediction-test-list-columns'
import {
  PredictionTestListErrorState,
  PredictionTestListLoadingState,
} from '../components/prediction-test-list-states'
import { usePredictionTestsQuery } from '../hooks/use-prediction-tests-query'
import type { PredictionTestListItem } from '../types/prediction-test'

type StatusFilter = NonNullable<PredictionTestListFilters['status']>

type PredictionTestListFilterState = {
  counsellorId: string
  status: StatusFilter
}

const EMPTY_FILTERS: PredictionTestListFilterState = {
  counsellorId: '',
  status: 'all',
}

const STATUS_FILTERS: StatusFilter[] = ['all', 'pending', 'approved', 'void']

function filterPredictionTest(row: PredictionTestListItem, search: string) {
  return row.studentName.toLowerCase().includes(search)
}

export default function PredictionTestListPage() {
  const navigate = useNavigate()
  const isProgramReviewer = useIsProgramReviewer()
  const isAcademicLeader = useIsAcademicLeader()
  const isTutorReviewer = useIsTutorReviewer()
  const [filters, setFilters] = useSessionState<PredictionTestListFilterState>(
    'list-filters:prediction-tests',
    EMPTY_FILTERS,
  )
  const status = STATUS_FILTERS.includes(filters.status)
    ? filters.status
    : 'all'
  const { canChange } = useModulePermissions('predictionTests')
  const lockPaymentStatus = useLocksPaymentStatus()
  const hideCounsellorFilter = useIsMarketing()
  const hidePayment = isProgramReviewer
  const canBulkUpdateStatus = canChange && !lockPaymentStatus && !hidePayment
  const listColumns = getPredictionTestListColumns({ hidePayment })
  const testsQuery = usePredictionTestsQuery({
    counsellorId: hideCounsellorFilter
      ? undefined
      : filters.counsellorId || undefined,
    status: hidePayment ? 'all' : status,
  })

  const clearFilters = () => setFilters(EMPTY_FILTERS)

  function openCreate() {
    void navigate({ to: '/prediction-tests/new' })
  }

  const listFilters = (
    <ListToolbarFilters>
      <PredictionTestListFiltersMenu
        status={status}
        counsellorId={filters.counsellorId}
        hidePayment={hidePayment}
        hideCounsellor={hideCounsellorFilter}
        onStatusChange={(next) =>
          setFilters((current) => ({ ...current, status: next }))
        }
        onCounsellorChange={(counsellorId) =>
          setFilters((current) => ({ ...current, counsellorId }))
        }
        onClear={clearFilters}
      />
    </ListToolbarFilters>
  )

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
              Prediction Tests
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              {isAcademicLeader
                ? 'Review prediction test scores.'
                : isTutorReviewer
                  ? 'Review prediction tests, and General English Pre-Test students assigned to you.'
                  : 'Review prediction test results and payments.'}
            </p>
          </div>
          <Can module="predictionTests" action="add">
            <Button
              onClick={openCreate}
              className="rounded-full bg-slate-900 px-4 text-white hover:bg-slate-800"
            >
              <Plus className="size-4" />
              Add Prediction Test
            </Button>
          </Can>
        </div>

        {testsQuery.isLoading ? <PredictionTestListLoadingState /> : null}

        {testsQuery.isError ? (
          <div className="space-y-2">
            {listFilters}
            <PredictionTestListErrorState
              onRetry={() => void testsQuery.refetch()}
            />
          </div>
        ) : null}

        {testsQuery.isSuccess ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              title="Tests"
              description="Search and manage prediction test records."
              totalLabel="tests"
              columns={listColumns}
              data={testsQuery.data.data}
              searchPlaceholder="Search by student name..."
              searchVariant="pill"
              globalFilterFn={filterPredictionTest}
              initialPageSize={10}
              emptyMessage="No prediction tests found"
              enableRowSelection={canBulkUpdateStatus}
              getRowId={(row) => row.id}
              selectionToolbar={(ctx) => <PredictionTestBulkStatusBar {...ctx} />}
              toolbarFilters={listFilters}
            />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
