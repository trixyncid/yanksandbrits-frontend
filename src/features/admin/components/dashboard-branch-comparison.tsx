import { Building2 } from 'lucide-react'

import {
  formatCurrencyAmount,
  formatCurrencyCompact,
} from '../../../shared/lib/currency'
import type { DashboardMetrics } from '../types/dashboard'
import { DashboardMeter } from './dashboard-kit'
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
        title="Branches side by side"
        description="How each branch did in the selected period."
        icon={<Building2 className="size-4" />}
      />

      {items.length === 0 ? (
        <DashboardEmptyState message="No branches to compare." />
      ) : (
        <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const width = Math.max(
              (item.revenue / maxRevenue) * 100,
              item.revenue > 0 ? 6 : 0,
            )
            const lead =
              items.length > 1 && item.revenue > 0 && item.revenue === maxRevenue

            return (
              <li
                key={item.branchId}
                className={
                  lead
                    ? 'rounded-3xl bg-brand-500 p-4 text-white'
                    : 'rounded-3xl bg-canvas/70 p-4'
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={lead ? 'font-bold' : 'font-bold text-ink'}>
                    {item.branchName}
                  </p>
                  {lead ? (
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
                      Top revenue
                    </span>
                  ) : null}
                </div>
                <p
                  className={
                    lead
                      ? 'mt-2 text-2xl font-bold tracking-tight tabular-nums'
                      : 'mt-2 text-2xl font-bold tracking-tight text-ink tabular-nums'
                  }
                  title={formatCurrencyAmount(item.revenue)}
                >
                  {formatCurrencyCompact(item.revenue)}
                </p>
                <DashboardMeter
                  className="mt-2"
                  value={width}
                  trackClassName={lead ? 'bg-white/20' : 'bg-white'}
                  barClassName={lead ? 'bg-white' : 'bg-brand-500'}
                />
                <dl
                  className={
                    lead
                      ? 'mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-white/80'
                      : 'mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-500'
                  }
                >
                  <div className="flex justify-between gap-2">
                    <dt>Enrolled</dt>
                    <dd className="font-semibold tabular-nums">
                      {item.newEnrollments.toLocaleString('en-US')}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Active</dt>
                    <dd className="font-semibold tabular-nums">
                      {item.activeStudents.toLocaleString('en-US')}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Leads</dt>
                    <dd className="font-semibold tabular-nums">
                      {item.leads.toLocaleString('en-US')}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Conversion</dt>
                    <dd className="font-semibold tabular-nums">
                      {item.conversionRate == null
                        ? '—'
                        : `${item.conversionRate.toFixed(1)}%`}
                    </dd>
                  </div>
                </dl>
              </li>
            )
          })}
        </ul>
      )}
    </DashboardPanel>
  )
}
