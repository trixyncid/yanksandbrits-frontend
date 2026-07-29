import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'

import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { studentResponseQueryKeys } from '../api/student-response-query-keys'
import { useStudentResponsesStore } from '../store/student-responses-store'
import type { StudentResponseListItem } from '../types/student-response'

export function StudentResponseActionsCell({
  response,
}: {
  response: StudentResponseListItem
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const removeResponse = useStudentResponsesStore((state) => state.remove)

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label={`Edit response ${response.title}`}
        onClick={() =>
          void navigate({
            to: '/student-responses/$responseId/edit',
            params: { responseId: response.id },
          })
        }
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label={`Delete response ${response.title}`}
        onClick={() =>
          requestDeleteConfirm({
            title: 'Delete response?',
            description: `This will permanently remove ${response.title}. This action cannot be undone.`,
            onConfirm: () => {
              removeResponse(response.id)
              void queryClient.invalidateQueries({
                queryKey: studentResponseQueryKeys.all,
              })
              notify('success', {
                title: 'Response deleted',
                description: `${response.title} has been removed.`,
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
