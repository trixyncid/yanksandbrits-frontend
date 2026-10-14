import { Filter, Sparkles, Target, Trophy, WalletCards } from 'lucide-react'

import {
  DashboardColumnChart,
  DashboardGauge,
} from '../../admin/components/dashboard-charts'
import { BRAND_CHART } from '../../admin/components/dashboard-palette'
import { DashboardChip } from '../../admin/components/dashboard-kit'
import {
  DashboardCardHeader,
  DashboardPanel,
} from '../../admin/components/dashboard-section'
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
    <DashboardPanel variant="plump" className={className}>
      <DashboardCardHeader
        title="Your funnel"
        description="Leads you created or talked to this period, by stage."
        icon={<Filter className="size-4" />}
        action={
          hasActivity ? (
            <DashboardChip tone="brand">
              Most at {chartData[peakIndex]?.label}: {chartData[peakIndex]?.value}
            </DashboardChip>
          ) : (
            <DashboardChip>{total} leads</DashboardChip>
          )
        }
      />

      <div className="flex flex-1 flex-col justify-end">
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
      icon: <Sparkles className="size-3.5" />,
      label: 'SPIF progress',
      pct: spifPct,
      detail:
        spif.remaining > 0
          ? `${spif.count} / ${spif.threshold} Tele Marketing`
          : spif.units > 0
            ? `${spif.units} unit${spif.units === 1 ? '' : 's'} earned`
            : `${spif.threshold} Tele Marketing to unlock`,
      amount: spif.units > 0 ? `${spif.units}u` : null,
    },
    {
      id: 'convert',
      icon: <Target className="size-3.5" />,
      label: 'Tele Marketing → enroll',
      pct: convertPct,
      detail: `${kpis.enrollments.current} enrollments from Tele Marketing`,
      amount: `${kpis.consultToEnrollRate.current}%`,
    },
    {
      id: 'payments',
      icon: <WalletCards className="size-3.5" />,
      label: 'Payment completion',
      pct: paymentPct,
      detail: `${kpis.studentPayments.completed} complete · ${kpis.studentPayments.incomplete} open`,
      amount: paymentTotal > 0 ? `${paymentPct}%` : '—',
    },
  ]

  return (
    <DashboardPanel className={className}>
      <DashboardCardHeader
        title="Goals this period"
        description="Bonus progress, how many calls became enrollments, and payment plans finished."
        icon={<Trophy className="size-4" />}
      />

      <ul className="grid flex-1 gap-2 sm:grid-cols-3">
        {goals.map((goal) => (
          <li
            key={goal.id}
            className="flex flex-col items-center gap-3 rounded-3xl bg-canvas/70 px-3 py-4 text-center"
          >
            <DashboardGauge
              value={goal.pct}
              size={112}
              strokeWidth={11}
              color={BRAND_CHART.brand500}
              trackColor={BRAND_CHART.brand100}
              label="done"
            />
            <div className="min-w-0">
              <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-ink">
                <span className="text-brand-600">{goal.icon}</span>
                {goal.label}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{goal.detail}</p>
              {goal.amount && goal.amount !== `${goal.pct}%` ? (
                <span className="mt-2 inline-flex rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-brand-700 tabular-nums">
                  {goal.amount}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </DashboardPanel>
  )
}
