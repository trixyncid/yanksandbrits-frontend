import { useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarClock, Eye, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { Can } from '../../auth/components/can'
import { fetchTutorWorkingSchedule } from '../../users/api/compensation-api'
import { RowActionButton } from '../../users/components/people-ui'
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
      <RowActionButton
        label={`View ${tutor.fullName}`}
        icon={Eye}
        onClick={() =>
          void navigate({
            to: '/tutors/$tutorId',
            params: { tutorId: tutor.id },
          })
        }
      />
      <Can module="users" action="change">
        <RowActionButton
          label={
            tutor.employmentType === 'FL'
              ? `Set per-session rate for ${tutor.fullName}`
              : tutor.hasWorkingSchedule
                ? `Edit working hours for ${tutor.fullName}`
                : `Set working hours for ${tutor.fullName}`
          }
          icon={CalendarClock}
          tone="accent"
          onClick={() => {
            void queryClient
              .ensureQueryData({
                queryKey: ['tutor-working-schedules', 'by-tutor', tutor.id],
                queryFn: () => fetchTutorWorkingSchedule(tutor.id),
              })
              .then(() => setDialogOpen(true))
          }}
        />
      </Can>
      <Can module="users" action="delete">
        <RowActionButton
          label={`Delete ${tutor.fullName}`}
          icon={Trash2}
          tone="delete"
          onClick={() =>
            requestDeleteConfirm({
              title: `Delete ${tutor.fullName}?`,
              description: `This permanently removes tutor ${tutor.fullName} (${tutor.pin}) and their sign-in. This cannot be undone.`,
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
        />
      </Can>

      <TutorWorkingScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tutorId={tutor.id}
        tutorName={tutor.fullName}
        schedule={scheduleQuery.data ?? null}
        mode="full"
        freelance={tutor.employmentType === 'FL'}
      />
    </div>
  )
}
