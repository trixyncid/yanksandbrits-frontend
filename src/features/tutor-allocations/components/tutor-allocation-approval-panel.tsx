import { Check, CheckCircle2, Clock } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { sessionsPerWeekLabel } from '../../prediction-tests/lib/schedule'
import { programLabel } from '../lib/programs'
import type { TutorAllocationListItem } from '../types/tutor-allocation'

function formatApprovedAt(value: string) {
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

function classSummary(allocation: TutorAllocationListItem) {
  const names = allocation.members
    .map((member) => member.studentName)
    .filter(Boolean)
  const type =
    allocation.classType === 'private'
      ? 'Private'
      : `Group of ${allocation.groupSize}`
  const facts = [
    type,
    allocation.program ? programLabel(allocation.program) : '',
    names.length > 0 ? names.join(', ') : '',
    allocation.sessionsPerWeek
      ? sessionsPerWeekLabel(allocation.sessionsPerWeek)
      : '',
    allocation.branchName,
  ].filter(Boolean)
  return facts
}

export function TutorAllocationApprovalPanel({
  allocation,
  canApprove,
  isApproving,
  onApprove,
}: {
  allocation: TutorAllocationListItem
  canApprove: boolean
  isApproving: boolean
  onApprove: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const facts = classSummary(allocation)

  if (allocation.approved) {
    const when = formatApprovedAt(allocation.approvedAt)
    const who = allocation.approvedBy.trim()
    const detail = who
      ? `${who} approved this class${when ? ` on ${when}` : ''}.`
      : when
        ? `Approved on ${when}.`
        : 'This class is approved.'

    return (
      <section className="animate-in fade-in slide-in-from-bottom-2 flex items-start gap-3 rounded-[1.75rem] bg-white px-5 py-4 sm:px-6">
        <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-ink">Step 1 · Approved</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            {detail} Academic leaders can see this class and assign tutors.
          </p>
        </div>
      </section>
    )
  }

  if (!canApprove) {
    return (
      <section className="animate-in fade-in slide-in-from-bottom-2 flex items-start gap-3 rounded-[1.75rem] bg-amber-50 px-5 py-4 sm:px-6">
        <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-amber-600">
          <Clock className="size-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-amber-900">
            Step 1 · Waiting for approval
          </h3>
          <p className="mt-0.5 text-sm text-amber-900/75">
            A branch manager or system admin needs to approve this class before
            an academic leader can see it and assign tutors.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-[1.75rem] bg-amber-50 ring-1 ring-amber-200/70">
      <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-amber-600">
            <Clock className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.14em] text-amber-700 uppercase">
              Step 1 · Your turn
            </p>
            <h3 className="mt-0.5 text-base font-bold text-ink">
              This class needs your approval
            </h3>
            <p className="mt-0.5 max-w-xl text-sm text-slate-600">
              Look over the students, sessions, and schedule below. Approving
              lets an academic leader see this class and assign tutors.
            </p>
            {facts.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {facts.map((fact) => (
                  <li
                    key={fact}
                    className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink"
                  >
                    {fact}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {confirming ? (
          <div className="w-full shrink-0 rounded-3xl bg-white p-4 shadow-lg shadow-ink/15 lg:max-w-xs">
            <p className="text-sm font-bold text-ink">
              Approve this class?
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Academic leaders will be able to open it and assign tutors. You
              can still edit the class afterward.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={isApproving}
                onClick={onApprove}
              >
                <Check className="size-3.5" />
                {isApproving ? 'Approving...' : 'Approve class'}
              </Button>
              <Button
                size="sm"
                variant="soft"
                disabled={isApproving}
                onClick={() => setConfirming(false)}
              >
                Not yet
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ink"
            className="shrink-0 self-start"
            onClick={() => setConfirming(true)}
          >
            <Check className="size-3.5" />
            Review and approve
          </Button>
        )}
      </div>
    </section>
  )
}
