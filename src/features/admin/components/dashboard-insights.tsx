import { Activity, Filter } from 'lucide-react'

import { cn } from '../../../shared/lib/cn'
import type { DashboardMetrics } from '../types/dashboard'
import {
  DashboardDonutChart,
  DashboardFunnelChart,
} from './dashboard-charts'
import { BRAND_CHART } from './dashboard-palette'
import { DashboardChip, DashboardSwatch } from './dashboard-kit'
import {
  DashboardCardHeader,
  DashboardEmptyState,
  DashboardPanel,
} from './dashboard-section'

const FUNNEL_ORDER = ['3_CO', '4_PT', '6_EN', '5_CA']

const FUNNEL_TONES: Record<string, string> = {
  '3_CO': 'bg-brand-300 text-ink',
  '4_PT': 'bg-brand-500',
  '6_EN': 'bg-brand-700',
  '5_CA': 'bg-brand-gray text-ink',
}

function cancellationTone(rate: number) {
  if (rate <= 5) return 'bg-emerald-50 text-emerald-700'
  if (rate <= 12) return 'bg-amber-50 text-amber-700'
  return 'bg-rose-50 text-rose-700'
}

export function DashboardFunnel({
  metrics,
  className,
}: {
  metrics: DashboardMetrics
  className?: string
}) {
  const ordered = [...metrics.prospectFunnel].sort((a, b) => {
    const ai = FUNNEL_ORDER.indexOf(a.status)
    const bi = FUNNEL_ORDER.indexOf(b.status)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
  const total = ordered.reduce((sum, item) => sum + item.count, 0)

  return (
    <DashboardPanel className={className}>
      <DashboardCardHeader
        title="Lead pipeline"
        description="Where this period's new leads are now."
        icon={<Filter className="size-4" />}
        action={
          total > 0 ? (
            <DashboardChip tone="brand">{total} leads</DashboardChip>
          ) : null
        }
      />

      {ordered.length === 0 ? (
        <DashboardEmptyState message="No new leads in this period." />
      ) : (
        <DashboardFunnelChart
          items={ordered.map((item) => ({
            label: item.label,
            value: item.count,
            tone: FUNNEL_TONES[item.status] ?? 'bg-brand-500',
          }))}
        />
      )}
    </DashboardPanel>
  )
}

export function DashboardOperationsCard({
  metrics,
  className,
}: {
  metrics: DashboardMetrics
  className?: string
}) {
  const { operations } = metrics
  const remaining = Math.max(
    operations.sessionsTotal -
      operations.sessionsFinished -
      operations.sessionsCancelled,
    0,
  )
  const completionRate =
    operations.sessionsTotal > 0
      ? Math.round(
          (operations.sessionsFinished / operations.sessionsTotal) * 100,
        )
      : 0

  const rows = [
    {
      label: 'Scheduled',
      value: operations.sessionsTotal,
      color: BRAND_CHART.brand200,
      extra: null as string | null,
    },
    {
      label: 'Taught',
      value: operations.sessionsFinished,
      color: BRAND_CHART.brand500,
      extra: null,
    },
    {
      label: 'Cancelled',
      value: operations.sessionsCancelled,
      color: BRAND_CHART.gray,
      extra: `${operations.cancellationRate.toFixed(1)}%`,
    },
  ]

  return (
    <DashboardPanel className={className}>
      <DashboardCardHeader
        title="Classes delivered"
        description="How this period's sessions went."
        icon={<Activity className="size-4" />}
      />

      {operations.sessionsTotal === 0 ? (
        <DashboardEmptyState message="No sessions scheduled in this period." />
      ) : (
        <div className="flex flex-1 flex-col items-center gap-4 sm:flex-row xl:flex-col">
          <DashboardDonutChart
            className="self-center"
            size={148}
            strokeWidth={16}
            centerValue={`${completionRate}%`}
            centerLabel="taught"
            segments={[
              {
                label: 'Taught',
                value: operations.sessionsFinished,
                color: BRAND_CHART.brand500,
              },
              {
                label: 'Still to run',
                value: remaining,
                color: BRAND_CHART.brand200,
              },
              {
                label: 'Cancelled',
                value: operations.sessionsCancelled,
                color: BRAND_CHART.gray,
              },
            ]}
          />

          <dl className="grid w-full flex-1 gap-1.5">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-2 rounded-2xl bg-canvas/70 px-3.5 py-2"
              >
                <dt className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <DashboardSwatch color={row.color} />
                  {row.label}
                </dt>
                <dd className="flex items-center gap-2">
                  {row.extra ? (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        cancellationTone(operations.cancellationRate),
                      )}
                      title="Share of sessions cancelled"
                    >
                      {row.extra}
                    </span>
                  ) : null}
                  <span className="text-sm font-bold text-ink tabular-nums">
                    {row.value.toLocaleString('en-US')}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </DashboardPanel>
  )
}
