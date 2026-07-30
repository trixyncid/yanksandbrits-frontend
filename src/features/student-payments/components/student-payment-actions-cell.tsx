import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
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

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label={`Edit payment ${payment.title}`}
        onClick={() =>
          void navigate({
            to: '/student-payments/$paymentId/edit',
            params: { paymentId: payment.id },
          })
        }
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label={`Delete payment ${payment.title}`}
        onClick={() =>
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
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-500 transition hover:border-rose-200 hover:bg-rose-50"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  )
}
