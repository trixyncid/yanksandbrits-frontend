import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2, UserPlus } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { deleteProspectiveStudent } from '../api/prospective-students-api'
import { prospectiveStudentQueryKeys } from '../api/prospective-student-query-keys'
import type { ProspectiveStudentListItem } from '../types/prospective-student'

export function ProspectiveStudentActionsCell({
  student,
}: {
  student: ProspectiveStudentListItem
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const canConvertToStudent =
    student.status === 'prediction_test' && !student.isStudent

  return (
    <div className="flex items-center justify-center gap-2">
      {canConvertToStudent ? (
        <button
          type="button"
          title="Enroll as student"
          aria-label={`Enroll ${student.fullName} as a student`}
          onClick={() =>
            void navigate({
              to: '/students/new',
              search: { prospectiveStudentId: student.id },
            })
          }
          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#4274B9] transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
        >
          <UserPlus className="size-3.5" />
        </button>
      ) : null}
      <button
        type="button"
        aria-label={`Edit prospective student ${student.fullName}`}
        onClick={() =>
          void navigate({
            to: '/prospective-students/$prospectiveStudentId/edit',
            params: { prospectiveStudentId: student.id },
          })
        }
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label={`Delete prospective student ${student.fullName}`}
        onClick={() =>
          requestDeleteConfirm({
            title: 'Delete prospective student?',
            description: `This will permanently remove ${student.fullName}. This action cannot be undone.`,
            onConfirm: () => {
              void deleteProspectiveStudent(student.id)
                .then(async () => {
                  await queryClient.invalidateQueries({
                    queryKey: prospectiveStudentQueryKeys.all,
                  })
                  notify('success', {
                    title: 'Prospective student deleted',
                    description: `${student.fullName} has been removed.`,
                  })
                })
                .catch((error) => {
                  notify('error', {
                    title: 'Unable to delete prospective student',
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
