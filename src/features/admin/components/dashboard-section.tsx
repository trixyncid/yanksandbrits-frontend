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
    <section className={cn('space-y-4', className)}>
      {title || action ? (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            {title ? (
              <h2 className="text-[13px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
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
    'rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6',
  dark: 'rounded-[1.5rem] border border-white/10 bg-[linear-gradient(160deg,#2F5A94_0%,#1B3654_78%)] p-5 text-white sm:p-6',
  tint: 'rounded-[1.5rem] border border-[#D8E6FA]/70 bg-[#F5F9FF] p-5 sm:p-6',
  warm: 'rounded-[1.5rem] border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 sm:p-6',
  quiet: 'rounded-[1.5rem] border border-slate-200/70 bg-white p-5 sm:p-6',
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
        'flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-500',
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
}: {
  title: string
  description?: string
  action?: ReactNode
  inverted?: boolean
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h3
          className={cn(
            'truncate text-base leading-6 font-bold',
            inverted ? 'text-white' : 'text-slate-900',
          )}
        >
          {title}
        </h3>
        {description ? (
          <p
            className={cn(
              'mt-1 line-clamp-2 min-h-10 text-sm leading-5',
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
