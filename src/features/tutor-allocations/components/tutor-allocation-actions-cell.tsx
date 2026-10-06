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
          aria-label={`Edit tutor allocation for ${label || 'class'}`}
          onClick={() =>
            void navigate({
              to: '/tutor-allocations/$allocationId/edit',
              params: { allocationId: allocation.id },
            })
          }
          className="inline-flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[#C8D4F5] hover:bg-[#F5F8FF] hover:text-[#1B2A5A]"
        >
          <Pencil className="size-3.5" />
        </button>
      </Can>
      <Can module="tutorAllocations" action="delete">
        <button
          type="button"
          aria-label={`Delete tutor allocation for ${label || 'class'}`}
          onClick={() =>
            requestDeleteConfirm({
              title: 'Delete tutor allocation?',
              description: `This will permanently remove this class${label ? ` for ${label}` : ''}. This action cannot be undone.`,
              onConfirm: () => {
                void (async () => {
                  try {
                    await deleteTutorAllocation(allocation.id)
                    await queryClient.invalidateQueries({
                      queryKey: tutorAllocationQueryKeys.all,
                    })
                    notify('success', {
                      title: 'Tutor allocation deleted',
                      description: 'The class has been removed.',
                    })
                  } catch (error) {
                    notify('error', {
                      title: 'Unable to delete tutor allocation',
                      description: getApiErrorMessage(error),
                    })
                  }
                })()
              },
            })
          }
          className="inline-flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-rose-500 shadow-sm transition hover:border-rose-200 hover:bg-rose-50"
        >
          <Trash2 className="size-3.5" />
        </button>
      </Can>
    </div>
  )
}
