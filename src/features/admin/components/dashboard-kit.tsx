import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../../shared/lib/cn'

/**
 * Small building blocks shared by the admin, marketing and tutor dashboards:
 * pill chips, change badges, round arrow buttons and the stacked-bar legend.
 */

/** Pill label for card headers, e.g. "Last 6 months". Not interactive. */
export function DashboardChip({
  children,
  icon: Icon,
  tone = 'soft',
  className,
}: {
  children: ReactNode
  icon?: LucideIcon
  tone?: 'soft' | 'brand' | 'ink' | 'glass'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex h-8 max-w-full items-center gap-1.5 rounded-full px-3 text-xs font-semibold whitespace-nowrap tabular-nums',
        tone === 'soft' && 'bg-canvas text-slate-600',
        tone === 'brand' && 'bg-brand-50 text-brand-700',
        tone === 'ink' && 'bg-ink text-white',
        tone === 'glass' && 'bg-white/12 text-white',
        className,
      )}
    >
      {Icon ? <Icon className="size-3.5 shrink-0 opacity-75" /> : null}
      <span className="truncate">{children}</span>
    </span>
  )
}

/** Change vs the prior period as a soft pill. */
export function DashboardDelta({
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
  const base =
    'inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2 text-[11px] font-semibold tabular-nums whitespace-nowrap'

  if (changePct == null || changePct === 0) {
    const label =
      changePct == null
        ? compact
          ? 'No prior'
          : 'No prior data'
        : compact
          ? '0%'
          : 'Same as before'
    return (
      <span
        className={cn(
          base,
          'font-medium',
          inverted ? 'bg-white/10 text-white/70' : 'bg-canvas text-slate-500',
        )}
      >
        <Minus className="size-3" />
        {label}
      </span>
    )
  }

  const rising = changePct > 0
  const good = lowerIsBetter ? !rising : rising

  return (
    <span
      className={cn(
        base,
        inverted
          ? good
            ? 'bg-emerald-400/15 text-emerald-100'
            : 'bg-rose-400/15 text-rose-100'
          : good
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-rose-50 text-rose-700',
      )}
      title={`${rising ? 'Up' : 'Down'} ${Math.abs(changePct)}% compared with the previous period`}
    >
      {rising ? (
        <ArrowUpRight className="size-3.5" />
      ) : (
        <ArrowDownRight className="size-3.5" />
      )}
      {Math.abs(changePct)}%{compact ? '' : ' vs before'}
    </span>
  )
}

/** Round ↗ button that scrolls to another card on the same page. */
export function DashboardJumpButton({
  targetId,
  label,
  inverted = false,
  className,
}: {
  targetId: string
  label: string
  inverted?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() =>
        document
          .getElementById(targetId)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      className={cn(
        'inline-flex size-10 shrink-0 items-center justify-center rounded-full transition hover:-translate-y-0.5',
        inverted
          ? 'bg-white text-ink hover:bg-brand-300'
          : 'bg-canvas text-ink hover:bg-ink hover:text-white',
        className,
      )}
    >
      <ArrowUpRight className="size-4" />
    </button>
  )
}

/** Thin progress meter with a lighter brand track. */
export function DashboardMeter({
  value,
  className,
  barClassName = 'bg-brand-500',
  trackClassName = 'bg-brand-50',
  label,
}: {
  /** 0–100 */
  value: number
  className?: string
  barClassName?: string
  trackClassName?: string
  label?: string
}) {
  const pct = Math.min(Math.max(value, 0), 100)
  return (
    <div
      className={cn('h-2 overflow-hidden rounded-full', trackClassName, className)}
      role={label ? 'meter' : undefined}
      aria-label={label}
      aria-valuenow={label ? Math.round(pct) : undefined}
      aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? 100 : undefined}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-700 ease-out',
          barClassName,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/** Big headline number used inside cards. */
export function DashboardFigure({
  value,
  compactValue,
  title,
  className,
}: {
  value: ReactNode
  /** Shorter version shown on phones. */
  compactValue?: ReactNode
  title?: string
  className?: string
}) {
  return (
    <p
      className={cn(
        'text-3xl leading-none font-bold tracking-tight tabular-nums sm:text-[2.5rem]',
        className,
      )}
      title={title}
    >
      {compactValue != null ? (
        <>
          <span className="sm:hidden">{compactValue}</span>
          <span className="hidden sm:inline">{value}</span>
        </>
      ) : (
        value
      )}
    </p>
  )
}

/** Colored square used beside a label in a legend or breakdown row. */
export function DashboardSwatch({
  color,
  className,
}: {
  color: string
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn('inline-block size-2.5 shrink-0 rounded-full', className)}
      style={{ backgroundColor: color }}
    />
  )
}

/**
 * Horizontal stacked bar with 2px gaps between segments and a hover title on
 * every segment.
 */
export function DashboardStackedBar({
  segments,
  className,
  formatValue,
}: {
  segments: { label: string; value: number; color: string }[]
  className?: string
  formatValue?: (value: number) => string
}) {
  const visible = segments.filter((segment) => segment.value > 0)
  const total = visible.reduce((sum, segment) => sum + segment.value, 0)

  if (total <= 0) {
    return <div className={cn('h-3 rounded-full bg-canvas', className)} />
  }

  return (
    <div className={cn('flex h-3 gap-0.5', className)}>
      {visible.map((segment) => (
        <div
          key={segment.label}
          className="h-full min-w-1.5 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${(segment.value / total) * 100}%`,
            backgroundColor: segment.color,
          }}
          title={`${segment.label}: ${formatValue ? formatValue(segment.value) : segment.value}`}
        />
      ))}
    </div>
  )
}
