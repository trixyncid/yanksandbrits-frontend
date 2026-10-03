import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { DataTable, ListToolbarFilters } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { useSessionState } from '../../../shared/hooks/use-session-state'
import { AdminShell } from '../../admin/components/admin-shell'
import { Can } from '../../auth/components/can'
import {
  useIsMarketing,
  useIsProgramReviewer,
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
type ManagerApprovalFilter = NonNullable<
  PredictionTestListFilters['managerApproval']
>
type AcademicLeaderStatusFilter = NonNullable<
  PredictionTestListFilters['academicLeaderStatus']
>

type PredictionTestListFilterState = {
  counsellorId: string
  status: StatusFilter
  managerApproval: ManagerApprovalFilter
  academicLeaderStatus: AcademicLeaderStatusFilter
}

const EMPTY_FILTERS: PredictionTestListFilterState = {
  counsellorId: '',
  status: 'all',
  managerApproval: 'all',
  academicLeaderStatus: 'all',
}

const STATUS_FILTERS: StatusFilter[] = ['all', 'pending', 'approved', 'void']
const MANAGER_APPROVAL_FILTERS: ManagerApprovalFilter[] = [
  'all',
  'pending',
  'approved',
]
const ACADEMIC_LEADER_STATUS_FILTERS: AcademicLeaderStatusFilter[] = [
  'all',
  'pending_review',
  'reviewed',
]

function filterPredictionTest(row: PredictionTestListItem, search: string) {
  return row.studentName.toLowerCase().includes(search)
}

function defaultAcademicLeaderStatusFilter(options: {
  isProgramReviewer: boolean
}): AcademicLeaderStatusFilter {
  // Reviewers work a pending-review queue; reviewed tests stay on finance /
  // systemadmin / branch-manager (and counsellor) lists.
  if (options.isProgramReviewer) return 'pending_review'
  return 'all'
}

export default function PredictionTestListPage() {
  const navigate = useNavigate()
  const isProgramReviewer = useIsProgramReviewer()
  const defaultAlStatus = defaultAcademicLeaderStatusFilter({
    isProgramReviewer,
  })
  const [filters, setFilters] = useSessionState<PredictionTestListFilterState>(
    'list-filters:prediction-tests',
    {
      ...EMPTY_FILTERS,
      academicLeaderStatus: defaultAlStatus,
    },
  )
  const status = STATUS_FILTERS.includes(filters.status)
    ? filters.status
    : 'all'
  const managerApproval = MANAGER_APPROVAL_FILTERS.includes(
    filters.managerApproval,
  )
    ? filters.managerApproval
    : 'all'
  const academicLeaderStatus = ACADEMIC_LEADER_STATUS_FILTERS.includes(
    filters.academicLeaderStatus,
  )
    ? filters.academicLeaderStatus
    : defaultAlStatus
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
    managerApproval: hidePayment ? 'approved' : managerApproval,
    academicLeaderStatus,
  })

  const clearFilters = () =>
    setFilters({
      ...EMPTY_FILTERS,
      academicLeaderStatus: defaultAlStatus,
    })

  function openCreate() {
    void navigate({ to: '/prediction-tests/new' })
  }

  const listFilters = (
    <ListToolbarFilters>
      <PredictionTestListFiltersMenu
        status={status}
        managerApproval={managerApproval}
        academicLeaderStatus={academicLeaderStatus}
        defaultAcademicLeaderStatus={defaultAlStatus}
        counsellorId={filters.counsellorId}
        hidePayment={hidePayment}
        hideCounsellor={hideCounsellorFilter}
        onStatusChange={(next) =>
          setFilters((current) => ({ ...current, status: next }))
        }
        onManagerApprovalChange={(next) =>
          setFilters((current) => ({ ...current, managerApproval: next }))
        }
        onAcademicLeaderStatusChange={(next) =>
          setFilters((current) => ({
            ...current,
            academicLeaderStatus: next,
          }))
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
              {hidePayment
                ? 'Review prediction tests the branch manager has approved.'
                : 'Review prediction test results, manager approval, and payments.'}
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
