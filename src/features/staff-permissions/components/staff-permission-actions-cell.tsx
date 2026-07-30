import { useQueryClient } from '@tanstack/react-query'
import { Eye, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { deleteStaffPermission } from '../api/staff-permissions-api'
import { staffPermissionQueryKeys } from '../api/staff-permission-query-keys'
import type { StaffPermissionListItem } from '../types/staff-permission'

export function StaffPermissionActionsCell({
  group,
}: {
  group: StaffPermissionListItem
}) {
  const queryClient = useQueryClient()

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label={`View group ${group.name}`}
        onClick={() =>
          notify('info', {
            title: 'Staff permission group',
            description: `${group.name} permission editor will be added later.`,
          })
        }
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
      >
        <Eye className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label={`Delete group ${group.name}`}
        onClick={() =>
          requestDeleteConfirm({
            title: 'Delete staff permission?',
            description: `This will permanently remove ${group.name}. This action cannot be undone.`,
            onConfirm: () => {
              void (async () => {
                try {
                  await deleteStaffPermission(group.id)
                  await queryClient.invalidateQueries({
                    queryKey: staffPermissionQueryKeys.all,
                  })
                  notify('success', {
                    title: 'Staff permission deleted',
                    description: `${group.name} has been removed.`,
                  })
                } catch (error) {
                  notify('error', {
                    title: 'Unable to delete staff permission',
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
