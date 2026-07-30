import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Eye, Pencil, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { deleteStudent } from '../api/students-api'
import { studentQueryKeys } from '../api/student-query-keys'
import type { StudentListItem } from '../types/student'

export function StudentActionsCell({ student }: { student: StudentListItem }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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
              void deleteStudent(student.id)
                .then(async () => {
                  await queryClient.invalidateQueries({
                    queryKey: studentQueryKeys.all,
                  })
                  notify('success', {
                    title: 'Student deleted',
                    description: `${student.pin} has been removed.`,
                  })
                })
                .catch((error) => {
                  notify('error', {
                    title: 'Unable to delete student',
                    description: getApiErrorMessage(error),
                  })
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
