import { format, parseISO } from 'date-fns'

import { formatCurrencyCompact } from '../../../shared/lib/currency'
import type { DashboardMetrics } from '../types/dashboard'
import { DashboardAreaChart, DashboardColumnChart } from './dashboard-charts'
import {
  DashboardCardHeader,
  DashboardEmptyState,
  DashboardPanel,
} from './dashboard-section'

function monthLabel(month: string) {
  return format(parseISO(`${month}-01`), 'MMM')
}

export function DashboardTrendCharts({ metrics }: { metrics: DashboardMetrics }) {
  const revenue = metrics.trends.revenue.map((item) => ({
    label: monthLabel(item.month),
    value: item.revenue,
  }))
  const enrollments = metrics.trends.enrollments.map((item) => ({
    label: monthLabel(item.month),
    value: item.enrollments,
  }))
  const hasRevenue = revenue.some((item) => item.value > 0)
  const hasEnrollments = enrollments.some((item) => item.value > 0)

  return (
    <div className="grid items-stretch gap-4 xl:grid-cols-5">
      <DashboardPanel className="xl:col-span-3">
        <DashboardCardHeader
          title="Revenue trend"
          description="Approved tuition and prediction test payments"
        />
        {hasRevenue ? (
          <DashboardAreaChart
            data={revenue}
            color="#4274B9"
            formatTick={formatCurrencyCompact}
          />
        ) : (
          <DashboardEmptyState message="No revenue recorded in the last 6 months." />
        )}
      </DashboardPanel>

      <DashboardPanel variant="tint" className="xl:col-span-2">
        <DashboardCardHeader
          title="Enrollment trend"
          description="New students by month"
        />
        {hasEnrollments ? (
          <DashboardColumnChart
            data={enrollments}
            barClassName="bg-[#3D9B6E]"
          />
        ) : (
          <DashboardEmptyState message="No enrollments recorded in the last 6 months." />
        )}
      </DashboardPanel>
    </div>
  )
}
