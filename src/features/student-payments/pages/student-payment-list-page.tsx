import { useNavigate } from '@tanstack/react-router'
import { Plus, RefreshCw } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { studentPaymentListColumns } from '../components/student-payment-list-columns'
import {
  StudentPaymentListErrorState,
  StudentPaymentListLoadingState,
} from '../components/student-payment-list-states'
import { useStudentPaymentsQuery } from '../hooks/use-student-payments-query'
import type { StudentPaymentListItem } from '../types/student-payment'

function filterStudentPayment(row: StudentPaymentListItem, search: string) {
  const haystack = [
    row.studentPin,
    row.studentName,
    row.title,
    row.description,
    row.createdBy,
    row.branch,
    row.status,
    String(row.amount),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function StudentPaymentListPage() {
  const navigate = useNavigate()
  const paymentsQuery = useStudentPaymentsQuery()

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
        {paymentsQuery.isLoading ? <StudentPaymentListLoadingState /> : null}

        {paymentsQuery.isError ? (
          <StudentPaymentListErrorState
            onRetry={() => void paymentsQuery.refetch()}
          />
        ) : null}

        {paymentsQuery.isSuccess ? (
          <DataTable
            title="Student Payment List"
            description="Track student payment transactions."
            totalLabel="payments"
            columns={studentPaymentListColumns}
            data={paymentsQuery.data.data}
            searchPlaceholder="Search by student, title, status, branch..."
            globalFilterFn={filterStudentPayment}
            initialPageSize={10}
            emptyMessage="No payment transactions found"
            toolbarActions={
              <>
                <Button
                  variant="secondary"
                  disabled={paymentsQuery.isFetching}
                  onClick={() => {
                    void paymentsQuery.refetch().then(() => {
                      notify('success', {
                        title: 'Student payments refreshed',
                        description: 'Latest payment data has been loaded.',
                      })
                    })
                  }}
                >
                  <RefreshCw
                    className={`size-4 ${paymentsQuery.isFetching ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
                <Button
                  onClick={() =>
                    void navigate({ to: '/student-payments/new' })
                  }
                >
                  <Plus className="size-4" />
                  Record New Transaction
                </Button>
              </>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
