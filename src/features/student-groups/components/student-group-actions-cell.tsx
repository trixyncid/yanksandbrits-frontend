import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { Can } from '../../auth/components/can'
import { deleteStudentGroup } from '../api/student-groups-api'
import { studentGroupQueryKeys } from '../api/student-group-query-keys'
import type { StudentGroupListItem } from '../types/student-group'

export function StudentGroupActionsCell({
  group,
}: {
  group: StudentGroupListItem
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const memberCount = group.members.length

  return (
    <div className="flex items-center justify-center gap-2">
      <Can module="studentGroups" action="change">
        <button
          type="button"
          aria-label={`Edit group ${group.groupName}`}
          title="Edit group"
          onClick={() =>
            void navigate({
              to: '/student-groups/$groupId/edit',
              params: { groupId: group.id },
            })
          }
          className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white"
        >
          <Pencil className="size-3.5" />
        </button>
      </Can>
      <Can module="studentGroups" action="delete">
        <button
          type="button"
          aria-label={`Delete group ${group.groupName}`}
          title="Delete group"
          onClick={() =>
            requestDeleteConfirm({
              title: `Delete ${group.groupName}?`,
              description: `This permanently removes the group ${group.groupName}${
                memberCount > 0
                  ? ` and its list of ${memberCount} ${memberCount === 1 ? 'student' : 'students'}`
                  : ''
              }. The students themselves are not deleted. This cannot be undone.`,
              confirmLabel: 'Delete group',
              onConfirm: () => {
                void (async () => {
                  try {
                    await deleteStudentGroup(group.id)
                    await queryClient.invalidateQueries({
                      queryKey: studentGroupQueryKeys.all,
                    })
                    notify('success', {
                      title: 'Group deleted',
                      description: `${group.groupName} has been removed.`,
                    })
                  } catch (error) {
                    notify('error', {
                      title: 'Unable to delete group',
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
