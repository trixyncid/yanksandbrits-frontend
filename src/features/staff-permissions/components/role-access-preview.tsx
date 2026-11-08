import { Database, Eye, History } from 'lucide-react'

import { PageBackdrop } from '../../../shared/components/page'
import { cn } from '../../../shared/lib/cn'
import { PAGES, PAGE_SECTIONS } from '../../auth/lib/page-catalog'
import {
  LEVEL_LABEL,
  levelFor,
  type AccessChange,
  type AccessLevel,
  type PermissionIndex,
} from '../lib/access-levels'

const OPEN_LEVELS: AccessLevel[] = ['open', 'view', 'edit', 'full', 'custom']

/** What staff with this role will see: their sidebar, background data, and edits so far. */
export function RoleAccessPreview({
  index,
  selected,
  changes,
  showChanges,
}: {
  index: PermissionIndex
  selected: Set<string>
  changes: AccessChange[]
  showChanges: boolean
}) {
  const levels = new Map(PAGES.map((page) => [page.key, levelFor(page, selected, index)]))
  const visible = PAGES.filter((page) => {
    const level = levels.get(page.key)
    if (level === 'custom') {
      // Custom without the page switch is still hidden from the sidebar.
      return selected.has(index.get(page.openPermission) ?? '')
    }
    return level ? OPEN_LEVELS.includes(level) : false
  })
  const dataOnly = PAGES.filter((page) => levels.get(page.key) === 'data')

  return (
    <div className="relative isolate overflow-hidden rounded-[1.75rem] p-5 text-white">
      <PageBackdrop theme="ink" pattern="grid" />
      <div className="relative space-y-5">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] text-white/60 uppercase">
            <Eye className="size-3.5" />
            Their sidebar
          </p>
          {visible.length === 0 ? (
            <p className="mt-2 text-sm text-white/70">No pages yet.</p>
          ) : (
            <div className="mt-2 space-y-2.5">
              {PAGE_SECTIONS.map((section) => {
                const pages = visible.filter((page) => page.section === section)
                if (pages.length === 0) return null
                return (
                  <div key={section}>
                    <p className="text-[10px] font-semibold tracking-[0.14em] text-white/45 uppercase">
                      {section}
                    </p>
                    <ul className="mt-1 space-y-1">
                      {pages.map((page) => (
                        <li
                          key={page.key}
                          className="flex items-center justify-between gap-2 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs"
                        >
                          <span className="truncate font-medium">{page.label}</span>
                          <span className="shrink-0 text-[10px] font-semibold text-white/60">
                            {LEVEL_LABEL[levels.get(page.key) ?? 'hidden']}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {dataOnly.length > 0 ? (
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] text-white/60 uppercase">
              <Database className="size-3.5" />
              Data only
            </p>
            <p className="mt-1 text-xs text-white/60">
              Not in the sidebar, but fills dropdowns on their pages.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {dataOnly.map((page) => (
                <span
                  key={page.key}
                  className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium"
                >
                  {page.label}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {showChanges ? (
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] text-white/60 uppercase">
              <History className="size-3.5" />
              Unsaved changes
            </p>
            {changes.length === 0 ? (
              <p className="mt-2 text-sm text-white/70">Nothing changed yet.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {changes.map((change) => (
                  <li key={change.label} className="flex items-start justify-between gap-2 text-xs">
                    <span className="min-w-0 font-medium">{change.label}</span>
                    <span className="shrink-0 text-right text-white/60">
                      {change.from} →{' '}
                      <span
                        className={cn(
                          'font-semibold',
                          change.removed ? 'text-rose-300' : 'text-brand-200',
                        )}
                      >
                        {change.to}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
