import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Lock, Pencil, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { Can } from '../../auth/components/can'
import { useCanEditApprovedPayment } from '../../auth/hooks/use-permissions'
import { deleteStudentPayment } from '../api/student-payments-api'
import { studentPaymentQueryKeys } from '../api/student-payment-query-keys'
import type { StudentPaymentListItem } from '../types/student-payment'

export function StudentPaymentActionsCell({
  payment,
}: {
  payment: StudentPaymentListItem
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const canEditApprovedPayment = useCanEditApprovedPayment()
  const deleteLocked =
    !canEditApprovedPayment &&
    payment.terms.some((term) => term.status === 'approved')

  return (
    <div className="flex items-center justify-center gap-2">
      <Can module="studentPayments" action="change">
        <button
          type="button"
          aria-label={`Edit payment plan for ${payment.studentName}`}
          title="Edit payment plan"
          onClick={() =>
            void navigate({
              to: '/student-payments/$paymentId/edit',
              params: { paymentId: payment.id },
            })
          }
          className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white"
        >
          <Pencil className="size-3.5" />
        </button>
      </Can>
      {deleteLocked ? (
        <Can module="studentPayments" action="delete">
        <span
          className="inline-flex size-9 cursor-not-allowed items-center justify-center rounded-full bg-canvas text-slate-300"
          title="An installment on this plan is approved, so it can't be deleted. Contact Finance if something needs fixing."
          aria-label="Delete locked: an installment on this plan is approved"
        >
          <Lock className="size-3.5" />
        </span>
        </Can>
      ) : (
      <Can module="studentPayments" action="delete">
        <button
        type="button"
        aria-label={`Delete payment plan for ${payment.studentName}`}
        title="Delete payment plan"
        onClick={() =>
          requestDeleteConfirm({
            title: 'Delete payment plan?',
            description: `This will permanently remove "${payment.title}" for ${payment.studentName}, with all of its installments and proofs. This cannot be undone.`,
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
        className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-rose-500 transition hover:bg-rose-500 hover:text-white"
      >
        <Trash2 className="size-3.5" />
        </button>
      </Can>
      )}
    </div>
  )
}
