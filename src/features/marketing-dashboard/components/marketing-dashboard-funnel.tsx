import {
  GitBranch,
  Sparkles,
  Target,
  WalletCards,
} from 'lucide-react'

import { cn } from '../../../shared/lib/cn'
import { DashboardColumnChart } from '../../admin/components/dashboard-charts'
import { DashboardPanel } from '../../admin/components/dashboard-section'
import type { MarketingPerformanceMetrics } from '../types/marketing-dashboard'

const FUNNEL_ORDER = ['3_CO', '4_PT', '6_EN', '5_CA'] as const

const EMPTY_FUNNEL_STAGES: { status: (typeof FUNNEL_ORDER)[number]; label: string }[] = [
  { status: '3_CO', label: 'Consult' },
  { status: '4_PT', label: 'Pending' },
  { status: '6_EN', label: 'Enrolled' },
  { status: '5_CA', label: 'Cancelled' },
]

function shortFunnelLabel(label: string, status: string) {
  const map: Record<string, string> = {
    '3_CO': 'Consult',
    '4_PT': 'Pending',
    '6_EN': 'Enroll',
    '5_CA': 'Cancel',
  }
  return map[status] ?? label.split(' ')[0] ?? label
}

function highlightStageIndex(
  data: { label: string; value: number }[],
) {
  if (data.length === 0) return 0
  let best = 0
  for (let i = 1; i < data.length; i += 1) {
    if (data[i].value >= data[best].value) best = i
  }
  return best
}

export function MarketingDashboardFunnel({
  metrics,
  className,
}: {
  metrics: MarketingPerformanceMetrics
  className?: string
}) {
  const source =
    metrics.funnel.length > 0
      ? metrics.funnel
      : EMPTY_FUNNEL_STAGES.map((stage) => ({
          status: stage.status,
          label: stage.label,
          count: 0,
        }))
  const ordered = [...source].sort((a, b) => {
    const ai = FUNNEL_ORDER.indexOf(a.status as (typeof FUNNEL_ORDER)[number])
    const bi = FUNNEL_ORDER.indexOf(b.status as (typeof FUNNEL_ORDER)[number])
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
  const chartData = ordered.map((item) => ({
    label: shortFunnelLabel(item.label, item.status),
    value: item.count,
  }))
  const hasActivity = chartData.some((item) => item.value > 0)
  const peakIndex = highlightStageIndex(chartData)
  const total = ordered.reduce((sum, item) => sum + item.count, 0)

  return (
    <DashboardPanel
      variant="plump"
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 fill-mode-both [animation-delay:200ms]',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-slate-900">Your funnel</p>
          <p className="mt-0.5 text-sm text-slate-400">
            Prospects you created or consulted this period
          </p>
        </div>
        {hasActivity ? (
          <span className="rounded-full bg-[#E8EEFF] px-3 py-1 text-xs font-semibold text-[#253CA1]">
            Peak {chartData[peakIndex]?.label}: {chartData[peakIndex]?.value}
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            {total} prospects
          </span>
        )}
      </div>

      <div className="mt-4">
        <DashboardColumnChart
          data={chartData}
          highlightIndex={hasActivity ? peakIndex : undefined}
          showValueOnHighlight={hasActivity}
          className="min-h-[240px]"
        />
      </div>
    </DashboardPanel>
  )
}

export function MarketingDashboardGoals({
  metrics,
  className,
}: {
  metrics: MarketingPerformanceMetrics
  className?: string
}) {
  const { kpis } = metrics
  const convertPct = Math.min(
    Math.max(kpis.consultToEnrollRate.current, 0),
    100,
  )

  const spif = kpis.spifProgress
  const spifPct = Math.min(Math.max(spif.progressPct, 0), 100)

  const paymentTotal =
    kpis.studentPayments.completed + kpis.studentPayments.incomplete
  const paymentPct =
    paymentTotal > 0
      ? Math.round((kpis.studentPayments.completed / paymentTotal) * 100)
      : 0

  const goals = [
    {
      id: 'spif',
      icon: <Sparkles className="size-4" />,
      label: 'SPIF progress',
      pct: spifPct,
      detail:
        spif.remaining > 0
          ? `${spif.count} / ${spif.threshold} consults`
          : spif.units > 0
            ? `${spif.units} unit${spif.units === 1 ? '' : 's'} earned`
            : `${spif.threshold} consults to unlock`,
      amount: spif.units > 0 ? `${spif.units}u` : null,
    },
    {
      id: 'convert',
      icon: <Target className="size-4" />,
      label: 'Consult → enroll',
      pct: convertPct,
      detail: `${kpis.enrollments.current} enrollments from consults`,
      amount: `${kpis.consultToEnrollRate.current}%`,
    },
    {
      id: 'payments',
      icon: <WalletCards className="size-4" />,
      label: 'Payment completion',
      pct: paymentPct,
      detail: `${kpis.studentPayments.completed} complete · ${kpis.studentPayments.incomplete} open`,
      amount: paymentTotal > 0 ? `${paymentPct}%` : '—',
    },
  ]

  return (
    <DashboardPanel
      variant="navy"
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 fill-mode-both [animation-delay:260ms]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-white">Marketing goals</p>
          <p className="mt-0.5 text-sm text-white/60">
            SPIF, conversion, and payment mix
          </p>
        </div>
        <span className="inline-flex size-9 items-center justify-center rounded-2xl bg-white/10 text-white">
          <GitBranch className="size-4" />
        </span>
      </div>

      <ul className="mt-6 space-y-5">
        {goals.map((goal) => (
          <li key={goal.id}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                  {goal.icon}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {goal.label}
                  </p>
                  <p className="truncate text-xs text-white/55">{goal.detail}</p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold tabular-nums text-white">
                  {goal.pct}%
                </p>
                {goal.amount ? (
                  <p className="text-[11px] font-medium text-white/55">
                    {goal.amount}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#7B93E8] transition-all duration-700 ease-out"
                style={{ width: `${goal.pct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </DashboardPanel>
  )
}
