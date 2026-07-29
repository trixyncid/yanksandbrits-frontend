import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'

import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { studentGroupQueryKeys } from '../api/student-group-query-keys'
import { useStudentGroupsStore } from '../store/student-groups-store'
import type { StudentGroupListItem } from '../types/student-group'

export function StudentGroupActionsCell({
  group,
}: {
  group: StudentGroupListItem
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const removeGroup = useStudentGroupsStore((state) => state.remove)

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label={`Edit ${group.groupName}`}
        onClick={() =>
          void navigate({
            to: '/student-groups/$groupId/edit',
            params: { groupId: group.id },
          })
        }
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label={`Delete ${group.groupName}`}
        onClick={() =>
          requestDeleteConfirm({
            title: 'Delete group?',
            description: `This will permanently remove ${group.groupName}. This action cannot be undone.`,
            onConfirm: () => {
              removeGroup(group.id)
              void queryClient.invalidateQueries({
                queryKey: studentGroupQueryKeys.all,
              })
              notify('success', {
                title: 'Group deleted',
                description: `${group.groupName} has been removed.`,
              })
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
