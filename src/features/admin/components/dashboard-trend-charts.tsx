import { format, parseISO } from 'date-fns'
import { UserPlus } from 'lucide-react'

import type { DashboardMetrics } from '../types/dashboard'
import { DashboardColumnChart } from './dashboard-charts'
import { DashboardChip, DashboardDelta } from './dashboard-kit'
import {
  DashboardCardHeader,
  DashboardEmptyState,
  DashboardPanel,
} from './dashboard-section'

function monthLabel(month: string) {
  return format(parseISO(`${month}-01`), 'MMM')
}

/** New students per month as rounded columns; the latest month is lit. */
export function DashboardEnrollmentTrend({
  metrics,
  className,
}: {
  metrics: DashboardMetrics
  className?: string
}) {
  const enrollments = metrics.trends.enrollments.map((item) => ({
    label: monthLabel(item.month),
    value: item.enrollments,
  }))
  const hasEnrollments = enrollments.some((item) => item.value > 0)
  const { newEnrollments } = metrics.kpis

  return (
    <DashboardPanel className={className}>
      <DashboardCardHeader
        title="Enrollments"
        description="New students each month."
        icon={<UserPlus className="size-4" />}
        action={<DashboardChip>6 months</DashboardChip>}
      />

      <div className="flex items-center gap-2.5">
        <p className="text-3xl leading-none font-bold tracking-tight text-ink tabular-nums">
          {newEnrollments.current.toLocaleString('en-US')}
        </p>
        <DashboardDelta changePct={newEnrollments.changePct} compact />
      </div>
      <p className="mt-1 text-xs text-slate-500">enrolled in this period</p>

      <div className="mt-4 flex flex-1 flex-col justify-end">
        {hasEnrollments ? (
          <DashboardColumnChart
            data={enrollments}
            highlightIndex={enrollments.length - 1}
            showValueOnHighlight
            className="min-h-[220px]"
          />
        ) : (
          <DashboardEmptyState message="No enrollments recorded in the last 6 months." />
        )}
      </div>
    </DashboardPanel>
  )
}
