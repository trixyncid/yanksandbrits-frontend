import {
  BarChart3,
  CalendarX2,
  Gift,
  Target,
  Timer,
  Trophy,
} from 'lucide-react'

import { formatCurrencyCompact } from '../../../shared/lib/currency'
import {
  DashboardColumnChart,
  DashboardGauge,
} from '../../admin/components/dashboard-charts'
import { BRAND_CHART } from '../../admin/components/dashboard-palette'
import { DashboardChip } from '../../admin/components/dashboard-kit'
import {
  DashboardCardHeader,
  DashboardEmptyState,
  DashboardPanel,
} from '../../admin/components/dashboard-section'
import type { TutorPerformanceMetrics } from '../types/tutor-dashboard'

function highlightWeekIndex(
  weeklyData: { label: string; value: number }[],
) {
  if (weeklyData.length === 0) return 0
  let best = 0
  for (let i = 1; i < weeklyData.length; i += 1) {
    if (weeklyData[i].value >= weeklyData[best].value) best = i
  }
  return best
}

export function TutorDashboardInsights({
  metrics,
  className,
}: {
  metrics: TutorPerformanceMetrics
  className?: string
}) {
  const weeklyData = metrics.weeklyTrend.map((item) => ({
    label: item.label.replace(/–.*/, '').trim(),
    value: item.sessions,
  }))
  const peakIndex = highlightWeekIndex(weeklyData)
  const hasSessions = weeklyData.some((item) => item.value > 0)

  const programItems = metrics.programMix.slice(0, 4)

  return (
    <DashboardPanel variant="plump" className={className}>
      <DashboardCardHeader
        title="Sessions each week"
        description="Classes you finished across this period."
        icon={<BarChart3 className="size-4" />}
        action={
          hasSessions ? (
            <DashboardChip tone="brand">
              Busiest {weeklyData[peakIndex]?.label}: {weeklyData[peakIndex]?.value}
            </DashboardChip>
          ) : null
        }
      />

      <div className="flex flex-1 flex-col justify-end">
        {hasSessions ? (
          <DashboardColumnChart
            data={weeklyData}
            highlightIndex={peakIndex}
            showValueOnHighlight
            className="min-h-[240px]"
          />
        ) : (
          <DashboardEmptyState message="No finished sessions yet. Your weekly numbers show up once classes are marked finished." />
        )}
      </div>

      {programItems.length > 0 ? (
        <div className="mt-5">
          <p className="text-xs font-semibold text-slate-500">Programs you teach most</p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {programItems.map((item) => (
              <li
                key={`${item.programId ?? item.title}`}
                className="flex items-center justify-between gap-2 rounded-2xl bg-canvas/70 px-3.5 py-2.5"
              >
                <span className="min-w-0 truncate text-sm font-semibold text-ink">
                  {item.title}
                </span>
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-brand-700 tabular-nums">
                  {item.sessions} · {item.hours}h
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </DashboardPanel>
  )
}

export function TutorDashboardGoals({
  metrics,
  className,
}: {
  metrics: TutorPerformanceMetrics
  className?: string
}) {
  const { kpis, workload, earnings } = metrics
  const bonus = kpis.bonusProgress
  const totalSessions =
    workload.regularSessions + workload.overtimeSessions
  // No sessions yet reads as 0%, not 100% regular.
  const regularShare =
    totalSessions > 0
      ? Math.round((workload.regularSessions / totalSessions) * 100)
      : 0
  const bonusPct = Math.min(Math.max(bonus.progressPct, 0), 100)

  const goals = [
    {
      id: 'bonus',
      icon: <Gift className="size-3.5" />,
      label: 'Bonus tier',
      pct: bonusPct,
      detail:
        bonus.nextTierMin != null
          ? `${bonus.sessionCount} / ${bonus.nextTierMin} sessions`
          : bonus.sessionCount > 0
            ? `${bonus.sessionCount} sessions · top tier`
            : '0 sessions yet',
      amount:
        bonus.bonusAmount > 0
          ? formatCurrencyCompact(bonus.bonusAmount)
          : null,
    },
    {
      id: 'remaining',
      icon: <Target className="size-3.5" />,
      label: 'Next tier',
      pct:
        bonus.nextTierMin != null && bonus.nextTierMin > 0
          ? Math.min(
              Math.round((bonus.sessionCount / bonus.nextTierMin) * 100),
              100,
            )
          : bonus.nextTierMin == null && bonus.sessionCount > 0
            ? 100
            : 0,
      detail:
        bonus.remaining > 0 && bonus.nextTierMin != null
          ? `${bonus.remaining} sessions remaining`
          : bonus.nextTierMin == null && bonus.sessionCount > 0
            ? 'Goal complete'
            : 'Set by finished volume',
      amount: null,
    },
    {
      id: 'workload',
      icon: <Timer className="size-3.5" />,
      label: 'Regular vs OT',
      pct: regularShare,
      detail: `${workload.regularSessions} regular · ${workload.overtimeSessions} OT`,
      amount: `${earnings.workingDays} days`,
    },
  ]

  return (
    <DashboardPanel className={className}>
      <DashboardCardHeader
        title="Teaching goals"
        description="Bonus progress and how your sessions split."
        icon={<Trophy className="size-4" />}
      />

      <ul className="flex flex-1 flex-col gap-2">
        {goals.map((goal) => (
          <li
            key={goal.id}
            className="flex items-center gap-4 rounded-3xl bg-canvas/70 px-3 py-3"
          >
            <DashboardGauge
              value={goal.pct}
              size={64}
              strokeWidth={7}
              color={BRAND_CHART.brand500}
              trackColor={BRAND_CHART.brand100}
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <span className="text-brand-600">{goal.icon}</span>
                {goal.label}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-500">{goal.detail}</p>
            </div>
            {goal.amount ? (
              <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-700 tabular-nums">
                {goal.amount}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </DashboardPanel>
  )
}

export function TutorDashboardCancellations({
  metrics,
  className,
}: {
  metrics: TutorPerformanceMetrics
  className?: string
}) {
  return (
    <DashboardPanel className={className}>
      <DashboardCardHeader
        title="Recent cancellations"
        description="Your latest classes that were cancelled."
        icon={<CalendarX2 className="size-4" />}
        action={
          metrics.cancellations.length > 0 ? (
            <DashboardChip>{metrics.cancellations.length} shown</DashboardChip>
          ) : null
        }
      />
      {metrics.cancellations.length === 0 ? (
        <DashboardEmptyState message="No cancelled classes in this period." />
      ) : (
        <ul className="space-y-2">
          {metrics.cancellations.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-3xl bg-canvas/70 px-3 py-2.5"
            >
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-rose-500">
                <CalendarX2 className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">
                  {item.program}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {item.subject}
                  {item.subjectType === 'group' ? ' (group)' : ''}
                  {item.startTime ? ` · ${item.startTime}` : ''}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 tabular-nums">
                {item.date}
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  )
}
