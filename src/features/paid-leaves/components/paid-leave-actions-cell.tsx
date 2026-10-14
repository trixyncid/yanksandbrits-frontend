import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { FileText, Pencil, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { Can } from '../../auth/components/can'
import { RowActionButton } from '../../users/components/people-ui'
import { deletePaidLeave } from '../api/paid-leaves-api'
import { paidLeaveQueryKeys } from '../api/paid-leave-query-keys'
import type { PaidLeaveListItem } from '../types/paid-leave'

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function PaidLeaveActionsCell({
  leave,
}: {
  leave: PaidLeaveListItem
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const range =
    leave.startDate === leave.endDate
      ? formatShortDate(leave.startDate)
      : `${formatShortDate(leave.startDate)} – ${formatShortDate(leave.endDate)}`

  return (
    <div className="flex items-center justify-center gap-2">
      <Can module="paidLeaves" action="change">
        <RowActionButton
          label={`Edit paid leave for ${leave.staffName}`}
          icon={Pencil}
          tone="edit"
          onClick={() =>
            void navigate({
              to: '/paid-leaves/$leaveId/edit',
              params: { leaveId: leave.id },
            })
          }
        />
      </Can>
      {leave.hasFile && leave.fileUrl ? (
        <a
          href={leave.fileUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open the attached PDF for ${leave.staffName}`}
          title="Open attached PDF"
          className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-brand-600 transition hover:bg-brand-600 hover:text-white"
        >
          <FileText className="size-3.5" />
        </a>
      ) : null}
      <Can module="paidLeaves" action="delete">
        <RowActionButton
          label={`Delete paid leave for ${leave.staffName}`}
          icon={Trash2}
          tone="delete"
          onClick={() =>
            requestDeleteConfirm({
              title: `Delete ${leave.staffName}'s leave?`,
              description: `This permanently removes the ${leave.totalDays}-day leave record (${range}) for ${leave.staffName}. This cannot be undone.`,
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
        />
      </Can>
    </div>
  )
}
