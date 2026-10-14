import { BadgeCheck, Hourglass, Plus, ReceiptText, Wallet } from 'lucide-react'

import {
  HeroPillButton,
  HeroSpotlight,
  PageHero,
} from '../../../shared/components/page'
import { formatCurrencyCompact } from '../../../shared/lib/currency'
import { Can } from '../../auth/components/can'
import { planAmountDue } from '../lib/payment-display'
import type { StudentPaymentListItem } from '../types/student-payment'

type PlanStatusFilter = 'all' | 'incomplete' | 'complete'

function summarize(rows: StudentPaymentListItem[]) {
  let owed = 0
  let collected = 0
  let openPlans = 0
  let paidPlans = 0
  let awaitingApproval = 0

  for (const row of rows) {
    const due = planAmountDue(
      row.fullAmount,
      row.discountAmount,
      row.linkedPredictionTestAmount,
    )
    collected += row.paidAmount
    owed += Math.max(0, due - row.paidAmount)
    if (row.status === 'complete') paidPlans += 1
    else openPlans += 1
    if (row.installmentPlan === 'two' && !row.installmentPlanApproved) {
      awaitingApproval += 1
    }
  }

  return { owed, collected, openPlans, paidPlans, awaitingApproval }
}

export function StudentPaymentHero({
  rows,
  loaded,
  status,
  onStatusChange,
  onAdd,
}: {
  rows: StudentPaymentListItem[]
  loaded: boolean
  status: string
  onStatusChange: (status: PlanStatusFilter) => void
  onAdd: () => void
}) {
  const summary = summarize(rows)
  const show = (value: string | number) => (loaded ? value : '–')
  const plural = (count: number, word: string) =>
    `${count} ${word}${count === 1 ? '' : 's'}`

  return (
    <PageHero
      eyebrow="Money"
      title="Student payments"
      description="Course fees, installments, and what each student still owes."
      theme="dusk"
      pattern="grid"
      stats={[
        {
          id: 'plans',
          label: 'Payment plans',
          value: show(rows.length),
          icon: ReceiptText,
          caption: loaded
            ? status === 'all'
              ? 'All plans'
              : status === 'complete'
                ? 'Fully paid only'
                : 'Still collecting only'
            : undefined,
          hint: 'Show all payment plans',
          active: status === 'all',
          onSelect: () => onStatusChange('all'),
        },
        {
          id: 'owed',
          label: 'Still owed',
          value: show(formatCurrencyCompact(summary.owed)),
          icon: Wallet,
          caption: loaded
            ? `Across ${plural(summary.openPlans, 'open plan')}`
            : undefined,
          hint: 'Show plans that still have money to collect',
          active: status === 'incomplete',
          onSelect: () => onStatusChange('incomplete'),
        },
        {
          id: 'collected',
          label: 'Collected',
          value: show(formatCurrencyCompact(summary.collected)),
          icon: BadgeCheck,
          caption: loaded
            ? `${plural(summary.paidPlans, 'plan')} fully paid`
            : undefined,
          hint: 'Show fully paid plans',
          active: status === 'complete',
          onSelect: () => onStatusChange('complete'),
        },
      ]}
      spotlight={
        <Can module="studentPayments" action="add">
          <HeroSpotlight
            title="Record a payment plan"
            description="Set the fee, then pay in full or split it in two."
            actions={
              <HeroPillButton icon={Plus} onClick={onAdd}>
                Add payment
              </HeroPillButton>
            }
          />
        </Can>
      }
    >
      {loaded && summary.awaitingApproval > 0 ? (
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
          <Hourglass className="size-3.5 text-amber-300" />
          {plural(summary.awaitingApproval, '2-payment plan')}{' '}
          {summary.awaitingApproval === 1 ? 'is' : 'are'} waiting for a
          manager&apos;s approval
        </p>
      ) : null}
    </PageHero>
  )
}
