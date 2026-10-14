import type { ReactNode } from 'react'

import { cn } from '../../../shared/lib/cn'

type DashboardSectionProps = {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  id?: string
}

/** A labelled group of bento cards on a dashboard. */
export function DashboardSection({
  title,
  description,
  action,
  children,
  className,
  id,
}: DashboardSectionProps) {
  return (
    <section id={id} className={cn('scroll-mt-24 space-y-2', className)}>
      {title || action ? (
        <div className="flex flex-wrap items-end justify-between gap-2 px-1 pt-1">
          <div className="min-w-0">
            {title ? (
              <h2 className="flex items-center gap-2 text-sm font-bold tracking-tight text-ink">
                <span aria-hidden className="h-4 w-1 rounded-full bg-brand-500" />
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-0.5 pl-3 text-xs text-slate-500 sm:text-sm">
                {description}
              </p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  )
}

/**
 * Card surfaces for dashboard bento grids. The variant names are kept stable
 * because other sections reuse this panel.
 */
const panelVariants = {
  /** Default white card. */
  surface: 'rounded-[1.75rem] bg-white p-4 sm:p-5',
  /** White card, slightly roomier. */
  plump: 'rounded-[1.75rem] bg-white p-4 sm:p-6',
  /** The one dark contrast card per dashboard. */
  dark: 'rounded-[1.75rem] bg-ink p-4 text-white shadow-[0_24px_48px_-28px_rgba(20,27,58,0.8)] sm:p-5',
  /** Navy card with a soft brand bloom. */
  navy: 'rounded-[1.75rem] bg-radial-[at_100%_0%] from-brand-500 via-brand-800 to-ink p-4 text-white shadow-[0_24px_48px_-28px_rgba(20,27,58,0.8)] sm:p-6',
  /** Pale brand tint, for a quieter companion card. */
  tint: 'rounded-[1.75rem] bg-brand-50 p-4 sm:p-5',
  /** Gradient tint, light. */
  navyTint:
    'rounded-[1.75rem] bg-linear-145 from-brand-100 via-brand-50 to-white p-4 sm:p-6',
  /** Warm accent (used for money that needs attention). */
  warm: 'rounded-[1.75rem] bg-amber-50 p-4 sm:p-5',
  /** Plain white, compact. */
  quiet: 'rounded-[1.75rem] bg-white p-4 sm:p-5',
}

export type DashboardPanelVariant = keyof typeof panelVariants

export function DashboardPanel({
  children,
  className,
  variant = 'surface',
}: {
  children: ReactNode
  className?: string
  variant?: DashboardPanelVariant
}) {
  return (
    <div
      className={cn(
        'flex h-full min-w-0 flex-col',
        panelVariants[variant],
        className,
      )}
    >
      {children}
    </div>
  )
}

export function DashboardEmptyState({
  message,
  className,
  inverted = false,
}: {
  message: string
  className?: string
  inverted?: boolean
}) {
  return (
    <p
      className={cn(
        'flex flex-1 items-center justify-center rounded-3xl px-4 py-8 text-center text-sm',
        inverted ? 'bg-white/10 text-white/70' : 'bg-canvas text-slate-500',
        className,
      )}
    >
      {message}
    </p>
  )
}

export function DashboardCardHeader({
  title,
  description,
  action,
  icon,
  inverted = false,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  /** Optional round icon shown before the title. */
  icon?: ReactNode
  inverted?: boolean
  className?: string
}) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-3', className)}>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {icon ? (
          <span
            className={cn(
              'inline-flex size-10 shrink-0 items-center justify-center rounded-full',
              inverted ? 'bg-white/12 text-white' : 'bg-brand-50 text-brand-600',
            )}
          >
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h3
            className={cn(
              'text-base leading-6 font-bold tracking-tight sm:text-lg',
              inverted ? 'text-white' : 'text-ink',
            )}
          >
            {title}
          </h3>
          {description ? (
            <p
              className={cn(
                'mt-0.5 line-clamp-2 text-xs leading-5 sm:text-sm',
                inverted ? 'text-white/65' : 'text-slate-500',
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
