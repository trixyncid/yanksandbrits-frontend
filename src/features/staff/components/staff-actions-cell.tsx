import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Eye, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { deleteStaff } from '../api/staff-api'
import { staffQueryKeys } from '../api/staff-query-keys'
import type { StaffListItem } from '../types/staff'

export function StaffActionsCell({ staff }: { staff: StaffListItem }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label={`View staff ${staff.fullName}`}
        onClick={() =>
          void navigate({
            to: '/staff/$staffId',
            params: { staffId: staff.id },
          })
        }
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
      >
        <Eye className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label={`Delete staff ${staff.fullName}`}
        onClick={() =>
          requestDeleteConfirm({
            title: 'Delete staff?',
            description: `This will permanently remove ${staff.fullName}. This action cannot be undone.`,
            onConfirm: () => {
              void (async () => {
                try {
                  await deleteStaff(staff.id)
                  await queryClient.invalidateQueries({
                    queryKey: staffQueryKeys.all,
                  })
                  notify('success', {
                    title: 'Staff deleted',
                    description: `${staff.fullName} has been removed.`,
                  })
                } catch (error) {
                  notify('error', {
                    title: 'Unable to delete staff',
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
