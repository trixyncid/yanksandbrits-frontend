import type { DashboardMetrics } from '../types/dashboard'
import {
  DashboardCardHeader,
  DashboardEmptyState,
  DashboardPanel,
} from './dashboard-section'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function DashboardMarketingAttribution({
  metrics,
}: {
  metrics: DashboardMetrics
}) {
  const items = metrics.marketingAttribution
  const maxLeads = Math.max(...items.map((item) => item.leads), 1)

  return (
    <DashboardPanel variant="tint">
      <DashboardCardHeader
        title="Marketing attribution"
        description="Lead volume and enrollment conversion by assigned marketer."
      />

      {items.length === 0 ? (
        <DashboardEmptyState message="No marketing attribution data in this period." />
      ) : (
        <ol className="space-y-3">
          {items.map((item, index) => {
            const width = Math.max((item.leads / maxLeads) * 100, item.leads > 0 ? 8 : 0)

            return (
              <li
                key={item.marketingId ?? item.name}
                className="rounded-2xl bg-white px-4 py-3 ring-1 ring-[#D8E6FA]"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 shrink-0 text-right text-xs font-bold text-slate-300 tabular-nums">
                    {index + 1}
                  </span>
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[#EDF4FF] text-[11px] font-bold text-[#2F5A94]">
                    {initials(item.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {item.name}
                      </p>
                      <span className="inline-flex rounded-full bg-[#EDF4FF] px-2.5 py-0.5 text-xs font-semibold text-[#2F5A94] tabular-nums">
                        {item.conversionRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#4274B9]"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 tabular-nums">
                      {item.leads.toLocaleString('en-US')} leads ·{' '}
                      {item.enrolled.toLocaleString('en-US')} enrolled
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </DashboardPanel>
  )
}
