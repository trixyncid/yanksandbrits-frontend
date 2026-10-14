import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Eye, Pencil, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { Can } from '../../auth/components/can'
import { deleteStudent } from '../api/students-api'
import { studentQueryKeys } from '../api/student-query-keys'
import type { StudentListItem } from '../types/student'

const ICON_BUTTON =
  'inline-flex size-9 items-center justify-center rounded-full bg-canvas transition'

export function StudentActionsCell({ student }: { student: StudentListItem }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const label = student.pin
    ? `${student.fullName} (${student.pin})`
    : student.fullName

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label={`View ${student.fullName}`}
        title="View student"
        onClick={() =>
          void navigate({
            to: '/students/$studentId',
            params: { studentId: student.id },
          })
        }
        className={`${ICON_BUTTON} text-ink hover:bg-brand-500 hover:text-white`}
      >
        <Eye className="size-3.5" />
      </button>
      <Can module="students" action="change">
        <button
          type="button"
          aria-label={`Edit ${student.fullName}`}
          title="Edit student"
          onClick={() =>
            void navigate({
              to: '/students/$studentId/edit',
              params: { studentId: student.id },
            })
          }
          className={`${ICON_BUTTON} text-ink hover:bg-ink hover:text-white`}
        >
          <Pencil className="size-3.5" />
        </button>
      </Can>
      <Can module="students" action="delete">
        <button
          type="button"
          aria-label={`Delete ${student.fullName}`}
          title="Delete student"
          onClick={() =>
            requestDeleteConfirm({
              title: `Delete ${student.fullName}?`,
              description: `This will permanently remove the student record for ${label}. This cannot be undone.`,
              confirmLabel: 'Delete student',
              onConfirm: () => {
                void deleteStudent(student.id)
                  .then(async () => {
                    await queryClient.invalidateQueries({
                      queryKey: studentQueryKeys.all,
                    })
                    notify('success', {
                      title: 'Student deleted',
                      description: `${label} has been removed.`,
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
          className={`${ICON_BUTTON} text-rose-500 hover:bg-rose-500 hover:text-white`}
        >
          <Trash2 className="size-3.5" />
        </button>
      </Can>
    </div>
  )
}
