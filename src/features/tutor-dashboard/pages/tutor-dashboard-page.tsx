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
import { TutorAssignedSessions } from '../components/tutor-assigned-sessions'
import { TutorDashboardEarnings } from '../components/tutor-dashboard-earnings'
import { TutorDashboardHero } from '../components/tutor-dashboard-hero'
import {
  TutorDashboardCancellations,
  TutorDashboardGoals,
  TutorDashboardInsights,
} from '../components/tutor-dashboard-insights'
import { TutorBonusCard } from '../components/tutor-dashboard-kpi-grid'
import { TutorDashboardSkeleton } from '../components/tutor-dashboard-skeleton'
import {
  AUTO_BOOKKEEPING_PERIOD,
  useTutorPerformanceQuery,
} from '../hooks/use-tutor-performance-query'
import {
  TUTOR_ANCHORS,
  type TutorPeriodOption,
} from '../types/tutor-dashboard'

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
        <TutorDashboardHero
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

        {isInitialLoading ? <TutorDashboardSkeleton /> : null}

        {showMetrics ? (
          <div
            className={cn(
              'animate-in fade-in slide-in-from-bottom-2 fill-mode-both space-y-3',
              fetchingClass,
            )}
          >
            <DashboardSection id={TUTOR_ANCHORS.teaching} title="Teaching">
              <div className="grid items-stretch gap-3 lg:grid-cols-12">
                <TutorBonusCard
                  metrics={metricsQuery.data}
                  className="lg:col-span-4"
                />
                <TutorDashboardInsights
                  metrics={metricsQuery.data}
                  className="lg:col-span-8"
                />
              </div>
            </DashboardSection>

            <DashboardSection id={TUTOR_ANCHORS.pay} title="Pay">
              <div className="grid items-stretch gap-3 lg:grid-cols-12">
                <TutorDashboardEarnings
                  metrics={metricsQuery.data}
                  className="lg:col-span-7"
                />
                <TutorDashboardGoals
                  metrics={metricsQuery.data}
                  className="lg:col-span-5"
                />
              </div>
            </DashboardSection>
          </div>
        ) : null}

        <DashboardSection id={TUTOR_ANCHORS.classes} title="Classes">
          <div className="grid items-stretch gap-3 lg:grid-cols-12">
            <TutorAssignedSessions
              className={showMetrics ? 'lg:col-span-7' : 'lg:col-span-12'}
            />
            {showMetrics ? (
              <TutorDashboardCancellations
                metrics={metricsQuery.data}
                className="lg:col-span-5"
              />
            ) : null}
          </div>
        </DashboardSection>
      </div>
    </AdminShell>
  )
}
