import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeftRight,
  Check,
  Hourglass,
  Lock,
  TriangleAlert,
  Unlock,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import {
  SearchableSelect,
  type SearchableSelectOption,
} from '../../../shared/components/ui/searchable-select'
import { Textarea } from '../../../shared/components/ui/textarea'
import { notify } from '../../../shared/lib/notify'
import { useInvalidateNavBadges } from '../../admin/hooks/use-nav-badges-query'
import {
  createTutorSwitchRequest,
  decideTutorSwitchRequest,
  fetchBookingTutorOptions,
  tutorSwitchQueryKeys,
} from '../api/tutor-switch-api'

/** Same "PIN | Name" format as the app's other tutor dropdowns. */
function tutorLabel(tutor: { tutorPin: string; tutorName: string }) {
  return tutor.tutorPin ? `${tutor.tutorPin} | ${tutor.tutorName}` : tutor.tutorName
}

/**
 * Tutor picker for booking a session. The tutor comes from the student's (or
 * group's) tutor allocation for the chosen program. Anyone else needs a tutor
 * switch approved by Finance or a System Admin, which opens up the full list.
 */
export function BookingTutorField({
  mode,
  studentId,
  studentGroupId,
  programId,
  value,
  onChange,
  allTutorOptions,
}: {
  mode: 'create' | 'edit'
  studentId?: string
  studentGroupId?: string
  programId: string
  value: string
  onChange: (tutorId: string) => void
  /** Every tutor; used only to keep an existing session's saved tutor visible. */
  allTutorOptions: SearchableSelectOption[]
}) {
  const queryClient = useQueryClient()
  const invalidateNavBadges = useInvalidateNavBadges()
  const [asking, setAsking] = useState(false)
  const [reason, setReason] = useState('')
  const ready = Boolean(programId && (studentId || studentGroupId))
  const params = { studentId, studentGroupId, programId }

  const optionsQuery = useQuery({
    queryKey: tutorSwitchQueryKeys.options(params),
    queryFn: () => fetchBookingTutorOptions(params),
    enabled: ready,
  })
  const options = optionsQuery.data
  const allocated = options?.allocated ?? []
  const locked = Boolean(options && !options.unlocked)
  const allocatedIds = allocated.map((item) => item.tutorId)
  const onlyTutorId = allocated.length === 1 ? allocated[0]!.tutorId : ''

  // Locked to one allocated tutor: fill it in. Existing sessions keep their
  // saved tutor unless it is empty.
  useEffect(() => {
    if (!locked || !onlyTutorId || value === onlyTutorId) return
    if (mode === 'edit' && value) return
    onChange(onlyTutorId)
  }, [locked, onlyTutorId, value, mode, onChange])

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: tutorSwitchQueryKeys.all })
    invalidateNavBadges()
  }

  const requestMutation = useMutation({
    mutationFn: () =>
      createTutorSwitchRequest({ ...params, programId, reason }),
    onSuccess: async () => {
      setAsking(false)
      setReason('')
      await refresh()
      notify('success', {
        title: 'Tutor switch requested',
        description: 'Finance or a System Admin will review it.',
      })
    },
    onError: (error) =>
      notify('error', {
        title: 'Unable to request a switch',
        description: getApiErrorMessage(error),
      }),
  })

  const decideMutation = useMutation({
    mutationFn: (decision: 'approve' | 'reject') =>
      decideTutorSwitchRequest(options!.pendingRequest!.id, decision),
    onSuccess: async (_, decision) => {
      await refresh()
      notify('success', {
        title: decision === 'approve' ? 'Tutor switch approved' : 'Tutor switch rejected',
        description:
          decision === 'approve'
            ? 'Any tutor can now be booked for this student and program.'
            : 'Bookings stay with the allocated tutor.',
      })
    },
    onError: (error) =>
      notify('error', {
        title: 'Unable to save the decision',
        description: getApiErrorMessage(error),
      }),
  })

  if (!ready) {
    return (
      <p className="flex h-11 items-center rounded-full bg-canvas/70 px-4 text-sm text-slate-400">
        Choose the student and program first
      </p>
    )
  }

  if (optionsQuery.isLoading || !options) {
    return <div className="h-11 animate-pulse rounded-full bg-canvas" aria-busy="true" />
  }

  const pending = options.pendingRequest
  const allocatedOptions: SearchableSelectOption[] = allocated.map((item) => ({
    value: item.tutorId,
    label: tutorLabel(item),
    keywords: `${item.tutorPin} ${item.tutorName}`,
  }))
  // Unlocked: allocated tutors plus anyone who teaches the program's subject.
  const subjectOptions: SearchableSelectOption[] = [
    ...allocatedOptions,
    ...allTutorOptions.filter(
      (option) =>
        option.value === value &&
        !allocatedIds.includes(value) &&
        !options.subjectTutors.some((tutor) => tutor.tutorId === value),
    ),
    ...options.subjectTutors
      .filter((tutor) => !allocatedIds.includes(tutor.tutorId))
      .map((tutor) => ({
        value: tutor.tutorId,
        label: tutorLabel(tutor),
        keywords: `${tutor.tutorPin} ${tutor.tutorName}`,
      })),
  ]
  // Keep an existing session's saved tutor visible even if it is not allocated.
  const savedNotAllocated = Boolean(value) && !allocatedIds.includes(value)
  const lockedOptions = savedNotAllocated
    ? [
        ...allocatedOptions,
        ...allTutorOptions.filter((option) => option.value === value),
      ]
    : allocatedOptions

  return (
    <div className="space-y-2">
      {locked && allocated.length === 0 ? (
        <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            No tutor is allocated to this student for this program yet. Finish
            tutor allocation first.
          </p>
        </div>
      ) : locked && allocated.length === 1 && !savedNotAllocated ? (
        <div className="flex h-11 items-center gap-2.5 rounded-full bg-canvas/70 px-4 text-sm">
          <Lock className="size-3.5 shrink-0 text-slate-400" />
          <span className="min-w-0 flex-1 truncate font-medium text-ink">
            {tutorLabel(allocated[0]!)}
          </span>
          <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
            Allocated
          </span>
        </div>
      ) : (
        <SearchableSelect
          id="tutorId"
          value={value}
          options={locked ? lockedOptions : subjectOptions}
          onChange={onChange}
          placeholder={
            locked
              ? 'Choose an allocated tutor'
              : options.subject
                ? `Choose a ${options.subject} tutor`
                : 'Choose a tutor'
          }
          searchPlaceholder="Search tutors..."
          emptyMessage={
            options.subject ? `No ${options.subject} tutors found` : 'No tutors found'
          }
        />
      )}

      {options.switchApproved ? (
        <p className="flex items-center gap-1.5 text-xs text-emerald-700">
          <Unlock className="size-3.5" />
          Tutor switch approved: pick any
          {options.subject ? ` ${options.subject}` : ''} tutor for this student and program.
        </p>
      ) : options.unlocked && !locked ? (
        <p className="text-xs text-slate-500">
          You can book any{options.subject ? ` ${options.subject}` : ''} tutor.{' '}
          {allocated.length
            ? `Allocated: ${allocated.map((item) => item.tutorName).join(', ')}.`
            : 'No tutor is allocated yet.'}
        </p>
      ) : null}

      {pending ? (
        <div className="rounded-2xl bg-canvas/70 px-4 py-3 text-sm">
          <p className="flex items-center gap-1.5 font-semibold text-ink">
            <Hourglass className="size-3.5 text-amber-600" />
            Tutor switch requested
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {pending.requestedByName ? `${pending.requestedByName}: ` : ''}
            “{pending.reason}”
            {options.canApprove ? '' : ' · Waiting for Finance or a System Admin.'}
          </p>
          {options.canApprove ? (
            <div className="mt-2.5 flex gap-2">
              <Button
                type="button"
                size="sm"
                disabled={decideMutation.isPending}
                onClick={() => decideMutation.mutate('approve')}
              >
                <Check className="size-3.5" />
                Approve switch
              </Button>
              <Button
                type="button"
                size="sm"
                variant="soft"
                disabled={decideMutation.isPending}
                onClick={() => decideMutation.mutate('reject')}
              >
                <X className="size-3.5" />
                Reject
              </Button>
            </div>
          ) : null}
        </div>
      ) : locked ? (
        asking ? (
          <div className="space-y-2 rounded-2xl bg-canvas/70 p-3">
            <label htmlFor="switchReason" className="text-xs font-semibold text-slate-600">
              Why does this student need a different tutor?
            </label>
            <Textarea
              id="switchReason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. The allocated tutor is on leave this month"
              className="min-h-20 bg-white"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="soft"
                onClick={() => {
                  setAsking(false)
                  setReason('')
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!reason.trim() || requestMutation.isPending}
                onClick={() => requestMutation.mutate()}
              >
                {requestMutation.isPending ? 'Sending...' : 'Send request'}
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAsking(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline"
          >
            <ArrowLeftRight className="size-3.5" />
            Need a different tutor? Ask Finance or a System Admin
          </button>
        )
      ) : null}
    </div>
  )
}
