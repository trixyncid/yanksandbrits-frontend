import { format, startOfDay } from 'date-fns'
import { Building2, CalendarDays } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import {
  EmptyState,
  ListErrorState,
} from '../../../shared/components/page'
import { cn } from '../../../shared/lib/cn'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import { useDayScheduleQuery } from '../../schedules/hooks/use-day-schedule-query'
import { AdminShell } from '../components/admin-shell'
import { DashboardActionItems } from '../components/dashboard-action-items'
import {
  DashboardFunnel,
  DashboardOperationsCard,
} from '../components/dashboard-insights'
import { DashboardRevenueCard } from '../components/dashboard-kpi-grid'
import {
  DashboardChartSkeleton,
  DashboardInsightsSkeleton,
  DashboardKpiSkeleton,
} from '../components/dashboard-skeleton'
import {
  DashboardCourseInterest,
  DashboardLeadSources,
} from '../components/dashboard-acquisition'
import { DashboardBranchComparison } from '../components/dashboard-branch-comparison'
import {
  DashboardClassroomUtilization,
  DashboardDeliveryOverview,
  DashboardProgramDemand,
  DashboardTutorUtilization,
} from '../components/dashboard-capacity'
import { DashboardMarketingAttribution } from '../components/dashboard-marketing-attribution'
import { DashboardSection } from '../components/dashboard-section'
import { DashboardEnrollmentTrend } from '../components/dashboard-trend-charts'
import { DashboardTimetable } from '../components/dashboard-timetable'
import { DashboardToolbar } from '../components/dashboard-toolbar'
import { useDashboardMetricsQuery } from '../hooks/use-dashboard-metrics-query'
import {
  ALL_BRANCHES_ID,
  DASHBOARD_ANCHORS,
  formatDashboardDateRange,
  getDefaultDashboardDateRange,
  isAllBranches,
} from '../types/dashboard'

export default function DashboardPage() {
  const today = startOfDay(new Date())
  const todayKey = format(today, 'yyyy-MM-dd')

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    getDefaultDashboardDateRange,
  )
  const [branchId, setBranchId] = useState(ALL_BRANCHES_ID)

  const branchesQuery = useBranchesQuery()
  const branches = branchesQuery.data?.data ?? []

  const formattedRange = useMemo(
    () => formatDashboardDateRange(dateRange),
    [dateRange],
  )

  const metricsQuery = useDashboardMetricsQuery({
    branchId,
    startDate: formattedRange?.startDate ?? '',
    endDate: formattedRange?.endDate ?? '',
  })
  const scheduleQuery = useDayScheduleQuery(
    branchId && !isAllBranches(branchId)
      ? { date: todayKey, branchId }
      : null,
  )

  const hasBranch = Boolean(branchId)
  const hasDateRange = Boolean(formattedRange)
  const isInitialLoading =
    hasBranch &&
    hasDateRange &&
    metricsQuery.isLoading &&
    !metricsQuery.data
  const showMetrics =
    hasBranch && hasDateRange && metricsQuery.data && !metricsQuery.isError
  const fetchingClass = metricsQuery.isFetching
    ? 'opacity-70 transition-opacity'
    : ''

  return (
    <AdminShell mainClassName="px-3 pb-6 sm:px-5">
      <div className="space-y-3">
        <DashboardToolbar
          dateRange={dateRange}
          branchId={branchId}
          branches={branches}
          branchesLoading={branchesQuery.isLoading}
          metrics={metricsQuery.data}
          onDateRangeChange={setDateRange}
          onBranchChange={setBranchId}
        />

        {!branchesQuery.isLoading && branches.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Add a branch to see your numbers"
            description="Everything on the dashboard is grouped by branch. Create your first branch, then come back here."
          />
        ) : !hasBranch || !hasDateRange ? (
          <DashboardKpiSkeleton />
        ) : (
          <>
            {isInitialLoading ? (
              <>
                <DashboardKpiSkeleton />
                <DashboardChartSkeleton />
                <DashboardInsightsSkeleton />
              </>
            ) : null}

            {metricsQuery.isError ? (
              <ListErrorState
                title="We couldn't load the dashboard"
                description="Check your connection and try again."
                onRetry={() => void metricsQuery.refetch()}
              />
            ) : null}

            {showMetrics ? (
              <div
                className={cn(
                  'animate-in fade-in slide-in-from-bottom-2 fill-mode-both space-y-3',
                  fetchingClass,
                )}
              >
                <DashboardSection
                  id={DASHBOARD_ANCHORS.money}
                  title="Money"
                >
                  <div className="grid items-stretch gap-3 xl:grid-cols-12">
                    <DashboardRevenueCard
                      metrics={metricsQuery.data}
                      className="xl:col-span-8"
                    />
                    <DashboardActionItems
                      metrics={metricsQuery.data}
                      className="xl:col-span-4"
                    />
                  </div>
                </DashboardSection>

                <DashboardSection
                  id={DASHBOARD_ANCHORS.pipeline}
                  title="Students & classes"
                >
                  <div className="grid items-stretch gap-3 md:grid-cols-2 xl:grid-cols-12">
                    <DashboardEnrollmentTrend
                      metrics={metricsQuery.data}
                      className="xl:col-span-4"
                    />
                    <DashboardFunnel
                      metrics={metricsQuery.data}
                      className="xl:col-span-5"
                    />
                    <DashboardDeliveryOverview
                      metrics={metricsQuery.data}
                      className="md:col-span-2 xl:col-span-3"
                    />
                  </div>
                </DashboardSection>

                <DashboardSection
                  id={DASHBOARD_ANCHORS.capacity}
                  title="Teaching capacity"
                >
                  <div className="grid items-stretch gap-3 md:grid-cols-2 xl:grid-cols-12">
                    <DashboardOperationsCard
                      metrics={metricsQuery.data}
                      className="xl:col-span-4"
                    />
                    <DashboardClassroomUtilization
                      metrics={metricsQuery.data}
                      className="xl:col-span-4"
                    />
                    <DashboardProgramDemand
                      metrics={metricsQuery.data}
                      className="md:col-span-2 xl:col-span-4"
                    />
                    <DashboardTutorUtilization
                      metrics={metricsQuery.data}
                      className="md:col-span-2 xl:col-span-12"
                    />
                  </div>
                </DashboardSection>

                {isAllBranches(branchId) &&
                metricsQuery.data.branchComparison.length > 0 ? (
                  <DashboardSection title="Branches">
                    <DashboardBranchComparison metrics={metricsQuery.data} />
                  </DashboardSection>
                ) : null}

                <DashboardSection
                  id={DASHBOARD_ANCHORS.acquisition}
                  title="Leads"
                >
                  <div className="grid items-stretch gap-3 xl:grid-cols-12">
                    <DashboardLeadSources
                      metrics={metricsQuery.data}
                      className="xl:col-span-6"
                    />
                    <DashboardCourseInterest
                      metrics={metricsQuery.data}
                      className="xl:col-span-6"
                    />
                    <DashboardMarketingAttribution
                      metrics={metricsQuery.data}
                      className="xl:col-span-12"
                    />
                  </div>
                </DashboardSection>
              </div>
            ) : null}

            <DashboardSection title="Today">
              {isAllBranches(branchId) ? (
                <EmptyState
                  icon={CalendarDays}
                  title="Pick a branch to see today's timetable"
                  description="Each branch has its own rooms and schedule. Choose one from the branch filter at the top."
                />
              ) : (
                <DashboardTimetable
                  columns={scheduleQuery.data?.columns ?? []}
                  events={scheduleQuery.data?.events ?? []}
                  branchId={branchId}
                  isLoading={scheduleQuery.isLoading || scheduleQuery.isFetching}
                  dateLabel="Today"
                />
              )}
            </DashboardSection>
          </>
        )}
      </div>
    </AdminShell>
  )
}
