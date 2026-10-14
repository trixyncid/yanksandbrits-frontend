import { useNavigate } from '@tanstack/react-router'

import {
  ClearListFiltersButton,
  DataTable,
  ListFilterSelect,
  ListToolbarFilters,
} from '../../../shared/components/data-table'
import { useSessionState } from '../../../shared/hooks/use-session-state'
import { AdminShell } from '../../admin/components/admin-shell'
import type { StudentPaymentListFilters } from '../api/student-payment-query-keys'
import { StudentPaymentHero } from '../components/student-payment-hero'
import { studentPaymentListColumns } from '../components/student-payment-list-columns'
import {
  StudentPaymentListErrorState,
  StudentPaymentListLoadingState,
} from '../components/student-payment-list-states'
import { useStudentPaymentsQuery } from '../hooks/use-student-payments-query'
import { paymentSearchHaystack } from '../lib/payment-display'
import type { StudentPaymentListItem } from '../types/student-payment'

type PlanStatusFilter = NonNullable<StudentPaymentListFilters['status']>

type StudentPaymentListFilterState = {
  status: PlanStatusFilter
}

const EMPTY_FILTERS: StudentPaymentListFilterState = { status: 'all' }

const PLAN_STATUS_FILTERS: PlanStatusFilter[] = [
  'all',
  'incomplete',
  'complete',
]

function filterStudentPayment(row: StudentPaymentListItem, search: string) {
  return paymentSearchHaystack(row).includes(search)
}

export default function StudentPaymentListPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useSessionState<StudentPaymentListFilterState>(
    'list-filters:student-payments',
    { ...EMPTY_FILTERS },
  )
  const status = PLAN_STATUS_FILTERS.includes(filters.status)
    ? filters.status
    : 'all'
  const hasActiveFilters = status !== 'all'
  const paymentsQuery = useStudentPaymentsQuery({ status })

  const clearFilters = () => setFilters({ ...EMPTY_FILTERS })

  function openCreate() {
    void navigate({
      to: '/student-payments/new',
      search: {
        studentId: undefined,
        prospectiveStudentId: undefined,
      },
    })
  }

  const listFilters = (
    <ListToolbarFilters>
      <ListFilterSelect
        label="Status"
        ariaLabel="Filter by plan status"
        value={status}
        idleValue="all"
        onChange={(next) => setFilters({ status: next as PlanStatusFilter })}
        options={[
          { value: 'all', label: 'All plans' },
          { value: 'incomplete', label: 'Still collecting' },
          { value: 'complete', label: 'Fully paid' },
        ]}
      />
      <ClearListFiltersButton
        visible={hasActiveFilters}
        onClear={clearFilters}
        className="h-10 rounded-full border-transparent bg-ink text-white hover:bg-ink-soft hover:text-white"
      />
    </ListToolbarFilters>
  )

  return (
    <AdminShell mainClassName="px-3 pb-6 sm:px-5">
      <div className="space-y-3">
        <StudentPaymentHero
          rows={paymentsQuery.data?.data ?? []}
          loaded={paymentsQuery.isSuccess}
          status={status}
          onStatusChange={(next) => setFilters({ status: next })}
          onAdd={openCreate}
        />

        {paymentsQuery.isLoading ? <StudentPaymentListLoadingState /> : null}

        {paymentsQuery.isError ? (
          <div className="space-y-2">
            {listFilters}
            <StudentPaymentListErrorState
              onRetry={() => void paymentsQuery.refetch()}
            />
          </div>
        ) : null}

        {paymentsQuery.isSuccess ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              variant="soft"
              title="Payment plans"
              description="Each plan shows the amount due, what has been paid, and its installments."
              totalLabel="payment plans"
              columns={studentPaymentListColumns}
              data={paymentsQuery.data.data}
              searchPlaceholder="Search by student name or PIN..."
              searchVariant="pill"
              globalFilterFn={filterStudentPayment}
              initialPageSize={10}
              emptyMessage={
                hasActiveFilters
                  ? 'No payment plans match this filter'
                  : 'No payment plans yet'
              }
              toolbarFilters={listFilters}
            />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
