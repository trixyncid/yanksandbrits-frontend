import {
  formatCurrencyAmount,
  formatCurrencyCompact,
} from '../../../shared/lib/currency'
import type { DashboardMetrics } from '../types/dashboard'
import {
  DashboardCardHeader,
  DashboardEmptyState,
  DashboardPanel,
} from './dashboard-section'

export function DashboardBranchComparison({
  metrics,
}: {
  metrics: DashboardMetrics
}) {
  const items = metrics.branchComparison
  const maxRevenue = Math.max(...items.map((item) => item.revenue), 1)

  if (items.length === 0) {
    return null
  }

  return (
    <DashboardPanel>
      <DashboardCardHeader
        title="Branch comparison"
        description="Side-by-side performance across all branches for the selected period."
      />

      {items.length === 0 ? (
        <DashboardEmptyState message="No branches to compare." />
      ) : (
        <div className="space-y-5">
          {items.map((item) => {
            const width = Math.max(
              (item.revenue / maxRevenue) * 100,
              item.revenue > 0 ? 8 : 0,
            )

            return (
              <div key={item.branchId} className="space-y-2">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900">
                    {item.branchName}
                  </p>
                  <p
                    className="text-sm font-bold text-slate-900 tabular-nums"
                    title={formatCurrencyAmount(item.revenue)}
                  >
                    <span className="sm:hidden">
                      {formatCurrencyCompact(item.revenue)}
                    </span>
                    <span className="hidden sm:inline">
                      {formatCurrencyAmount(item.revenue)}
                    </span>
                  </p>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#2F5A94]"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 tabular-nums">
                    {item.newEnrollments.toLocaleString('en-US')} enrolled
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 tabular-nums">
                    {item.activeStudents.toLocaleString('en-US')} active
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 tabular-nums">
                    {item.leads.toLocaleString('en-US')} leads
                  </span>
                  <span className="rounded-full bg-[#EDF4FF] px-2 py-0.5 text-[#2F5A94] tabular-nums">
                    {item.conversionRate == null
                      ? '— conversion'
                      : `${item.conversionRate.toFixed(1)}% conversion`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DashboardPanel>
  )
}
