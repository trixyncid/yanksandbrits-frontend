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
      <section className="animate-in fade-in slide-in-from-bottom-2 flex items-start gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 px-4 py-4 sm:px-5">
        <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="size-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-emerald-950">Approved</h3>
          <p className="mt-0.5 text-sm text-emerald-900/80">
            {detail} Academic leaders can see this class and assign tutors.
          </p>
        </div>
      </section>
    )
  }

  if (!canApprove) {
    return (
      <section className="animate-in fade-in slide-in-from-bottom-2 flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-4 sm:px-5">
        <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <Clock className="size-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-amber-950">
            Waiting for approval
          </h3>
          <p className="mt-0.5 text-sm text-amber-900/80">
            A branch manager or system admin needs to approve this class before
            an academic leader can see it and assign tutors.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-2xl border border-amber-200/90 bg-amber-50/80 shadow-[0_8px_24px_rgba(180,83,9,0.06)]">
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Clock className="size-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-amber-950">
              This class needs your approval
            </h3>
            <p className="mt-0.5 max-w-xl text-sm text-amber-900/80">
              Look over the students, sessions, and schedule below. Approving
              lets an academic leader see this class and assign tutors.
            </p>
            {facts.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {facts.map((fact) => (
                  <li
                    key={fact}
                    className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-amber-200/80"
                  >
                    {fact}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {confirming ? (
          <div className="w-full shrink-0 rounded-xl border border-amber-200 bg-white p-3 shadow-sm lg:max-w-xs">
            <p className="text-sm font-semibold text-slate-900">
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
                variant="secondary"
                disabled={isApproving}
                onClick={() => setConfirming(false)}
              >
                Not yet
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="sm"
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
