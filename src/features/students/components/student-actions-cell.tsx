import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Eye, Pencil, Trash2 } from 'lucide-react'

import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { studentQueryKeys } from '../api/student-query-keys'
import { useStudentsStore } from '../store/students-store'
import type { StudentListItem } from '../types/student'

export function StudentActionsCell({ student }: { student: StudentListItem }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const removeStudent = useStudentsStore((state) => state.remove)

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label={`View ${student.fullName}`}
        onClick={() =>
          void navigate({
            to: '/students/$studentId',
            params: { studentId: student.id },
          })
        }
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
      >
        <Eye className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label={`Edit ${student.fullName}`}
        onClick={() =>
          void navigate({
            to: '/students/$studentId/edit',
            params: { studentId: student.id },
          })
        }
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label={`Delete ${student.fullName}`}
        onClick={() =>
          requestDeleteConfirm({
            title: 'Delete student?',
            description: `This will permanently remove ${student.fullName} (${student.pin}). This action cannot be undone.`,
            onConfirm: () => {
              removeStudent(student.id)
              void queryClient.invalidateQueries({
                queryKey: studentQueryKeys.all,
              })
              notify('success', {
                title: 'Student deleted',
                description: `${student.pin} has been removed.`,
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
