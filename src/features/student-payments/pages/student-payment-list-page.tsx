import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import {
  ClearListFiltersButton,
  DataTable,
  ListToolbarFilters,
} from '../../../shared/components/data-table'
import { FeaturePageAtmosphere } from '../../../shared/components/feature-page'
import { Button } from '../../../shared/components/ui/button'
import { Select } from '../../../shared/components/ui/select'
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

  const listFilters = (
    <ListToolbarFilters>
      <Select
        value={status}
        onChange={(event) =>
          setFilters({ status: event.target.value as PlanStatusFilter })
        }
        containerClassName="w-full sm:w-[160px]"
        className="h-9 border-white/80 bg-white/80 py-1.5 shadow-sm backdrop-blur-md"
        aria-label="Filter by plan status"
      >
        <option value="all">All plans</option>
        <option value="incomplete">Incomplete</option>
        <option value="complete">Complete</option>
      </Select>
      <ClearListFiltersButton visible={hasActiveFilters} onClear={clearFilters} />
    </ListToolbarFilters>
  )

  return (
    <AdminShell>
      <FeaturePageAtmosphere>
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-2">
          {paymentsQuery.isLoading ? <StudentPaymentListLoadingState /> : null}

          {paymentsQuery.isError ? (
            <div className="space-y-2">
              <div className="flex justify-end">{listFilters}</div>
              <StudentPaymentListErrorState
                onRetry={() => void paymentsQuery.refetch()}
              />
            </div>
          ) : null}

          {paymentsQuery.isSuccess ? (
            <DataTable
              variant="glass"
              title="Payment List"
              description="Track tuition payment plans and installments."
              totalLabel="payment plans"
              columns={studentPaymentListColumns}
              data={paymentsQuery.data.data}
              searchPlaceholder="Search by student name, PIN..."
              globalFilterFn={filterStudentPayment}
              initialPageSize={10}
              emptyMessage="No payment plans found"
              toolbarFilters={listFilters}
              toolbarActions={
                <Can module="studentPayments" action="add">
                  <Button
                    size="sm"
                    onClick={() =>
                      void navigate({
                        to: '/student-payments/new',
                        search: {
                          studentId: undefined,
                          prospectiveStudentId: undefined,
                        },
                      })
                    }
                  >
                    <Plus className="size-4" />
                    Add Payment Plan
                  </Button>
                </Can>
              }
            />
          ) : null}
        </div>
      </FeaturePageAtmosphere>
    </AdminShell>
  )
}
