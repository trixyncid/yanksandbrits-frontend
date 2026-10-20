import { useMemo, useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { ListErrorState } from '../../../shared/components/page'
import { cn } from '../../../shared/lib/cn'
import { AdminShell } from '../../admin/components/admin-shell'
import { DashboardSection } from '../../admin/components/dashboard-section'
import { BookkeepingPeriodSelect } from '../../bookkeeping/components/bookkeeping-period-select'
import {
  OPEN_BOOKKEEPING_PERIOD,
  type BookkeepingPeriodValue,
} from '../../bookkeeping/components/bookkeeping-period'
import type { BookkeepingListItem } from '../../bookkeeping/types/bookkeeping'
import {
  FinanceCollectionsCard,
  FinanceEnrollmentTrend,
  FinancePayCard,
  FinanceQueueCard,
  FinanceVerificationCard,
} from '../components/finance-dashboard-cards'
import { FinanceDashboardHero } from '../components/finance-dashboard-hero'
import {
  AUTO_BOOKKEEPING_PERIOD,
  useFinancePerformanceQuery,
} from '../hooks/use-finance-performance-query'
import {
  FINANCE_ANCHORS,
  type FinancePeriodOption,
} from '../types/finance-dashboard'

function mapPeriodStatus(status: string): BookkeepingListItem['status'] {
  if (status === '1_PD' || status === 'pending') return 'pending'
  if (status === '3_VD' || status === 'void') return 'void'
  return 'approved'
}

function toBookkeepingListItems(periods: FinancePeriodOption[]): BookkeepingListItem[] {
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

function FinanceDashboardSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading your performance">
      {[['lg:col-span-7', 'lg:col-span-5'], ['lg:col-span-5', 'lg:col-span-7']].map(
        (row, rowIndex) => (
          <div key={rowIndex} className="grid gap-3 lg:grid-cols-12">
            {row.map((span) => (
              <div key={span} className={cn('rounded-[1.75rem] bg-white p-5', span)}>
                <div className="h-4 w-40 animate-pulse rounded-full bg-canvas" />
                <div className="mt-5 h-3 animate-pulse rounded-full bg-canvas" />
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="h-16 animate-pulse rounded-3xl bg-canvas/70" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ),
      )}
    </div>
  )
}

export default function FinanceDashboardPage() {
  const [period, setPeriod] = useState<BookkeepingPeriodValue>(AUTO_BOOKKEEPING_PERIOD)
  const [hasUserSelectedPeriod, setHasUserSelectedPeriod] = useState(false)
  const metricsQuery = useFinancePerformanceQuery(period)

  // Adopt the server's default period once, unless the user already picked one.
  if (!hasUserSelectedPeriod && metricsQuery.data && period === AUTO_BOOKKEEPING_PERIOD) {
    setPeriod(toSelectValue(metricsQuery.data.defaultPeriod))
  }

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

  const metrics = metricsQuery.data && !metricsQuery.isError ? metricsQuery.data : undefined

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
        <FinanceDashboardHero metrics={metrics} periodPicker={periodPicker} />

        {metricsQuery.isError ? (
          <ListErrorState
            title="We couldn't load your performance"
            description={getApiErrorMessage(metricsQuery.error)}
            onRetry={() => void metricsQuery.refetch()}
          />
        ) : null}

        {metricsQuery.isLoading && !metricsQuery.data ? <FinanceDashboardSkeleton /> : null}

        {metrics ? (
          <div
            className={cn(
              'animate-in fade-in slide-in-from-bottom-2 fill-mode-both space-y-3',
              metricsQuery.isFetching && 'opacity-70 transition-opacity',
            )}
          >
            <DashboardSection id={FINANCE_ANCHORS.pay} title="Pay">
              <div className="grid items-stretch gap-3 lg:grid-cols-12">
                <FinancePayCard metrics={metrics} className="lg:col-span-7" />
                <FinanceEnrollmentTrend metrics={metrics} className="lg:col-span-5" />
              </div>
            </DashboardSection>

            <DashboardSection id={FINANCE_ANCHORS.work} title="Review work">
              <div className="grid items-stretch gap-3 lg:grid-cols-12">
                <FinanceVerificationCard metrics={metrics} className="lg:col-span-5" />
                <FinanceQueueCard metrics={metrics} className="lg:col-span-7" />
              </div>
            </DashboardSection>

            <DashboardSection id={FINANCE_ANCHORS.money} title="Money in">
              <FinanceCollectionsCard metrics={metrics} />
            </DashboardSection>
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
