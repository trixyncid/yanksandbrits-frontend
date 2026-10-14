import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { Can } from '../../auth/components/can'
import { deleteBranch } from '../api/branches-api'
import { branchQueryKeys } from '../api/branch-query-keys'
import type { BranchListItem } from '../types/branch'

export function BranchActionsCell({ branch }: { branch: BranchListItem }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return (
    <div className="flex items-center justify-center gap-2">
      <Can module="branches" action="change">
        <button
          type="button"
          aria-label={`Edit branch ${branch.name}`}
          title="Edit branch"
          onClick={() =>
            void navigate({
              to: '/branches/$branchId/edit',
              params: { branchId: branch.id },
            })
          }
          className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white"
        >
          <Pencil className="size-3.5" />
        </button>
      </Can>
      <Can module="branches" action="delete">
        <button
          type="button"
          aria-label={`Delete branch ${branch.name}`}
          title="Delete branch"
          onClick={() =>
            requestDeleteConfirm({
              title: `Delete ${branch.name}?`,
              description: `This will permanently remove the ${branch.name} branch. This action cannot be undone.`,
              onConfirm: () => {
                void (async () => {
                  try {
                    await deleteBranch(branch.id)
                    await queryClient.invalidateQueries({
                      queryKey: branchQueryKeys.all,
                    })
                    notify('success', {
                      title: 'Branch deleted',
                      description: `${branch.name} has been removed.`,
                    })
                  } catch (error) {
                    notify('error', {
                      title: 'Unable to delete branch',
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
