import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'

import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { newStudentQueryKeys } from '../api/new-student-query-keys'
import { useNewStudentsStore } from '../store/new-students-store'
import type { NewStudentListItem } from '../types/new-student'

export function NewStudentActionsCell({
  student,
}: {
  student: NewStudentListItem
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const removeStudent = useNewStudentsStore((state) => state.remove)

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label={`Edit new student ${student.fullName}`}
        onClick={() =>
          void navigate({
            to: '/new-students/$studentId/edit',
            params: { studentId: student.id },
          })
        }
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label={`Delete new student ${student.fullName}`}
        onClick={() =>
          requestDeleteConfirm({
            title: 'Delete new student?',
            description: `This will permanently remove ${student.fullName}. This action cannot be undone.`,
            onConfirm: () => {
              removeStudent(student.id)
              void queryClient.invalidateQueries({
                queryKey: newStudentQueryKeys.all,
              })
              notify('success', {
                title: 'New student deleted',
                description: `${student.fullName} has been removed.`,
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
