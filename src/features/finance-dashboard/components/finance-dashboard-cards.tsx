import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  BarChart3,
  Clock3,
  History,
  Inbox,
  Timer,
  Wallet,
} from 'lucide-react'

import {
  formatCurrencyAmount,
  formatCurrencyCompact,
} from '../../../shared/lib/currency'
import { cn } from '../../../shared/lib/cn'
import { DashboardColumnChart } from '../../admin/components/dashboard-charts'
import {
  DashboardChip,
  DashboardDelta,
  DashboardFigure,
  DashboardStackedBar,
  DashboardSwatch,
} from '../../admin/components/dashboard-kit'
import { BRAND_CHART } from '../../admin/components/dashboard-palette'
import {
  DashboardCardHeader,
  DashboardEmptyState,
  DashboardPanel,
} from '../../admin/components/dashboard-section'
import type {
  FinancePendingQueue,
  FinancePerformanceMetrics,
} from '../types/finance-dashboard'

type CardProps = { metrics: FinancePerformanceMetrics; className?: string }

function plural(count: number, word: string) {
  return `${count.toLocaleString('en-US')} ${word}${count === 1 ? '' : 's'}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function formatHours(hours: number) {
  if (hours < 24) return `${hours.toLocaleString('en-US', { maximumFractionDigits: 1 })}h`
  const days = hours / 24
  return `${days.toLocaleString('en-US', { maximumFractionDigits: 1 })}d`
}

/** Percent change where a drop is the improvement (turnaround time). */
function turnaroundChange(current: number | null, previous: number | null) {
  if (current == null || previous == null || previous === 0) return null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

export function FinancePayCard({ metrics, className }: CardProps) {
  const { earnings, kpis } = metrics
  const rows = [
    {
      label: 'Base salary',
      amount: earnings.mainSalary,
      hint: null as string | null,
      accent: BRAND_CHART.brand900,
    },
    {
      label: 'New student commission',
      amount: earnings.commissionSalary,
      hint: `${plural(earnings.enrollmentCount, 'new student')} × ${formatCurrencyAmount(earnings.commissionFee)}`,
      accent: BRAND_CHART.brand400,
    },
  ]

  return (
    <DashboardPanel variant="plump" className={className}>
      <DashboardCardHeader
        title="How your pay adds up"
        description={
          earnings.isSaved
            ? 'Saved when this bookkeeping period was approved.'
            : 'Estimated so far. It updates as new students enroll.'
        }
        icon={<Wallet className="size-4" />}
        action={
          <DashboardChip tone="ink">
            {formatCurrencyAmount(earnings.expectedSalary)}
          </DashboardChip>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        <DashboardChip icon={History}>
          Last period {formatCurrencyCompact(kpis.expectedPay.previous)}
        </DashboardChip>
        <DashboardDelta changePct={kpis.expectedPay.changePct} />
      </div>

      <DashboardStackedBar
        segments={rows.map((row) => ({
          label: row.label,
          value: Math.max(row.amount, 0),
          color: row.accent,
        }))}
        formatValue={formatCurrencyAmount}
      />

      <dl className="mt-4 grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-3 rounded-3xl bg-canvas/70 px-4 py-3"
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <DashboardSwatch color={row.accent} className="mt-1.5" />
              <div className="min-w-0">
                <dt className="text-sm font-semibold text-ink">{row.label}</dt>
                {row.hint ? (
                  <p className="mt-0.5 text-xs leading-snug text-slate-500">{row.hint}</p>
                ) : null}
              </div>
            </div>
            <dd className="shrink-0 text-sm font-bold text-ink tabular-nums">
              {formatCurrencyAmount(row.amount)}
            </dd>
          </div>
        ))}
      </dl>

      {earnings.isSaved && earnings.enrollmentCount !== kpis.newStudents.current ? (
        <p className="mt-3 rounded-2xl bg-amber-50 px-3.5 py-2.5 text-xs leading-snug text-amber-900">
          Pay was saved for {plural(earnings.enrollmentCount, 'new student')}, but{' '}
          {plural(kpis.newStudents.current, 'student')} enrolled in this period. The
          period may have been approved before the commission started, or students
          were added afterwards.
        </p>
      ) : null}
    </DashboardPanel>
  )
}

export function FinanceEnrollmentTrend({ metrics, className }: CardProps) {
  const data = metrics.enrollmentTrend.map((week) => ({
    label: week.label.replace(/–.*/, '').trim(),
    value: week.enrollments,
  }))
  const hasEnrollments = data.some((week) => week.value > 0)
  let peak = 0
  data.forEach((week, index) => {
    if (week.value >= data[peak].value) peak = index
  })

  return (
    <DashboardPanel variant="plump" className={className}>
      <DashboardCardHeader
        title="New students each week"
        description="Prospective students who enrolled. Each one earns you commission."
        icon={<BarChart3 className="size-4" />}
        action={
          hasEnrollments ? (
            <DashboardChip tone="brand">
              Busiest {data[peak]?.label}: {data[peak]?.value}
            </DashboardChip>
          ) : null
        }
      />
      <div className="flex flex-1 flex-col justify-end">
        {hasEnrollments ? (
          <DashboardColumnChart
            data={data}
            highlightIndex={peak}
            showValueOnHighlight
            className="min-h-[220px]"
          />
        ) : (
          <DashboardEmptyState message="No new students yet this period. Enrollments show up here week by week." />
        )}
      </div>
    </DashboardPanel>
  )
}

export function FinanceVerificationCard({ metrics, className }: CardProps) {
  const { verification, kpis } = metrics
  const turnaroundDelta = turnaroundChange(
    verification.avgTurnaroundHours,
    verification.previousAvgTurnaroundHours,
  )

  return (
    <DashboardPanel variant="dark" className={className}>
      <DashboardCardHeader
        title="Payments you verified"
        description="Installments and prediction-test fees you approved."
        icon={<BadgeCheck className="size-4" />}
        inverted
      />

      <div className="flex items-end justify-between gap-3">
        <DashboardFigure value={kpis.paymentsVerified.current.toLocaleString('en-US')} />
        <DashboardDelta changePct={kpis.paymentsVerified.changePct} inverted />
      </div>
      <p className="mt-1 text-xs text-white/60">
        Worth {formatCurrencyAmount(verification.amount)}
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white/8 px-3.5 py-3">
          <dt className="text-[11px] text-white/60">Installments</dt>
          <dd className="mt-0.5 text-lg font-bold tabular-nums">
            {verification.installments.toLocaleString('en-US')}
          </dd>
        </div>
        <div className="rounded-2xl bg-white/8 px-3.5 py-3">
          <dt className="text-[11px] text-white/60">Prediction tests</dt>
          <dd className="mt-0.5 text-lg font-bold tabular-nums">
            {verification.predictionTests.toLocaleString('en-US')}
          </dd>
        </div>
        <div className="col-span-2 flex items-center justify-between gap-3 rounded-2xl bg-white/8 px-3.5 py-3">
          <div className="flex items-center gap-2">
            <Timer className="size-4 text-white/60" />
            <div>
              <dt className="text-[11px] text-white/60">Average time to approve</dt>
              <dd className="mt-0.5 text-lg font-bold tabular-nums">
                {verification.avgTurnaroundHours == null
                  ? '–'
                  : formatHours(verification.avgTurnaroundHours)}
              </dd>
            </div>
          </div>
          {turnaroundDelta != null ? (
            <DashboardDelta changePct={turnaroundDelta} lowerIsBetter inverted compact />
          ) : null}
        </div>
      </dl>

      <p className="mt-4 text-[11px] leading-snug text-white/50">
        {verification.trackingSince
          ? `Approvals are counted from ${formatDate(verification.trackingSince)}, when approval tracking started.`
          : 'Approval tracking starts with the next payment approved, so earlier approvals are not counted.'}
      </p>
    </DashboardPanel>
  )
}

function QueueRow({
  label,
  queue,
  staleAfterDays,
  to,
}: {
  label: string
  queue: FinancePendingQueue
  staleAfterDays: number
  to: '/student-payments' | '/prediction-tests'
}) {
  const hasStale = queue.staleCount > 0
  return (
    <li className="rounded-3xl bg-canvas/70 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{label}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {queue.count === 0
              ? 'Nothing waiting'
              : `${plural(queue.count, 'payment')} · ${formatCurrencyAmount(queue.amount)}`}
          </p>
        </div>
        {queue.count > 0 ? (
          <Link
            to={to}
            className="shrink-0 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
          >
            Review
          </Link>
        ) : null}
      </div>
      {queue.count > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {queue.oldestDays != null ? (
            <DashboardChip icon={Clock3}>
              Oldest {queue.oldestDays === 0 ? 'today' : `${plural(queue.oldestDays, 'day')} ago`}
            </DashboardChip>
          ) : null}
          {hasStale ? (
            <DashboardChip icon={AlertTriangle} className="bg-amber-50 text-amber-800">
              {queue.staleCount} waiting over {staleAfterDays} days
            </DashboardChip>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}

export function FinanceQueueCard({ metrics, className }: CardProps) {
  const { queue } = metrics
  const total = queue.installments.count + queue.predictionTests.count
  return (
    <DashboardPanel variant="plump" className={className}>
      <DashboardCardHeader
        title="Waiting for review"
        description="Pending payments right now, whichever period you pick."
        icon={<Inbox className="size-4" />}
        action={<DashboardChip tone={total > 0 ? 'brand' : 'soft'}>{total} pending</DashboardChip>}
      />
      <ul className="space-y-2">
        <QueueRow
          label="Student installments"
          queue={queue.installments}
          staleAfterDays={queue.staleAfterDays}
          to="/student-payments"
        />
        <QueueRow
          label="Prediction-test fees"
          queue={queue.predictionTests}
          staleAfterDays={queue.staleAfterDays}
          to="/prediction-tests"
        />
      </ul>
    </DashboardPanel>
  )
}

export function FinanceCollectionsCard({ metrics, className }: CardProps) {
  const { collections, kpis } = metrics
  const settled = collections.installments + collections.voidedInstallments
  const voidRate = settled > 0 ? Math.round((collections.voidedInstallments / settled) * 100) : 0

  return (
    <DashboardPanel variant="plump" className={className}>
      <DashboardCardHeader
        title="Tuition collected"
        description="Approved installments paid in this period."
        icon={<Banknote className="size-4" />}
      />
      <div className="flex items-end justify-between gap-3">
        <DashboardFigure
          value={formatCurrencyAmount(collections.amount)}
          compactValue={formatCurrencyCompact(collections.amount)}
        />
        <DashboardDelta changePct={kpis.tuitionCollected.changePct} />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Last period {formatCurrencyAmount(kpis.tuitionCollected.previous)}
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-canvas/70 px-3.5 py-3">
          <dt className="text-[11px] text-slate-500">Installments approved</dt>
          <dd className="mt-0.5 text-lg font-bold text-ink tabular-nums">
            {collections.installments.toLocaleString('en-US')}
          </dd>
        </div>
        <div
          className={cn(
            'rounded-2xl px-3.5 py-3',
            collections.voidedInstallments > 0 ? 'bg-rose-50' : 'bg-canvas/70',
          )}
        >
          <dt className="text-[11px] text-slate-500">Voided</dt>
          <dd className="mt-0.5 text-lg font-bold text-ink tabular-nums">
            {collections.voidedInstallments.toLocaleString('en-US')}
            {settled > 0 ? (
              <span className="ml-1 text-xs font-medium text-slate-500">({voidRate}%)</span>
            ) : null}
          </dd>
        </div>
      </dl>
    </DashboardPanel>
  )
}
