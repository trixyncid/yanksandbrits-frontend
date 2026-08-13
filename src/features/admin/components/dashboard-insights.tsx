import { cn } from '../../../shared/lib/cn'
import type { DashboardMetrics } from '../types/dashboard'
import { DashboardDonutChart, DashboardFunnelChart } from './dashboard-charts'
import {
  DashboardCardHeader,
  DashboardEmptyState,
  DashboardPanel,
} from './dashboard-section'

const FUNNEL_ORDER = ['1_WT', '2_FU', '3_CO', '4_PT', '6_EN', '5_CA']

const FUNNEL_TONES: Record<string, string> = {
  '1_WT': 'bg-slate-500',
  '2_FU': 'bg-[#6B9FD4]',
  '3_CO': 'bg-[#4274B9]',
  '4_PT': 'bg-[#2F5A94]',
  '6_EN': 'bg-[#3D9B6E]',
  '5_CA': 'bg-[#C45B6E]',
}

function cancellationTone(rate: number) {
  if (rate <= 5) return 'text-[#1F5A3D] bg-[#E8F7EF]'
  if (rate <= 12) return 'text-[#9A3412] bg-[#FFF7ED]'
  return 'text-[#6E2433] bg-[#FCEEF1]'
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
        title="Prospect funnel"
        description="New leads created in the selected period."
        action={
          total > 0 ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 tabular-nums">
              {total} total leads
            </span>
          ) : null
        }
      />

      {ordered.length === 0 ? (
        <DashboardEmptyState message="No new prospects in this period." />
      ) : (
        <DashboardFunnelChart
          items={ordered.map((item) => ({
            label: item.label,
            value: item.count,
            tone: FUNNEL_TONES[item.status] ?? 'bg-[#4274B9]',
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

  return (
    <DashboardPanel variant="quiet" className={className}>
      <DashboardCardHeader
        title="Delivery health"
        description="How classes ran during the selected period."
      />

      {operations.sessionsTotal === 0 ? (
        <DashboardEmptyState message="No sessions scheduled in this period." />
      ) : (
        <div className="flex flex-1 flex-col items-center gap-6 sm:flex-row sm:items-start xl:flex-col xl:items-stretch">
          <DashboardDonutChart
            className="self-center"
            size={156}
            strokeWidth={18}
            centerValue={`${completionRate}%`}
            centerLabel="completed"
            segments={[
              {
                label: 'Finished',
                value: operations.sessionsFinished,
                color: '#3D9B6E',
              },
              {
                label: 'Remaining',
                value: remaining,
                color: '#93B8E8',
              },
              {
                label: 'Cancelled',
                value: operations.sessionsCancelled,
                color: '#C45B6E',
              },
            ]}
          />

          <dl className="grid w-full flex-1 gap-3">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <div>
                <dt className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                  Scheduled
                </dt>
                <dd className="mt-1 text-lg font-bold text-slate-900 tabular-nums">
                  {operations.sessionsTotal.toLocaleString('en-US')}
                </dd>
              </div>
              <span className="size-2.5 rounded-full bg-[#93B8E8]" />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#F4FBF7] px-4 py-3">
              <div>
                <dt className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                  Delivered
                </dt>
                <dd className="mt-1 text-lg font-bold text-slate-900 tabular-nums">
                  {operations.sessionsFinished.toLocaleString('en-US')}
                </dd>
              </div>
              <span className="size-2.5 rounded-full bg-[#3D9B6E]" />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <div>
                <dt className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                  Cancelled
                </dt>
                <dd className="mt-1 flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900 tabular-nums">
                    {operations.sessionsCancelled.toLocaleString('en-US')}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                      cancellationTone(operations.cancellationRate),
                    )}
                  >
                    {operations.cancellationRate.toFixed(1)}%
                  </span>
                </dd>
              </div>
              <span className="size-2.5 rounded-full bg-[#C45B6E]" />
            </div>
          </dl>
        </div>
      )}
    </DashboardPanel>
  )
}
