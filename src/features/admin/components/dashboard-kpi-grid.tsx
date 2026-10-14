import { format, parseISO } from 'date-fns'
import { CalendarRange, GraduationCap, Sparkles, Wallet } from 'lucide-react'

import {
  formatCurrencyAmount,
  formatCurrencyCompact,
} from '../../../shared/lib/currency'
import type { DashboardMetrics } from '../types/dashboard'
import {
  DashboardAreaChart,
} from './dashboard-charts'
import { BRAND_CHART } from './dashboard-palette'
import { DashboardChip, DashboardDelta, DashboardFigure } from './dashboard-kit'
import {
  DashboardCardHeader,
  DashboardEmptyState,
  DashboardPanel,
} from './dashboard-section'

function monthLabel(month: string) {
  return format(parseISO(`${month}-01`), 'MMM')
}

/**
 * The money card that leads the dashboard: period revenue, how it splits
 * between tuition and prediction tests, and the six-month trend.
 */
export function DashboardRevenueCard({
  metrics,
  className,
}: {
  metrics: DashboardMetrics
  className?: string
}) {
  const { revenue } = metrics.kpis
  const trend = metrics.trends.revenue.map((item) => ({
    label: monthLabel(item.month),
    value: item.revenue,
  }))
  const hasTrend = trend.some((item) => item.value > 0)
  const split = revenue.studentPayments + revenue.predictionTests
  const tuitionShare =
    split > 0 ? Math.round((revenue.studentPayments / split) * 100) : 0

  return (
    <DashboardPanel variant="plump" className={className}>
      <DashboardCardHeader
        title="Revenue"
        description="Approved tuition and prediction test payments."
        icon={<Wallet className="size-4" />}
        action={
          <DashboardChip icon={CalendarRange} tone="soft">
            Trend: last 6 months
          </DashboardChip>
        }
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500">This period</p>
          <div className="mt-1 flex flex-wrap items-center gap-2.5">
            <DashboardFigure
              className="text-ink"
              title={formatCurrencyAmount(revenue.current)}
              value={formatCurrencyAmount(revenue.current)}
              compactValue={formatCurrencyCompact(revenue.current)}
            />
            <DashboardDelta changePct={revenue.changePct} />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            Previous period{' '}
            <span className="font-semibold text-ink tabular-nums">
              {formatCurrencyCompact(revenue.previous)}
            </span>
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
          <div className="rounded-2xl bg-brand-50 px-3.5 py-2.5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-700">
              <GraduationCap className="size-3.5" />
              Tuition
            </p>
            <p
              className="mt-0.5 text-base font-bold text-ink tabular-nums"
              title={formatCurrencyAmount(revenue.studentPayments)}
            >
              {formatCurrencyCompact(revenue.studentPayments)}
            </p>
          </div>
          <div className="rounded-2xl bg-canvas px-3.5 py-2.5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
              <Sparkles className="size-3.5" />
              Tests
            </p>
            <p
              className="mt-0.5 text-base font-bold text-ink tabular-nums"
              title={formatCurrencyAmount(revenue.predictionTests)}
            >
              {formatCurrencyCompact(revenue.predictionTests)}
            </p>
          </div>
          {split > 0 ? (
            <p className="col-span-2 text-right text-[11px] text-slate-500">
              Tuition is {tuitionShare}% of this period&apos;s revenue
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-2 flex flex-1 flex-col justify-end">
        {hasTrend ? (
          <DashboardAreaChart
            data={trend}
            color={BRAND_CHART.brand500}
            formatTick={formatCurrencyCompact}
          />
        ) : (
          <DashboardEmptyState
            className="mt-4"
            message="No revenue recorded in the last 6 months."
          />
        )}
      </div>
    </DashboardPanel>
  )
}
