import { useNavigate } from '@tanstack/react-router'
import type { Row } from '@tanstack/react-table'
import {
  CalendarPlus,
  CircleCheck,
  ClipboardList,
  Hourglass,
  NotebookPen,
  Plus,
} from 'lucide-react'
import { useMemo } from 'react'

import { DataTable, ListToolbarFilters } from '../../../shared/components/data-table'
import {
  HeroPillButton,
  HeroSpotlight,
  PageHero,
  type HeroStat,
} from '../../../shared/components/page'
import { useSessionState } from '../../../shared/hooks/use-session-state'
import { AdminShell } from '../../admin/components/admin-shell'
import { Can } from '../../auth/components/can'
import {
  useCanEditApprovedPayment,
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

function hasAnyScore(row: PredictionTestListItem) {
  return [
    row.listening,
    row.reading,
    row.writing,
    row.speaking,
    row.math,
    row.writtenTestScore,
  ].some((value) => value != null)
}

function isThisMonth(value: string) {
  const date = new Date(value)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  )
}

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
  const canEditApprovedPayment = useCanEditApprovedPayment()
  const listColumns = getPredictionTestListColumns({ hidePayment })
  const testsQuery = usePredictionTestsQuery({
    counsellorId: hideCounsellorFilter
      ? undefined
      : filters.counsellorId || undefined,
    status: hidePayment ? 'all' : status,
  })

  const clearFilters = () => setFilters(EMPTY_FILTERS)
  const tests = useMemo(
    () => testsQuery.data?.data ?? [],
    [testsQuery.data?.data],
  )
  const loaded = testsQuery.isSuccess
  const effectiveStatus = hidePayment ? 'all' : status

  // Counts come from the list already on screen. While a payment filter is
  // applied, the other statuses are not loaded, so show a dash instead of 0.
  const countFor = (target: StatusFilter, count: number) =>
    loaded && (effectiveStatus === 'all' || effectiveStatus === target)
      ? count
      : '–'

  const heroStats: HeroStat[] = hidePayment
    ? [
        {
          id: 'all',
          label: 'Tests',
          value: loaded ? tests.length : '–',
          icon: ClipboardList,
          caption: 'In your review list',
        },
        {
          id: 'scored',
          label: 'Scored',
          value: loaded ? tests.filter(hasAnyScore).length : '–',
          icon: NotebookPen,
          caption: 'Have at least one score',
        },
        {
          id: 'month',
          label: 'This month',
          value: loaded
            ? tests.filter((test) => isThisMonth(test.createdAt)).length
            : '–',
          icon: CalendarPlus,
          caption: 'New tests added',
        },
      ]
    : [
        {
          id: 'all',
          label: 'Tests',
          value: countFor('all', tests.length),
          icon: ClipboardList,
          hint: 'Show all prediction tests',
          active: status === 'all',
          onSelect: () =>
            setFilters((current) => ({ ...current, status: 'all' })),
        },
        {
          id: 'pending',
          label: 'Awaiting Finance',
          value: countFor(
            'pending',
            tests.filter((test) => test.status === 'pending').length,
          ),
          icon: Hourglass,
          caption: 'Payment not yet approved',
          hint: 'Show tests awaiting payment approval',
          active: status === 'pending',
          onSelect: () =>
            setFilters((current) => ({ ...current, status: 'pending' })),
        },
        {
          id: 'approved',
          label: 'Approved',
          value: countFor(
            'approved',
            tests.filter((test) => test.status === 'approved').length,
          ),
          icon: CircleCheck,
          caption: 'Payment confirmed',
          hint: 'Show tests with approved payment',
          active: status === 'approved',
          onSelect: () =>
            setFilters((current) => ({ ...current, status: 'approved' })),
        },
      ]

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
    <AdminShell mainClassName="px-3 pb-6 sm:px-5">
      <div className="space-y-3">
        <PageHero
          eyebrow="Leads"
          title="Prediction Tests"
          description={
            isAcademicLeader
              ? 'Review prediction test scores.'
              : isTutorReviewer
                ? 'Review prediction tests, and General English Pre-Test students assigned to you.'
                : 'Placement test scores and test fees for each prospective student, from booking to Finance approval.'
          }
          theme="dawn"
          pattern="dots"
          stats={heroStats}
          spotlight={
            <Can module="predictionTests" action="add">
              <HeroSpotlight
                title="Book a prediction test"
                description="Pick the student and record the fee. Scores can wait until they finish."
                actions={
                  <HeroPillButton icon={Plus} onClick={openCreate}>
                    Add prediction test
                  </HeroPillButton>
                }
              />
            </Can>
          }
        />

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
              variant="soft"
              title={hidePayment ? 'Test Records' : 'Test & Payment Records'}
              description={
                hidePayment
                  ? 'Find a student and open their test to review scores.'
                  : 'Find a student, check their scores and payment, or select rows to update payment status together.'
              }
              totalLabel="tests"
              columns={listColumns}
              data={tests}
              searchPlaceholder="Search by student name..."
              searchVariant="pill"
              globalFilterFn={filterPredictionTest}
              initialPageSize={10}
              emptyMessage={
                (!hidePayment && status !== 'all') ||
                (!hideCounsellorFilter && filters.counsellorId)
                  ? 'No prediction tests match these filters'
                  : 'No prediction tests yet'
              }
              enableRowSelection={
                canBulkUpdateStatus &&
                (canEditApprovedPayment ||
                  ((row: Row<PredictionTestListItem>) =>
                    row.original.status !== 'approved'))
              }
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
