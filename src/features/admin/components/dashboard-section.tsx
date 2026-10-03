import type { ReactNode } from 'react'

import { cn } from '../../../shared/lib/cn'

type DashboardSectionProps = {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function DashboardSection({
  title,
  description,
  action,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <section className={cn('space-y-1.5', className)}>
      {title || action ? (
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            {title ? (
              <h2 className="text-[12px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  )
}

const panelVariants = {
  surface:
    'rounded-xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-3',
  plump:
    'rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:rounded-3xl sm:p-5',
  dark: 'rounded-xl border border-white/10 bg-[linear-gradient(160deg,#1B2A5A_0%,#1B3654_78%)] p-3 text-white sm:p-3',
  navy: 'rounded-2xl border border-white/10 bg-[linear-gradient(160deg,#253CA1_0%,#1B2A5A_78%)] p-4 text-white shadow-[0_12px_32px_rgba(37,60,161,0.22)] sm:rounded-3xl sm:p-5',
  tint: 'rounded-xl border border-[#D8E6FA]/70 bg-[#F5F9FF] p-3 sm:p-3',
  navyTint:
    'rounded-2xl border border-[#C8D4F5]/80 bg-[linear-gradient(145deg,#E8EEFF_0%,#F5F8FF_55%,#FFFFFF_100%)] p-4 sm:rounded-3xl sm:p-5',
  warm: 'rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-3 sm:p-3',
  quiet: 'rounded-xl border border-slate-200/70 bg-white p-3 sm:p-3',
}

export function DashboardPanel({
  children,
  className,
  variant = 'surface',
}: {
  children: ReactNode
  className?: string
  variant?: keyof typeof panelVariants
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
}: {
  message: string
  className?: string
}) {
  return (
    <p
      className={cn(
        'flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-4 text-center text-sm text-slate-500',
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
  inverted = false,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  inverted?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-2 flex items-start justify-between gap-2',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <h3
          className={cn(
            'truncate text-sm leading-5 font-bold sm:text-base sm:leading-6',
            inverted ? 'text-white' : 'text-slate-900',
          )}
        >
          {title}
        </h3>
        {description ? (
          <p
            className={cn(
              'mt-0.5 line-clamp-2 text-xs leading-5 sm:text-sm',
              inverted ? 'text-white/70' : 'text-slate-500',
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 pt-0.5">{action}</div> : null}
    </div>
  )
}
