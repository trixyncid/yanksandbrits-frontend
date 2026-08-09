import { useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarClock, Eye, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { fetchTutorWorkingSchedule } from '../../users/api/compensation-api'
import { TutorWorkingScheduleDialog } from '../../users/components/tutor-working-schedule-dialog'
import { deleteTutor } from '../api/tutors-api'
import { tutorQueryKeys } from '../api/tutor-query-keys'
import type { TutorListItem } from '../types/tutor'

export function TutorActionsCell({ tutor }: { tutor: TutorListItem }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)

  const scheduleQuery = useQuery({
    queryKey: ['tutor-working-schedules', 'by-tutor', tutor.id],
    queryFn: () => fetchTutorWorkingSchedule(tutor.id),
    enabled: dialogOpen,
  })

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
      <button
        type="button"
        aria-label={
          tutor.hasWorkingSchedule
            ? `Edit schedule for ${tutor.fullName}`
            : `Record schedule for ${tutor.fullName}`
        }
        onClick={() => {
          void queryClient
            .ensureQueryData({
              queryKey: ['tutor-working-schedules', 'by-tutor', tutor.id],
              queryFn: () => fetchTutorWorkingSchedule(tutor.id),
            })
            .then(() => setDialogOpen(true))
        }}
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-amber-600 transition hover:border-amber-200 hover:bg-amber-50"
      >
        <CalendarClock className="size-3.5" />
      </button>
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

      <TutorWorkingScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tutorId={tutor.id}
        tutorName={tutor.fullName}
        schedule={scheduleQuery.data ?? null}
        mode="full"
      />
    </div>
  )
}
