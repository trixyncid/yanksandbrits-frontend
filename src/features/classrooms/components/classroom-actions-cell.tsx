import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'

import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { classroomQueryKeys } from '../api/classroom-query-keys'
import { useClassroomsStore } from '../store/classrooms-store'
import type { ClassroomListItem } from '../types/classroom'

export function ClassroomActionsCell({
  classroom,
}: {
  classroom: ClassroomListItem
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const removeClassroom = useClassroomsStore((state) => state.remove)

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label={`Edit classroom ${classroom.code}`}
        onClick={() =>
          void navigate({
            to: '/classrooms/$classroomId/edit',
            params: { classroomId: classroom.id },
          })
        }
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label={`Delete classroom ${classroom.code}`}
        onClick={() =>
          requestDeleteConfirm({
            title: 'Delete classroom?',
            description: `This will permanently remove ${classroom.className}. This action cannot be undone.`,
            onConfirm: () => {
              removeClassroom(classroom.id)
              void queryClient.invalidateQueries({
                queryKey: classroomQueryKeys.all,
              })
              notify('success', {
                title: 'Classroom deleted',
                description: `${classroom.className} has been removed.`,
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
