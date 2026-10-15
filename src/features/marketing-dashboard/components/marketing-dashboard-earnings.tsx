import { Wallet } from 'lucide-react'

import { formatCurrencyAmount } from '../../../shared/lib/currency'
import { BRAND_CHART } from '../../admin/components/dashboard-palette'
import {
  DashboardChip,
  DashboardStackedBar,
  DashboardSwatch,
} from '../../admin/components/dashboard-kit'
import {
  DashboardCardHeader,
  DashboardEmptyState,
  DashboardPanel,
} from '../../admin/components/dashboard-section'
import {
  formatCommissionPercentage,
  periodTypeLabel,
} from '../../bookkeeping/components/salary-breakdown-format'
import type { SalaryBreakdownMarketer } from '../../bookkeeping/types/bookkeeping'
import type { MarketingPerformanceMetrics } from '../types/marketing-dashboard'

function commissionRateLabel(marketer: SalaryBreakdownMarketer) {
  if (marketer.branchRanges.length > 1) {
    return `${marketer.branchRanges.length} branch rates`
  }
  return formatCommissionPercentage(marketer.commissionPercentage)
}

function commissionHint(marketer: SalaryBreakdownMarketer) {
  if (marketer.branchRanges.length > 1) {
    return marketer.branchRanges
      .map(
        (branch) =>
          `${branch.branchName} ${formatCommissionPercentage(branch.commissionPercentage)}`,
      )
      .join(' · ')
  }
  return `${formatCommissionPercentage(marketer.commissionPercentage)} of completed plans`
}

function buildPayRows(marketer: SalaryBreakdownMarketer) {
  return [
    {
      label: 'Base salary',
      amount: marketer.mainSalary,
      hint: null as string | null,
      accent: BRAND_CHART.brand900,
    },
    {
      label: 'Commission',
      amount: marketer.commissionBonus,
      hint: commissionHint(marketer),
      accent: BRAND_CHART.brand700,
    },
    {
      label: 'Tier bonus',
      amount: marketer.tierBonus,
      hint: 'Flat bonus for this payment range',
      accent: BRAND_CHART.brand500,
    },
    {
      label: 'Tele Marketing fees',
      amount: marketer.consultTotal,
      hint: `${marketer.consultCount} Tele Marketing`,
      accent: BRAND_CHART.brand400,
    },
    {
      label: 'Enrollment add-ons',
      amount: marketer.enrollmentTotal,
      hint: `${marketer.enrollmentCount} enrollment${marketer.enrollmentCount === 1 ? '' : 's'}`,
      accent: BRAND_CHART.brand300,
    },
    {
      label: 'SPIF',
      amount: marketer.spifTotal,
      hint: `${marketer.spifProspectCount} prospect${
        marketer.spifProspectCount === 1 ? '' : 's'
      } · every ${
        marketer.spifThreshold || (marketer.periodType === '5W' ? 6 : 5)
      } → 100k`,
      accent: BRAND_CHART.brand200,
    },
  ]
}

export function MarketingDashboardEarnings({
  metrics,
}: {
  metrics: MarketingPerformanceMetrics
}) {
  const { earnings, earningsMeta } = metrics

  if (!earnings) {
    return (
      <DashboardPanel>
        <DashboardCardHeader
          title="How your pay adds up"
          icon={<Wallet className="size-4" />}
        />
        <DashboardEmptyState message="You don't have a salary profile yet. Ask a manager to set up your marketing salary to see expected pay here." />
      </DashboardPanel>
    )
  }

  const rows = buildPayRows(earnings)

  return (
    <DashboardPanel variant="plump">
      <DashboardCardHeader
        title="How your pay adds up"
        description={`${earningsMeta.period}${earningsMeta.isOpenPeriod ? ' · estimate while the period is open' : ''} · ${periodTypeLabel(earnings.periodType)} tiers · rate ${commissionRateLabel(earnings)}`}
        icon={<Wallet className="size-4" />}
        action={
          <DashboardChip tone="ink">
            {formatCurrencyAmount(earnings.expectedSalary)}
          </DashboardChip>
        }
      />

      <DashboardStackedBar
        segments={rows.map((row) => ({
          label: row.label,
          value: Math.max(row.amount, 0),
          color: row.accent,
        }))}
        formatValue={formatCurrencyAmount}
      />

      <dl className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
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
                  <p className="mt-0.5 text-xs leading-snug text-slate-500">
                    {row.hint}
                  </p>
                ) : null}
              </div>
            </div>
            <dd className="shrink-0 text-sm font-bold text-ink tabular-nums">
              {formatCurrencyAmount(row.amount)}
            </dd>
          </div>
        ))}
      </dl>
    </DashboardPanel>
  )
}
