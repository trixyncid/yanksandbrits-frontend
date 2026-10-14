import { Info, Users } from 'lucide-react'

import { formatCurrencyAmount } from '../../../shared/lib/currency'
import { cn } from '../../../shared/lib/cn'
import type { TeamRange, TeamRangeStep } from '../types/bookkeeping'

const STEP_COPY: Record<TeamRangeStep, { label: string; order: number }> = {
  prediction_test: { label: 'Prediction test', order: 1 },
  first_installment: { label: '1st of 2 payments', order: 2 },
  whole_plan: { label: 'Whole plan', order: 3 },
}

function formatDate(value: string | null) {
  if (!value) return '—'
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(parsed)
}

/**
 * A Branch Manager's team range: what they and their counsellors collected,
 * filled up to the cap set by the top bonus tier, with anything taken out to
 * make room for newer payments. It picks the tier bonus only.
 */
export function TeamRangeCard({
  teamRange,
  className,
}: {
  teamRange: TeamRange
  className?: string
}) {
  const { cap, rangeAmount, rawAmount } = teamRange
  const percent = cap ? Math.min(100, Math.round((rangeAmount / cap) * 100)) : null
  const removed = [...teamRange.removed].sort(
    (a, b) => STEP_COPY[a.step].order - STEP_COPY[b.step].order,
  )
  const removedTotal = removed.reduce((sum, item) => sum + item.amount, 0)

  return (
    <section className={cn('rounded-[1.75rem] bg-white p-5 sm:p-6', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Users className="size-[1.1rem]" />
          </span>
          <div>
            <h3 className="text-base font-bold tracking-tight text-ink">Team range</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              You and {Math.max(teamRange.teamSize - 1, 0)} counsellor
              {teamRange.teamSize - 1 === 1 ? '' : 's'} at your branch. This
              range sets your tier bonus
              {teamRange.tierBonus > 0
                ? ` (${formatCurrencyAmount(teamRange.tierBonus)} this period)`
                : ''}
              . Commission is only on your own payments.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">
            {formatCurrencyAmount(rangeAmount)}
          </p>
          <p className="text-xs font-medium text-slate-500">
            {cap ? `of ${formatCurrencyAmount(cap)} cap` : 'No cap set'}
          </p>
        </div>
      </div>

      {percent != null ? (
        <div className="mt-4">
          <div
            className="h-2.5 overflow-hidden rounded-full bg-canvas"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label="Team range filled"
          >
            <div
              className={cn(
                'h-full rounded-full transition-all',
                percent >= 100 ? 'bg-brand-700' : 'bg-brand-500',
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            {percent >= 100
              ? 'Full. Newer payments make room by taking out older ones (see below).'
              : `${percent}% full · ${formatCurrencyAmount(cap! - rangeAmount)} until the cap`}
          </p>
        </div>
      ) : (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-canvas px-3.5 py-2.5 text-xs text-slate-600">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          Set a max amount on the top bonus tier for this period to cap the
          team range.
        </p>
      )}

      {teamRange.contributions.length > 0 ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {teamRange.contributions.map((person) => (
            <li
              key={`${person.ownerName}-${person.isManager}`}
              className="flex items-center justify-between gap-3 rounded-2xl bg-canvas/70 px-3.5 py-2.5"
            >
              <span className="min-w-0 truncate text-sm font-semibold text-ink">
                {person.ownerName}
                {person.isManager ? (
                  <span className="ml-1.5 rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">
                    You
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 text-sm font-semibold text-slate-600 tabular-nums">
                {formatCurrencyAmount(person.amount)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {removed.length > 0 ? (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="text-sm font-bold text-ink">Taken out to make room</h4>
            <p className="text-xs text-slate-500">
              {formatCurrencyAmount(removedTotal)} of {formatCurrencyAmount(rawAmount)} collected
            </p>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Only from the team range, so only your tier bonus is affected.
            Nobody's commission changes. Order:
            prediction tests, then 1st of 2 payments, then whole plans; yours
            before your team's, oldest first.
          </p>
          <ul className="mt-3 space-y-1.5">
            {removed.map((item) => (
              <li
                key={item.key}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-canvas/70 px-3.5 py-2.5 text-sm"
              >
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    'bg-white text-slate-600',
                  )}
                >
                  {STEP_COPY[item.step].label}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-ink">
                  {item.studentName || item.paymentTitle || 'Payment'}
                  <span className="font-normal text-slate-500">
                    {' · '}
                    {item.isManager ? 'You' : item.ownerName} · {formatDate(item.date)}
                  </span>
                </span>
                <span className="shrink-0 font-semibold text-slate-600 tabular-nums">
                  −{formatCurrencyAmount(item.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
