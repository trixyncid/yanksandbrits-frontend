import { AlertCircle, RefreshCw, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { Button } from '../ui/button'

/** Friendly placeholder for an empty list, tab, or panel. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-[1.75rem] bg-white px-6 py-14 text-center',
        className,
      )}
    >
      <span className="relative inline-flex size-16 items-center justify-center">
        <span aria-hidden className="absolute inset-0 rounded-full bg-brand-50" />
        <span aria-hidden className="absolute inset-2 rounded-full bg-brand-100" />
        <Icon className="relative size-6 text-brand-600" strokeWidth={1.7} />
      </span>
      <h2 className="mt-4 text-base font-bold tracking-tight text-ink">{title}</h2>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

/** Skeleton for a list page body (table card). */
export function ListLoadingState({ rows = 7 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-white" aria-busy="true">
      <div className="px-6 pt-6 pb-4">
        <div className="h-6 w-44 animate-pulse rounded-full bg-canvas" />
        <div className="mt-3 h-10 w-80 max-w-full animate-pulse rounded-full bg-canvas" />
      </div>
      <div className="space-y-2 px-6 pb-6">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-12 animate-pulse rounded-2xl bg-canvas/70"
            style={{ animationDelay: `${index * 40}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

/** Error card with a retry button. */
export function ListErrorState({
  title,
  description,
  onRetry,
}: {
  title: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-[1.75rem] bg-white px-5 py-12 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
        <AlertCircle className="size-6" />
      </div>
      <h2 className="mt-3 text-base font-bold text-ink">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
        {description ?? 'Something went wrong while loading. You can try again.'}
      </p>
      {onRetry ? (
        <Button variant="ink" className="mt-4" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Try again
        </Button>
      ) : null}
    </div>
  )
}
