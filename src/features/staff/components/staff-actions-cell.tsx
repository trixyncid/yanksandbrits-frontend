import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Eye, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { Can } from '../../auth/components/can'
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
        aria-label={`View user ${staff.fullName}`}
        onClick={() => {
          if (staff.isStudent && staff.studentId) {
            void navigate({
              to: '/students/$studentId',
              params: { studentId: staff.studentId },
            })
            return
          }

          void navigate({
            to: '/users/$userId',
            params: { userId: staff.id },
          })
        }}
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
      >
        <Eye className="size-3.5" />
      </button>
      {!staff.isStudent ? (
        <Can module="users" action="delete">
          <button
            type="button"
            aria-label={`Delete user ${staff.fullName}`}
            onClick={() =>
              requestDeleteConfirm({
                title: 'Delete user?',
                description: `This will permanently remove ${staff.fullName}. This action cannot be undone.`,
                onConfirm: () => {
                  void (async () => {
                    try {
                      await deleteStaff(staff.id)
                      await queryClient.invalidateQueries({
                        queryKey: staffQueryKeys.all,
                      })
                      notify('success', {
                        title: 'User deleted',
                        description: `${staff.fullName} has been removed.`,
                      })
                    } catch (error) {
                      notify('error', {
                        title: 'Unable to delete user',
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
        </Can>
      ) : null}
    </div>
  )
}
