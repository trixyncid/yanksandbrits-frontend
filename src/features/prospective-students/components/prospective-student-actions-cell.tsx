import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2, UserPlus, WalletCards } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { Can } from '../../auth/components/can'
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
  const canCreatePayment =
    (student.status === 'prediction_test' || student.status === 'consult') &&
    !student.isStudent
  const canConvertToStudent = student.canEnroll && !student.isStudent

  return (
    <div className="flex items-center justify-center gap-2">
      {canCreatePayment ? (
        <Can module="studentPayments" action="add">
          <button
            type="button"
            title="Record a payment"
            aria-label={`Record a payment for ${student.fullName}`}
            onClick={() =>
              void navigate({
                to: '/student-payments/new',
                search: { prospectiveStudentId: student.id },
              })
            }
            className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white"
          >
            <WalletCards className="size-3.5" />
          </button>
        </Can>
      ) : null}
      {canConvertToStudent ? (
        <Can module="students" action="add">
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
            className="inline-flex size-9 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition hover:bg-brand-500 hover:text-white"
          >
            <UserPlus className="size-3.5" />
          </button>
        </Can>
      ) : null}
      <Can module="prospectiveStudents" action="change">
        <button
          type="button"
          aria-label={`Edit ${student.fullName}`}
          title="Edit lead"
          onClick={() =>
            void navigate({
              to: '/prospective-students/$prospectiveStudentId/edit',
              params: { prospectiveStudentId: student.id },
            })
          }
          className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white"
        >
          <Pencil className="size-3.5" />
        </button>
      </Can>
      <Can module="prospectiveStudents" action="delete">
        <button
          type="button"
          aria-label={`Delete ${student.fullName}`}
          title="Delete lead"
          onClick={() =>
            requestDeleteConfirm({
              title: `Delete ${student.fullName}?`,
              description: `This permanently removes the lead for ${student.fullName}, including their contact and consult details. This cannot be undone.`,
              confirmLabel: 'Delete lead',
              onConfirm: () => {
                void deleteProspectiveStudent(student.id)
                  .then(async () => {
                    await queryClient.invalidateQueries({
                      queryKey: prospectiveStudentQueryKeys.all,
                    })
                    notify('success', {
                      title: 'Lead deleted',
                      description: `${student.fullName} has been removed.`,
                    })
                  })
                  .catch((error) => {
                    notify('error', {
                      title: 'Unable to delete lead',
                      description: getApiErrorMessage(error),
                    })
                  })
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
