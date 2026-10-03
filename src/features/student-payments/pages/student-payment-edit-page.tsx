import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { useState } from 'react'

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
import {
  StudentPaymentDetailAside,
  StudentPaymentDetailHero,
} from '../components/student-payment-detail-hero'
import { StudentPaymentForm } from '../components/student-payment-form'
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
        <StudentPaymentDetailLoadingState />
      </AdminShell>
    )
  }

  if (paymentQuery.isError || !paymentQuery.data) {
    return (
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#E8EEFF] text-[#253CA1]">
            <CreditCard className="size-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            Payment not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This payment plan may have been removed, or the link is no longer
            valid.
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
  payment: initialPayment,
  initialValues,
}: {
  payment: StudentPaymentListItem
  initialValues: StudentPaymentFormValues
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [payment, setPayment] = useState(initialPayment)
  const form = useStudentPaymentForm({
    mode: 'edit',
    paymentId: payment.id,
    initialValues,
  })

  function handleDelete() {
    requestDeleteConfirm({
      title: 'Delete payment plan?',
      description: `This will permanently remove ${payment.title} and its installments. This action cannot be undone.`,
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
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1">
          <Link
            to="/student-payments"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#253CA1]"
          >
            <ArrowLeft className="size-4" />
            Payments
          </Link>
        </div>

        <StudentPaymentDetailHero payment={payment} values={form.values} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className="animate-in fade-in slide-in-from-bottom-2 delay-75 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
            <StudentPaymentForm
              mode="edit"
              values={form.values}
              errors={form.errors}
              isSubmitting={form.isSubmitting}
              payment={payment}
              onChange={form.updateField}
              onTermChange={form.updateTerm}
              onPersistTerm={form.persistTerm}
              onPersistNewTerm={form.persistNewTerm}
              onAddTerm={form.addTerm}
              onRemoveTerm={form.removeTerm}
              onProofUploaded={setPayment}
              onSubmit={form.submit}
              onCancel={form.cancel}
              onDelete={handleDelete}
            />
          </section>

          <StudentPaymentDetailAside payment={payment} values={form.values} />
        </div>
      </div>
    </AdminShell>
  )
}

function StudentPaymentDetailLoadingState() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
      <div className="h-64 animate-pulse rounded-[1.75rem] bg-white shadow-sm" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="h-[32rem] animate-pulse rounded-[1.75rem] bg-white shadow-sm" />
        <div className="h-96 animate-pulse rounded-[1.75rem] bg-white shadow-sm" />
      </div>
    </div>
  )
}
