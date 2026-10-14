import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Hourglass,
  UserRound,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import {
  EmptyState,
  ListLoadingState,
  PageHeader,
} from '../../../shared/components/page'
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
import { planStatusCopy } from '../lib/payment-ui'
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
        <div className="mx-auto max-w-6xl space-y-3">
          <div className="h-24 animate-pulse rounded-[1.75rem] bg-ink/80" />
          <ListLoadingState rows={5} />
        </div>
      </AdminShell>
    )
  }

  if (paymentQuery.isError || !paymentQuery.data) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-2xl py-10">
          <EmptyState
            icon={CreditCard}
            title="Payment plan not found"
            description="This payment plan may have been removed, or the link is no longer valid."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="soft"
                  onClick={() => void navigate({ to: '/student-payments' })}
                >
                  <ArrowLeft className="size-4" />
                  Back to payments
                </Button>
                {paymentQuery.isError ? (
                  <Button
                    variant="ink"
                    onClick={() => void paymentQuery.refetch()}
                  >
                    Try again
                  </Button>
                ) : null}
              </div>
            }
          />
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

  const branchLabel =
    payment.branch && payment.branch !== '—' ? payment.branch : null
  const createdLine = `Created ${formatDateTime(payment.createdAt)}${
    payment.createdBy && payment.createdBy !== '—'
      ? ` by ${payment.createdBy}`
      : ''
  }`

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/student-payments"
          backLabel="Student payments"
          title={payment.studentName}
          description={
            <>
              {[title, branchLabel].filter(Boolean).join(' · ')}
              <span className="block text-xs opacity-75">{createdLine}</span>
            </>
          }
          icon={Wallet}
          theme="dusk"
          pattern="grid"
          badge={
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white">
              <span
                aria-hidden
                className={
                  payment.status === 'complete'
                    ? 'size-1.5 rounded-full bg-emerald-300'
                    : 'size-1.5 rounded-full bg-amber-300'
                }
              />
              {planStatusCopy(payment.status)}
            </span>
          }
          actions={
            <>
              {payment.studentPin ? (
                <span className="rounded-full bg-white/15 px-3 py-1.5 font-mono text-xs font-semibold text-white">
                  {payment.studentPin}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
                {plan === 'two' ? (
                  payment.installmentPlanApproved ? (
                    <>
                      <CheckCircle2 className="size-3.5 text-emerald-300" />
                      2-payment plan approved
                    </>
                  ) : (
                    <>
                      <Hourglass className="size-3.5 text-amber-300" />
                      2-payment plan awaiting approval
                    </>
                  )
                ) : (
                  'Pay in full'
                )}
              </span>
              <PersonLink payment={payment} label={personLabel} />
            </>
          }
        />

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
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3.5 text-xs font-semibold text-ink transition hover:bg-ink hover:text-white"
      >
        <UserRound className="size-3.5" />
        View student
      </Link>
    )
  }

  if (payment.prospectiveStudentId) {
    return (
      <Link
        to="/prospective-students/$prospectiveStudentId/edit"
        params={{ prospectiveStudentId: payment.prospectiveStudentId }}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3.5 text-xs font-semibold text-ink transition hover:bg-ink hover:text-white"
      >
        <UserRound className="size-3.5" />
        View lead
      </Link>
    )
  }

  return (
    <span className="text-xs font-semibold text-white/80">{label}</span>
  )
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
