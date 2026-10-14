import { Compass, MessageCircleQuestion } from 'lucide-react'

import type { DashboardMetrics } from '../types/dashboard'
import {
  DashboardDonutChart,
} from './dashboard-charts'
import { BRAND_SERIES } from './dashboard-palette'
import { DashboardChip, DashboardMeter, DashboardSwatch } from './dashboard-kit'
import {
  DashboardCardHeader,
  DashboardEmptyState,
  DashboardPanel,
} from './dashboard-section'

/**
 * Sources keep a fixed color by their position in the list the API returns,
 * and each row repeats the label and number so color is never the only cue.
 */
function sourceColor(index: number) {
  return index < BRAND_SERIES.length
    ? BRAND_SERIES[index]
    : BRAND_SERIES[BRAND_SERIES.length - 1]
}

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
        description="How new leads found us this period."
        icon={<Compass className="size-4" />}
      />

      {items.length === 0 ? (
        <DashboardEmptyState message="No leads recorded in this period." />
      ) : (
        <div className="flex flex-1 flex-col items-center gap-5 sm:flex-row sm:items-center">
          <DashboardDonutChart
            size={172}
            strokeWidth={22}
            centerValue={total}
            centerLabel="leads"
            segments={items.map((item, index) => ({
              label: item.label,
              value: item.leads,
              color: sourceColor(index),
            }))}
          />

          <ul className="w-full flex-1 space-y-1.5">
            {items.map((item, index) => {
              const share = total > 0 ? Math.round((item.leads / total) * 100) : 0

              return (
                <li
                  key={item.source}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-canvas/70 px-3 py-2 text-sm"
                >
                  <span className="inline-flex min-w-0 items-center gap-2.5">
                    <DashboardSwatch color={sourceColor(index)} />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink">
                        {item.label}
                      </span>
                      {item.enrolled > 0 ? (
                        <span className="text-[11px] font-medium text-emerald-700">
                          {item.conversionRate}% enrolled
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="font-bold text-ink tabular-nums">
                      {item.leads}
                    </span>
                    <span className="ml-2 text-xs font-medium text-slate-500 tabular-nums">
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
    <DashboardPanel className={className}>
      <DashboardCardHeader
        title="Course interest"
        description="The programs leads are asking about."
        icon={<MessageCircleQuestion className="size-4" />}
        action={
          total > 0 ? (
            <DashboardChip tone="brand">{total} questions</DashboardChip>
          ) : null
        }
      />

      {items.length === 0 ? (
        <DashboardEmptyState message="No course interest recorded in this period." />
      ) : (
        <ol className="flex-1 space-y-1.5">
          {items.map((item, index) => {
            const width = Math.max((item.count / max) * 100, item.count > 0 ? 6 : 0)
            const share = total > 0 ? Math.round((item.count / total) * 100) : 0

            return (
              <li
                key={item.course}
                className="flex items-center gap-3 rounded-2xl px-1 py-1.5"
                title={`${item.label}: ${item.count} (${share}%)`}
              >
                <span
                  className={
                    index === 0
                      ? 'inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white tabular-nums'
                      : 'inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-canvas text-xs font-bold text-slate-500 tabular-nums'
                  }
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-ink">
                      {item.label}
                    </p>
                    <p className="shrink-0 text-sm font-bold text-ink tabular-nums">
                      {item.count}
                      <span className="ml-1.5 text-xs font-medium text-slate-500">
                        {share}%
                      </span>
                    </p>
                  </div>
                  <DashboardMeter
                    className="mt-1.5"
                    value={width}
                    barClassName={index === 0 ? 'bg-brand-500' : 'bg-brand-300'}
                  />
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </DashboardPanel>
  )
}
