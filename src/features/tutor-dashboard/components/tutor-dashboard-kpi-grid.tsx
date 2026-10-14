import { Sparkles } from 'lucide-react'

import { formatCurrencyCompact } from '../../../shared/lib/currency'
import { cn } from '../../../shared/lib/cn'
import {
  DashboardGauge,
} from '../../admin/components/dashboard-charts'
import { BRAND_CHART } from '../../admin/components/dashboard-palette'
import {
  DashboardCardHeader,
  DashboardPanel,
} from '../../admin/components/dashboard-section'
import type { TutorPerformanceMetrics } from '../types/tutor-dashboard'

/**
 * The tutor dashboard's one dark card: progress toward the next session bonus
 * tier as a large ring, with the numbers behind it.
 */
export function TutorBonusCard({
  metrics,
  className,
}: {
  metrics: TutorPerformanceMetrics
  className?: string
}) {
  const bonus = metrics.kpis.bonusProgress
  const bonusPct = Math.min(Math.max(bonus.progressPct, 0), 100)

  const subtitle =
    bonus.remaining > 0 && bonus.nextTierMin != null
      ? `${bonus.remaining} more sessions to the next tier`
      : bonus.nextTierMin == null && bonus.sessionCount > 0
        ? 'You reached the top tier'
        : 'Finish sessions to start earning a bonus'

  return (
    <DashboardPanel
      variant="dark"
      className={cn('relative overflow-hidden', className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-16 size-56 rounded-full bg-brand-500/30 blur-3xl"
      />
      <div className="relative flex h-full flex-col">
        <DashboardCardHeader
          inverted
          title="Session bonus"
          description={subtitle}
          icon={<Sparkles className="size-4" />}
        />

        <div className="flex flex-1 items-center justify-center py-2">
          <DashboardGauge
            inverted
            value={bonusPct}
            size={176}
            strokeWidth={16}
            color={BRAND_CHART.brand300}
            label="to next tier"
          />
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white/8 px-3 py-2.5">
            <dt className="text-[11px] font-medium text-white/55">Sessions</dt>
            <dd className="mt-0.5 text-sm font-bold tabular-nums">
              {bonus.sessionCount}
              {bonus.nextTierMin != null ? (
                <span className="text-white/45">/{bonus.nextTierMin}</span>
              ) : null}
            </dd>
          </div>
          <div className="rounded-2xl bg-white/8 px-3 py-2.5">
            <dt className="text-[11px] font-medium text-white/55">To go</dt>
            <dd className="mt-0.5 text-sm font-bold tabular-nums">
              {bonus.nextTierMin != null ? bonus.remaining : '—'}
            </dd>
          </div>
          <div className="rounded-2xl bg-white px-3 py-2.5 text-ink">
            <dt className="text-[11px] font-medium text-slate-500">Earned</dt>
            <dd className="mt-0.5 text-sm font-bold tabular-nums">
              {bonus.bonusAmount > 0
                ? formatCurrencyCompact(bonus.bonusAmount)
                : '—'}
            </dd>
          </div>
        </dl>
      </div>
    </DashboardPanel>
  )
}
