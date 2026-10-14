import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { Can } from '../../auth/components/can'
import { deleteTutorAllocation } from '../api/tutor-allocations-api'
import { tutorAllocationQueryKeys } from '../api/tutor-allocation-query-keys'
import type { TutorAllocationListItem } from '../types/tutor-allocation'

export function TutorAllocationActionsCell({
  allocation,
}: {
  allocation: TutorAllocationListItem
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const label = allocation.members.map((member) => member.studentName).join(', ')

  return (
    <div className="flex items-center justify-center gap-2">
      <Can module="tutorAllocations" action="change">
        <button
          type="button"
          aria-label={`Open class for ${label || 'these students'}`}
          title="Open class"
          onClick={() =>
            void navigate({
              to: '/tutor-allocations/$allocationId/edit',
              params: { allocationId: allocation.id },
            })
          }
          className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white"
        >
          <Pencil className="size-3.5" />
        </button>
      </Can>
      <Can module="tutorAllocations" action="delete">
        <button
          type="button"
          aria-label={`Delete class for ${label || 'these students'}`}
          title="Delete class"
          onClick={() =>
            requestDeleteConfirm({
              title: label ? `Delete the class for ${label}?` : 'Delete this class?',
              description: `This permanently removes the ${allocation.classType === 'private' ? 'private class' : `group class of ${allocation.groupSize}`}${label ? ` for ${label}` : ''}, with its tutors and weekly schedule. This can't be undone.`,
              onConfirm: () => {
                void (async () => {
                  try {
                    await deleteTutorAllocation(allocation.id)
                    await queryClient.invalidateQueries({
                      queryKey: tutorAllocationQueryKeys.all,
                    })
                    notify('success', {
                      title: 'Class deleted',
                      description: label
                        ? `The class for ${label} has been removed.`
                        : 'The class has been removed.',
                    })
                  } catch (error) {
                    notify('error', {
                      title: 'Unable to delete class',
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
    </div>
  )
}
