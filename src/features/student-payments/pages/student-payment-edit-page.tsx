import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { DataTableBadge } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import {
  approveStudentPaymentInstallmentPlan,
  deleteStudentPayment,
  studentPaymentToFormValues,
} from '../api/student-payments-api'
import { studentPaymentQueryKeys } from '../api/student-payment-query-keys'
import { StudentPaymentForm } from '../components/student-payment-form'
import { useStudentPaymentForm } from '../hooks/use-student-payment-form'
import { useStudentPaymentQuery } from '../hooks/use-student-payment-query'
import { planStatusLabel, planStatusTone } from '../lib/payment-display'
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
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="mx-auto h-10 w-10 animate-pulse rounded-2xl bg-[#E8EEFF]" />
          <p className="mt-4 text-sm text-slate-500">Loading payment...</p>
        </div>
      </AdminShell>
    )
  }

  if (paymentQuery.isError || !paymentQuery.data) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
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
          <Button
            className="mt-6"
            variant="secondary"
            size="sm"
            onClick={() => void navigate({ to: '/student-payments' })}
          >
            <ArrowLeft className="size-3.5" />
            Back to payments
          </Button>
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
  const [isApprovingPlan, setIsApprovingPlan] = useState(false)
  const form = useStudentPaymentForm({
    mode: 'edit',
    paymentId: payment.id,
    initialValues,
    installmentPlanApproved: payment.installmentPlanApproved,
  })
  const plan =
    form.values.installmentPlan === 'two' ||
    form.values.installmentPlan === 'full'
      ? form.values.installmentPlan
      : payment.installmentPlan
  const title = form.values.title.trim() || payment.title || 'Payment plan'
  const personLabel = payment.studentPin
    ? `${payment.studentPin} · ${payment.studentName}`
    : payment.studentName

  async function handleApproveInstallmentPlan() {
    setIsApprovingPlan(true)
    try {
      const updated = await approveStudentPaymentInstallmentPlan(payment.id)
      setPayment(updated)
      await queryClient.invalidateQueries({
        queryKey: studentPaymentQueryKeys.all,
      })
      notify('success', {
        title: '2-payment plan approved',
        description: 'Installments on this plan can now be approved.',
      })
    } catch (error) {
      notify('error', {
        title: 'Unable to approve installment plan',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsApprovingPlan(false)
    }
  }

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
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-4xl space-y-4">
        <section className="animate-in fade-in slide-in-from-bottom-1 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:rounded-3xl">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
            <div className="flex min-w-0 items-start gap-3">
              <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(160deg,#253CA1_0%,#1B2A5A_100%)] text-sm font-bold tracking-wide text-white shadow-md shadow-[#253CA1]/25">
                {getInitials(payment.studentName)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    {payment.studentName}
                  </h2>
                  {payment.studentPin ? (
                    <span className="rounded-full bg-[#E8EEFF] px-2 py-0.5 text-[11px] font-semibold text-[#253CA1]">
                      {payment.studentPin}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {[
                    title,
                    payment.branch && payment.branch !== '—'
                      ? payment.branch
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <DataTableBadge tone={planStatusTone(payment.status)}>
                    {planStatusLabel(payment.status)}
                  </DataTableBadge>
                  {plan === 'two' ? (
                    <DataTableBadge
                      tone={
                        payment.installmentPlanApproved ? 'success' : 'warning'
                      }
                    >
                      {payment.installmentPlanApproved
                        ? '2-payment plan approved'
                        : '2-payment plan awaiting approval'}
                    </DataTableBadge>
                  ) : (
                    <DataTableBadge tone="neutral">Pay in full</DataTableBadge>
                  )}
                  <PersonLink payment={payment} label={personLabel} />
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Created {formatDateTime(payment.createdAt)}
                  {payment.createdBy && payment.createdBy !== '—'
                    ? ` by ${payment.createdBy}`
                    : ''}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0"
              onClick={form.cancel}
            >
              Go Back
            </Button>
          </div>
        </section>

        <StudentPaymentForm
          mode="edit"
          values={form.values}
          errors={form.errors}
          isSubmitting={form.isSubmitting}
          payment={payment}
          onChange={form.updateField}
          onTermChange={form.updateTerm}
          onAddTerm={form.addTerm}
          onReplaceTerms={form.replaceTerms}
          onRemoveTerm={form.removeTerm}
          onProofUploaded={setPayment}
          onSubmit={form.submit}
          onCancel={form.cancel}
          onDelete={handleDelete}
          onPretestCredit={form.setPretestCredit}
          onApproveInstallmentPlan={() => {
            void handleApproveInstallmentPlan()
          }}
          isApprovingInstallmentPlan={isApprovingPlan}
        />
      </div>
    </AdminShell>
  )
}

function PersonLink({
  payment,
  label,
}: {
  payment: StudentPaymentListItem
  label: string
}) {
  if (payment.studentId) {
    return (
      <Link
        to="/students/$studentId"
        params={{ studentId: payment.studentId }}
        className="text-xs font-semibold text-[#253CA1] hover:underline"
      >
        View student
      </Link>
    )
  }

  if (payment.prospectiveStudentId) {
    return (
      <Link
        to="/prospective-students/$prospectiveStudentId/edit"
        params={{ prospectiveStudentId: payment.prospectiveStudentId }}
        className="text-xs font-semibold text-[#253CA1] hover:underline"
      >
        View lead
      </Link>
    )
  }

  return <span className="text-xs font-semibold text-slate-500">{label}</span>
}

function formatDateTime(value: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}
