import type { ReactNode } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clock3,
  Minus,
  Sparkles,
  UserCheck,
  Wallet,
} from 'lucide-react'

import {
  formatCurrencyAmount,
  formatCurrencyCompact,
} from '../../../shared/lib/currency'
import { cn } from '../../../shared/lib/cn'
import { DashboardPanel } from '../../admin/components/dashboard-section'
import type { TutorPerformanceMetrics } from '../types/tutor-dashboard'

function ChangeBadge({
  changePct,
  inverted = false,
  lowerIsBetter = false,
  compact = false,
}: {
  changePct?: number | null
  inverted?: boolean
  lowerIsBetter?: boolean
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
  const positive = lowerIsBetter ? !rising : rising

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
        inverted
          ? positive
            ? 'bg-emerald-400/15 text-emerald-100'
            : 'bg-rose-400/15 text-rose-100'
          : positive
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
  lowerIsBetter = false,
  className,
}: {
  label: string
  value: ReactNode
  changePct?: number | null
  icon: ReactNode
  lowerIsBetter?: boolean
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
          <ChangeBadge changePct={changePct} lowerIsBetter={lowerIsBetter} compact />
        </div>
        <div className="text-[1.35rem] leading-none font-bold tracking-tight text-slate-900 tabular-nums">
          {value}
        </div>
      </article>
    </DashboardPanel>
  )
}

export function TutorDashboardKpiGrid({
  metrics,
}: {
  metrics: TutorPerformanceMetrics
}) {
  const { kpis, workload, earningsMeta } = metrics
  const bonus = kpis.bonusProgress
  const bonusPct = Math.min(Math.max(bonus.progressPct, 0), 100)
  const sparkHeights = [28, 44, 36, 58, 48, 72, 64, 80]

  return (
    <div className="space-y-3">
      {/* Row 1: money / bonus */}
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
                <CalendarDays className="size-3 opacity-70" />
                {workload.workingDays} days
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                <BookOpen className="size-3 opacity-60" />
                {workload.sessionsPerDay}/day
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                {kpis.finishedSessions.current} sess.
              </span>
            </div>
          </div>
        </DashboardPanel>

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
              <p className="text-sm font-bold text-white">Bonus insight</p>
              <span className="inline-flex size-8 items-center justify-center rounded-xl bg-white/15 text-white">
                <Sparkles className="size-3.5" />
              </span>
            </div>

            <p className="mt-1 text-xs leading-snug text-white/60">
              {bonus.remaining > 0 && bonus.nextTierMin != null
                ? `${bonus.remaining} more to next tier`
                : bonus.nextTierMin == null && bonus.sessionCount > 0
                  ? 'Top tier reached'
                  : 'Finish sessions to earn bonus'}
            </p>

            <div className="mt-3 flex items-end justify-between gap-2">
              <p className="text-2xl font-bold tracking-tight text-white tabular-nums">
                {bonusPct}
                <span className="ml-0.5 text-sm font-semibold text-white/50">%</span>
              </p>
              <div className="mb-1.5 h-1.5 w-full max-w-[7rem] overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-[#A8B8F0] transition-all duration-700 ease-out"
                  style={{ width: `${bonusPct}%` }}
                />
              </div>
            </div>

            <div className="mt-auto grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
              <div>
                <p className="text-[10px] font-medium text-white/45">Sessions</p>
                <p className="mt-0.5 text-sm font-bold tabular-nums text-white">
                  {bonus.sessionCount}
                  {bonus.nextTierMin != null ? (
                    <span className="text-white/40">/{bonus.nextTierMin}</span>
                  ) : null}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-white/45">Remaining</p>
                <p className="mt-0.5 text-sm font-bold tabular-nums text-white">
                  {bonus.nextTierMin != null ? bonus.remaining : '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-white/45">Earned</p>
                <p className="mt-0.5 text-sm font-bold tabular-nums text-white">
                  {bonus.bonusAmount > 0
                    ? formatCurrencyCompact(bonus.bonusAmount)
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </DashboardPanel>
      </div>

      {/* Row 2: delivery KPIs */}
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both [animation-delay:120ms]"
          label="Finished sessions"
          value={kpis.finishedSessions.current.toLocaleString('en-US')}
          changePct={kpis.finishedSessions.changePct}
          icon={
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-[#E8EEFF] text-[#253CA1]">
              <BookOpen className="size-3" />
            </span>
          }
        />
        <KpiCard
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both [animation-delay:160ms]"
          label="Hours taught"
          value={kpis.hoursTaught.current.toLocaleString('en-US', {
            maximumFractionDigits: 1,
          })}
          changePct={kpis.hoursTaught.changePct}
          icon={
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-[#E8F7EF] text-[#1F5A3D]">
              <Clock3 className="size-3" />
            </span>
          }
        />
        <KpiCard
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both [animation-delay:200ms]"
          label="Attendance"
          value={`${kpis.studentAttendanceRate.current}%`}
          changePct={kpis.studentAttendanceRate.changePct}
          icon={
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-[#E8EEFF] text-[#253CA1]">
              <UserCheck className="size-3" />
            </span>
          }
        />
      </div>
    </div>
  )
}
