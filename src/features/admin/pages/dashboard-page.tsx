import { format, startOfDay } from 'date-fns'
import { Building2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import { useDayScheduleQuery } from '../../schedules/hooks/use-day-schedule-query'
import { AdminShell } from '../components/admin-shell'
import { DashboardActionItems } from '../components/dashboard-action-items'
import {
  DashboardFunnel,
  DashboardOperationsCard,
} from '../components/dashboard-insights'
import { DashboardKpiGrid } from '../components/dashboard-kpi-grid'
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
import { DashboardTrendCharts } from '../components/dashboard-trend-charts'
import { DashboardTimetable } from '../components/dashboard-timetable'
import { DashboardToolbar } from '../components/dashboard-toolbar'
import { useDashboardMetricsQuery } from '../hooks/use-dashboard-metrics-query'
import {
  ALL_BRANCHES_ID,
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
    <AdminShell mainClassName="px-3 py-3 sm:px-4 sm:py-3">
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
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center">
            <div className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-[#E8EEFF] text-[#253CA1]">
              <Building2 className="size-6" />
            </div>
            <p className="mt-3 text-base font-semibold text-slate-900">
              Add a branch to view business metrics
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">
              Dashboard KPIs, trends, and today&apos;s timetable are scoped to a
              branch. Create a branch first, then return here.
            </p>
          </div>
        ) : !hasBranch || !hasDateRange ? (
          <DashboardKpiSkeleton />
        ) : (
          <>
            {isInitialLoading ? (
              <DashboardKpiSkeleton />
            ) : metricsQuery.isError ? (
              <div className="rounded-xl border border-rose-100 bg-rose-50/70 px-4 py-6 text-center">
                <p className="text-sm font-semibold text-rose-700">
                  Unable to load business metrics.
                </p>
                <p className="mt-1 text-sm text-rose-600">
                  Check your connection and try again.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => void metricsQuery.refetch()}
                >
                  Try again
                </Button>
              </div>
            ) : showMetrics ? (
              <div className={cn('space-y-3', fetchingClass)}>
                <DashboardKpiGrid metrics={metricsQuery.data} />

                <DashboardSection title="Needs attention">
                  <DashboardActionItems metrics={metricsQuery.data} />
                </DashboardSection>
              </div>
            ) : null}

            {isInitialLoading ? (
              <>
                <DashboardSection title="Performance">
                  <DashboardChartSkeleton />
                </DashboardSection>
                <DashboardSection title="Pipeline & delivery">
                  <DashboardInsightsSkeleton />
                </DashboardSection>
              </>
            ) : null}

            {showMetrics ? (
              <div className={cn('space-y-3', fetchingClass)}>
                <DashboardSection title="Performance">
                  <DashboardTrendCharts metrics={metricsQuery.data} />
                </DashboardSection>

                <DashboardSection title="Pipeline & delivery">
                  <div className="grid items-stretch gap-2 xl:grid-cols-12">
                    <DashboardFunnel
                      metrics={metricsQuery.data}
                      className="xl:col-span-5"
                    />
                    <DashboardOperationsCard
                      metrics={metricsQuery.data}
                      className="xl:col-span-4"
                    />
                    <DashboardDeliveryOverview
                      metrics={metricsQuery.data}
                      className="xl:col-span-3"
                    />
                  </div>
                </DashboardSection>

                <DashboardSection title="Operations & capacity">
                  <div className="grid items-stretch gap-2 xl:grid-cols-2">
                    <DashboardProgramDemand metrics={metricsQuery.data} />
                    <DashboardClassroomUtilization metrics={metricsQuery.data} />
                  </div>
                  <div className="mt-2">
                    <DashboardTutorUtilization metrics={metricsQuery.data} />
                  </div>
                </DashboardSection>

                {isAllBranches(branchId) &&
                metricsQuery.data.branchComparison.length > 0 ? (
                  <DashboardSection title="Locations">
                    <DashboardBranchComparison metrics={metricsQuery.data} />
                  </DashboardSection>
                ) : null}

                <DashboardSection title="Acquisition">
                  <div className="grid items-stretch gap-2 xl:grid-cols-12">
                    <DashboardLeadSources
                      metrics={metricsQuery.data}
                      className="xl:col-span-5"
                    />
                    <DashboardCourseInterest
                      metrics={metricsQuery.data}
                      className="xl:col-span-7"
                    />
                  </div>
                  <div className="mt-2">
                    <DashboardMarketingAttribution metrics={metricsQuery.data} />
                  </div>
                </DashboardSection>
              </div>
            ) : null}

            {isAllBranches(branchId) ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  Select a branch to view today&apos;s timetable
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  The schedule is branch-specific. Choose a branch from the
                  filter above.
                </p>
              </div>
            ) : (
              <DashboardTimetable
                columns={scheduleQuery.data?.columns ?? []}
                events={scheduleQuery.data?.events ?? []}
                branchId={branchId}
                isLoading={scheduleQuery.isLoading || scheduleQuery.isFetching}
                dateLabel="Today"
              />
            )}
          </>
        )}
      </div>
    </AdminShell>
  )
}
