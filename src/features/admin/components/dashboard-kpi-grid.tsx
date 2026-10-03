import type { ReactNode } from 'react'
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Target,
  UserPlus,
  Users,
} from 'lucide-react'

import {
  formatCurrencyAmount,
  formatCurrencyCompact,
} from '../../../shared/lib/currency'
import { cn } from '../../../shared/lib/cn'
import type { DashboardMetrics } from '../types/dashboard'
import { DashboardGauge, DashboardSparkline } from './dashboard-charts'
import { DashboardPanel } from './dashboard-section'

function ChangeBadge({
  changePct,
  inverted = false,
}: {
  changePct?: number | null
  inverted?: boolean
}) {
  if (changePct == null) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
          inverted ? 'bg-white/10 text-white/70' : 'bg-slate-100 text-slate-500',
        )}
      >
        <Minus className="size-3" />
        No prior data
      </span>
    )
  }

  if (changePct === 0) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
          inverted ? 'bg-white/10 text-white/70' : 'bg-slate-100 text-slate-500',
        )}
      >
        <Minus className="size-3" />
        Flat vs prior
      </span>
    )
  }

  const positive = changePct > 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
        inverted
          ? positive
            ? 'bg-emerald-400/15 text-emerald-100'
            : 'bg-rose-400/15 text-rose-100'
          : positive
            ? 'bg-[#E8F7EF] text-[#1F5A3D]'
            : 'bg-[#FCEEF1] text-[#6E2433]',
      )}
    >
      {positive ? (
        <ArrowUpRight className="size-3.5" />
      ) : (
        <ArrowDownRight className="size-3.5" />
      )}
      {Math.abs(changePct)}% vs prior
    </span>
  )
}

function SupportingCard({
  label,
  value,
  detail,
  icon,
  children,
  className,
}: {
  label: string
  value: string
  detail: string
  icon?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <article className={cn('flex h-full flex-col p-3', className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
          {label}
        </p>
        {icon}
      </div>
      <div className="mt-1.5 flex min-h-[52px] flex-1 items-center">
        {children ?? (
          <p className="text-[1.25rem] leading-none font-bold tracking-tight text-slate-900 tabular-nums">
            {value}
          </p>
        )}
      </div>
      <p className="pt-1.5 text-[11px] leading-snug text-slate-500">{detail}</p>
    </article>
  )
}

export function DashboardKpiGrid({ metrics }: { metrics: DashboardMetrics }) {
  const { kpis, trends } = metrics
  const sparklineValues = trends.revenue.map((item) => item.revenue)

  return (
    <div className="grid items-stretch gap-2 xl:grid-cols-2">
      <DashboardPanel variant="dark" className="justify-between overflow-hidden">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-white/55 uppercase">
              Revenue
            </p>
            <p
              className="mt-1.5 text-[1.5rem] leading-none font-bold tracking-tight tabular-nums sm:text-[1.75rem]"
              title={formatCurrencyAmount(kpis.revenue.current)}
            >
              <span className="sm:hidden">
                {formatCurrencyCompact(kpis.revenue.current)}
              </span>
              <span className="hidden sm:inline">
                {formatCurrencyAmount(kpis.revenue.current)}
              </span>
            </p>
          </div>
          <ChangeBadge changePct={kpis.revenue.changePct} inverted />
        </div>

        <div className="mt-3">
          <p className="mb-1.5 text-[10px] font-semibold tracking-[0.12em] text-white/45 uppercase">
            Last 6 months
          </p>
          <DashboardSparkline values={sparklineValues} color="#A8C8F0" />
        </div>

        <p className="mt-2 text-[11px] text-white/65">
          {formatCurrencyCompact(kpis.revenue.studentPayments)} tuition ·{' '}
          {formatCurrencyCompact(kpis.revenue.predictionTests)} tests in this
          period
        </p>
      </DashboardPanel>

      <div className="grid h-full grid-cols-1 gap-2 sm:grid-cols-2 sm:grid-rows-2">
        <DashboardPanel variant="quiet" className="p-0">
          <SupportingCard
            label="New enrollments"
            value={kpis.newEnrollments.current.toLocaleString('en-US')}
            detail={`${kpis.newEnrollments.previous} enrolled in the prior period`}
            icon={
              <span className="inline-flex size-7 items-center justify-center rounded-md bg-[#E8F7EF] text-[#1F5A3D]">
                <UserPlus className="size-3.5" />
              </span>
            }
          >
            <div className="flex w-full items-end justify-between gap-2">
              <p className="text-[1.25rem] leading-none font-bold tracking-tight text-slate-900 tabular-nums">
                {kpis.newEnrollments.current.toLocaleString('en-US')}
              </p>
              <ChangeBadge changePct={kpis.newEnrollments.changePct} />
            </div>
          </SupportingCard>
        </DashboardPanel>

        <DashboardPanel variant="tint" className="p-0">
          <SupportingCard
            label="Active students"
            value={kpis.activeStudents.toLocaleString('en-US')}
            detail={
              metrics.branchId == null
                ? 'Currently active across all branches'
                : 'Currently active across this branch'
            }
            icon={
              <span className="inline-flex size-7 items-center justify-center rounded-md bg-white text-[#1B2A5A] ring-1 ring-[#D8E6FA]">
                <Users className="size-3.5" />
              </span>
            }
          />
        </DashboardPanel>

        <DashboardPanel variant="quiet" className="p-0">
          <article className="flex h-full flex-col p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                Conversion
              </p>
              <span className="inline-flex size-7 items-center justify-center rounded-md bg-[#E8F7EF] text-[#1F5A3D]">
                <Target className="size-3.5" />
              </span>
            </div>
            <div className="mt-1.5 flex min-h-[52px] flex-1 items-center">
              <DashboardGauge
                value={kpis.conversionRate}
                size={72}
                strokeWidth={7}
                color="#3D9B6E"
              />
            </div>
            <p className="pt-1.5 text-[11px] leading-snug text-slate-500">
              New prospects who reached enrolled
            </p>
          </article>
        </DashboardPanel>

        <DashboardPanel variant="warm" className="p-0">
          <SupportingCard
            label="Pending collections"
            value={formatCurrencyAmount(kpis.pendingCollections.amount)}
            detail={`${kpis.pendingCollections.count} payment${kpis.pendingCollections.count === 1 ? '' : 's'} awaiting approval`}
            icon={
              <span className="inline-flex size-7 items-center justify-center rounded-md bg-amber-100 text-[#9A3412]">
                <AlertCircle className="size-3.5" />
              </span>
            }
          >
            <p
              className="text-[1.25rem] leading-none font-bold tracking-tight text-[#9A3412] tabular-nums"
              title={formatCurrencyAmount(kpis.pendingCollections.amount)}
            >
              <span className="sm:hidden">
                {formatCurrencyCompact(kpis.pendingCollections.amount)}
              </span>
              <span className="hidden sm:inline">
                {formatCurrencyAmount(kpis.pendingCollections.amount)}
              </span>
            </p>
          </SupportingCard>
        </DashboardPanel>
      </div>
    </div>
  )
}
