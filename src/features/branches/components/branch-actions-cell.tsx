import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { deleteBranch } from '../api/branches-api'
import { branchQueryKeys } from '../api/branch-query-keys'
import type { BranchListItem } from '../types/branch'

export function BranchActionsCell({ branch }: { branch: BranchListItem }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label={`Edit branch ${branch.name}`}
        onClick={() =>
          void navigate({
            to: '/branches/$branchId/edit',
            params: { branchId: branch.id },
          })
        }
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label={`Delete branch ${branch.name}`}
        onClick={() =>
          requestDeleteConfirm({
            title: 'Delete branch?',
            description: `This will permanently remove ${branch.name}. This action cannot be undone.`,
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
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-500 transition hover:border-rose-200 hover:bg-rose-50"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  )
}
