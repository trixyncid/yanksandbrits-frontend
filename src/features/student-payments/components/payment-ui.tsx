import type { ReactNode } from 'react'

import {
  PageBackdrop,
  type PagePattern,
} from '../../../shared/components/page'
import { cn } from '../../../shared/lib/cn'
import type { PillTone } from '../lib/payment-ui'
import type { StudentPaymentListItem } from '../types/student-payment'

const PILL_TONES: Record<PillTone, { pill: string; dot: string }> = {
  brand: { pill: 'bg-brand-50 text-brand-700', dot: 'bg-brand-500' },
  success: { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  warning: { pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  danger: { pill: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
  neutral: { pill: 'bg-canvas text-slate-500', dot: 'bg-slate-400' },
}

/** Soft status pill with a leading dot. */
export function StatusPill({
  tone,
  children,
  className,
}: {
  tone: PillTone
  children: ReactNode
  className?: string
}) {
  const styles = PILL_TONES[tone]
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap',
        styles.pill,
        className,
      )}
    >
      <span aria-hidden className={cn('size-1.5 rounded-full', styles.dot)} />
      {children}
    </span>
  )
}

/**
 * Dark navy money card used for balances and totals. Shared by the money
 * pages (payments, bookkeeping, salary reports).
 */
export function DuskPanel({
  children,
  className,
  pattern = 'grid',
}: {
  children: ReactNode
  className?: string
  pattern?: PagePattern
}) {
  return (
    <section
      className={cn(
        'relative isolate overflow-hidden rounded-[1.75rem] p-5 text-white sm:p-6',
        className,
      )}
    >
      <PageBackdrop theme="dusk" pattern={pattern} />
      <div className="relative">{children}</div>
    </section>
  )
}

/** One short bar per installment, coloured by its status. */
export function TermDots({ row }: { row: StudentPaymentListItem }) {
  if (row.terms.length === 0) return null
  return (
    <span className="flex items-center justify-center gap-1" aria-hidden>
      {row.terms.map((term) => (
        <span
          key={term.id}
          className={cn(
            'h-1.5 w-4 rounded-full',
            term.status === 'approved'
              ? 'bg-emerald-500'
              : term.status === 'pending'
                ? 'bg-brand-400'
                : 'bg-rose-300',
          )}
        />
      ))}
    </span>
  )
}

export type PayMixSegment = {
  label: string
  amount: number
  /** Tailwind background class for the bar and legend dot. */
  color: string
}

/**
 * Stacked bar showing how a payroll total splits into its parts. Made for the
 * dark hero, so text is white.
 */
export function PayMixBar({
  segments,
  formatAmount,
  label,
}: {
  segments: PayMixSegment[]
  formatAmount: (amount: number) => string
  label: string
}) {
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.amount), 0)

  return (
    <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-md">
      <p className="text-[11px] font-bold tracking-[0.14em] text-white/70 uppercase">
        {label}
      </p>
      <div
        className="mt-2.5 flex h-2.5 overflow-hidden rounded-full bg-white/15"
        role="img"
        aria-label={segments
          .map((segment) => `${segment.label} ${formatAmount(segment.amount)}`)
          .join(', ')}
      >
        {total > 0
          ? segments.map((segment) => (
              <div
                key={segment.label}
                className={cn('h-full', segment.color)}
                style={{ width: `${(Math.max(0, segment.amount) / total) * 100}%` }}
              />
            ))
          : null}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {segments.map((segment) => (
          <div key={segment.label} className="min-w-0">
            <dt className="flex items-center gap-1.5 text-[11px] font-medium text-white/70">
              <span className={cn('size-2 rounded-full', segment.color)} />
              {segment.label}
            </dt>
            <dd className="mt-0.5 truncate text-sm font-semibold text-white tabular-nums">
              {formatAmount(segment.amount)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
