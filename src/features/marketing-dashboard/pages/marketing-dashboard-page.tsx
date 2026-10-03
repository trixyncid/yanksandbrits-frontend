import { useEffect, useMemo, useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { AdminShell } from '../../admin/components/admin-shell'
import {
  BookkeepingPeriodSelect,
  OPEN_BOOKKEEPING_PERIOD,
  type BookkeepingPeriodValue,
} from '../../bookkeeping/components/bookkeeping-period-select'
import type { BookkeepingListItem } from '../../bookkeeping/types/bookkeeping'
import { MarketingDashboardEarnings } from '../components/marketing-dashboard-earnings'
import {
  MarketingDashboardFunnel,
  MarketingDashboardGoals,
} from '../components/marketing-dashboard-funnel'
import { MarketingDashboardKpiGrid } from '../components/marketing-dashboard-kpi-grid'
import { MarketingDashboardLeadSources } from '../components/marketing-dashboard-lead-sources'
import { MarketingDashboardSkeleton } from '../components/marketing-dashboard-skeleton'
import {
  AUTO_BOOKKEEPING_PERIOD,
  useMarketingPerformanceQuery,
} from '../hooks/use-marketing-performance-query'
import type { MarketingPeriodOption } from '../types/marketing-dashboard'

function mapPeriodStatus(
  status: string,
): BookkeepingListItem['status'] {
  if (status === '1_PD' || status === 'pending') return 'pending'
  if (status === '3_VD' || status === 'void') return 'void'
  return 'approved'
}

function toBookkeepingListItems(
  periods: MarketingPeriodOption[],
): BookkeepingListItem[] {
  return periods.map((period) => ({
    id: period.id,
    startDate: period.startDate,
    endDate: period.endDate,
    status: mapPeriodStatus(period.status),
    title: period.title,
    branchId: null,
    branchName: '',
    createdAt: '',
    updatedAt: '',
    createdBy: '',
  }))
}

function toSelectValue(defaultPeriod: string): BookkeepingPeriodValue {
  return defaultPeriod === 'open' || !defaultPeriod
    ? OPEN_BOOKKEEPING_PERIOD
    : defaultPeriod
}

export default function MarketingDashboardPage() {
  const [period, setPeriod] = useState<BookkeepingPeriodValue>(
    AUTO_BOOKKEEPING_PERIOD,
  )
  const [hasUserSelectedPeriod, setHasUserSelectedPeriod] = useState(false)
  const metricsQuery = useMarketingPerformanceQuery(period)

  useEffect(() => {
    if (hasUserSelectedPeriod || !metricsQuery.data) return
    if (period !== AUTO_BOOKKEEPING_PERIOD) return
    setPeriod(toSelectValue(metricsQuery.data.defaultPeriod))
  }, [hasUserSelectedPeriod, metricsQuery.data, period])

  const periods = useMemo(
    () => toBookkeepingListItems(metricsQuery.data?.availablePeriods ?? []),
    [metricsQuery.data?.availablePeriods],
  )

  const selectValue =
    period === AUTO_BOOKKEEPING_PERIOD && metricsQuery.data
      ? toSelectValue(metricsQuery.data.defaultPeriod)
      : period === AUTO_BOOKKEEPING_PERIOD
        ? OPEN_BOOKKEEPING_PERIOD
        : period

  const isInitialLoading = metricsQuery.isLoading && !metricsQuery.data
  const showMetrics = metricsQuery.data && !metricsQuery.isError
  const fetchingClass = metricsQuery.isFetching
    ? 'opacity-70 transition-opacity'
    : ''

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
              Performance Overview
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Leads, consults, and expected pay for the selected bookkeeping
              period.
            </p>
            {showMetrics && metricsQuery.data.period.label ? (
              <p className="mt-2 text-xs text-slate-400 sm:text-sm">
                Showing{' '}
                <span className="font-semibold text-slate-600">
                  {metricsQuery.data.period.label}
                </span>
                {metricsQuery.data.comparisonPeriod.label
                  ? ` · vs ${metricsQuery.data.comparisonPeriod.label}`
                  : null}
                {metricsQuery.data.period.periodType
                  ? ` · ${metricsQuery.data.period.periodType} tiers`
                  : null}
              </p>
            ) : null}
          </div>
          <BookkeepingPeriodSelect
            variant="pill"
            value={selectValue}
            periods={periods}
            openPeriodLabel="This period"
            disabled={metricsQuery.isLoading && !metricsQuery.data}
            onChange={(next) => {
              setHasUserSelectedPeriod(true)
              setPeriod(next)
            }}
          />
        </div>

        {metricsQuery.isError ? (
          <div className="rounded-3xl border border-rose-200/80 bg-rose-50/60 px-4 py-8 text-center">
            <p className="text-sm font-semibold text-rose-700">
              Unable to load your performance metrics
            </p>
            <p className="mt-1 text-sm text-rose-600/80">
              {getApiErrorMessage(metricsQuery.error)}
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={() => void metricsQuery.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : null}

        {isInitialLoading ? <MarketingDashboardSkeleton /> : null}

        {showMetrics ? (
          <div className={`space-y-4 ${fetchingClass}`}>
            <MarketingDashboardKpiGrid metrics={metricsQuery.data} />
            <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
              <MarketingDashboardFunnel
                metrics={metricsQuery.data}
                className="lg:col-span-7"
              />
              <MarketingDashboardGoals
                metrics={metricsQuery.data}
                className="lg:col-span-5"
              />
            </div>
            <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
              <div className="lg:col-span-7">
                <MarketingDashboardEarnings metrics={metricsQuery.data} />
              </div>
              <div className="lg:col-span-5">
                <MarketingDashboardLeadSources metrics={metricsQuery.data} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
