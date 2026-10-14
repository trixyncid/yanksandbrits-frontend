import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CreditCard,
  FileImage,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Wallet,
} from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { DataTableBadge } from '../../../shared/components/data-table'
import { EmptyState } from '../../../shared/components/page'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { formatCurrencyAmount } from '../../../shared/lib/currency'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { deleteStudentPayment } from '../../student-payments/api/student-payments-api'
import { studentPaymentQueryKeys } from '../../student-payments/api/student-payment-query-keys'
import { PaymentProgress } from '../../student-payments/components/student-payment-terms-fields'
import { useStudentPaymentsQuery } from '../../student-payments/hooks/use-student-payments-query'
import {
  firstProofUrl,
  planAmountDue,
  planStatusLabel,
  planStatusTone,
  proofCount,
  termStatusLabel,
  termStatusTone,
} from '../../student-payments/lib/payment-display'
import type { StudentPaymentListItem } from '../../student-payments/types/student-payment'
import type { StudentDetail } from '../types/student'

function formatDate(value: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
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

type StudentPaymentsTabProps = {
  student: StudentDetail
}

export function StudentPaymentsTab({ student }: StudentPaymentsTabProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const paymentsQuery = useStudentPaymentsQuery({ studentId: student.id })
  const payments = paymentsQuery.data?.data ?? []

  function openCreate() {
    void navigate({
      to: '/student-payments/new',
      search: { studentId: student.id },
    })
  }

  function openEdit(payment: StudentPaymentListItem) {
    void navigate({
      to: '/student-payments/$paymentId/edit',
      params: { paymentId: payment.id },
    })
  }

  function handleDelete(payment: StudentPaymentListItem) {
    requestDeleteConfirm({
      title: `Delete ${payment.title ? `“${payment.title}”` : 'this payment plan'}?`,
      description: `This will permanently remove ${payment.title ? `“${payment.title}”` : 'this payment plan'} and all its installments for ${student.fullName}. This cannot be undone.`,
      confirmLabel: 'Delete payment plan',
      onConfirm: () => {
        void (async () => {
          try {
            await deleteStudentPayment(payment.id)
            await queryClient.invalidateQueries({
              queryKey: studentPaymentQueryKeys.all,
            })
            notify('success', {
              title: 'Payment plan deleted',
              description: `${payment.title || 'The payment plan'} has been removed from ${student.fullName}.`,
            })
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

  const totals = payments.reduce(
    (sum, payment) => {
      const due = planAmountDue(
        payment.fullAmount,
        payment.discountAmount,
        payment.linkedPredictionTestAmount,
      )
      return { due: sum.due + due, paid: sum.paid + payment.paidAmount }
    },
    { due: 0, paid: 0 },
  )
  const outstanding = Math.max(0, totals.due - totals.paid)

  return (
    <div className="space-y-3">
      <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-ink px-5 py-5 text-white sm:px-6">
        <div
          aria-hidden
          className="absolute -top-16 -right-10 -z-10 size-56 rounded-full bg-brand-500/40 blur-3xl"
        />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15">
              <Wallet className="size-[1.1rem]" strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-bold tracking-tight">Payments</h3>
              <p className="mt-0.5 text-xs text-white/70">
                Plans and installments recorded for this student.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-ink shadow-sm transition hover:bg-brand-500 hover:text-white"
          >
            <Plus className="size-4" />
            Add payment plan
          </button>
        </div>
        {paymentsQuery.isSuccess && payments.length > 0 ? (
          <dl className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <dt className="text-xs text-white/70">Paid so far</dt>
              <dd className="mt-0.5 text-xl font-bold tabular-nums">
                {formatCurrencyAmount(totals.paid)}
              </dd>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <dt className="text-xs text-white/70">Total due</dt>
              <dd className="mt-0.5 text-xl font-bold tabular-nums">
                {formatCurrencyAmount(totals.due)}
              </dd>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <dt className="text-xs text-white/70">Still to pay</dt>
              <dd className="mt-0.5 text-xl font-bold tabular-nums">
                {formatCurrencyAmount(outstanding)}
              </dd>
            </div>
          </dl>
        ) : null}
      </section>

      {paymentsQuery.isLoading ? (
        <div className="space-y-2 rounded-[1.75rem] bg-white p-5" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-3xl bg-canvas"
              style={{ animationDelay: `${index * 40}ms` }}
            />
          ))}
          <p className="sr-only">Loading payment history…</p>
        </div>
      ) : paymentsQuery.isError ? (
        <div className="flex flex-col items-center rounded-[1.75rem] bg-white px-6 py-12 text-center">
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertCircle className="size-6" />
          </span>
          <p className="mt-3 text-base font-bold text-ink">
            Unable to load payment history
          </p>
          <Button
            className="mt-4"
            variant="ink"
            onClick={() => void paymentsQuery.refetch()}
          >
            <RefreshCw className="size-4" />
            Try again
          </Button>
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments yet"
          description="Record a payment plan with an approved installment to activate this student and unlock scheduling."
          action={
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              Add payment plan
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => {
            const count = proofCount(payment.terms)
            const proofUrl = firstProofUrl(payment.terms)

            const due = planAmountDue(
              payment.fullAmount,
              payment.discountAmount,
              payment.linkedPredictionTestAmount,
            )
            const covered = payment.fullAmount > 0 && due === 0
            const left = due - payment.paidAmount

            return (
              <article
                key={payment.id}
                className="overflow-hidden rounded-[1.75rem] bg-white"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 px-5 pt-5 pb-4 sm:px-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold tracking-tight text-ink">
                        {payment.title || 'Payment'}
                      </h4>
                      <DataTableBadge tone={planStatusTone(payment.status)}>
                        {planStatusLabel(payment.status)}
                      </DataTableBadge>
                      {payment.installmentPlan === 'two' ? (
                        <DataTableBadge
                          tone={
                            payment.installmentPlanApproved
                              ? 'success'
                              : 'warning'
                          }
                        >
                          {payment.installmentPlanApproved
                            ? 'Plan approved'
                            : 'Awaiting approval'}
                        </DataTableBadge>
                      ) : null}
                    </div>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-ink tabular-nums">
                      {formatCurrencyAmount(payment.paidAmount)}
                      <span className="text-sm font-medium text-slate-400">
                        {' '}
                        / {formatCurrencyAmount(due)}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {left > 0
                        ? `${formatCurrencyAmount(left)} remaining`
                        : left < 0
                          ? `${formatCurrencyAmount(Math.abs(left))} over the amount due`
                          : 'Nothing remaining'}
                    </p>
                    <div className="mt-2 max-w-xs">
                      <PaymentProgress
                        paidAmount={covered ? 1 : payment.paidAmount}
                        fullAmount={covered ? 1 : due}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      {formatDateTime(payment.createdAt)} · {payment.createdBy}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {count > 0 && proofUrl ? (
                      <a
                        href={proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-canvas px-3 text-xs font-semibold text-ink transition hover:bg-brand-500 hover:text-white"
                      >
                        <FileImage className="size-3.5" />
                        {count === 1 ? 'Proof' : `${count} files`}
                      </a>
                    ) : null}
                    <button
                      type="button"
                      aria-label={`Edit ${payment.title || 'payment'}`}
                      title="Edit payment plan"
                      onClick={() => openEdit(payment)}
                      className={cn(
                        'inline-flex size-9 items-center justify-center rounded-full bg-canvas text-ink transition',
                        'hover:bg-ink hover:text-white',
                      )}
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${payment.title || 'payment'}`}
                      title="Delete payment plan"
                      onClick={() => handleDelete(payment)}
                      className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-rose-500 transition hover:bg-rose-500 hover:text-white"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto px-3 pb-3">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-canvas text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase [&_th:first-child]:rounded-l-full [&_th:last-child]:rounded-r-full">
                      <tr>
                        <th className="px-5 py-2.5">Installment</th>
                        <th className="px-4 py-2.5">Amount</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payment.terms.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-5 py-4 text-sm text-slate-500"
                          >
                            No installments on this plan.
                          </td>
                        </tr>
                      ) : (
                        payment.terms.map((term, index) => (
                          <tr key={term.id} className="border-t border-slate-100">
                            <td className="px-5 py-3">
                              <p className="font-semibold text-ink">
                                #{index + 1}
                              </p>
                              <p className="mt-0.5 max-w-xs text-xs text-slate-500">
                                {term.description || '—'}
                              </p>
                            </td>
                            <td className="px-4 py-3 font-semibold tabular-nums text-ink">
                              {formatCurrencyAmount(term.amount)}
                            </td>
                            <td className="px-4 py-3">
                              <DataTableBadge tone={termStatusTone(term.status)}>
                                {termStatusLabel(term.status)}
                              </DataTableBadge>
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {formatDate(term.paymentDate)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
