import { ChevronDown, Search, Wallet } from 'lucide-react'
import { useMemo, useState, type CSSProperties } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { cn } from '../../../shared/lib/cn'
import { formatCurrencyAmount } from '../../../shared/lib/currency'
import { useBookkeepingSalaryBreakdownQuery } from '../hooks/use-bookkeeping-query'
import type { SalaryBreakdownMarketer } from '../types/bookkeeping'
import {
  SalaryBreakdownMarketerDetail,
  SalaryBreakdownSummaryStrip,
  SalaryBreakdownSurface,
  formatCommissionPercentage,
  periodTypeLabel,
} from './salary-breakdown-parts'

const listSurfaceStyle = {
  '--sb-ink': '#1a2b42',
  '--sb-muted': '#64748b',
  '--sb-line': 'rgba(66, 116, 185, 0.16)',
  '--sb-blue': '#253CA1',
  '--sb-blue-deep': '#1B2A5A',
  '--sb-wash': '#F4F8FC',
} as CSSProperties

type BookkeepingSalaryBreakdownProps = {
  bookkeepingId: string
  periodLabel: string
  enabled?: boolean
}

function MarketerBreakdownCard({
  marketer,
  defaultOpen,
}: {
  marketer: SalaryBreakdownMarketer
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const initial = (marketer.marketerName || '?').slice(0, 1).toUpperCase()

  return (
    <article
      className={cn(
        'overflow-hidden border transition duration-300',
        open
          ? 'border-[var(--sb-blue)]/30 bg-white'
          : 'border-slate-200/90 bg-white/90 hover:border-slate-300',
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[var(--sb-wash)]/60"
        aria-expanded={open}
      >
        <div className="flex size-11 shrink-0 items-center justify-center border border-[var(--sb-line)] bg-[linear-gradient(145deg,#3A56B8,#1B2A5A)] text-sm font-semibold text-white">
          {initial}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h3 className="truncate text-base font-semibold text-[var(--sb-ink)]">
              {marketer.marketerName}
            </h3>
            <span className="text-[11px] font-medium tracking-wide text-slate-400">
              {marketer.marketerPin}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">{marketer.email}</p>
          <p className="mt-2 text-[11px] text-slate-500">
            <span className="font-medium text-[var(--sb-blue-deep)]">
              {formatCommissionPercentage(marketer.commissionPercentage)}
            </span>
            <span className="mx-1.5 text-slate-300">·</span>
            {periodTypeLabel(marketer.periodType)}
            <span className="mx-1.5 text-slate-300">·</span>
            {marketer.consultCount} consult
            {marketer.consultCount === 1 ? '' : 's'}
            <span className="mx-1.5 text-slate-300">·</span>
            {marketer.enrollmentCount} enroll
            {marketer.enrollmentCount === 1 ? '' : 's'}
            <span className="mx-1.5 text-slate-300">·</span>
            SPIF {formatCurrencyAmount(marketer.spifTotal)}
          </p>
        </div>

        <div className="hidden text-right sm:block">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            Expected
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--sb-blue-deep)]">
            {formatCurrencyAmount(marketer.expectedSalary)}
          </p>
        </div>

        <ChevronDown
          className={cn(
            'size-5 shrink-0 text-slate-400 transition-transform duration-300',
            open && 'rotate-180 text-[var(--sb-blue)]',
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[var(--sb-line)] bg-[var(--sb-wash)]/40 px-5 py-5">
            <div className="mb-4 flex items-center justify-between gap-3 sm:hidden">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                Expected salary
              </p>
              <p className="text-base font-semibold tabular-nums text-[var(--sb-blue-deep)]">
                {formatCurrencyAmount(marketer.expectedSalary)}
              </p>
            </div>
            <SalaryBreakdownMarketerDetail marketer={marketer} />
          </div>
        </div>
      </div>
    </article>
  )
}

export function BookkeepingSalaryBreakdown({
  bookkeepingId,
  periodLabel,
  enabled = true,
}: BookkeepingSalaryBreakdownProps) {
  const query = useBookkeepingSalaryBreakdownQuery(bookkeepingId, enabled)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const rows = query.data?.data ?? []
    const needle = search.trim().toLowerCase()
    if (!needle) {
      return rows
    }
    return rows.filter((row) =>
      [row.marketerPin, row.marketerName, row.email]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
  }, [query.data?.data, search])

  if (query.isLoading) {
    return (
      <div className="animate-pulse border border-slate-200/80 bg-white px-6 py-14 text-center text-sm text-slate-500">
        Loading salary breakdown...
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="border border-rose-200/80 bg-rose-50/60 px-6 py-12 text-center text-sm text-rose-600">
        {getApiErrorMessage(query.error)}
      </div>
    )
  }

  const meta = query.data?.meta
  const marketers = query.data?.data ?? []

  if (!meta || marketers.length === 0) {
    return (
      <div className="border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
        <Wallet className="mx-auto size-9 text-slate-300" />
        <p className="mt-4 text-sm font-semibold text-slate-800">
          No salary profiles for this period
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Marketers need a configured base salary to appear in the breakdown.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5" style={listSurfaceStyle}>
      <SalaryBreakdownSurface className="animate-in fade-in slide-in-from-bottom-1 p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
              Period overview
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--sb-ink)]">
              Salary breakdown
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Base, commission, telemarketing, and SPIF for {periodLabel}.
            </p>
          </div>
        </div>
        <SalaryBreakdownSummaryStrip
          meta={meta}
          baseHint={`${meta.total} marketer${meta.total === 1 ? '' : 's'}`}
        />
      </SalaryBreakdownSurface>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Showing{' '}
          <span className="font-semibold text-slate-700">{filtered.length}</span>{' '}
          of {marketers.length}
        </p>
        <label className="relative block w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, PIN, email…"
            className="w-full border border-slate-200 bg-white py-2.5 pr-3 pl-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[var(--sb-blue)]/50 focus:ring-2 focus:ring-[var(--sb-blue)]/10"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          No marketers match “{search.trim()}”.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((marketer, index) => (
            <MarketerBreakdownCard
              key={marketer.marketerId}
              marketer={marketer}
              defaultOpen={
                index === 0 && (marketer.feesTotal > 0 || marketer.spifTotal > 0)
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
