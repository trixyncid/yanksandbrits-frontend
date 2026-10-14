import { useNavigate } from '@tanstack/react-router'
import { CornerDownLeft, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../../../shared/components/ui/dialog'
import { cn } from '../../../shared/lib/cn'
import type { NavigationItem } from '../config/navigation'
import { searchablePages, type SearchEntry } from '../lib/page-search'

export function AdminCommandSearch({
  open,
  onOpenChange,
  navigation,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  navigation: NavigationItem[]
}) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)
  const pages = useMemo(() => searchablePages(navigation), [navigation])

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return pages
    return pages.filter(({ item, section }) =>
      `${item.label} ${section}`.toLowerCase().includes(needle),
    )
  }, [pages, query])

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  function close() {
    onOpenChange(false)
    setQuery('')
    setActiveIndex(0)
  }

  function go(entry: SearchEntry | undefined) {
    if (!entry) return
    close()
    void navigate({ to: entry.item.to })
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent
        showClose={false}
        className="top-[18%] max-w-lg translate-y-0 overflow-hidden rounded-[1.75rem] border-0 p-0"
      >
        <DialogTitle className="sr-only">Search pages</DialogTitle>
        <DialogDescription className="sr-only">
          Type to find a page, then press Enter to open it.
        </DialogDescription>
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <Search className="size-4 shrink-0 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setActiveIndex((index) => Math.min(index + 1, results.length - 1))
              } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                setActiveIndex((index) => Math.max(index - 1, 0))
              } else if (event.key === 'Enter') {
                event.preventDefault()
                go(results[activeIndex])
              }
            }}
            placeholder="Search pages, e.g. Programs"
            aria-label="Search pages"
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ink placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="rounded-md bg-canvas px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
            Esc
          </kbd>
        </div>
        <ul ref={listRef} className="max-h-80 overflow-y-auto p-2" role="listbox">
          {results.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-slate-500">
              No pages match “{query.trim()}”.
            </li>
          ) : (
            results.map((entry, index) => {
              const Icon = entry.item.icon
              const active = index === activeIndex
              return (
                <li key={`${entry.section}-${entry.item.id}`} role="option" aria-selected={active}>
                  <button
                    type="button"
                    data-index={index}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => go(entry)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition',
                      active ? 'bg-brand-50' : 'hover:bg-canvas',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex size-8 shrink-0 items-center justify-center rounded-full',
                        active ? 'bg-brand-500 text-white' : 'bg-canvas text-slate-500',
                      )}
                    >
                      <Icon className="size-4" strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {entry.item.label}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {entry.section}
                      </span>
                    </span>
                    {active ? (
                      <CornerDownLeft className="size-3.5 shrink-0 text-slate-400" />
                    ) : null}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
