import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  ChevronDown,
  Copy,
  Link2,
  Loader2,
  Search,
  X,
} from 'lucide-react'
import { useId, useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { DropdownSelect } from '../../../shared/components/ui/dropdown-select'
import { Input } from '../../../shared/components/ui/input'
import { cn } from '../../../shared/lib/cn'
import { notify } from '../../../shared/lib/notify'
import {
  PAGES,
  PAGES_BY_KEY,
  PAGE_SECTIONS,
  type PageDefinition,
} from '../../auth/lib/page-catalog'
import { fetchStaffPermission, fetchStaffPermissions } from '../api/staff-permissions-api'
import { staffPermissionQueryKeys } from '../api/staff-permission-query-keys'
import {
  ACTION_LABEL,
  DATA_ACTIONS,
  LEVELS_PAGE_ONLY,
  LEVELS_WITH_DATA,
  applyLevel,
  grantDataOnly,
  grantedRelated,
  levelFor,
  missingNeeds,
  pageState,
  pagesSharingData,
  recordState,
  setPageOpen,
  toggleRecordAction,
  type AccessLevel,
  type PermissionIndex,
  type RecordSet,
} from '../lib/access-levels'
import { mainRecords, pageRecords } from '../lib/page-records'

type Scope = 'all' | 'granted'

type RoleAccessMatrixProps = {
  index: PermissionIndex
  /** Catalog permissions no page covers; shown under "Other". */
  others: RecordSet[]
  selected: Set<string>
  onChange: (next: Set<string>) => void
  /** The role being edited, left out of "Copy from role". */
  roleId?: string
}

/**
 * The whole of a role's access in one list, page by page as staff see the
 * sidebar. A level covers the usual cases; Details holds the exact switches,
 * including settings that live inside a page (pay rates, attendance…).
 */
export function RoleAccessMatrix({
  index,
  others,
  selected,
  onChange,
  roleId,
}: RoleAccessMatrixProps) {
  const [search, setSearch] = useState('')
  const [scope, setScope] = useState<Scope>('all')
  // Open Details where the simple levels can't describe what the role has.
  const [detailsOpen, setDetailsOpen] = useState<Set<string>>(
    () =>
      new Set(
        PAGES.filter((page) => levelFor(page, selected, index) === 'custom').map(
          (page) => page.key,
        ),
      ),
  )

  function toggleDetails(key: string) {
    setDetailsOpen((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const hasAccess = (page: PageDefinition) =>
    levelFor(page, selected, index) !== 'hidden' ||
    grantedRelated(page, selected, index).length > 0

  const needle = search.trim().toLowerCase()
  const visiblePages = PAGES.filter((page) => {
    if (scope === 'granted' && !hasAccess(page)) return false
    if (!needle) return true
    return [
      page.label,
      page.description,
      page.section,
      ...pageRecords(page).map((records) => records.label),
    ]
      .join(' ')
      .toLowerCase()
      .includes(needle)
  })
  const visibleOthers = others.filter(
    (records) =>
      (!needle || `${records.label} ${records.description}`.toLowerCase().includes(needle)) &&
      (scope === 'all' ||
        DATA_ACTIONS.some((action) => recordState(records, selected, index)[action])),
  )

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find a page or setting, e.g. payment, pay rates…"
              aria-label="Find a page or setting"
              className="h-11 pl-11"
            />
          </div>
          <div
            role="radiogroup"
            aria-label="Which pages to show"
            className="inline-flex shrink-0 self-start rounded-full bg-canvas p-1 sm:self-auto"
          >
            {(
              [
                { id: 'all', label: 'All pages' },
                { id: 'granted', label: 'With access' },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={scope === option.id}
                onClick={() => setScope(option.id)}
                className={cn(
                  'h-8 rounded-full px-3.5 text-xs font-semibold transition',
                  scope === option.id
                    ? 'bg-white text-ink shadow-sm'
                    : 'text-slate-500 hover:text-ink',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CopyFromRole roleId={roleId} onCopy={(ids) => onChange(new Set(ids))} />
          <button
            type="button"
            disabled={selected.size === 0}
            onClick={() => onChange(new Set())}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-canvas px-3 text-xs font-semibold text-slate-600 transition hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="size-3.5" />
            Remove all access
          </button>
        </div>
      </div>

      {visiblePages.length === 0 && visibleOthers.length === 0 ? (
        <div className="rounded-2xl bg-canvas px-5 py-10 text-center">
          <p className="text-sm font-semibold text-ink">Nothing matches</p>
          <p className="mt-1 text-sm text-slate-500">
            {scope === 'granted' && !needle
              ? 'This role has no access yet. Show all pages to start adding some.'
              : 'Try another word, or show all pages.'}
          </p>
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-brand-500 hover:underline"
            onClick={() => {
              setSearch('')
              setScope('all')
            }}
          >
            Show all pages
          </button>
        </div>
      ) : null}

      {PAGE_SECTIONS.map((section) => {
        const pages = visiblePages.filter((page) => page.section === section)
        if (pages.length === 0) return null
        const sectionPages = PAGES.filter((page) => page.section === section)
        const granted = sectionPages.filter(hasAccess).length
        return (
          <section key={section} aria-label={section}>
            <div className="flex items-baseline justify-between gap-2 px-1">
              <h4 className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                {section}
              </h4>
              <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                {granted} of {sectionPages.length} with access
              </span>
            </div>
            <div className="mt-2 space-y-2">
              {pages.map((page) => (
                <PageRow
                  key={page.key}
                  page={page}
                  index={index}
                  selected={selected}
                  detailsOpen={detailsOpen.has(page.key)}
                  onToggleDetails={() => toggleDetails(page.key)}
                  onChange={onChange}
                />
              ))}
            </div>
          </section>
        )
      })}

      {visibleOthers.length > 0 ? (
        <section aria-label="Other">
          <h4 className="px-1 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            Other
          </h4>
          <p className="mt-1 px-1 text-xs text-slate-500">
            Records not tied to a page yet.
          </p>
          <div className="mt-2 rounded-2xl bg-canvas p-3 sm:p-4">
            <RecordGrid
              rows={visibleOthers}
              index={index}
              selected={selected}
              onChange={onChange}
            />
          </div>
        </section>
      ) : null}
    </div>
  )
}

function PageRow({
  page,
  index,
  selected,
  detailsOpen,
  onToggleDetails,
  onChange,
}: {
  page: PageDefinition
  index: PermissionIndex
  selected: Set<string>
  detailsOpen: boolean
  onToggleDetails: () => void
  onChange: (next: Set<string>) => void
}) {
  const detailsId = useId()
  const level = levelFor(page, selected, index)
  const levels = page.module ? LEVELS_WITH_DATA : LEVELS_PAGE_ONLY
  const records = pageRecords(page)
  const hasDetails = records.length > 0
  const related = grantedRelated(page, selected, index)
  const missing = missingNeeds(page, selected, index, PAGES_BY_KEY)
  const state = pageState(page, selected, index)
  // Pages on the same records always share read/create/edit/delete.
  const siblingsKeepingData = pagesSharingData(page).filter(
    (sibling) => pageState(sibling, selected, index).open,
  )
  const active = level !== 'hidden' || related.length > 0

  function setLevel(next: AccessLevel) {
    onChange(applyLevel(page, next, selected, index))
  }

  return (
    <div
      className={cn(
        'rounded-2xl px-3.5 py-3 transition sm:px-4',
        !active ? 'bg-canvas' : level === 'data' ? 'bg-slate-100' : 'bg-brand-50',
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className={cn('text-sm font-semibold', active ? 'text-ink' : 'text-slate-600')}>
              {page.label}
            </span>
            {level === 'custom' ? (
              <span
                className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800"
                title="A mix the levels don't cover. See Details."
              >
                Custom
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{page.description}</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <div
            role="radiogroup"
            aria-label={`${page.label} access`}
            className="inline-flex max-w-full overflow-x-auto rounded-full bg-white p-0.5 ring-1 ring-slate-200/70"
          >
            {levels.map((option) => {
              const isActive = level === option.level
              return (
                <button
                  key={option.level}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  title={option.hint}
                  onClick={() => setLevel(option.level)}
                  className={cn(
                    'h-7 shrink-0 rounded-full px-2.5 text-xs font-semibold transition sm:px-3',
                    isActive
                      ? option.level === 'hidden'
                        ? 'bg-slate-500 text-white'
                        : option.level === 'data'
                          ? 'bg-slate-700 text-white'
                          : 'bg-brand-500 text-white'
                      : 'text-slate-500 hover:bg-canvas hover:text-ink',
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
          {hasDetails ? (
            <button
              type="button"
              onClick={onToggleDetails}
              aria-expanded={detailsOpen}
              aria-controls={detailsId}
              className={cn(
                'inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-semibold transition',
                detailsOpen
                  ? 'bg-ink text-white'
                  : 'bg-white text-slate-500 ring-1 ring-slate-200/70 hover:text-ink',
              )}
            >
              Details
              <ChevronDown
                className={cn('size-3.5 transition-transform', detailsOpen ? 'rotate-180' : '')}
              />
            </button>
          ) : null}
        </div>
      </div>

      {related.length > 0 && !detailsOpen ? (
        <p className="mt-2 flex flex-wrap gap-1.5 text-xs text-slate-600">
          {related.map(({ records: item, label }) => (
            <span key={item.key} className="rounded-full bg-white px-2 py-0.5 ring-1 ring-slate-200/70">
              {item.label}: <span className="font-semibold text-ink">{label}</span>
            </span>
          ))}
        </p>
      ) : null}

      {detailsOpen && hasDetails ? (
        <div id={detailsId} className="mt-3 space-y-3 rounded-xl bg-white p-3 sm:p-4">
          {page.module ? (
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 size-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500/40"
                checked={state.open}
                onChange={(event) =>
                  onChange(setPageOpen(page, event.target.checked, selected, index))
                }
              />
              <span>
                <span className="block font-semibold text-ink">Show in sidebar</span>
                <span className="block text-xs text-slate-500">
                  Off keeps the page out of their menu; the data below still works
                  in other pages’ dropdowns.
                </span>
              </span>
            </label>
          ) : null}
          <RecordGrid
            rows={records}
            index={index}
            selected={selected}
            onChange={onChange}
            primaryKey={mainRecords(page)?.key}
          />
          {siblingsKeepingData.length > 0 ? (
            <p className="flex items-start gap-1.5 text-xs text-slate-500">
              <Link2 className="mt-0.5 size-3.5 shrink-0" />
              Same records as {siblingsKeepingData.map((item) => item.label).join(' and ')}:
              what one page can read or change, the others can too.
            </p>
          ) : null}
        </div>
      ) : null}

      {missing.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="size-3.5 shrink-0" />
          <span className="min-w-0 flex-1">
            Its dropdowns need {missing.map((item) => item.label).join(', ')}.
          </span>
          <button
            type="button"
            onClick={() => onChange(grantDataOnly(missing, selected, index))}
            className="rounded-full bg-amber-500 px-2.5 py-1 font-semibold text-white transition hover:bg-amber-600"
          >
            Allow as data only
          </button>
        </div>
      ) : null}
    </div>
  )
}

/** Read / Create / Edit / Delete switches, one row per kind of record. */
function RecordGrid({
  rows,
  index,
  selected,
  onChange,
  primaryKey,
}: {
  rows: RecordSet[]
  index: PermissionIndex
  selected: Set<string>
  onChange: (next: Set<string>) => void
  /** The page's own records, labelled so it stands apart from related settings. */
  primaryKey?: string
}) {
  const columns = 'grid grid-cols-[minmax(0,1fr)_repeat(4,2.5rem)] items-center gap-x-0.5 sm:grid-cols-[minmax(0,1fr)_repeat(4,3.75rem)] sm:gap-x-1'
  return (
    <div role="table" aria-label="Record permissions" className="text-sm">
      <div role="row" className={cn(columns, 'pb-1.5 text-[11px] font-semibold text-slate-400')}>
        <span role="columnheader">Records</span>
        {DATA_ACTIONS.map((action) => (
          <span key={action} role="columnheader" className="text-center">
            {ACTION_LABEL[action]}
          </span>
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map((records) => {
          const state = recordState(records, selected, index)
          return (
            <div key={records.key} role="row" className={cn(columns, 'py-2')}>
              <div role="rowheader" className="min-w-0 pr-2">
                <p className="font-medium break-words text-ink">
                  {records.label}
                  {records.key === primaryKey ? (
                    <span className="ml-1.5 inline-block text-[10px] font-semibold text-slate-400 uppercase">
                      page records
                    </span>
                  ) : null}
                </p>
                <p className="text-xs leading-snug text-slate-500">{records.description}</p>
              </div>
              {DATA_ACTIONS.map((action) => {
                const available = index.has(records.permissions[action])
                return (
                  <span key={action} role="cell" className="flex justify-center">
                    <input
                      type="checkbox"
                      aria-label={`${ACTION_LABEL[action]} ${records.label}`}
                      disabled={!available}
                      className="size-4 cursor-pointer rounded border-slate-300 text-brand-500 focus:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-30"
                      checked={state[action]}
                      onChange={(event) =>
                        onChange(
                          toggleRecordAction(records, action, event.target.checked, selected, index),
                        )
                      }
                    />
                  </span>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CopyFromRole({
  roleId,
  onCopy,
}: {
  roleId?: string
  onCopy: (permissionIds: string[]) => void
}) {
  const [copying, setCopying] = useState(false)
  const rolesQuery = useQuery({
    queryKey: staffPermissionQueryKeys.list({}),
    queryFn: () => fetchStaffPermissions({}),
  })
  const roles = (rolesQuery.data?.data ?? []).filter((role) => role.id !== roleId)

  async function copy(id: string) {
    const role = roles.find((item) => item.id === id)
    setCopying(true)
    try {
      const detail = await fetchStaffPermission(id)
      onCopy(detail.permissionIds)
      notify('success', {
        title: 'Access copied',
        description: `Started from ${role?.name ?? 'that role'}. Adjust anything, then save.`,
      })
    } catch (error) {
      notify('error', { title: 'Unable to copy role', description: getApiErrorMessage(error) })
    } finally {
      setCopying(false)
    }
  }

  return (
    <div className="inline-flex items-center gap-2" title="Replaces the current choices">
      {copying ? (
        <Loader2 className="size-4 animate-spin text-slate-500" />
      ) : (
        <Copy className="size-4 text-slate-400" />
      )}
      <DropdownSelect
        variant="pill"
        value=""
        placeholder="Copy access from a role"
        ariaLabel="Copy access from role"
        disabled={copying || roles.length === 0}
        options={roles.map((role) => ({ value: role.id, label: role.name }))}
        onValueChange={(id) => void copy(id)}
      />
    </div>
  )
}
