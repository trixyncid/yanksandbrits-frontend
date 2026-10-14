import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { Can } from '../../auth/components/can'
import { deleteClassroom } from '../api/classrooms-api'
import { classroomQueryKeys } from '../api/classroom-query-keys'
import type { ClassroomListItem } from '../types/classroom'

export function ClassroomActionsCell({
  classroom,
}: {
  classroom: ClassroomListItem
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return (
    <div className="flex items-center justify-center gap-2">
      <Can module="classrooms" action="change">
        <button
          type="button"
          aria-label={`Edit classroom ${classroom.code}`}
          title="Edit classroom"
          onClick={() =>
            void navigate({
              to: '/classrooms/$classroomId/edit',
              params: { classroomId: classroom.id },
            })
          }
          className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white"
        >
          <Pencil className="size-3.5" />
        </button>
      </Can>
      <Can module="classrooms" action="delete">
        <button
          type="button"
          aria-label={`Delete classroom ${classroom.code}`}
          title="Delete classroom"
          onClick={() =>
            requestDeleteConfirm({
              title: `Delete ${classroom.className}?`,
              description: `This permanently removes the classroom ${classroom.className} (${classroom.code}). Past sessions keep their history, but the room can no longer be booked. This can't be undone.`,
              onConfirm: () => {
                void (async () => {
                  try {
                    await deleteClassroom(classroom.id)
                    await queryClient.invalidateQueries({
                      queryKey: classroomQueryKeys.all,
                    })
                    notify('success', {
                      title: 'Classroom deleted',
                      description: `${classroom.className} has been removed.`,
                    })
                  } catch (error) {
                    notify('error', {
                      title: 'Unable to delete classroom',
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
