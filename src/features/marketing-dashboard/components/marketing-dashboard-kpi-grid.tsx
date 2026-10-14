import { CircleCheck, CircleDashed, Gauge, WalletCards } from 'lucide-react'

import {
  formatCurrencyAmount,
  formatCurrencyCompact,
} from '../../../shared/lib/currency'
import { cn } from '../../../shared/lib/cn'
import {
  DashboardDonutChart,
  DashboardGauge,
} from '../../admin/components/dashboard-charts'
import { BRAND_CHART } from '../../admin/components/dashboard-palette'
import { DashboardDelta } from '../../admin/components/dashboard-kit'
import {
  DashboardCardHeader,
  DashboardPanel,
} from '../../admin/components/dashboard-section'
import {
  formatCommissionPercentage,
  formatCommissionTierRange,
} from '../../bookkeeping/components/salary-breakdown-parts'
import type { MarketingPerformanceMetrics } from '../types/marketing-dashboard'

/**
 * The marketing dashboard's one dark card: the commission rate, progress
 * through the current tier, and the estimated commission.
 */
export function MarketingCommissionCard({
  metrics,
  className,
}: {
  metrics: MarketingPerformanceMetrics
  className?: string
}) {
  const marketer = metrics.earnings

  if (!marketer) {
    return (
      <DashboardPanel variant="dark" className={cn('relative overflow-hidden', className)}>
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-brand-500/30 blur-3xl"
        />
        <div className="relative flex h-full flex-col">
          <DashboardCardHeader
            inverted
            title="Commission tier"
            description="Ask a manager to set up your marketing salary to see your tier progress."
            icon={<Gauge className="size-4" />}
          />
          <div className="mt-auto rounded-3xl bg-white/8 px-4 py-3">
            <p className="text-[11px] font-medium text-white/55">Your rate</p>
            <p className="mt-0.5 text-lg font-bold">—</p>
          </div>
        </div>
      </DashboardPanel>
    )
  }

  const branchRanges = marketer.branchRanges
  const hasSeparateBranchRanges = branchRanges.length > 1
  const hasTier = marketer.tierMinAmount != null && !hasSeparateBranchRanges
  const tierMin = marketer.tierMinAmount
  const tierMax = marketer.tierMaxAmount
  const rangeAmount = marketer.rangeAmount
  const hasBoundedTier =
    hasTier && tierMin != null && tierMax != null && tierMax > tierMin

  const progressPct = hasBoundedTier
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(((rangeAmount - tierMin) / (tierMax - tierMin)) * 100),
        ),
      )
    : hasTier
      ? rangeAmount >= (tierMin ?? 0)
        ? 100
        : 0
      : 0

  const remainingToTierTop =
    hasBoundedTier && rangeAmount < tierMax ? tierMax - rangeAmount : null

  const subtitle = hasSeparateBranchRanges
    ? `${branchRanges.length} payment branches · each range uses your own tiers`
    : !hasTier
    ? 'No commission tier matches this range yet'
    : remainingToTierTop != null
      ? `${formatCurrencyCompact(remainingToTierTop)} more to top of tier`
      : hasBoundedTier
        ? 'At or above the top of this tier'
        : 'Open-ended tier'

  return (
    <DashboardPanel variant="dark" className={cn('relative overflow-hidden', className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-brand-500/30 blur-3xl"
      />

      <div className="relative flex h-full flex-col">
        <DashboardCardHeader
          inverted
          title="Commission tier"
          description={subtitle}
          icon={<Gauge className="size-4" />}
        />

        <div className="flex items-center gap-5">
          {hasSeparateBranchRanges ? null : (
            <DashboardGauge
              inverted
              value={progressPct}
              size={124}
              strokeWidth={12}
              color={BRAND_CHART.brand300}
              label="of tier"
            />
          )}
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-white/55">Your rate</p>
            <p className="text-4xl leading-none font-bold tracking-tight tabular-nums">
              {hasSeparateBranchRanges
                ? 'Split'
                : formatCommissionPercentage(marketer.commissionPercentage)}
            </p>
            <p className="mt-1.5 text-xs text-white/55">
              {hasSeparateBranchRanges
                ? 'Different rate per branch'
                : 'of completed payment plans'}
            </p>
          </div>
        </div>

        {hasSeparateBranchRanges ? (
          <ul className="mt-5 space-y-1.5">
            {branchRanges.map((branch) => (
              <li
                key={branch.branchId}
                className="flex items-center justify-between gap-3 rounded-3xl bg-white/8 px-4 py-2.5 text-xs"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {branch.branchName}
                  </span>
                  <span className="text-white/55 tabular-nums">
                    <span title={formatCurrencyAmount(branch.rangeAmount)}>
                      {formatCurrencyCompact(branch.rangeAmount)}
                    </span>
                    {' · '}
                    {formatCommissionPercentage(branch.commissionPercentage)}
                  </span>
                </span>
                <span
                  className="shrink-0 text-sm font-bold tabular-nums"
                  title={formatCurrencyAmount(branch.commissionBonus)}
                >
                  {branch.commissionBonus > 0
                    ? formatCurrencyCompact(branch.commissionBonus)
                    : '—'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <dl className="mt-auto grid grid-cols-3 gap-2 pt-5">
            <div className="rounded-2xl bg-white/8 px-3 py-2.5">
              <dt className="text-[11px] font-medium text-white/55">Range</dt>
              <dd
                className="mt-0.5 text-sm font-bold tabular-nums"
                title={formatCurrencyAmount(rangeAmount)}
              >
                {formatCurrencyCompact(rangeAmount)}
              </dd>
            </div>
            <div className="rounded-2xl bg-white/8 px-3 py-2.5">
              <dt className="text-[11px] font-medium text-white/55">Tier top</dt>
              <dd
                className="mt-0.5 truncate text-sm font-bold tabular-nums"
                title={formatCommissionTierRange(tierMin, tierMax)}
              >
                {hasTier
                  ? tierMax != null
                    ? formatCurrencyCompact(tierMax)
                    : `${formatCurrencyCompact(tierMin ?? 0)}+`
                  : '—'}
              </dd>
            </div>
            <div className="rounded-2xl bg-white px-3 py-2.5 text-ink">
              <dt className="text-[11px] font-medium text-slate-500">Est. pay</dt>
              <dd
                className="mt-0.5 text-sm font-bold tabular-nums"
                title={formatCurrencyAmount(marketer.commissionBonus)}
              >
                {marketer.commissionBonus > 0
                  ? formatCurrencyCompact(marketer.commissionBonus)
                  : '—'}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </DashboardPanel>
  )
}

export function MarketingStudentPaymentsCard({
  metrics,
  className,
}: {
  metrics: MarketingPerformanceMetrics
  className?: string
}) {
  const payments = metrics.kpis.studentPayments
  const total = payments.completed + payments.incomplete
  const completedShare =
    total > 0 ? Math.round((payments.completed / total) * 100) : 0

  return (
    <DashboardPanel className={className}>
      <DashboardCardHeader
        title="Student payments"
        description="Payment plans finished vs. still open this period."
        icon={<WalletCards className="size-4" />}
        action={<DashboardDelta changePct={payments.changePct} compact />}
      />

      <div className="flex flex-1 flex-col items-center gap-5 sm:flex-row">
        <DashboardDonutChart
          size={156}
          strokeWidth={18}
          centerValue={total > 0 ? `${completedShare}%` : '—'}
          centerLabel="completed"
          segments={[
            {
              label: 'Completed',
              value: payments.completed,
              color: BRAND_CHART.brand500,
            },
            {
              label: 'Incomplete',
              value: payments.incomplete,
              color: BRAND_CHART.brand200,
            },
          ]}
        />
        <dl className="grid w-full flex-1 gap-2">
          <div className="rounded-3xl bg-brand-50 px-4 py-3">
            <dt className="flex items-center gap-1.5 text-xs font-semibold text-brand-700">
              <span aria-hidden className="size-2.5 rounded-full bg-brand-500" />
              <CircleCheck className="size-3.5" />
              Completed
            </dt>
            <dd className="mt-1 text-2xl leading-none font-bold text-ink tabular-nums">
              {payments.completed.toLocaleString('en-US')}
            </dd>
          </div>
          <div className="rounded-3xl bg-canvas px-4 py-3">
            <dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <span aria-hidden className="size-2.5 rounded-full bg-brand-200" />
              <CircleDashed className="size-3.5" />
              Still open
            </dt>
            <dd className="mt-1 text-2xl leading-none font-bold text-ink tabular-nums">
              {payments.incomplete.toLocaleString('en-US')}
            </dd>
          </div>
        </dl>
      </div>
    </DashboardPanel>
  )
}
