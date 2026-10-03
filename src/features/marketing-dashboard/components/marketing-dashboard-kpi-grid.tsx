import type { ReactNode } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleCheck,
  CircleDashed,
  Gauge,
  MessageSquareText,
  Minus,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react'

import {
  formatCurrencyAmount,
  formatCurrencyCompact,
} from '../../../shared/lib/currency'
import { cn } from '../../../shared/lib/cn'
import { DashboardPanel } from '../../admin/components/dashboard-section'
import {
  formatCommissionPercentage,
  formatCommissionTierRange,
} from '../../bookkeeping/components/salary-breakdown-parts'
import type { MarketingPerformanceMetrics } from '../types/marketing-dashboard'

function ChangeBadge({
  changePct,
  inverted = false,
  compact = false,
}: {
  changePct?: number | null
  inverted?: boolean
  compact?: boolean
}) {
  if (changePct == null) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
          inverted ? 'bg-white/10 text-white/70' : 'bg-slate-100 text-slate-500',
        )}
      >
        <Minus className="size-3" />
        {compact ? '—' : 'No prior data'}
      </span>
    )
  }

  if (changePct === 0) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
          inverted ? 'bg-white/10 text-white/70' : 'bg-slate-100 text-slate-500',
        )}
      >
        <Minus className="size-3" />
        {compact ? '0%' : 'Flat vs prior'}
      </span>
    )
  }

  const rising = changePct > 0

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
        inverted
          ? rising
            ? 'bg-emerald-400/15 text-emerald-100'
            : 'bg-rose-400/15 text-rose-100'
          : rising
            ? 'bg-[#E8F0FF] text-[#253CA1]'
            : 'bg-[#FCEEF1] text-[#6E2433]',
      )}
    >
      {rising ? (
        <ArrowUpRight className="size-3" />
      ) : (
        <ArrowDownRight className="size-3" />
      )}
      {Math.abs(changePct)}%{compact ? '' : ' vs prior'}
    </span>
  )
}

function KpiCard({
  label,
  value,
  changePct,
  icon,
  className,
}: {
  label: string
  value: ReactNode
  changePct?: number | null
  icon: ReactNode
  className?: string
}) {
  return (
    <DashboardPanel variant="plump" className={cn('p-0', className)}>
      <article className="flex flex-col gap-2 p-3 sm:p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {icon}
            <p className="truncate text-xs font-medium text-slate-500">{label}</p>
          </div>
          <ChangeBadge changePct={changePct} compact />
        </div>
        <div className="text-[1.35rem] leading-none font-bold tracking-tight text-slate-900 tabular-nums">
          {value}
        </div>
      </article>
    </DashboardPanel>
  )
}

function CommissionTierPanel({
  metrics,
}: {
  metrics: MarketingPerformanceMetrics
}) {
  const marketer = metrics.earnings

  if (!marketer) {
    return (
      <DashboardPanel
        variant="navy"
        className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both relative overflow-hidden p-3.5 sm:p-4 [animation-delay:80ms] lg:col-span-5"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-6 -right-4 size-28 rounded-full bg-white/10 blur-2xl"
        />
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-white">Commission tier</p>
            <span className="inline-flex size-8 items-center justify-center rounded-xl bg-white/15 text-white">
              <Gauge className="size-3.5" />
            </span>
          </div>
          <p className="mt-1 text-xs leading-snug text-white/60">
            Ask a manager to set your marketing salary to unlock tier progress.
          </p>
          <div className="mt-auto border-t border-white/10 pt-3">
            <p className="text-[10px] font-medium text-white/45">Your rate</p>
            <p className="mt-0.5 text-sm font-bold text-white">—</p>
          </div>
        </div>
      </DashboardPanel>
    )
  }

  const hasTier = marketer.tierMinAmount != null
  const tierMin = marketer.tierMinAmount
  const tierMax = marketer.tierMaxAmount
  const rangeAmount = marketer.rangeAmount
  const hasBoundedTier =
    hasTier && tierMin != null && tierMax != null && tierMax > tierMin

  const progressPct = hasBoundedTier
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(((rangeAmount - tierMin) / (tierMax - tierMin)) * 100),
        ),
      )
    : hasTier
      ? rangeAmount >= (tierMin ?? 0)
        ? 100
        : 0
      : 0

  const remainingToTierTop =
    hasBoundedTier && rangeAmount < tierMax ? tierMax - rangeAmount : null

  const subtitle = !hasTier
    ? 'No commission tier matches this range yet'
    : remainingToTierTop != null
      ? `${formatCurrencyCompact(remainingToTierTop)} more to top of tier`
      : hasBoundedTier
        ? 'At or above the top of this tier'
        : 'Open-ended tier'

  return (
    <DashboardPanel
      variant="navy"
      className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both relative overflow-hidden p-3.5 sm:p-4 [animation-delay:80ms] lg:col-span-5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-6 -right-4 size-28 rounded-full bg-white/10 blur-2xl"
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-white">Commission tier</p>
          <span className="inline-flex size-8 items-center justify-center rounded-xl bg-white/15 text-white">
            <Gauge className="size-3.5" />
          </span>
        </div>

        <p className="mt-1 text-xs leading-snug text-white/60">{subtitle}</p>

        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-2xl font-bold tracking-tight text-white tabular-nums">
            {formatCommissionPercentage(marketer.commissionPercentage)}
          </p>
          <div className="mb-1.5 w-full max-w-[7rem]">
            <p className="mb-1 text-right text-[11px] font-semibold tabular-nums text-white/80">
              {progressPct}%
            </p>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[#A8B8F0] transition-all duration-700 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
          <div>
            <p className="text-[10px] font-medium text-white/45">Range</p>
            <p
              className="mt-0.5 text-sm font-bold tabular-nums text-white"
              title={formatCurrencyAmount(rangeAmount)}
            >
              {formatCurrencyCompact(rangeAmount)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium text-white/45">Tier</p>
            <p
              className="mt-0.5 truncate text-sm font-bold tabular-nums text-white"
              title={formatCommissionTierRange(tierMin, tierMax)}
            >
              {hasTier
                ? tierMax != null
                  ? formatCurrencyCompact(tierMax)
                  : `${formatCurrencyCompact(tierMin ?? 0)}+`
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium text-white/45">Est. pay</p>
            <p
              className="mt-0.5 text-sm font-bold tabular-nums text-white"
              title={formatCurrencyAmount(marketer.commissionBonus)}
            >
              {marketer.commissionBonus > 0
                ? formatCurrencyCompact(marketer.commissionBonus)
                : '—'}
            </p>
          </div>
        </div>
      </div>
    </DashboardPanel>
  )
}

export function MarketingDashboardKpiGrid({
  metrics,
}: {
  metrics: MarketingPerformanceMetrics
}) {
  const { kpis, earningsMeta } = metrics
  const sparkHeights = [28, 44, 36, 58, 48, 72, 64, 80]

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-12 lg:items-stretch">
        <DashboardPanel
          variant="plump"
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both relative overflow-hidden p-3.5 sm:p-4 lg:col-span-7"
        >
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-7 items-center justify-center rounded-lg bg-[#E8EEFF] text-[#253CA1]">
                  <Wallet className="size-3.5" />
                </span>
                <p className="text-sm font-semibold text-slate-800">Expected pay</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                {earningsMeta.period || 'This period'}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-end gap-2.5">
              <p
                className="text-[1.85rem] leading-none font-bold tracking-tight text-slate-900 tabular-nums sm:text-[2.1rem]"
                title={formatCurrencyAmount(kpis.expectedPay.current)}
              >
                <span className="sm:hidden">
                  {formatCurrencyCompact(kpis.expectedPay.current)}
                </span>
                <span className="hidden sm:inline">
                  {formatCurrencyAmount(kpis.expectedPay.current)}
                </span>
              </p>
              <div className="mb-0.5">
                <ChangeBadge changePct={kpis.expectedPay.changePct} compact />
              </div>
            </div>

            <p className="mt-1.5 text-xs text-slate-400">
              Prior{' '}
              <span className="font-semibold text-slate-600">
                {formatCurrencyCompact(kpis.expectedPay.previous)}
              </span>
            </p>

            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-4 top-14 flex h-10 items-end justify-end gap-1 opacity-[0.1]"
            >
              {sparkHeights.map((height, index) => (
                <span
                  key={index}
                  className="w-2 rounded-t-sm bg-[#253CA1]"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>

            <div className="relative z-10 mt-auto flex flex-wrap gap-1.5 pt-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                <Users className="size-3 opacity-70" />
                {kpis.newLeads.current} leads
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                <MessageSquareText className="size-3 opacity-60" />
                {kpis.consults.current} consults
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                <UserPlus className="size-3 opacity-60" />
                {kpis.enrollments.current} enrolls
              </span>
            </div>
          </div>
        </DashboardPanel>

        <CommissionTierPanel metrics={metrics} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both [animation-delay:120ms]"
          label="New leads"
          value={kpis.newLeads.current.toLocaleString('en-US')}
          changePct={kpis.newLeads.changePct}
          icon={
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-[#E8EEFF] text-[#253CA1]">
              <Users className="size-3" />
            </span>
          }
        />
        <KpiCard
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both [animation-delay:160ms]"
          label="Consults"
          value={kpis.consults.current.toLocaleString('en-US')}
          changePct={kpis.consults.changePct}
          icon={
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-[#E8F7EF] text-[#1F5A3D]">
              <MessageSquareText className="size-3" />
            </span>
          }
        />
        <KpiCard
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both [animation-delay:200ms]"
          label="Enrollments"
          value={kpis.enrollments.current.toLocaleString('en-US')}
          changePct={kpis.enrollments.changePct}
          icon={
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-[#E8EEFF] text-[#253CA1]">
              <UserPlus className="size-3" />
            </span>
          }
        />
      </div>

      <StudentPaymentsCard
        className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both [animation-delay:280ms]"
        payments={kpis.studentPayments}
      />
    </div>
  )
}

function StudentPaymentsCard({
  payments,
  className,
}: {
  payments: MarketingPerformanceMetrics['kpis']['studentPayments']
  className?: string
}) {
  const total = payments.completed + payments.incomplete
  const completedShare =
    total > 0 ? Math.round((payments.completed / total) * 100) : 0
  const incompleteShare = total > 0 ? 100 - completedShare : 0

  return (
    <DashboardPanel
      variant="plump"
      className={cn('overflow-hidden p-0', className)}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-0 sm:p-0">
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:border-r sm:border-slate-100 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-base font-bold text-slate-900">
                Student payments
              </p>
              <p className="mt-0.5 text-sm text-slate-400">
                Plan completions and open installments this period
              </p>
            </div>
            <ChangeBadge changePct={payments.changePct} />
          </div>

          <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
            {total === 0 ? (
              <div className="h-full w-full rounded-full bg-slate-200/80" />
            ) : (
              <>
                {completedShare > 0 ? (
                  <div
                    className="h-full bg-[#3D9B6E] transition-all duration-700 ease-out"
                    style={{ width: `${completedShare}%` }}
                    title={`Completed ${completedShare}%`}
                  />
                ) : null}
                {incompleteShare > 0 ? (
                  <div
                    className="h-full bg-amber-400 transition-all duration-700 ease-out"
                    style={{ width: `${incompleteShare}%` }}
                    title={`Incomplete ${incompleteShare}%`}
                  />
                ) : null}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:w-[min(100%,22rem)] sm:shrink-0 sm:gap-0">
          <div className="rounded-2xl bg-[#E8F7EF]/70 px-4 py-3.5 sm:rounded-none sm:bg-transparent sm:px-5 sm:py-5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <CircleCheck className="size-3.5 text-[#1F5A3D]" />
              Completed
            </p>
            <p className="mt-2 text-[1.75rem] leading-none font-bold tracking-tight text-slate-900 tabular-nums">
              {payments.completed.toLocaleString('en-US')}
            </p>
            <p className="mt-1.5 text-xs text-slate-400">
              {completedShare}% of period plans
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50/80 px-4 py-3.5 sm:rounded-none sm:border-l sm:border-slate-100 sm:bg-transparent sm:px-5 sm:py-5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <CircleDashed className="size-3.5 text-amber-700" />
              Incomplete
            </p>
            <p className="mt-2 text-[1.75rem] leading-none font-bold tracking-tight text-slate-900 tabular-nums">
              {payments.incomplete.toLocaleString('en-US')}
            </p>
            <p className="mt-1.5 text-xs text-slate-400">
              Still open with period activity
            </p>
          </div>
        </div>
      </div>
    </DashboardPanel>
  )
}
