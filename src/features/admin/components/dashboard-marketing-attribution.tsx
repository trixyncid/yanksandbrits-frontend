import { Megaphone } from 'lucide-react'

import type { DashboardMetrics } from '../types/dashboard'
import { DashboardMeter } from './dashboard-kit'
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
  className,
}: {
  metrics: DashboardMetrics
  className?: string
}) {
  const items = metrics.marketingAttribution
  const maxLeads = Math.max(...items.map((item) => item.leads), 1)

  return (
    <DashboardPanel className={className}>
      <DashboardCardHeader
        title="Education counsellors"
        description="Leads handled and how many enrolled, per counsellor."
        icon={<Megaphone className="size-4" />}
      />

      {items.length === 0 ? (
        <DashboardEmptyState message="No counsellor activity in this period." />
      ) : (
        <ol className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => {
            const width = Math.max((item.leads / maxLeads) * 100, item.leads > 0 ? 6 : 0)

            return (
              <li
                key={item.marketingId ?? item.name}
                className="flex items-center gap-3 rounded-3xl bg-canvas/70 px-3 py-3"
              >
                <span className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-brand-700">
                  {initials(item.name)}
                  <span className="absolute -top-1 -right-1 inline-flex size-5 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white tabular-nums">
                    {index + 1}
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-ink">
                      {item.name}
                    </p>
                    <span
                      className="inline-flex shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 tabular-nums"
                      title="Share of leads that enrolled"
                    >
                      {item.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                  <DashboardMeter className="mt-1.5" value={width} trackClassName="bg-white" />
                  <p className="mt-1 text-[11px] text-slate-500 tabular-nums">
                    {item.leads.toLocaleString('en-US')} leads ·{' '}
                    {item.enrolled.toLocaleString('en-US')} enrolled
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </DashboardPanel>
  )
}
