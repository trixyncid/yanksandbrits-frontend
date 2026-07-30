import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { FileText, Pencil, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { deletePaidLeave } from '../api/paid-leaves-api'
import { paidLeaveQueryKeys } from '../api/paid-leave-query-keys'
import type { PaidLeaveListItem } from '../types/paid-leave'

export function PaidLeaveActionsCell({
  leave,
}: {
  leave: PaidLeaveListItem
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label={`Edit paid leave for ${leave.staffName}`}
        onClick={() =>
          void navigate({
            to: '/paid-leaves/$leaveId/edit',
            params: { leaveId: leave.id },
          })
        }
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
      >
        <Pencil className="size-3.5" />
      </button>
      {leave.hasFile && leave.fileUrl ? (
        <a
          href={leave.fileUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`View PDF for ${leave.staffName}`}
          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-amber-600 transition hover:border-amber-200 hover:bg-amber-50"
        >
          <FileText className="size-3.5" />
        </a>
      ) : null}
      <button
        type="button"
        aria-label={`Delete paid leave for ${leave.staffName}`}
        onClick={() =>
          requestDeleteConfirm({
            title: 'Delete paid leave?',
            description: `This will permanently remove the leave record for ${leave.staffName}. This action cannot be undone.`,
            onConfirm: () => {
              void (async () => {
                try {
                  await deletePaidLeave(leave.id)
                  await queryClient.invalidateQueries({
                    queryKey: paidLeaveQueryKeys.all,
                  })
                  notify('success', {
                    title: 'Paid leave deleted',
                    description: `${leave.staffName}'s leave record has been removed.`,
                  })
                } catch (error) {
                  notify('error', {
                    title: 'Unable to delete paid leave',
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
