import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import {
  deleteStudentPayment,
  studentPaymentToFormValues,
} from '../api/student-payments-api'
import { studentPaymentQueryKeys } from '../api/student-payment-query-keys'
import { StudentPaymentForm } from '../components/student-payment-form'
import {
  StudentPaymentListErrorState,
  StudentPaymentListLoadingState,
} from '../components/student-payment-list-states'
import { useStudentPaymentForm } from '../hooks/use-student-payment-form'
import { useStudentPaymentQuery } from '../hooks/use-student-payment-query'
import type {
  StudentPaymentFormValues,
  StudentPaymentListItem,
} from '../types/student-payment'

export default function StudentPaymentEditPage() {
  const navigate = useNavigate()
  const { paymentId } = useParams({ strict: false }) as { paymentId: string }
  const paymentQuery = useStudentPaymentQuery(paymentId)

  if (paymentQuery.isLoading) {
    return (
      <AdminShell>
        <StudentPaymentListLoadingState />
      </AdminShell>
    )
  }

  if (paymentQuery.isError || !paymentQuery.data) {
    return (
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Payment not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This payment may have been removed or the link is invalid.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void navigate({ to: '/student-payments' })}
            >
              <ArrowLeft className="size-3.5" />
              Back to payments
            </Button>
            {paymentQuery.isError ? (
              <Button size="sm" onClick={() => void paymentQuery.refetch()}>
                Retry
              </Button>
            ) : null}
          </div>
          {paymentQuery.isError ? (
            <div className="mt-8 w-full">
              <StudentPaymentListErrorState
                onRetry={() => void paymentQuery.refetch()}
              />
            </div>
          ) : null}
        </div>
      </AdminShell>
    )
  }

  return (
    <StudentPaymentEditForm
      payment={paymentQuery.data}
      initialValues={studentPaymentToFormValues(paymentQuery.data)}
    />
  )
}

function StudentPaymentEditForm({
  payment,
  initialValues,
}: {
  payment: StudentPaymentListItem
  initialValues: StudentPaymentFormValues
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const form = useStudentPaymentForm({
    mode: 'edit',
    paymentId: payment.id,
    initialValues,
  })

  function handleDelete() {
    requestDeleteConfirm({
      title: 'Delete payment?',
      description: `This will permanently remove ${payment.title}. This action cannot be undone.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteStudentPayment(payment.id)
            await queryClient.invalidateQueries({
              queryKey: studentPaymentQueryKeys.all,
            })
            notify('success', {
              title: 'Payment deleted',
              description: `${payment.title} has been removed.`,
            })
            void navigate({ to: '/student-payments' })
          } catch (error) {
            notify('error', {
              title: 'Unable to delete payment',
              description: getApiErrorMessage(error),
            })
          }
        })()
      },
    })
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/student-payments"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
            >
              <ArrowLeft className="size-4" />
              Student Payments
            </Link>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Update Payment
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Edit transaction details for {payment.title}.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <StudentPaymentForm
            mode="edit"
            values={form.values}
            errors={form.errors}
            isSubmitting={form.isSubmitting}
            meta={{
              createdBy: payment.createdBy,
              branch: payment.branch,
              transactionDate: payment.transactionDate,
            }}
            onChange={form.updateField}
            onSubmit={form.submit}
            onCancel={form.cancel}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </AdminShell>
  )
}
