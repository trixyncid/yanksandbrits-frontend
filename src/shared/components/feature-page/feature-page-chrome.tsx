import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

type FeaturePageAtmosphereProps = {
  children: ReactNode
  className?: string
}

/** Soft brand wash + floating orbs behind feature content. */
export function FeaturePageAtmosphere({
  children,
  className,
}: FeaturePageAtmosphereProps) {
  return (
    <div className={cn('relative isolate', className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[1.5rem]"
      >
        <div className="absolute -top-24 -left-16 size-[22rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(37,60,161,0.16),transparent_68%)] blur-2xl" />
        <div className="absolute top-32 -right-20 size-[26rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(123,147,232,0.14),transparent_70%)] blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 size-[20rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(232,238,255,0.9),transparent_72%)] blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(245,248,255,0.35)_0%,transparent_42%,rgba(247,249,252,0.5)_100%)]" />
      </div>
      {children}
    </div>
  )
}

type GlassSurfaceProps = {
  children: ReactNode
  className?: string
}

export function GlassSurface({ children, className }: GlassSurfaceProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/70 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:rounded-3xl',
        className,
      )}
    >
      {children}
    </div>
  )
}

type FeatureHeroStat = {
  label: string
  value: string | number
  hint?: string
}

type FeatureHeroProps = {
  icon: LucideIcon
  eyebrow?: string
  title: string
  description: string
  actions?: ReactNode
  stats?: FeatureHeroStat[]
  className?: string
}

export function FeatureHero({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
  stats,
  className,
}: FeatureHeroProps) {
  return (
    <section
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:rounded-3xl',
        className,
      )}
    >
      <div className="relative p-4 sm:p-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 right-0 size-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(37,60,161,0.12),transparent_70%)]"
        />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="relative shrink-0">
              <div className="absolute -inset-1.5 rounded-[1.1rem] bg-[radial-gradient(circle_at_center,rgba(37,60,161,0.14),transparent_70%)]" />
              <div className="relative inline-flex size-10 items-center justify-center rounded-xl bg-[linear-gradient(160deg,#253CA1_0%,#1B2A5A_100%)] text-white shadow-md shadow-[#253CA1]/25 sm:size-11">
                <Icon className="size-5" strokeWidth={1.75} />
              </div>
            </div>
            <div className="min-w-0 pt-0.5">
              {eyebrow ? (
                <p className="text-[10px] font-semibold tracking-[0.12em] text-[#253CA1] uppercase">
                  {eyebrow}
                </p>
              ) : null}
              <h2
                className={cn(
                  'text-xl font-bold tracking-tight text-slate-900 sm:text-2xl',
                  eyebrow ? 'mt-1' : 'mt-0',
                )}
              >
                {title}
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-snug text-slate-500">
                {description}
              </p>
            </div>
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {actions}
            </div>
          ) : null}
        </div>

        {stats && stats.length > 0 ? (
          <div className="relative mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
              >
                <p className="text-[10px] font-semibold tracking-[0.1em] text-slate-400 uppercase">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {stat.value}
                </p>
                {stat.hint ? (
                  <p className="mt-0.5 text-[11px] text-slate-500">{stat.hint}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

type FormSectionCardProps = {
  icon: LucideIcon
  title: string
  description: string
  children: ReactNode
  className?: string
  delayClassName?: string
}

export function FormSectionCard({
  icon: Icon,
  title,
  description,
  children,
  className,
  delayClassName = '',
}: FormSectionCardProps) {
  return (
    <section
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:rounded-3xl',
        delayClassName,
        className,
      )}
    >
      <div className="border-b border-slate-100 bg-[linear-gradient(90deg,#F5F8FF_0%,#FFFFFF_100%)] px-4 py-3 sm:px-5">
        <div className="flex items-start gap-2.5">
          <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#E8EEFF] text-[#253CA1] ring-1 ring-[#C8D4F5]/80">
            <Icon className="size-4" strokeWidth={1.85} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold tracking-tight text-slate-900">
              {title}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="space-y-3.5 p-4 sm:p-5">{children}</div>
    </section>
  )
}

type ChoiceTileProps = {
  selected: boolean
  onSelect: () => void
  title: string
  description?: string
  name: string
}

export function ChoiceTile({
  selected,
  onSelect,
  title,
  description,
  name,
}: ChoiceTileProps) {
  return (
    <label
      className={cn(
        'relative flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 transition duration-200',
        selected
          ? 'border-[#253CA1] bg-[linear-gradient(135deg,#F5F8FF_0%,#E8EEFF_100%)] shadow-sm shadow-[#253CA1]/10 ring-1 ring-[#253CA1]/20'
          : 'border-slate-200/90 bg-white hover:border-[#C8D4F5] hover:bg-[#F5F8FF]/80',
      )}
    >
      <input
        type="radio"
        name={name}
        className="mt-0.5 size-4 border-slate-300 text-[#253CA1] focus:ring-[#253CA1]/40"
        checked={selected}
        onChange={onSelect}
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-800">{title}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-slate-500">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  )
}

type ScoreTileProps = {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
  accent?: string
  required?: boolean
}

export function ScoreTile({
  label,
  htmlFor,
  error,
  children,
  accent = '#253CA1',
  required,
}: ScoreTileProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#C8D4F5] hover:shadow-md hover:shadow-[#253CA1]/8">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 opacity-80"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />
      <label
        htmlFor={htmlFor}
        className="text-[10px] font-semibold tracking-[0.12em] text-slate-400 uppercase"
      >
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? <p className="mt-1.5 text-xs text-rose-500">{error}</p> : null}
    </div>
  )
}
