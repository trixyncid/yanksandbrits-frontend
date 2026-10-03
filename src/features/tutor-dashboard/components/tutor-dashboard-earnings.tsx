import { formatCurrencyAmount } from '../../../shared/lib/currency'
import {
  DashboardEmptyState,
  DashboardPanel,
} from '../../admin/components/dashboard-section'
import type { TutorPerformanceMetrics } from '../types/tutor-dashboard'

export function TutorDashboardEarnings({
  metrics,
}: {
  metrics: TutorPerformanceMetrics
}) {
  const { earnings, workload } = metrics

  const rows = [
    {
      label: 'Base salary',
      amount: earnings.mainSalary,
      hint: null as string | null,
      accent: 'bg-[#1B2A5A]',
    },
    {
      label: 'Session pay',
      amount: earnings.sessionSalary,
      hint: `${earnings.numberSessions} regular session${earnings.numberSessions === 1 ? '' : 's'}`,
      accent: 'bg-[#253CA1]',
    },
    {
      label: 'Overtime pay',
      amount: earnings.overtimeSalary,
      hint: `${earnings.overtimeSessions} overtime session${earnings.overtimeSessions === 1 ? '' : 's'}`,
      accent: 'bg-[#3A56B8]',
    },
    {
      label: 'Session bonus',
      amount: earnings.bonusSalary,
      hint: 'Tier bonus for finished session volume',
      accent: 'bg-[#7B93E8]',
    },
  ]

  const totalParts = rows.reduce((sum, row) => sum + Math.max(row.amount, 0), 0)

  if (earnings.expectedSalary <= 0 && workload.workingDays === 0) {
    return (
      <DashboardPanel variant="plump">
        <DashboardEmptyState message="No earnings for this period. Finished sessions will build your expected pay here." />
      </DashboardPanel>
    )
  }

  return (
    <DashboardPanel
      variant="plump"
      className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both gap-0 overflow-hidden p-0 [animation-delay:300ms]"
    >
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-base font-bold text-slate-900">How pay builds</p>
            <p className="mt-0.5 text-sm text-slate-400">
              Components that roll into your expected total
            </p>
          </div>
          <p className="text-sm font-bold tabular-nums text-[#253CA1]">
            {formatCurrencyAmount(earnings.expectedSalary)}
          </p>
        </div>
        {totalParts > 0 ? (
          <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
            {rows.map((row) => {
              if (row.amount <= 0) return null
              const width = (row.amount / totalParts) * 100
              return (
                <div
                  key={row.label}
                  className={`${row.accent} transition-all duration-700 ease-out`}
                  style={{ width: `${width}%` }}
                  title={`${row.label}: ${formatCurrencyAmount(row.amount)}`}
                />
              )
            })}
          </div>
        ) : null}
      </div>

      <dl className="divide-y divide-slate-100 px-4 sm:px-5">
        {rows.map((row, index) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-2 py-3.5"
            style={{ animationDelay: `${320 + index * 40}ms` }}
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <span
                aria-hidden
                className={`mt-1.5 size-2 shrink-0 rounded-full ${row.accent}`}
              />
              <div className="min-w-0">
                <dt className="text-sm font-semibold text-slate-800">
                  {row.label}
                </dt>
                {row.hint ? (
                  <p className="mt-0.5 text-xs leading-snug text-slate-400">
                    {row.hint}
                  </p>
                ) : null}
              </div>
            </div>
            <dd className="shrink-0 text-sm font-bold tabular-nums text-slate-900">
              {formatCurrencyAmount(row.amount)}
            </dd>
          </div>
        ))}
      </dl>
    </DashboardPanel>
  )
}
