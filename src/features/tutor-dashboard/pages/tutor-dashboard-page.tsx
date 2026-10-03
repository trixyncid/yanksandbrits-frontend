import { useEffect, useMemo, useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { AdminShell } from '../../admin/components/admin-shell'
import {
  DashboardInsightsSkeleton,
  DashboardKpiSkeleton,
} from '../../admin/components/dashboard-skeleton'
import {
  BookkeepingPeriodSelect,
  OPEN_BOOKKEEPING_PERIOD,
  type BookkeepingPeriodValue,
} from '../../bookkeeping/components/bookkeeping-period-select'
import type { BookkeepingListItem } from '../../bookkeeping/types/bookkeeping'
import { TutorDashboardEarnings } from '../components/tutor-dashboard-earnings'
import {
  TutorDashboardCancellations,
  TutorDashboardInsights,
} from '../components/tutor-dashboard-insights'
import { TutorDashboardKpiGrid } from '../components/tutor-dashboard-kpi-grid'
import {
  AUTO_BOOKKEEPING_PERIOD,
  useTutorPerformanceQuery,
} from '../hooks/use-tutor-performance-query'
import type { TutorPeriodOption } from '../types/tutor-dashboard'

function mapPeriodStatus(
  status: string,
): BookkeepingListItem['status'] {
  if (status === '1_PD' || status === 'pending') return 'pending'
  if (status === '3_VD' || status === 'void') return 'void'
  return 'approved'
}

function toBookkeepingListItems(
  periods: TutorPeriodOption[],
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

export default function TutorDashboardPage() {
  const [period, setPeriod] = useState<BookkeepingPeriodValue>(
    AUTO_BOOKKEEPING_PERIOD,
  )
  const [hasUserSelectedPeriod, setHasUserSelectedPeriod] = useState(false)
  const metricsQuery = useTutorPerformanceQuery(period)

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
              Sessions, reliability, and expected pay for the selected
              bookkeeping period.
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

        {isInitialLoading ? (
          <div className="space-y-4">
            <DashboardKpiSkeleton />
            <DashboardInsightsSkeleton />
          </div>
        ) : null}

        {showMetrics ? (
          <div className={`space-y-4 ${fetchingClass}`}>
            <TutorDashboardKpiGrid metrics={metricsQuery.data} />
            <TutorDashboardInsights metrics={metricsQuery.data} />
            <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
              <div className="lg:col-span-7">
                <TutorDashboardEarnings metrics={metricsQuery.data} />
              </div>
              <div className="lg:col-span-5">
                <TutorDashboardCancellations metrics={metricsQuery.data} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
