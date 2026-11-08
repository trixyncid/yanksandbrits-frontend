import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../../shared/lib/cn'

export function StaffDetailItem({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  const empty = !value || value === '—'
  return (
    <div className={cn('min-w-0 rounded-2xl bg-canvas px-3.5 py-2.5', className)}>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd
        className={cn(
          'mt-0.5 text-sm font-semibold break-words',
          empty ? 'text-slate-400' : 'text-ink',
        )}
      >
        {empty ? '—' : value}
      </dd>
    </div>
  )
}

export function StaffDetailSection({
  title,
  description,
  children,
  className,
  icon: Icon,
}: {
  title: string
  description: string
  children: ReactNode
  className?: string
  icon?: LucideIcon
}) {
  return (
    <section className={cn(className)}>
      <div className="mb-3 flex items-start gap-3">
        {Icon ? (
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas text-ink">
            <Icon className="size-[1.1rem]" strokeWidth={1.9} />
          </span>
        ) : null}
        <div className="min-w-0">
          <h3 className="text-base font-bold tracking-tight text-ink">
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <dl className="grid gap-2 sm:grid-cols-2">{children}</dl>
    </section>
  )
}
