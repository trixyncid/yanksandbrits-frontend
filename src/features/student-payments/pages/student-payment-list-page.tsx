import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import {
  ClearListFiltersButton,
  DataTable,
  ListFilterSelect,
  ListToolbarFilters,
} from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { useSessionState } from '../../../shared/hooks/use-session-state'
import { AdminShell } from '../../admin/components/admin-shell'
import { Can } from '../../auth/components/can'
import type { StudentPaymentListFilters } from '../api/student-payment-query-keys'
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
          { value: 'incomplete', label: 'Incomplete' },
          { value: 'complete', label: 'Complete' },
        ]}
      />
      <ClearListFiltersButton
        visible={hasActiveFilters}
        onClear={clearFilters}
        className="h-10 rounded-full border-slate-200 bg-white hover:bg-slate-50"
      />
    </ListToolbarFilters>
  )

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
              Payments
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Track tuition plans, installments, and what is still owed.
            </p>
          </div>
          <Can module="studentPayments" action="add">
            <Button
              onClick={openCreate}
              className="rounded-full bg-slate-900 px-4 text-white hover:bg-slate-800"
            >
              <Plus className="size-4" />
              Add Payment
            </Button>
          </Can>
        </div>

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
              title="Plans"
              description="Search and manage tuition payment plans."
              totalLabel="payment plans"
              columns={studentPaymentListColumns}
              data={paymentsQuery.data.data}
              searchPlaceholder="Search by student name, PIN..."
              searchVariant="pill"
              globalFilterFn={filterStudentPayment}
              initialPageSize={10}
              emptyMessage="No payment plans found"
              toolbarFilters={listFilters}
            />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
