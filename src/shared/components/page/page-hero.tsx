import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { PageBackdrop } from './page-backdrop'
import { isDarkTheme, type PagePattern, type PageTheme } from './page-themes'

export type HeroStat = {
  id: string
  label: string
  value: ReactNode
  icon: LucideIcon
  /** Optional caption under the number, e.g. "+3 this week". */
  caption?: string
  /** When set, the arrow button runs this (usually a list filter). */
  onSelect?: () => void
  /** Accessible label for the arrow button. */
  hint?: string
  active?: boolean
}

function HeroStatCard({ stat }: { stat: HeroStat }) {
  const Icon = stat.icon
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col justify-between gap-5 rounded-3xl p-4 backdrop-blur-md transition sm:p-5',
        stat.active
          ? 'bg-white shadow-[0_16px_32px_-16px_rgba(20,27,58,0.45)]'
          : 'bg-white/70',
      )}
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon className="size-3.5" strokeWidth={2} />
        </span>
        {stat.label}
      </p>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-3xl font-bold tracking-tight text-ink tabular-nums sm:text-4xl">
            {stat.value}
          </p>
          {stat.caption ? (
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
              {stat.caption}
            </p>
          ) : null}
        </div>
        {stat.onSelect ? (
          <button
            type="button"
            onClick={stat.onSelect}
            aria-label={stat.hint ?? `Show ${stat.label}`}
            title={stat.hint}
            aria-pressed={stat.active}
            className={cn(
              'inline-flex size-11 shrink-0 items-center justify-center rounded-full shadow-sm transition hover:-translate-y-0.5',
              stat.active
                ? 'bg-brand-500 text-white'
                : 'bg-white text-ink hover:bg-brand-500 hover:text-white',
            )}
          >
            <ArrowUpRight className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

/** Brand-blue call-to-action tile that sits beside the stats. */
export function HeroSpotlight({
  title,
  description,
  actions,
  className,
}: {
  title: string
  description?: string
  actions: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col justify-between gap-5 rounded-3xl bg-brand-500 p-5 text-white shadow-[0_20px_40px_-20px_rgba(37,60,161,0.8)]',
        className,
      )}
    >
      <div>
        <p className="text-lg font-bold tracking-tight">{title}</p>
        {description ? (
          <p className="mt-0.5 text-xs font-medium text-white/75">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">{actions}</div>
    </div>
  )
}

/** White pill used for actions inside a spotlight or a dark hero. */
export function HeroPillButton({
  children,
  onClick,
  icon: Icon,
}: {
  children: ReactNode
  onClick: () => void
  icon?: LucideIcon
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-ink shadow-sm transition hover:bg-ink hover:text-white"
    >
      {Icon ? <Icon className="size-4" /> : null}
      {children}
    </button>
  )
}

/**
 * Top-of-page banner for list and overview pages: themed backdrop, title,
 * optional stats (which can act as quick filters) and a spotlight action.
 */
export function PageHero({
  title,
  description,
  eyebrow,
  theme,
  pattern,
  stats = [],
  spotlight,
  actions,
  children,
  compact = false,
}: {
  title: string
  description?: string
  eyebrow?: string
  theme: PageTheme
  pattern: PagePattern
  stats?: HeroStat[]
  spotlight?: ReactNode
  /** Buttons beside the title (e.g. Export). */
  actions?: ReactNode
  /** Anything else to place under the stats row. */
  children?: ReactNode
  /** Shorter banner for pages without stats. */
  compact?: boolean
}) {
  const dark = isDarkTheme(theme)
  const hasRow = stats.length > 0 || Boolean(spotlight)

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden rounded-[1.75rem] px-4 sm:px-6',
        compact ? 'py-6 sm:py-7' : 'pt-6 pb-4 sm:pt-7 sm:pb-6',
      )}
    >
      <PageBackdrop theme={theme} pattern={pattern} />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            {eyebrow ? (
              <p
                className={cn(
                  'mb-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-[0.14em] uppercase',
                  dark ? 'bg-white/15 text-white' : 'bg-white/70 text-brand-700',
                )}
              >
                {eyebrow}
              </p>
            ) : null}
            <h1
              className={cn(
                'text-3xl font-bold tracking-tight sm:text-4xl',
                dark ? 'text-white drop-shadow-sm' : 'text-ink',
              )}
            >
              {title}
            </h1>
            {description ? (
              <p
                className={cn(
                  'mt-1.5 max-w-xl text-sm font-medium',
                  dark ? 'text-white/80' : 'text-slate-600',
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>

        {hasRow ? (
          <div
            className={cn(
              'mt-8 grid gap-3 sm:mt-12',
              stats.length > 0 &&
                'sm:grid-cols-2 lg:grid-cols-[repeat(var(--stat-count),minmax(0,13.5rem))_1fr]',
            )}
            style={{ ['--stat-count' as string]: String(Math.max(stats.length, 1)) }}
          >
            {stats.map((stat) => (
              <HeroStatCard key={stat.id} stat={stat} />
            ))}
            {spotlight ? (
              <div className="sm:col-span-2 lg:col-span-1 lg:ml-auto lg:w-full lg:max-w-xs">
                {spotlight}
              </div>
            ) : null}
          </div>
        ) : null}

        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </section>
  )
}
