import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { CreditCard, FileImage, Pencil, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { DataTableBadge } from '../../../shared/components/data-table'
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
      title: 'Delete payment plan?',
      description: `This will permanently remove "${payment.title || 'this payment'}" and its installments for ${student.fullName}. This action cannot be undone.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteStudentPayment(payment.id)
            await queryClient.invalidateQueries({
              queryKey: studentPaymentQueryKeys.all,
            })
            notify('success', {
              title: 'Payment deleted',
              description: 'The payment plan has been removed.',
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

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <p className="text-sm text-slate-500">
          Plans and installments recorded for this student.
        </p>
        <Button variant="secondary" size="sm" onClick={openCreate}>
          <CreditCard className="size-3.5" />
          Add Payment Plan
        </Button>
      </div>

      {paymentsQuery.isLoading ? (
        <div className="px-6 py-12 text-center text-sm text-slate-500">
          Loading payment history…
        </div>
      ) : paymentsQuery.isError ? (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <p className="text-sm text-rose-600">Unable to load payment history.</p>
          <Button
            className="mt-4"
            variant="secondary"
            size="sm"
            onClick={() => void paymentsQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#E8EEFF] text-[#253CA1]">
            <CreditCard className="size-5" />
          </div>
          <h4 className="mt-4 text-base font-bold text-slate-900">
            No payments yet
          </h4>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Record a payment plan with an approved installment to activate this
            student and unlock scheduling.
          </p>
          <Button className="mt-5" size="sm" onClick={openCreate}>
            <CreditCard className="size-3.5" />
            Add Payment Plan
          </Button>
        </div>
      ) : (
        <div className="space-y-4 px-6 py-5">
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
                className="overflow-hidden rounded-2xl border border-slate-200"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 bg-slate-50/80 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
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
                    <p className="mt-2 text-sm font-semibold text-slate-800 tabular-nums">
                      {formatCurrencyAmount(payment.paidAmount)}
                      <span className="font-medium text-slate-400">
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
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B2A5A] transition hover:text-[#253CA1]"
                      >
                        <FileImage className="size-3.5" />
                        {count === 1 ? 'Proof' : `${count} files`}
                      </a>
                    ) : null}
                    <button
                      type="button"
                      aria-label={`Edit ${payment.title || 'payment'}`}
                      onClick={() => openEdit(payment)}
                      className={cn(
                        'inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition',
                        'hover:border-[#C8D4F5] hover:bg-[#F5F8FF] hover:text-[#1B2A5A]',
                      )}
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${payment.title || 'payment'}`}
                      onClick={() => handleDelete(payment)}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-500 transition hover:border-rose-200 hover:bg-rose-50"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
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
                              <p className="font-medium text-slate-800">
                                #{index + 1}
                              </p>
                              <p className="mt-0.5 max-w-xs text-xs text-slate-500">
                                {term.description || '—'}
                              </p>
                            </td>
                            <td className="px-4 py-3 font-semibold tabular-nums text-slate-800">
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
    </>
  )
}
