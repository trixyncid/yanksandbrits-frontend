import { BookOpen, CalendarDays, History, Wallet } from 'lucide-react'

import {
  formatCurrencyAmount,
  formatCurrencyCompact,
} from '../../../shared/lib/currency'
import { BRAND_CHART } from '../../admin/components/dashboard-palette'
import {
  DashboardChip,
  DashboardStackedBar,
  DashboardSwatch,
} from '../../admin/components/dashboard-kit'
import {
  DashboardCardHeader,
  DashboardEmptyState,
  DashboardPanel,
} from '../../admin/components/dashboard-section'
import type { TutorPerformanceMetrics } from '../types/tutor-dashboard'

export function TutorDashboardEarnings({
  metrics,
  className,
}: {
  metrics: TutorPerformanceMetrics
  className?: string
}) {
  const { earnings, workload, kpis } = metrics

  const rows = [
    {
      label: 'Base salary',
      amount: earnings.mainSalary,
      hint: null as string | null,
      accent: BRAND_CHART.brand900,
    },
    {
      label: 'Session pay',
      amount: earnings.sessionSalary,
      hint: `${earnings.numberSessions} regular session${earnings.numberSessions === 1 ? '' : 's'}`,
      accent: BRAND_CHART.brand700,
    },
    {
      label: 'Overtime pay',
      amount: earnings.overtimeSalary,
      hint: `${earnings.overtimeSessions} overtime session${earnings.overtimeSessions === 1 ? '' : 's'}`,
      accent: BRAND_CHART.brand500,
    },
    {
      label: 'Session bonus',
      amount: earnings.bonusSalary,
      hint: 'Tier bonus for finished session volume',
      accent: BRAND_CHART.brand300,
    },
  ]

  const header = (
    <DashboardCardHeader
      title="How your pay adds up"
      description="The parts that make up your expected total."
      icon={<Wallet className="size-4" />}
      action={
        <DashboardChip tone="ink">
          {formatCurrencyAmount(earnings.expectedSalary)}
        </DashboardChip>
      }
    />
  )

  if (earnings.expectedSalary <= 0 && workload.workingDays === 0) {
    return (
      <DashboardPanel className={className}>
        {header}
        <DashboardEmptyState message="No pay yet for this period. Your expected pay builds up here as you finish sessions." />
      </DashboardPanel>
    )
  }

  return (
    <DashboardPanel variant="plump" className={className}>
      {header}

      <div className="mb-4 flex flex-wrap gap-1.5">
        <DashboardChip icon={CalendarDays} tone="brand">
          {workload.workingDays} working days
        </DashboardChip>
        <DashboardChip icon={BookOpen}>
          {workload.sessionsPerDay} sessions a day
        </DashboardChip>
        <DashboardChip icon={History}>
          Last period {formatCurrencyCompact(kpis.expectedPay.previous)}
        </DashboardChip>
      </div>

      <DashboardStackedBar
        segments={rows.map((row) => ({
          label: row.label,
          value: Math.max(row.amount, 0),
          color: row.accent,
        }))}
        formatValue={formatCurrencyAmount}
      />

      <dl className="mt-4 grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-3 rounded-3xl bg-canvas/70 px-4 py-3"
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <DashboardSwatch color={row.accent} className="mt-1.5" />
              <div className="min-w-0">
                <dt className="text-sm font-semibold text-ink">{row.label}</dt>
                {row.hint ? (
                  <p className="mt-0.5 text-xs leading-snug text-slate-500">
                    {row.hint}
                  </p>
                ) : null}
              </div>
            </div>
            <dd className="shrink-0 text-sm font-bold text-ink tabular-nums">
              {formatCurrencyAmount(row.amount)}
            </dd>
          </div>
        ))}
      </dl>
    </DashboardPanel>
  )
}
