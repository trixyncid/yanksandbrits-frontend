import { Check, CheckCircle2, Send, UserRoundCheck } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../../../shared/components/ui/button'
import {
  allocationHasSessions,
  sectionsMissingTutors,
} from '../lib/allocation-readiness'
import type { TutorAllocationListItem } from '../types/tutor-allocation'

function formatWhen(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function AssignProgramControl({
  isAssigning,
  onAssign,
}: {
  isAssigning: boolean
  onAssign: () => void
}) {
  const [confirmingAssign, setConfirmingAssign] = useState(false)

  return confirmingAssign ? (
    <div className="w-full shrink-0 rounded-3xl bg-white p-4 text-left shadow-lg shadow-ink/15 lg:max-w-xs">
      <p className="text-sm font-bold text-ink">
        Assign this program to the students?
      </p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Each student gets the program and session count from this class. Each
        tutor receives the sessions they will teach.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" disabled={isAssigning} onClick={onAssign}>
          <Check className="size-3.5" />
          {isAssigning ? 'Assigning...' : 'Assign Program to Student'}
        </Button>
        <Button
          size="sm"
          variant="soft"
          disabled={isAssigning}
          onClick={() => setConfirmingAssign(false)}
        >
          Not yet
        </Button>
      </div>
    </div>
  ) : (
    <button
      type="button"
      className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 self-start rounded-full bg-white px-5 text-sm font-semibold text-ink shadow-sm transition hover:bg-ink hover:text-white"
      onClick={() => setConfirmingAssign(true)}
    >
      <Send className="size-4" />
      Assign Program to Student
    </button>
  )
}

function joinNames(names: string[]) {
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

export function TutorAllocationHandoffPanel({
  allocation,
  canAssign,
  isAssigning,
  onAssign,
}: {
  allocation: TutorAllocationListItem
  canAssign: boolean
  isAssigning: boolean
  onAssign: () => void
}) {
  if (!allocation.approved) return null

  if (allocation.programsAssigned) {
    const when = formatWhen(allocation.programsAssignedAt)
    const who = allocation.programsAssignedBy.trim()
    const detail = who
      ? `${who} assigned these programs${when ? ` on ${when}` : ''}.`
      : when
        ? `Assigned on ${when}.`
        : 'Students and tutors have these sessions.'

    return (
      <section className="animate-in fade-in slide-in-from-bottom-2 flex items-start gap-3 rounded-[1.75rem] bg-emerald-50 px-5 py-4 sm:px-6">
        <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600">
          <CheckCircle2 className="size-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-emerald-900">
            Step 3 · Programs assigned
          </h3>
          <p className="mt-0.5 text-sm text-emerald-900/75">
            {detail} Each student has the program and sessions from this
            allocation, and each tutor has received the sessions they will
            teach.
          </p>
        </div>
      </section>
    )
  }

  const missing = sectionsMissingTutors(allocation)
  const hasSessions = allocationHasSessions(allocation)
  // No separate "done" step: a tutor on every section is enough to assign.
  const ready = hasSessions && missing.length === 0

  if (allocation.tutorsAllocated || ready) {
    const when = formatWhen(allocation.tutorsAllocatedAt)
    const who = allocation.tutorsAllocatedBy.trim()
    const detail =
      allocation.tutorsAllocated && who
        ? `${who} assigned the tutors${when ? ` on ${when}` : ''}.`
        : 'Every program in this class has a tutor.'

    return (
      <section
        className={
          canAssign
            ? 'animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-[1.75rem] bg-brand-500 text-white shadow-lg shadow-brand-500/30'
            : 'animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-[1.75rem] bg-white'
        }
      >
        <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={
                canAssign
                  ? 'inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-600'
                  : 'inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600'
              }
            >
              <UserRoundCheck className="size-5" />
            </div>
            <div className="min-w-0">
              <p
                className={
                  canAssign
                    ? 'text-[11px] font-bold tracking-[0.14em] text-white/75 uppercase'
                    : 'text-[11px] font-bold tracking-[0.14em] text-brand-600 uppercase'
                }
              >
                {canAssign ? 'Step 3 · Your turn' : 'Step 2 · Complete'}
              </p>
              <h3
                className={
                  canAssign
                    ? 'mt-0.5 text-base font-bold text-white'
                    : 'mt-0.5 text-base font-bold text-ink'
                }
              >
                {canAssign ? 'Ready to start classes' : 'All tutors assigned'}
              </h3>
              <p
                className={
                  canAssign
                    ? 'mt-0.5 max-w-xl text-sm text-white/80'
                    : 'mt-0.5 max-w-xl text-sm text-slate-600'
                }
              >
                {detail}{' '}
                {canAssign
                  ? 'Assign the program to the students so their sessions can begin.'
                  : "You're all done here. The students' sessions will begin once their counsellor confirms the program."}
              </p>
            </div>
          </div>
          {canAssign ? (
            <AssignProgramControl
              isAssigning={isAssigning}
              onAssign={onAssign}
            />
          ) : null}
        </div>
      </section>
    )
  }

  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-[1.75rem] bg-white">
      <div className="flex min-w-0 items-start gap-3 p-5 sm:p-6">
        <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas text-ink">
          <UserRoundCheck className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">
            Step 2 · Tutors
          </p>
          <h3 className="mt-0.5 text-base font-bold text-ink">
            {canAssign ? 'Waiting for tutors' : 'Tutors needed'}
          </h3>
          <p className="mt-0.5 max-w-xl text-sm text-slate-500">
            {canAssign
              ? !hasSessions
                ? 'This class has no session counts yet. Once sessions and tutors are set, you can assign the program to the students.'
                : `${joinNames(missing)} still ${missing.length === 1 ? 'needs' : 'need'} a tutor. You can assign the program to the students once every part has one.`
              : !hasSessions
                ? 'Enter the number of sessions for each program and choose a tutor for each one, then save.'
                : `Choose a tutor for ${joinNames(missing)}, then save.`}
          </p>
        </div>
      </div>
    </section>
  )
}
