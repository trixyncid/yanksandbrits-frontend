import { DashboardDonutChart } from '../../admin/components/dashboard-charts'
import {
  DashboardEmptyState,
  DashboardPanel,
} from '../../admin/components/dashboard-section'
import { cn } from '../../../shared/lib/cn'
import type { MarketingPerformanceMetrics } from '../types/marketing-dashboard'

const SOURCE_COLORS = [
  '#253CA1',
  '#253CA1',
  '#3D9B6E',
  '#D97706',
  '#7C6BC4',
  '#C45B6E',
]

export function MarketingDashboardLeadSources({
  metrics,
  className,
}: {
  metrics: MarketingPerformanceMetrics
  className?: string
}) {
  const items = metrics.leadSources
  const total = items.reduce((sum, item) => sum + item.leads, 0)
  const top = items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => b.item.leads - a.item.leads)
    .slice(0, 4)

  return (
    <DashboardPanel
      variant="plump"
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 fill-mode-both [animation-delay:300ms]',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-base font-bold text-slate-900">Channels</p>
          <p className="mt-0.5 text-sm text-slate-400">
            Lead quality by source this period
          </p>
        </div>
        {total > 0 ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-600">
            {total} leads
          </span>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="mt-4">
          <DashboardEmptyState message="No channel activity in this period." />
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <DashboardDonutChart
            size={120}
            strokeWidth={14}
            centerValue={total}
            centerLabel="leads"
            segments={items.map((item, index) => ({
              label: item.label,
              value: item.leads,
              color: SOURCE_COLORS[index % SOURCE_COLORS.length],
            }))}
          />

          <ul className="min-w-0 flex-1 space-y-2.5">
            {top.map(({ item, index }) => (
              <li
                key={item.source}
                className="flex items-center justify-between gap-2"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        SOURCE_COLORS[index % SOURCE_COLORS.length],
                    }}
                  />
                  <span className="truncate text-sm font-medium text-slate-700">
                    {item.label}
                  </span>
                  {!item.countsTowardPay ? (
                    <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                      no fee
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-[#253CA1]">
                  {item.leads} · {item.conversionRate}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardPanel>
  )
}
