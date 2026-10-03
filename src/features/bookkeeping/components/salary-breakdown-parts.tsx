import { format } from 'date-fns'
import {
  Gauge,
  Gift,
  GraduationCap,
  MessageSquareText,
  Sparkles,
  Wallet,
} from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'

import { cn } from '../../../shared/lib/cn'
import { formatCurrencyAmount } from '../../../shared/lib/currency'
import type {
  SalaryBreakdownMarketer,
  SalaryBreakdownMeta,
} from '../types/bookkeeping'

const breakdownSurfaceStyle = {
  '--sb-ink': '#1a2b42',
  '--sb-muted': '#64748b',
  '--sb-line': 'rgba(66, 116, 185, 0.16)',
  '--sb-blue': '#253CA1',
  '--sb-blue-deep': '#1B2A5A',
  '--sb-blue-soft': '#E8F0FA',
  '--sb-wash': '#F4F8FC',
  '--sb-consult': '#0e7490',
  '--sb-enroll': '#047857',
  '--sb-spif': '#b45309',
  '--sb-bonus': '#0f766e',
  '--sb-bonus-deep': '#115e59',
} as CSSProperties

export function formatSalaryBreakdownDate(value: string | null) {
  if (!value) {
    return '—'
  }
  return format(new Date(value), 'MMM d, yyyy')
}

export function formatCommissionPercentage(value: number) {
  if (!Number.isFinite(value) || value === 0) {
    return '0%'
  }
  const rounded = Math.round(value * 100) / 100
  return `${rounded % 1 === 0 ? String(rounded) : rounded.toFixed(2)}%`
}

export function formatCommissionTierRange(
  minAmount: number | null,
  maxAmount: number | null,
) {
  if (minAmount == null) {
    return 'No matching tier'
  }
  const minLabel = formatCurrencyAmount(minAmount)
  if (maxAmount == null) {
    return `${minLabel} and above`
  }
  return `${minLabel} – ${formatCurrencyAmount(maxAmount)}`
}

export function periodTypeLabel(periodType: string) {
  if (periodType === '5W') {
    return '5-week period'
  }
  if (periodType === '4W') {
    return '4-week period'
  }
  return periodType
}

type PaySlice = {
  key: string
  label: string
  amount: number
  color: string
}

function buildPaySlices(marketer: SalaryBreakdownMarketer): PaySlice[] {
  return [
    {
      key: 'base',
      label: 'Base',
      amount: marketer.mainSalary,
      color: '#1B2A5A',
    },
    {
      key: 'commission',
      label: 'Commission',
      amount: marketer.commissionBonus,
      color: '#253CA1',
    },
    {
      key: 'tier',
      label: 'Tier bonus',
      amount: marketer.tierBonus,
      color: '#0f766e',
    },
    {
      key: 'consult',
      label: 'Consult',
      amount: marketer.consultTotal,
      color: '#0e7490',
    },
    {
      key: 'enroll',
      label: 'Enrollment',
      amount: marketer.enrollmentTotal,
      color: '#047857',
    },
    {
      key: 'spif',
      label: 'SPIF',
      amount: marketer.spifTotal,
      color: '#b45309',
    },
  ].filter((slice) => slice.amount > 0)
}

function MetaChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-[var(--sb-line)] bg-white/70 px-2.5 py-1 text-[11px] font-medium tracking-wide text-[var(--sb-muted)]">
      {children}
    </span>
  )
}

export function SalaryBreakdownSurface({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      style={breakdownSurfaceStyle}
      className={cn(
        'relative overflow-hidden rounded-[1.5rem] border border-[var(--sb-line)]',
        'bg-[linear-gradient(165deg,var(--sb-wash)_0%,#ffffff_42%,#f7fafc_100%)]',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% 8%, rgba(66,116,185,0.12), transparent 42%), radial-gradient(circle at 88% 0%, rgba(47,90,148,0.08), transparent 36%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--sb-blue)]/35 to-transparent"
      />
      <div className="relative">{children}</div>
    </div>
  )
}

export function SalaryBreakdownSummaryStat({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string
  hint?: string
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-bottom-1 fill-mode-both relative overflow-hidden border px-4 py-4 transition duration-300',
        accent
          ? 'border-[var(--sb-blue)]/25 bg-[linear-gradient(145deg,#e8eeff_0%,#ffffff_55%,#f5f8ff_100%)]'
          : 'border-slate-200/90 bg-white/80',
      )}
    >
      <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
        {label}
      </p>
      <p
        className={cn(
          'mt-2 text-xl font-semibold tracking-tight tabular-nums sm:text-2xl',
          accent ? 'text-[var(--sb-blue-deep)]' : 'text-[var(--sb-ink)]',
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{hint}</p> : null}
    </div>
  )
}

export function SalaryBreakdownFeeRow({
  title,
  subtitle,
  amount,
  tone,
}: {
  title: string
  subtitle: string
  amount: number
  tone: 'consult' | 'enrollment'
}) {
  const toneClass =
    tone === 'consult'
      ? 'text-[var(--sb-consult)]'
      : 'text-[var(--sb-enroll)]'

  return (
    <div className="group flex items-start justify-between gap-4 border-b border-slate-100/90 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[var(--sb-ink)] transition group-hover:text-[var(--sb-blue-deep)]">
          {title}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
      </div>
      <span className={cn('shrink-0 text-sm font-semibold tabular-nums', toneClass)}>
        {formatCurrencyAmount(amount)}
      </span>
    </div>
  )
}

export function SalaryBreakdownSummaryStrip({
  meta,
  marketer,
  baseHint,
}: {
  meta: SalaryBreakdownMeta
  marketer?: SalaryBreakdownMarketer | null
  baseHint?: string
}) {
  const expectedPay = marketer?.expectedSalary ?? meta.totalExpectedSalary
  const mainSalary = marketer?.mainSalary ?? meta.totalMainSalary
  const rangeAmount = marketer?.rangeAmount ?? meta.totalRangeAmount
  const commissionBonus = marketer?.commissionBonus ?? meta.totalCommissionBonus
  const percentage = marketer?.commissionPercentage ?? null
  const tierBonus = marketer?.tierBonus ?? meta.totalTierBonus
  const telemarketingTotal =
    (marketer?.consultTotal ?? meta.totalConsultFees) +
    (marketer?.enrollmentTotal ?? meta.totalEnrollmentFees) +
    (marketer?.spifTotal ?? meta.totalSpif)

  return (
    <div
      style={breakdownSurfaceStyle}
      className="grid gap-px overflow-hidden rounded-2xl border border-[var(--sb-line)] bg-[var(--sb-line)] sm:grid-cols-2 xl:grid-cols-4"
    >
      <SalaryBreakdownSummaryStat
        label="Expected pay"
        value={formatCurrencyAmount(expectedPay)}
        hint="All earnings for this period"
        accent
      />
      <SalaryBreakdownSummaryStat
        label="Base salary"
        value={formatCurrencyAmount(mainSalary)}
        hint={baseHint}
      />
      <SalaryBreakdownSummaryStat
        label="Commission range"
        value={formatCurrencyAmount(rangeAmount)}
        hint={
          marketer
            ? periodTypeLabel(marketer.periodType)
            : `${meta.total} marketer${meta.total === 1 ? '' : 's'}`
        }
      />
      <SalaryBreakdownSummaryStat
        label={percentage == null ? 'Commission' : 'Commission rate'}
        value={
          percentage == null
            ? formatCurrencyAmount(commissionBonus)
            : formatCommissionPercentage(percentage)
        }
        hint={
          percentage == null
            ? 'Estimated commission payout'
            : [
                formatCurrencyAmount(commissionBonus),
                tierBonus > 0 ? `bonus ${formatCurrencyAmount(tierBonus)}` : null,
                telemarketingTotal > 0
                  ? `TM ${formatCurrencyAmount(telemarketingTotal)}`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ')
        }
      />
    </div>
  )
}

export function PayCompositionBar({
  marketer,
  inverted = false,
}: {
  marketer: SalaryBreakdownMarketer
  inverted?: boolean
}) {
  const slices = buildPaySlices(marketer)
  const total = slices.reduce((sum, slice) => sum + slice.amount, 0) || 1

  if (slices.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'flex h-3 overflow-hidden rounded-sm',
          inverted ? 'bg-white/15' : 'bg-slate-100/80',
        )}
      >
        {slices.map((slice, index) => (
          <div
            key={slice.key}
            title={`${slice.label}: ${formatCurrencyAmount(slice.amount)}`}
            className="h-full transition-[width] duration-700 ease-out first:rounded-l-sm last:rounded-r-sm"
            style={{
              width: `${(slice.amount / total) * 100}%`,
              backgroundColor: slice.color,
              transitionDelay: `${index * 60}ms`,
            }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {slices.map((slice) => (
          <div
            key={slice.key}
            className={cn(
              'flex items-center gap-2 text-xs',
              inverted ? 'text-white/70' : 'text-slate-600',
            )}
          >
            <span
              className="size-2 shrink-0 rounded-sm"
              style={{ backgroundColor: slice.color }}
            />
            <span>{slice.label}</span>
            <span
              className={cn(
                'font-semibold tabular-nums',
                inverted ? 'text-white' : 'text-[var(--sb-ink)]',
              )}
            >
              {formatCurrencyAmount(slice.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SalaryBreakdownCommissionRangeCard({
  marketer,
  className,
}: {
  marketer: SalaryBreakdownMarketer
  className?: string
}) {
  const hasTier = marketer.tierMinAmount != null
  const tierMin = marketer.tierMinAmount
  const tierMax = marketer.tierMaxAmount
  const rangeAmount = marketer.rangeAmount
  const hasBoundedTier =
    hasTier && tierMin != null && tierMax != null && tierMax > tierMin

  const progress = hasBoundedTier
    ? Math.min(
        100,
        Math.max(0, ((rangeAmount - tierMin) / (tierMax - tierMin)) * 100),
      )
    : hasTier
      ? rangeAmount >= (tierMin ?? 0)
        ? 100
        : 0
      : 0

  const remainingToTierTop =
    hasBoundedTier && rangeAmount < tierMax
      ? tierMax - rangeAmount
      : null
  const amountIntoTier = hasTier
    ? Math.max(0, rangeAmount - (tierMin ?? 0))
    : 0
  const tierSpan = hasBoundedTier ? tierMax - tierMin : null

  return (
    <section
      className={cn(
        'border border-[var(--sb-line)] bg-white/75 p-5 backdrop-blur-[2px]',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Gauge className="size-4 text-[var(--sb-blue)]" />
            <p className="text-[10px] font-semibold tracking-[0.16em] text-[var(--sb-blue)] uppercase">
              Commission progress
            </p>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-[var(--sb-blue-deep)]">
            {formatCurrencyAmount(rangeAmount)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {periodTypeLabel(marketer.periodType)} · payout base{' '}
            <span className="font-medium tabular-nums text-slate-700">
              {formatCurrencyAmount(marketer.payoutAmount)}
            </span>
          </p>
        </div>

        <div className="relative flex shrink-0 flex-col items-center">
          <div className="relative flex size-[4.75rem] items-center justify-center">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff_0%,var(--sb-blue-soft)_55%,#d5e4f5_100%)]"
            />
            <span
              aria-hidden
              className="absolute inset-[3px] rounded-full border border-[var(--sb-blue)]/15"
            />
            <span
              aria-hidden
              className="absolute inset-0 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
            />
            <p className="relative text-[1.35rem] leading-none font-bold tracking-tight tabular-nums text-[var(--sb-blue-deep)]">
              {formatCommissionPercentage(marketer.commissionPercentage)}
            </p>
          </div>
          <p className="mt-1.5 text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            Your rate
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-dashed border-slate-200/90 pt-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-[var(--sb-ink)]">
              {hasTier ? 'Current tier' : 'Outside configured tiers'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatCommissionTierRange(tierMin, tierMax)}
            </p>
          </div>
          {hasTier ? (
            <p className="text-xs text-slate-500">
              Est.{' '}
              <span className="font-semibold tabular-nums text-[var(--sb-ink)]">
                {formatCurrencyAmount(marketer.commissionBonus)}
              </span>
            </p>
          ) : null}
        </div>

        {hasTier ? (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
              <p className="font-medium text-slate-600">
                Range through this tier
              </p>
              <p className="tabular-nums text-slate-500">
                <span className="font-semibold text-[var(--sb-blue-deep)]">
                  {formatCurrencyAmount(amountIntoTier)}
                </span>
                {tierSpan != null ? (
                  <>
                    {' '}
                    of{' '}
                    <span className="font-medium text-slate-700">
                      {formatCurrencyAmount(tierSpan)}
                    </span>
                    <span className="ml-1.5 font-semibold text-[var(--sb-blue)]">
                      ({Math.round(progress)}%)
                    </span>
                  </>
                ) : (
                  <span className="ml-1.5 text-slate-400">
                    into open-ended tier
                  </span>
                )}
              </p>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--sb-blue)_0%,var(--sb-blue-deep)_100%)] transition-[width] duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] tabular-nums text-slate-400">
              <span>{formatCurrencyAmount(tierMin ?? 0)}</span>
              <span className="font-semibold text-[var(--sb-blue-deep)]">
                {formatCurrencyAmount(rangeAmount)}
              </span>
              <span>
                {tierMax != null
                  ? formatCurrencyAmount(tierMax)
                  : 'No upper limit'}
              </span>
            </div>

            {remainingToTierTop != null ? (
              <p className="text-xs text-slate-500">
                {formatCurrencyAmount(remainingToTierTop)} more range to the
                top of this tier
              </p>
            ) : hasBoundedTier && rangeAmount >= tierMax! ? (
              <p className="text-xs font-medium text-[#1F5A3D]">
                At or above the top of this tier
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-500">
            No commission tier matches this range amount yet.
          </p>
        )}
      </div>
    </section>
  )
}

export function SalaryBreakdownBonusRangeCard({
  marketer,
  className,
}: {
  marketer: SalaryBreakdownMarketer
  className?: string
}) {
  const hasTier = marketer.bonusTierMinAmount != null
  const tierMin = marketer.bonusTierMinAmount
  const tierMax = marketer.bonusTierMaxAmount
  const rangeAmount = marketer.rangeAmount
  const hasBoundedTier =
    hasTier && tierMin != null && tierMax != null && tierMax > tierMin

  const progress = hasBoundedTier
    ? Math.min(
        100,
        Math.max(0, ((rangeAmount - tierMin) / (tierMax - tierMin)) * 100),
      )
    : hasTier
      ? rangeAmount >= (tierMin ?? 0)
        ? 100
        : 0
      : 0

  const remainingToTierTop =
    hasBoundedTier && rangeAmount < tierMax
      ? tierMax - rangeAmount
      : null
  const amountIntoTier = hasTier
    ? Math.max(0, rangeAmount - (tierMin ?? 0))
    : 0
  const tierSpan = hasBoundedTier ? tierMax - tierMin : null

  return (
    <section
      className={cn(
        'border border-[var(--sb-line)] bg-white/75 p-5 backdrop-blur-[2px]',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Gift className="size-4 text-[var(--sb-bonus)]" />
            <p className="text-[10px] font-semibold tracking-[0.16em] text-[var(--sb-bonus)] uppercase">
              Bonuses progress
            </p>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-[var(--sb-bonus-deep)]">
            {formatCurrencyAmount(rangeAmount)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {periodTypeLabel(marketer.periodType)} · same payment range as
            commission
          </p>
        </div>

        <div className="relative flex shrink-0 flex-col items-center">
          <div className="relative flex size-[4.75rem] items-center justify-center">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff_0%,#ccfbf1_55%,#99f6e4_100%)]"
            />
            <span
              aria-hidden
              className="absolute inset-[3px] rounded-full border border-[var(--sb-bonus)]/20"
            />
            <span
              aria-hidden
              className="absolute inset-0 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
            />
            <p className="relative text-[1.05rem] leading-none font-bold tracking-tight tabular-nums text-[var(--sb-bonus-deep)]">
              {formatCurrencyAmount(marketer.tierBonus)}
            </p>
          </div>
          <p className="mt-1.5 text-[10px] font-semibold tracking-[0.14em] text-teal-700/70 uppercase">
            Tier bonus
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-dashed border-slate-200/90 pt-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-[var(--sb-ink)]">
              {hasTier ? 'Current bonus tier' : 'Outside configured bonus tiers'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatCommissionTierRange(tierMin, tierMax)}
            </p>
          </div>
          {hasTier ? (
            <p className="text-xs text-slate-500">
              Flat bonus for this range
            </p>
          ) : null}
        </div>

        {hasTier ? (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
              <p className="font-medium text-slate-600">
                Range through this tier
              </p>
              <p className="tabular-nums text-slate-500">
                <span className="font-semibold text-[var(--sb-bonus-deep)]">
                  {formatCurrencyAmount(amountIntoTier)}
                </span>
                {tierSpan != null ? (
                  <>
                    {' '}
                    of{' '}
                    <span className="font-medium text-slate-700">
                      {formatCurrencyAmount(tierSpan)}
                    </span>
                    <span className="ml-1.5 font-semibold text-[var(--sb-bonus)]">
                      ({Math.round(progress)}%)
                    </span>
                  </>
                ) : (
                  <span className="ml-1.5 text-slate-400">
                    into open-ended tier
                  </span>
                )}
              </p>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-teal-50">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--sb-bonus)_0%,var(--sb-bonus-deep)_100%)] transition-[width] duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] tabular-nums text-slate-400">
              <span>{formatCurrencyAmount(tierMin ?? 0)}</span>
              <span className="font-semibold text-[var(--sb-bonus-deep)]">
                {formatCurrencyAmount(rangeAmount)}
              </span>
              <span>
                {tierMax != null
                  ? formatCurrencyAmount(tierMax)
                  : 'No upper limit'}
              </span>
            </div>

            {remainingToTierTop != null ? (
              <p className="text-xs text-slate-500">
                {formatCurrencyAmount(remainingToTierTop)} more range to the
                top of this bonus tier
              </p>
            ) : hasBoundedTier && rangeAmount >= tierMax! ? (
              <p className="text-xs font-medium text-[#1F5A3D]">
                At or above the top of this bonus tier
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-500">
            No bonus tier matches this range amount yet.
          </p>
        )}
      </div>
    </section>
  )
}

function PaySummaryPanel({ marketer }: { marketer: SalaryBreakdownMarketer }) {
  const rows = [
    {
      label: 'Base salary',
      amount: marketer.mainSalary,
      hint: null as string | null,
    },
    {
      label: 'Commission bonus',
      amount: marketer.commissionBonus,
      hint: 'Completed plans × rate',
    },
    {
      label: 'Tier bonus',
      amount: marketer.tierBonus,
      hint: 'Flat bonus for payment range',
    },
    {
      label: 'Telemarketing · consult',
      amount: marketer.consultTotal,
      hint: '15k per non–walk-in consult',
    },
    {
      label: 'Telemarketing · enrollment',
      amount: marketer.enrollmentTotal,
      hint: '20k enrollment add-on',
    },
    {
      label: 'SPIF telemarketing',
      amount: marketer.spifTotal,
      hint: `${marketer.spifProspectCount} prospect${
        marketer.spifProspectCount === 1 ? '' : 's'
      } · every ${
        marketer.spifThreshold || (marketer.periodType === '5W' ? 6 : 5)
      } → 100k`,
    },
  ]

  return (
    <section className="border border-[var(--sb-line)] bg-white/75 p-5">
      <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
        Pay composition
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums text-[var(--sb-blue-deep)]">
        {formatCurrencyAmount(marketer.expectedSalary)}
      </p>
      <p className="mt-1 text-xs text-slate-500">Expected total for this period</p>

      <div className="mt-5">
        <PayCompositionBar marketer={marketer} />
      </div>

      <dl className="mt-5 space-y-0 border-t border-slate-100 pt-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-3 border-b border-slate-50 py-2.5 last:border-b-0"
          >
            <div className="min-w-0">
              <dt className="text-sm text-slate-600">{row.label}</dt>
              {row.hint ? (
                <p className="mt-0.5 text-[11px] text-slate-400">{row.hint}</p>
              ) : null}
            </div>
            <dd className="shrink-0 text-sm font-semibold tabular-nums text-[var(--sb-ink)]">
              {formatCurrencyAmount(row.amount)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function TelemarketingActivityPanel({
  marketer,
  className,
}: {
  marketer: SalaryBreakdownMarketer
  className?: string
}) {
  const hasFees = marketer.consultCount > 0 || marketer.enrollmentCount > 0
  const threshold =
    marketer.spifThreshold || (marketer.periodType === '5W' ? 6 : 5)

  return (
    <section
      className={cn(
        'border border-[var(--sb-line)] bg-white/75 p-5',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
            Telemarketing activity
          </p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
            Flat fees outside commission range — 15k consult, +20k enrollment,
            SPIF 100k per {threshold} prospects.
          </p>
        </div>
        {marketer.spifTotal > 0 || marketer.spifProspectCount > 0 ? (
          <div className="border border-amber-200/70 bg-amber-50/60 px-3 py-2 text-right">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] text-amber-800/80 uppercase">
              <Sparkles className="size-3" />
              SPIF
            </div>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-amber-900">
              {formatCurrencyAmount(marketer.spifTotal)}
            </p>
            <p className="text-[11px] text-amber-800/70">
              {marketer.spifProspectCount} / {threshold} · {marketer.spifUnits}×
            </p>
          </div>
        ) : null}
      </div>

      {!hasFees ? (
        <div className="mt-8 flex flex-col items-center justify-center py-6 text-center">
          <div className="flex size-12 items-center justify-center border border-dashed border-slate-200 bg-slate-50/80 text-slate-300">
            <Wallet className="size-5" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-600">
            No consult or enrollment fees yet
          </p>
          <p className="mt-1 max-w-xs text-xs text-slate-400">
            Course payments and prediction tests still count toward the range.
          </p>
        </div>
      ) : (
        <div className="mt-4 max-h-80 overflow-y-auto pr-1">
          {marketer.consults.length > 0 ? (
            <div className="mb-4">
              <div className="mb-1 flex items-center gap-2 border-b border-slate-100 pb-2">
                <MessageSquareText className="size-3.5 text-[var(--sb-consult)]" />
                <p className="text-xs font-semibold text-[var(--sb-consult)]">
                  Consults · 15k each
                </p>
                <span className="ml-auto text-[11px] tabular-nums text-slate-400">
                  {marketer.consultCount}
                </span>
              </div>
              {marketer.consults.map((item) => (
                <SalaryBreakdownFeeRow
                  key={`consult-${item.id}`}
                  title={item.name}
                  subtitle={`Consulted ${formatSalaryBreakdownDate(item.date)}${
                    item.resource ? ` · ${item.resource}` : ''
                  }`}
                  amount={item.amount}
                  tone="consult"
                />
              ))}
            </div>
          ) : null}

          {marketer.enrollments.length > 0 ? (
            <div>
              <div className="mb-1 flex items-center gap-2 border-b border-slate-100 pb-2">
                <GraduationCap className="size-3.5 text-[var(--sb-enroll)]" />
                <p className="text-xs font-semibold text-[var(--sb-enroll)]">
                  Enrollment add-ons · 20k each
                </p>
                <span className="ml-auto text-[11px] tabular-nums text-slate-400">
                  {marketer.enrollmentCount}
                </span>
              </div>
              {marketer.enrollments.map((item) => (
                <SalaryBreakdownFeeRow
                  key={`enroll-${item.id}`}
                  title={item.name}
                  subtitle={`Enrolled ${formatSalaryBreakdownDate(item.enrollmentDate)} · Consulted ${formatSalaryBreakdownDate(item.consultDate)}`}
                  amount={item.amount}
                  tone="enrollment"
                />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}

export function SalaryBreakdownMarketerDetail({
  marketer,
}: {
  marketer: SalaryBreakdownMarketer
}) {
  return (
    <div
      style={breakdownSurfaceStyle}
      className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both space-y-4 duration-500"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <SalaryBreakdownCommissionRangeCard marketer={marketer} />
        <SalaryBreakdownBonusRangeCard marketer={marketer} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <PaySummaryPanel marketer={marketer} />
        <TelemarketingActivityPanel marketer={marketer} />
      </div>
    </div>
  )
}

export function SalaryBreakdownHeaderMeta({
  periodLabel,
  marketer,
}: {
  periodLabel: string
  marketer: SalaryBreakdownMarketer
}) {
  return (
    <div
      style={breakdownSurfaceStyle}
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <div>
        <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
          Period
        </p>
        <p className="mt-0.5 text-sm font-semibold text-[var(--sb-ink)]">
          {periodLabel}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <MetaChip>
          {formatCommissionPercentage(marketer.commissionPercentage)} rate
        </MetaChip>
        {marketer.tierBonus > 0 ? (
          <MetaChip>
            <Gift className="size-3" />
            Bonus {formatCurrencyAmount(marketer.tierBonus)}
          </MetaChip>
        ) : null}
        <MetaChip>
          <MessageSquareText className="size-3" />
          {marketer.consultCount} consult
          {marketer.consultCount === 1 ? '' : 's'}
        </MetaChip>
        <MetaChip>
          <GraduationCap className="size-3" />
          {marketer.enrollmentCount} enrollment
          {marketer.enrollmentCount === 1 ? '' : 's'}
        </MetaChip>
        <MetaChip>
          <Sparkles className="size-3" />
          SPIF {formatCurrencyAmount(marketer.spifTotal)}
        </MetaChip>
      </div>
    </div>
  )
}
