import { Link } from '@tanstack/react-router'
import { ArrowLeft, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { PageBackdrop } from './page-backdrop'
import { isDarkTheme, type PagePattern, type PageTheme } from './page-themes'

/**
 * Header for create, edit and detail pages: a back link, the page title, and
 * a slim themed band so the page keeps its section's identity.
 */
export function PageHeader({
  backTo,
  backLabel,
  title,
  description,
  icon: Icon,
  theme,
  pattern,
  actions,
  badge,
}: {
  /** Route the back link goes to, e.g. "/programs". */
  backTo: string
  backLabel: string
  title: ReactNode
  description?: ReactNode
  icon: LucideIcon
  theme: PageTheme
  pattern: PagePattern
  actions?: ReactNode
  /** Small status chip beside the title, e.g. "Draft" or "Approved". */
  badge?: ReactNode
}) {
  const dark = isDarkTheme(theme)

  return (
    <section className="relative isolate overflow-hidden rounded-[1.75rem] px-4 py-5 sm:px-6 sm:py-6">
      <PageBackdrop theme={theme} pattern={pattern} />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            to={backTo}
            aria-label={`Back to ${backLabel}`}
            title={`Back to ${backLabel}`}
            className={cn(
              'inline-flex size-11 shrink-0 items-center justify-center rounded-full transition hover:-translate-x-0.5',
              dark
                ? 'bg-white/15 text-white hover:bg-white/25'
                : 'bg-white text-ink shadow-sm hover:bg-brand-50',
            )}
          >
            <ArrowLeft className="size-4" />
          </Link>
          <span
            className={cn(
              'hidden size-12 shrink-0 items-center justify-center rounded-2xl sm:inline-flex',
              dark ? 'bg-white text-brand-600' : 'bg-brand-500 text-white',
            )}
          >
            <Icon className="size-5" strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            <p
              className={cn(
                'text-xs font-semibold',
                dark ? 'text-white/70' : 'text-slate-500',
              )}
            >
              {backLabel}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h1
                className={cn(
                  'truncate text-2xl font-bold tracking-tight sm:text-[1.75rem]',
                  dark ? 'text-white' : 'text-ink',
                )}
              >
                {title}
              </h1>
              {badge}
            </div>
            {description ? (
              <p
                className={cn(
                  'mt-0.5 text-sm',
                  dark ? 'text-white/80' : 'text-slate-600',
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </section>
  )
}
