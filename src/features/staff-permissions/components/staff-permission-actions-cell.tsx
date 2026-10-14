import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { Can } from '../../auth/components/can'
import { RowActionButton } from '../../users/components/people-ui'
import { deleteStaffPermission } from '../api/staff-permissions-api'
import { staffPermissionQueryKeys } from '../api/staff-permission-query-keys'
import type { StaffPermissionListItem } from '../types/staff-permission'

function memberText(count: number) {
  return `${count} ${count === 1 ? 'person' : 'people'}`
}

export function StaffPermissionActionsCell({
  group,
}: {
  group: StaffPermissionListItem
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return (
    <div className="flex items-center justify-center gap-2">
      <Can managerOnly>
        <RowActionButton
          label={`Edit role ${group.name}`}
          icon={Pencil}
          tone="edit"
          onClick={() =>
            void navigate({
              to: '/staff-permissions/$groupId/edit',
              params: { groupId: group.id },
            })
          }
        />
      </Can>
      <Can managerOnly>
        <RowActionButton
          label={`Delete role ${group.name}`}
          icon={Trash2}
          tone="delete"
          onClick={() =>
            requestDeleteConfirm({
              title: `Delete the ${group.name} role?`,
              description: group.isSystem
                ? `${group.name} is a built-in role. Deleting it removes it from ${memberText(group.memberCount)}, who will lose the access it gave them. This cannot be undone.`
                : `This removes ${group.name} from ${memberText(group.memberCount)}. Anyone who only had this role will lose that access. This cannot be undone.`,
              onConfirm: () => {
                void (async () => {
                  try {
                    await deleteStaffPermission(group.id)
                    await queryClient.invalidateQueries({
                      queryKey: staffPermissionQueryKeys.all,
                    })
                    notify('success', {
                      title: 'Role deleted',
                      description: `${group.name} has been removed.`,
                    })
                  } catch (error) {
                    notify('error', {
                      title: 'Unable to delete role',
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
