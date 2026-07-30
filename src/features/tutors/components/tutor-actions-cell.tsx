import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { CalendarClock, Eye, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { deleteTutor } from '../api/tutors-api'
import { tutorQueryKeys } from '../api/tutor-query-keys'
import type { TutorListItem } from '../types/tutor'

export function TutorActionsCell({ tutor }: { tutor: TutorListItem }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label={`View tutor ${tutor.fullName}`}
        onClick={() =>
          void navigate({
            to: '/tutors/$tutorId',
            params: { tutorId: tutor.id },
          })
        }
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
      >
        <Eye className="size-3.5" />
      </button>
      {tutor.hasWorkingSchedule ? (
        <button
          type="button"
          aria-label={`Edit schedule for ${tutor.fullName}`}
          onClick={() =>
            notify('info', {
              title: 'Working schedule',
              description: `${tutor.fullName} schedule editor will be added later.`,
            })
          }
          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-amber-600 transition hover:border-amber-200 hover:bg-amber-50"
        >
          <CalendarClock className="size-3.5" />
        </button>
      ) : null}
      <button
        type="button"
        aria-label={`Delete tutor ${tutor.fullName}`}
        onClick={() =>
          requestDeleteConfirm({
            title: 'Delete tutor?',
            description: `This will permanently remove ${tutor.fullName}. This action cannot be undone.`,
            onConfirm: () => {
              void (async () => {
                try {
                  await deleteTutor(tutor.id)
                  await queryClient.invalidateQueries({
                    queryKey: tutorQueryKeys.all,
                  })
                  notify('success', {
                    title: 'Tutor deleted',
                    description: `${tutor.fullName} has been removed.`,
                  })
                } catch (error) {
                  notify('error', {
                    title: 'Unable to delete tutor',
                    description: getApiErrorMessage(error),
                  })
                }
              })()
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
