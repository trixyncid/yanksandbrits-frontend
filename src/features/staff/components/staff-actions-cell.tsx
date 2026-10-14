import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Eye, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { Can } from '../../auth/components/can'
import { RowActionButton } from '../../users/components/people-ui'
import { deleteStaff } from '../api/staff-api'
import { staffQueryKeys } from '../api/staff-query-keys'
import type { StaffListItem } from '../types/staff'

export function StaffActionsCell({ staff }: { staff: StaffListItem }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return (
    <div className="flex items-center justify-center gap-2">
      <RowActionButton
        label={
          staff.isStudent
            ? `Open student profile for ${staff.fullName}`
            : `View ${staff.fullName}`
        }
        icon={Eye}
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
      />
      {!staff.isStudent ? (
        <Can module="users" action="delete">
          <RowActionButton
            label={`Delete ${staff.fullName}`}
            icon={Trash2}
            tone="delete"
            onClick={() =>
              requestDeleteConfirm({
                title: `Delete ${staff.fullName}?`,
                description: `This permanently removes the login account for ${staff.fullName}${staff.pin ? ` (${staff.pin})` : ''}. They will no longer be able to sign in. This cannot be undone.`,
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
          />
        </Can>
      ) : null}
    </div>
  )
}
