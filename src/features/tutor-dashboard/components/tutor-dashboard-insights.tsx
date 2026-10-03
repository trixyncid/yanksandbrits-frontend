import { Gift, Target, Timer } from 'lucide-react'

import { formatCurrencyCompact } from '../../../shared/lib/currency'
import { DashboardColumnChart } from '../../admin/components/dashboard-charts'
import {
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
}: {
  metrics: TutorPerformanceMetrics
}) {
  const weeklyData = metrics.weeklyTrend.map((item) => ({
    label: item.label.replace(/–.*/, '').trim(),
    value: item.sessions,
  }))
  const peakIndex = highlightWeekIndex(weeklyData)

  const programItems = metrics.programMix.slice(0, 4)

  return (
    <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
      <DashboardPanel
        variant="plump"
        className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both [animation-delay:200ms] lg:col-span-7"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-base font-bold text-slate-900">
              Weekly sessions
            </p>
            <p className="mt-0.5 text-sm text-slate-400">
              Finished teaching volume across this period
            </p>
          </div>
          {weeklyData.some((item) => item.value > 0) ? (
            <span className="rounded-full bg-[#E8EEFF] px-3 py-1 text-xs font-semibold text-[#253CA1]">
              Peak {weeklyData[peakIndex]?.label}: {weeklyData[peakIndex]?.value}
            </span>
          ) : null}
        </div>

        <div className="mt-4">
          {weeklyData.some((item) => item.value > 0) ? (
            <DashboardColumnChart
              data={weeklyData}
              highlightIndex={peakIndex}
              showValueOnHighlight
              className="min-h-[240px]"
            />
          ) : (
            <DashboardEmptyState message="No finished sessions yet. Weekly volume will appear once classes are marked finished." />
          )}
        </div>

        {programItems.length > 0 ? (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Top programs
            </p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {programItems.map((item) => (
                <li
                  key={`${item.programId ?? item.title}`}
                  className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2"
                >
                  <span className="min-w-0 truncate text-sm font-medium text-slate-700">
                    {item.title}
                  </span>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-[#253CA1]">
                    {item.sessions} · {item.hours}h
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </DashboardPanel>

      <TutorDashboardGoals metrics={metrics} />
    </div>
  )
}

export function TutorDashboardGoals({
  metrics,
}: {
  metrics: TutorPerformanceMetrics
}) {
  const { kpis, workload, earnings } = metrics
  const bonus = kpis.bonusProgress
  const totalSessions = Math.max(
    workload.regularSessions + workload.overtimeSessions,
    1,
  )
  const otShare = Math.round(
    (workload.overtimeSessions / totalSessions) * 100,
  )
  const regularShare = Math.max(100 - otShare, 0)
  const bonusPct = Math.min(Math.max(bonus.progressPct, 0), 100)

  const goals = [
    {
      id: 'bonus',
      icon: <Gift className="size-4" />,
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
      icon: <Target className="size-4" />,
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
      icon: <Timer className="size-4" />,
      label: 'Regular vs OT',
      pct: regularShare,
      detail: `${workload.regularSessions} regular · ${workload.overtimeSessions} OT`,
      amount: `${earnings.workingDays} days`,
    },
  ]

  return (
    <DashboardPanel
      variant="navy"
      className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both [animation-delay:260ms] lg:col-span-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-white">Teaching goals</p>
          <p className="mt-0.5 text-sm text-white/60">
            Bonus progress and workload mix
          </p>
        </div>
        <span className="inline-flex size-9 items-center justify-center rounded-2xl bg-white/10 text-white">
          <Target className="size-4" />
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

export function TutorDashboardCancellations({
  metrics,
}: {
  metrics: TutorPerformanceMetrics
}) {
  return (
    <DashboardPanel
      variant="plump"
      className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both gap-0 overflow-hidden p-0 [animation-delay:340ms]"
    >
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <p className="text-base font-bold text-slate-900">
          Recent cancellations
        </p>
        <p className="mt-0.5 text-sm text-slate-400">
          Latest cancelled classes assigned to you
        </p>
      </div>
      {metrics.cancellations.length === 0 ? (
        <div className="px-4 py-6 sm:px-5">
          <DashboardEmptyState message="No cancellations in this window." />
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {metrics.cancellations.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 sm:px-5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {item.program}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {item.subject}
                  {item.subjectType === 'group' ? ' (group)' : ''}
                  {item.startTime ? ` · ${item.startTime}` : ''}
                </p>
              </div>
              <p className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-600">
                {item.date}
              </p>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  )
}
