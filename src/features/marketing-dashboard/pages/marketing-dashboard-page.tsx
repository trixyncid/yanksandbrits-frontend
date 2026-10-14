import { useEffect, useMemo, useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { ListErrorState } from '../../../shared/components/page'
import { cn } from '../../../shared/lib/cn'
import { AdminShell } from '../../admin/components/admin-shell'
import { DashboardSection } from '../../admin/components/dashboard-section'
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
import { MarketingDashboardHero } from '../components/marketing-dashboard-hero'
import {
  MarketingCommissionCard,
  MarketingStudentPaymentsCard,
} from '../components/marketing-dashboard-kpi-grid'
import { MarketingDashboardSkeleton } from '../components/marketing-dashboard-skeleton'
import {
  AUTO_BOOKKEEPING_PERIOD,
  useMarketingPerformanceQuery,
} from '../hooks/use-marketing-performance-query'
import {
  MARKETING_ANCHORS,
  type MarketingPeriodOption,
} from '../types/marketing-dashboard'
import { TeamRangeCard } from '../../bookkeeping/components/team-range-card'

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

  const periodPicker = (
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
  )

  return (
    <AdminShell mainClassName="px-3 pb-6 sm:px-5">
      <div className="space-y-3">
        <MarketingDashboardHero
          metrics={showMetrics ? metricsQuery.data : undefined}
          periodPicker={periodPicker}
        />

        {metricsQuery.isError ? (
          <ListErrorState
            title="We couldn't load your performance"
            description={getApiErrorMessage(metricsQuery.error)}
            onRetry={() => void metricsQuery.refetch()}
          />
        ) : null}

        {isInitialLoading ? <MarketingDashboardSkeleton /> : null}

        {showMetrics ? (
          <div
            className={cn(
              'animate-in fade-in slide-in-from-bottom-2 fill-mode-both space-y-3',
              fetchingClass,
            )}
          >
            <DashboardSection id={MARKETING_ANCHORS.funnel} title="Pipeline">
              <div className="grid items-stretch gap-3 lg:grid-cols-12">
                <MarketingDashboardFunnel
                  metrics={metricsQuery.data}
                  className="lg:col-span-7"
                />
                <MarketingCommissionCard
                  metrics={metricsQuery.data}
                  className="lg:col-span-5"
                />
              </div>
            </DashboardSection>

            <DashboardSection id={MARKETING_ANCHORS.goals} title="Progress">
              <div className="grid items-stretch gap-3 lg:grid-cols-12">
                <MarketingDashboardGoals
                  metrics={metricsQuery.data}
                  className="lg:col-span-7"
                />
                <MarketingStudentPaymentsCard
                  metrics={metricsQuery.data}
                  className="lg:col-span-5"
                />
              </div>
            </DashboardSection>

            <DashboardSection id={MARKETING_ANCHORS.pay} title="Pay">
              {metricsQuery.data.earnings?.teamRange ? (
                <TeamRangeCard
                  teamRange={metricsQuery.data.earnings.teamRange}
                  className="mb-3"
                />
              ) : null}
              <MarketingDashboardEarnings metrics={metricsQuery.data} />
            </DashboardSection>
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
