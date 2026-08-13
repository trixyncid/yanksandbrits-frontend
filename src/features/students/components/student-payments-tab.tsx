import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { CreditCard, FileImage, Pencil, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { DataTableBadge } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { deleteStudentPayment } from '../../student-payments/api/student-payments-api'
import { studentPaymentQueryKeys } from '../../student-payments/api/student-payment-query-keys'
import { useStudentPaymentsQuery } from '../../student-payments/hooks/use-student-payments-query'
import type {
  StudentPaymentListItem,
  StudentPaymentStatus,
} from '../../student-payments/types/student-payment'
import type { StudentDetail } from '../types/student'

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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function statusTone(status: StudentPaymentStatus) {
  if (status === 'approved') return 'success' as const
  if (status === 'pending') return 'info' as const
  return 'danger' as const
}

function statusLabel(status: StudentPaymentStatus) {
  if (status === 'approved') return 'Approved'
  if (status === 'pending') return 'Pending'
  return 'Void'
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
      title: 'Delete payment?',
      description: `This will permanently remove "${payment.title || 'this payment'}" for ${student.fullName}. This action cannot be undone.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteStudentPayment(payment.id)
            await queryClient.invalidateQueries({
              queryKey: studentPaymentQueryKeys.all,
            })
            notify('success', {
              title: 'Payment deleted',
              description: 'The payment record has been removed.',
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Payment History</h3>
          <p className="mt-1 text-sm text-slate-500">
            Payment transactions recorded for this student.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={openCreate}>
          <CreditCard className="size-3.5" />
          Add Payment
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
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#EDF4FF] text-[#4274B9]">
            <CreditCard className="size-5" />
          </div>
          <h4 className="mt-4 text-base font-bold text-slate-900">
            No payments yet
          </h4>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Record a tuition or installment payment to start this student&apos;s
            payment history.
          </p>
          <Button className="mt-5" size="sm" onClick={openCreate}>
            <CreditCard className="size-3.5" />
            Add Payment
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created by</th>
                <th className="px-4 py-3">Proof</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t border-slate-100">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">
                      {payment.title || 'Payment'}
                    </p>
                    <p className="mt-0.5 max-w-xs text-xs text-slate-500">
                      {payment.description || '—'}
                    </p>
                  </td>
                  <td className="px-4 py-4 font-semibold tabular-nums text-slate-800">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {formatDateTime(payment.transactionDate)}
                  </td>
                  <td className="px-4 py-4">
                    <DataTableBadge tone={statusTone(payment.status)}>
                      {statusLabel(payment.status)}
                    </DataTableBadge>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {payment.createdBy || '—'}
                  </td>
                  <td className="px-4 py-4">
                    {payment.hasPaymentProof && payment.paymentProofUrl ? (
                      <a
                        href={payment.paymentProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F5A94] transition hover:text-[#4274B9]"
                      >
                        <FileImage className="size-3.5" />
                        View
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        aria-label={`Edit ${payment.title || 'payment'}`}
                        onClick={() => openEdit(payment)}
                        className={cn(
                          'inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition',
                          'hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]',
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
