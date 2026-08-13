import type { DashboardMetrics } from '../types/dashboard'
import { DashboardDonutChart } from './dashboard-charts'
import {
  DashboardCardHeader,
  DashboardEmptyState,
  DashboardPanel,
} from './dashboard-section'

const SOURCE_COLORS = [
  '#4274B9',
  '#3D9B6E',
  '#D97706',
  '#7C6BC4',
  '#C45B6E',
  '#64748B',
]

export function DashboardLeadSources({
  metrics,
  className,
}: {
  metrics: DashboardMetrics
  className?: string
}) {
  const items = metrics.leadSources
  const total = items.reduce((sum, item) => sum + item.leads, 0)

  return (
    <DashboardPanel className={className}>
      <DashboardCardHeader
        title="Lead sources"
        description="Where new prospects came from in this period."
      />

      {items.length === 0 ? (
        <DashboardEmptyState message="No prospects recorded in this period." />
      ) : (
        <div className="flex flex-1 flex-col items-center gap-6 sm:flex-row sm:items-start">
          <DashboardDonutChart
            size={164}
            strokeWidth={18}
            centerValue={total}
            centerLabel="leads"
            segments={items.map((item, index) => ({
              label: item.label,
              value: item.leads,
              color: SOURCE_COLORS[index % SOURCE_COLORS.length],
            }))}
          />

          <ul className="w-full flex-1 space-y-2.5">
            {items.map((item, index) => {
              const share = total > 0 ? Math.round((item.leads / total) * 100) : 0

              return (
                <li
                  key={item.source}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          SOURCE_COLORS[index % SOURCE_COLORS.length],
                      }}
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-slate-700">
                        {item.label}
                      </span>
                      {item.enrolled > 0 ? (
                        <span className="text-[11px] font-medium text-[#1F5A3D]">
                          {item.conversionRate}% enrolled
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="font-bold text-slate-900 tabular-nums">
                      {item.leads}
                    </span>
                    <span className="ml-2 text-xs font-medium text-slate-400 tabular-nums">
                      {share}%
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </DashboardPanel>
  )
}

export function DashboardCourseInterest({
  metrics,
  className,
}: {
  metrics: DashboardMetrics
  className?: string
}) {
  const items = metrics.courseInterest
  const max = Math.max(...items.map((item) => item.count), 1)
  const total = items.reduce((sum, item) => sum + item.count, 0)

  return (
    <DashboardPanel variant="quiet" className={className}>
      <DashboardCardHeader
        title="Course interest"
        description="Programs prospects are asking about."
        action={
          total > 0 ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 tabular-nums">
              {total} inquiries
            </span>
          ) : null
        }
      />

      {items.length === 0 ? (
        <DashboardEmptyState message="No course interest data in this period." />
      ) : (
        <ol className="flex-1 space-y-3">
          {items.map((item, index) => {
            const width = Math.max((item.count / max) * 100, item.count > 0 ? 8 : 0)
            const share = total > 0 ? Math.round((item.count / total) * 100) : 0

            return (
              <li key={item.course} className="flex items-center gap-3">
                <span className="w-6 shrink-0 text-right text-xs font-bold text-slate-300 tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {item.label}
                    </p>
                    <p className="shrink-0 text-sm font-bold text-slate-900 tabular-nums">
                      {item.count}
                      <span className="ml-1.5 text-xs font-medium text-slate-400">
                        {share}%
                      </span>
                    </p>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#2F5A94]"
                      style={{ width: `${width}%` }}
                    />
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
