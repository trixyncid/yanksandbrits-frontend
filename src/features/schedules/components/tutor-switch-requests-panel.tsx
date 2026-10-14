import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftRight, Check, X } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { notify } from '../../../shared/lib/notify'
import { useInvalidateNavBadges } from '../../admin/hooks/use-nav-badges-query'
import { useAuthUser } from '../../auth/hooks/use-permissions'
import { hasAuthRole } from '../../auth/types/auth'
import {
  decideTutorSwitchRequest,
  fetchTutorSwitchRequests,
  tutorSwitchQueryKeys,
  type TutorSwitchRequest,
} from '../api/tutor-switch-api'

function formatWhen(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

/** Finance and System Admins approve tutor switches; everyone else sees nothing. */
export function TutorSwitchRequestsPanel() {
  const user = useAuthUser()
  const canApprove = Boolean(
    user &&
      (user.is_superuser ||
        hasAuthRole(user, 'finance') ||
        hasAuthRole(user, 'systemadmin')),
  )
  const queryClient = useQueryClient()
  const invalidateNavBadges = useInvalidateNavBadges()

  const requestsQuery = useQuery({
    queryKey: tutorSwitchQueryKeys.requests('1_PD'),
    queryFn: () => fetchTutorSwitchRequests('1_PD'),
    enabled: canApprove,
  })

  const decideMutation = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'approve' | 'reject' }) =>
      decideTutorSwitchRequest(id, decision),
    onSuccess: async (request, { decision }) => {
      await queryClient.invalidateQueries({ queryKey: tutorSwitchQueryKeys.all })
      invalidateNavBadges()
      notify('success', {
        title: decision === 'approve' ? 'Tutor switch approved' : 'Tutor switch rejected',
        description:
          decision === 'approve'
            ? `Any tutor can now be booked for ${subjectName(request)} in ${request.programTitle}.`
            : `${subjectName(request)} stays with the allocated tutor.`,
      })
    },
    onError: (error) =>
      notify('error', {
        title: 'Unable to save the decision',
        description: getApiErrorMessage(error),
      }),
  })

  const requests = requestsQuery.data ?? []
  if (!canApprove || requests.length === 0) return null

  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <ArrowLeftRight className="size-[1.1rem]" />
        </span>
        <div>
          <h2 className="text-base font-bold tracking-tight text-ink">
            Tutor switches waiting for you
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Approving lets bookings for that student and program use any tutor.
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {requests.map((request) => (
          <li
            key={request.id}
            className="flex flex-col gap-3 rounded-2xl bg-canvas/70 px-4 py-3 sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">
                {subjectName(request)}
                <span className="font-normal text-slate-500">
                  {' · '}
                  {request.programCode ? `${request.programCode} · ` : ''}
                  {request.programTitle}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-slate-600">“{request.reason}”</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {request.requestedByName || 'Someone'} · {formatWhen(request.createdAt)}
                {request.allocatedTutors.length
                  ? ` · Allocated: ${request.allocatedTutors.map((tutor) => tutor.tutorName).join(', ')}`
                  : ' · No tutor allocated'}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                disabled={decideMutation.isPending}
                onClick={() => decideMutation.mutate({ id: request.id, decision: 'approve' })}
              >
                <Check className="size-3.5" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="soft"
                disabled={decideMutation.isPending}
                onClick={() => decideMutation.mutate({ id: request.id, decision: 'reject' })}
              >
                <X className="size-3.5" />
                Reject
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function subjectName(request: TutorSwitchRequest) {
  return request.studentName || request.studentGroupName || 'This student'
}
