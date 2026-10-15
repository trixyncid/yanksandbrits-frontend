import {
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import {
  Check,
  ChevronDown,
  LayoutGrid,
  Loader2,
  Search,
  Shield,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react'

import { Button } from '../../../shared/components/ui/button'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { cn } from '../../../shared/lib/cn'
import { usePermissionsCatalogQuery } from '../hooks/use-permissions-catalog-query'
import { PAGES } from '../../auth/lib/page-catalog'
import { accessChanges, buildPermissionIndex } from '../lib/access-levels'
import { RoleAccessMatrix } from './role-access-matrix'
import { RoleAccessPreview } from './role-access-preview'
import {
  getPermissionActionHint,
  getPermissionActionLabel,
  getPermissionAppLabel,
  getPermissionModuleCopy,
  buildPermissionAppFilters,
} from '../lib/permission-labels'
import type {
  PermissionOption,
  StaffPermissionFormErrors,
  StaffPermissionFormValues,
} from '../types/staff-permission'

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-xs text-rose-500">{message}</p>
}

type PermissionGroup = {
  key: string
  appLabel: string
  model: string
  label: string
  description: string
  copy: ReturnType<typeof getPermissionModuleCopy>
  permissions: PermissionOption[]
}

type SelectionFilter = 'all' | 'selected' | 'available'

function groupPermissions(permissions: PermissionOption[]): PermissionGroup[] {
  const map = new Map<string, PermissionGroup>()

  for (const permission of permissions) {
    const key = `${permission.appLabel}.${permission.model}`
    const existing = map.get(key)
    if (existing) {
      existing.permissions.push(permission)
      continue
    }
    const copy = getPermissionModuleCopy(permission.model)
    map.set(key, {
      key,
      appLabel: permission.appLabel,
      model: permission.model,
      label: copy.label,
      description: copy.description,
      copy,
      permissions: [permission],
    })
  }

  for (const group of map.values()) {
    group.permissions.sort((a, b) => {
      const order = ['view', 'add', 'change', 'delete']
      const aRank = order.indexOf(a.codename.split('_')[0] ?? '')
      const bRank = order.indexOf(b.codename.split('_')[0] ?? '')
      return (aRank === -1 ? 99 : aRank) - (bRank === -1 ? 99 : bRank)
    })
  }

  return Array.from(map.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  )
}

type StaffPermissionFormProps = {
  mode: 'create' | 'edit'
  values: StaffPermissionFormValues
  errors: StaffPermissionFormErrors
  isSubmitting: boolean
  onChange: <K extends keyof StaffPermissionFormValues>(
    field: K,
    value: StaffPermissionFormValues[K],
  ) => void
  onTogglePermission: (permissionId: string) => void
  onSetPermissionGroup: (ids: string[], selected: boolean) => void
  onSubmit: () => void | Promise<void>
  onCancel: () => void
  onDelete?: () => void
  /** The role being edited, so "Copy from role" leaves it out. */
  roleId?: string
}

export function StaffPermissionForm({
  mode,
  roleId,
  values,
  errors,
  isSubmitting,
  onChange,
  onTogglePermission,
  onSetPermissionGroup,
  onSubmit,
  onCancel,
  onDelete,
}: StaffPermissionFormProps) {
  const permissionsQuery = usePermissionsCatalogQuery()
  const [search, setSearch] = useState('')
  const [selectionFilter, setSelectionFilter] =
    useState<SelectionFilter>('all')
  const [appFilter, setAppFilter] = useState<string>('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [hasInitializedExpand, setHasInitializedExpand] = useState(false)

  const selectedIds = useMemo(
    () => new Set(values.permissionIds),
    [values.permissionIds],
  )

  const allPermissions = useMemo(
    () => permissionsQuery.data ?? [],
    [permissionsQuery.data],
  )
  const selectedCount = values.permissionIds.length
  const [fineTuneOpen, setFineTuneOpen] = useState(false)
  // Snapshot of what the role had when the form opened, for the change list.
  const [initialIds] = useState(() => new Set(values.permissionIds))

  const permissionIndex = useMemo(
    () => buildPermissionIndex(allPermissions),
    [allPermissions],
  )
  const changes = useMemo(
    () => accessChanges(initialIds, selectedIds, permissionIndex),
    [initialIds, selectedIds, permissionIndex],
  )
  const rawChangeCount = useMemo(() => {
    let count = 0
    for (const id of selectedIds) if (!initialIds.has(id)) count += 1
    for (const id of initialIds) if (!selectedIds.has(id)) count += 1
    return count
  }, [initialIds, selectedIds])

  const visiblePageCount = useMemo(
    () =>
      PAGES.filter((page) => {
        const id = permissionIndex.get(page.openPermission)
        return Boolean(id && selectedIds.has(id))
      }).length,
    [permissionIndex, selectedIds],
  )

  function setSelected(next: Set<string>) {
    onChange('permissionIds', Array.from(next))
  }

  const appLabels = useMemo(() => {
    const labels = new Set(allPermissions.map((item) => item.appLabel))
    return Array.from(labels)
  }, [allPermissions])

  const appFilters = useMemo(
    () => buildPermissionAppFilters(appLabels),
    [appLabels],
  )

  const groups = useMemo(() => {
    const needle = search.trim().toLowerCase()

    let filtered = allPermissions

    if (appFilter !== 'all') {
      const selectedFilter = appFilters.find((filter) => filter.id === appFilter)
      const allowed = new Set(selectedFilter?.appLabels ?? [appFilter])
      filtered = filtered.filter((item) => allowed.has(item.appLabel))
    }

    if (selectionFilter === 'selected') {
      filtered = filtered.filter((item) => selectedIds.has(item.id))
    } else if (selectionFilter === 'available') {
      filtered = filtered.filter((item) => !selectedIds.has(item.id))
    }

    if (needle) {
      filtered = filtered.filter((permission) => {
        const moduleCopy = getPermissionModuleCopy(permission.model)
        const haystack = [
          permission.name,
          permission.codename,
          permission.appLabel,
          permission.model,
          moduleCopy.label,
          moduleCopy.singular,
          moduleCopy.description,
          getPermissionAppLabel(permission.appLabel),
          getPermissionActionLabel(
            permission.codename,
            moduleCopy.label,
            permission.name,
          ),
        ]
          .join(' ')
          .toLowerCase()
        return haystack.includes(needle)
      })
    }

    return groupPermissions(filtered)
  }, [
    allPermissions,
    appFilter,
    appFilters,
    search,
    selectedIds,
    selectionFilter,
  ])

  // Once the catalog loads, expand groups that already have selections
  // (or the first group when nothing is selected).
  if (permissionsQuery.isSuccess && !hasInitializedExpand) {
    const catalogGroups = groupPermissions(allPermissions)
    const initial = new Set<string>()
    for (const group of catalogGroups) {
      const hasSelected = group.permissions.some((item) =>
        selectedIds.has(item.id),
      )
      if (hasSelected) {
        initial.add(group.key)
      }
    }

    if (initial.size === 0 && catalogGroups[0]) {
      initial.add(catalogGroups[0].key)
    }

    setExpanded(initial)
    setHasInitializedExpand(true)
  }

  // While searching, expand every matching group each time the results change.
  const [expandedForGroups, setExpandedForGroups] = useState<
    typeof groups | null
  >(null)
  if (search.trim() && expandedForGroups !== groups) {
    setExpandedForGroups(groups)
    setExpanded(new Set(groups.map((group) => group.key)))
  }


  function toggleExpanded(key: string) {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  function expandAllVisible() {
    setExpanded(new Set(groups.map((group) => group.key)))
  }

  function collapseAll() {
    setExpanded(new Set())
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
        <aside className="animate-in fade-in slide-in-from-left-2 space-y-3 xl:sticky xl:top-4 xl:self-start">
          <div className="overflow-hidden rounded-[1.75rem] bg-white p-5">
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-ink text-white">
              <Shield className="size-[1.1rem]" />
            </div>
            <h3 className="mt-3 text-base font-bold tracking-tight text-ink">
              {mode === 'create' ? 'Name this role' : 'Role details'}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              The name is what staff see. Then pick, page by page, what this
              role can open and change.
            </p>

            <div className="mt-5 space-y-2">
              <Label htmlFor="name">
                Role name<span className="text-rose-500"> *</span>
              </Label>
              <Input
                id="name"
                value={values.name}
                onChange={(event) => onChange('name', event.target.value)}
                placeholder="e.g. Front Desk"
                autoFocus={mode === 'create'}
              />
              <p className="text-xs text-slate-400">
                Shown on staff profiles and in the roles list.
              </p>
              <FieldError message={errors.name} />
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="code">Short code (optional)</Label>
              <Input
                id="code"
                value={values.code}
                onChange={(event) => onChange('code', event.target.value)}
                placeholder="e.g. front-desk"
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-400">
                A short name the system uses behind the scenes. Lowercase
                letters, numbers and hyphens only. Built-in roles keep theirs.
              </p>
              <FieldError message={errors.code} />
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="description">What this role is for</Label>
              <Input
                id="description"
                value={values.description}
                onChange={(event) =>
                  onChange('description', event.target.value)
                }
                placeholder="Optional, e.g. Front-office staff who enroll students"
              />
              <FieldError message={errors.description} />
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="canViewAllData">Whose records they can see</Label>
              <label
                htmlFor="canViewAllData"
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-2xl px-3.5 py-3 text-sm transition',
                  values.canViewAllData
                    ? 'bg-ink text-white'
                    : 'bg-canvas text-slate-700 hover:bg-canvas-deep',
                )}
              >
                <input
                  id="canViewAllData"
                  type="checkbox"
                  className="mt-0.5 size-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500/40"
                  checked={values.canViewAllData}
                  onChange={(event) =>
                    onChange('canViewAllData', event.target.checked)
                  }
                />
                <span>
                  <span
                    className={cn(
                      'block font-semibold',
                      values.canViewAllData ? 'text-white' : 'text-ink',
                    )}
                  >
                    See all records in the pages they can access
                  </span>
                  <span
                    className={cn(
                      'mt-0.5 block text-xs',
                      values.canViewAllData ? 'text-white/70' : 'text-slate-500',
                    )}
                  >
                    Turn this off if they should only see records linked to
                    their own account (for example a tutor seeing only their
                    classes).
                  </span>
                </span>
              </label>
              <FieldError message={errors.canViewAllData} />
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-1 delay-75">
            <RoleAccessPreview
              index={permissionIndex}
              selected={selectedIds}
              changes={changes}
              showChanges={mode === 'edit'}
            />
          </div>
        </aside>

        <section className="animate-in fade-in slide-in-from-bottom-2 delay-100 min-w-0 space-y-3">
          <div className="rounded-[1.75rem] bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500">
                  <LayoutGrid className="size-[1.1rem]" />
                </span>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-ink">
                    Pages and data
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    <strong className="font-semibold text-ink">Data only</strong>{' '}
                    keeps a page out of the sidebar but lets other pages use its
                    records, e.g. a tutor dropdown. View, Edit and Full open the
                    page.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={selectedCount === 0}
                onClick={() => onChange('permissionIds', [])}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-canvas px-3 text-xs font-semibold text-slate-600 transition hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X className="size-3.5" />
                Clear all
              </button>
            </div>

            {errors.permissionIds ? (
              <div className="mt-4">
                <FieldError message={errors.permissionIds} />
              </div>
            ) : null}

            <div className="mt-5">
              {permissionsQuery.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-16 animate-pulse rounded-2xl bg-canvas"
                      style={{ animationDelay: `${index * 50}ms` }}
                    />
                  ))}
                </div>
              ) : null}
              {permissionsQuery.isSuccess ? (
                <RoleAccessMatrix
                  index={permissionIndex}
                  selected={selectedIds}
                  onChange={setSelected}
                  roleId={roleId}
                />
              ) : null}
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-white p-5 sm:p-6">
            <button
              type="button"
              onClick={() => setFineTuneOpen((open) => !open)}
              aria-expanded={fineTuneOpen}
              className="flex w-full items-center gap-3 text-left"
            >
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas text-slate-500">
                <SlidersHorizontal className="size-[1.1rem]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-bold tracking-tight text-ink">
                  Fine-tune individual permissions
                </span>
                <span className="mt-0.5 block text-sm text-slate-500">
                  Every permission on its own, including special ones like
                  approving payments. {selectedCount} allowed.
                </span>
              </span>
              <ChevronDown
                className={cn(
                  'size-5 shrink-0 text-slate-400 transition-transform',
                  fineTuneOpen ? 'rotate-180' : '',
                )}
              />
            </button>

            {fineTuneOpen ? (
          <div>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={expandAllVisible}
                  className="h-8 rounded-full bg-canvas px-3 text-xs font-semibold text-slate-600 transition hover:bg-canvas-deep hover:text-ink"
                >
                  Expand all
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="h-8 rounded-full bg-canvas px-3 text-xs font-semibold text-slate-600 transition hover:bg-canvas-deep hover:text-ink"
                >
                  Collapse
                </button>
            </div>

            <div className="relative mt-5">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by page or action, e.g. students, payments…"
                aria-label="Search role actions"
                className="h-12 pl-11"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'selected', label: 'Selected' },
                  { id: 'available', label: 'Not selected' },
                ] as const
              ).map((option) => {
                const active = selectionFilter === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectionFilter(option.id)}
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
                      active
                        ? 'bg-ink text-white'
                        : 'bg-canvas text-slate-600 hover:bg-canvas-deep',
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>

            {appFilters.length > 1 ? (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                <AppChip
                  label="All modules"
                  active={appFilter === 'all'}
                  onClick={() => setAppFilter('all')}
                />
                {appFilters.map((filter) => (
                  <AppChip
                    key={filter.id}
                    label={filter.label}
                    active={appFilter === filter.id}
                    onClick={() => setAppFilter(filter.id)}
                  />
                ))}
              </div>
            ) : null}

            <div className="mt-5">
              {permissionsQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-16 animate-pulse rounded-2xl bg-canvas"
                      style={{ animationDelay: `${index * 50}ms` }}
                    />
                  ))}
                </div>
              ) : null}

              {permissionsQuery.isError ? (
                <div className="rounded-2xl bg-rose-50/70 px-5 py-10 text-center">
                  <p className="text-sm font-semibold text-rose-700">
                    Couldn’t load role actions
                  </p>
                  <p className="mt-1 text-sm text-rose-600/80">
                    Check your connection, then try again.
                  </p>
                  <Button
                    type="button"
                    className="mt-4"
                    size="sm"
                    variant="ink"
                    onClick={() => void permissionsQuery.refetch()}
                  >
                    Try again
                  </Button>
                </div>
              ) : null}

              {permissionsQuery.isSuccess && groups.length === 0 ? (
                <div className="rounded-2xl bg-canvas px-5 py-12 text-center">
                  <p className="text-sm font-semibold text-ink">
                    No matches
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try another search, switch filters, or show all modules.
                  </p>
                  <button
                    type="button"
                    className="mt-4 text-sm font-semibold text-brand-500 hover:underline"
                    onClick={() => {
                      setSearch('')
                      setSelectionFilter('all')
                      setAppFilter('all')
                    }}
                  >
                    Reset filters
                  </button>
                </div>
              ) : null}

              {permissionsQuery.isSuccess && groups.length > 0 ? (
                <div className="max-h-[36rem] space-y-3 overflow-y-auto pr-1">
                  {groups.map((group) => {
                    const groupIds = group.permissions.map((item) => item.id)
                    const groupSelectedCount = groupIds.filter((id) =>
                      selectedIds.has(id),
                    ).length
                    const allSelected = groupSelectedCount === groupIds.length
                    const someSelected =
                      groupSelectedCount > 0 && !allSelected
                    const isOpen = expanded.has(group.key)

                    return (
                      <div
                        key={group.key}
                        className={cn(
                          'overflow-hidden rounded-2xl transition',
                          groupSelectedCount > 0 ? 'bg-brand-50' : 'bg-canvas',
                        )}
                      >
                        <div className="flex items-center gap-2 px-3 py-2.5 sm:px-4">
                          <button
                            type="button"
                            onClick={() => toggleExpanded(group.key)}
                            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-1 py-1 text-left transition hover:bg-white/80"
                            aria-expanded={isOpen}
                          >
                            <span
                              className={cn(
                                'inline-flex size-8 shrink-0 items-center justify-center rounded-full transition',
                                isOpen
                                  ? 'bg-ink text-white'
                                  : 'bg-white text-slate-500',
                              )}
                            >
                              <ChevronDown
                                className={cn(
                                  'size-4 transition-transform duration-200',
                                  isOpen ? 'rotate-0' : '-rotate-90',
                                )}
                              />
                            </span>
                            <span className="min-w-0">
                              <span className="flex items-center gap-2">
                                <span className="truncate text-sm font-semibold text-ink">
                                  {group.label}
                                </span>
                                {groupSelectedCount > 0 ? (
                                  <span className="shrink-0 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-white tabular-nums">
                                    {groupSelectedCount}/{groupIds.length}
                                  </span>
                                ) : null}
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-slate-500">
                                {group.description}
                              </span>
                            </span>
                          </button>

                          <label className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-slate-600 transition hover:text-ink">
                            <input
                              type="checkbox"
                              className="size-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500/40"
                              checked={allSelected}
                              ref={(element) => {
                                if (element) {
                                  element.indeterminate = someSelected
                                }
                              }}
                              onChange={(event) =>
                                onSetPermissionGroup(
                                  groupIds,
                                  event.target.checked,
                                )
                              }
                            />
                            Allow all
                          </label>
                        </div>

                        {isOpen ? (
                          <div className="px-3 pb-3 sm:px-4">
                            <div className="grid gap-2 sm:grid-cols-2">
                              {group.permissions.map((permission) => {
                                const checked = selectedIds.has(permission.id)
                                return (
                                  <label
                                    key={permission.id}
                                    className={cn(
                                      'group relative flex cursor-pointer items-start gap-3 rounded-2xl border px-3.5 py-3 transition',
                                      checked
                                        ? 'border-transparent bg-white ring-2 ring-brand-500'
                                        : 'border-transparent bg-white/70 hover:bg-white',
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        'mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md border transition',
                                        checked
                                          ? 'border-brand-500 bg-brand-500 text-white'
                                          : 'border-slate-300 bg-white text-transparent',
                                      )}
                                      aria-hidden
                                    >
                                      <Check className="size-3" />
                                    </span>
                                    <input
                                      type="checkbox"
                                      className="absolute inset-0 cursor-pointer opacity-0"
                                      checked={checked}
                                      onChange={() =>
                                        onTogglePermission(permission.id)
                                      }
                                    />
                                    <span className="min-w-0">
                                      <span className="block text-sm font-semibold text-ink">
                                        {getPermissionActionLabel(
                                          permission.codename,
                                          group.label,
                                          permission.name,
                                        )}
                                      </span>
                                      <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                                        {getPermissionActionHint(
                                          permission.codename,
                                          group.copy,
                                        )}
                                      </span>
                                    </span>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </div>
          </div>
            ) : null}
          </div>
        </section>
      </div>

      {/* Mirrors FormSaveBar, but keeps Save disabled until the role has a name. */}
      <div className="sticky bottom-3 z-10 animate-in fade-in slide-in-from-bottom-2 delay-150">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[1.75rem] bg-white/95 py-2 pr-2 pl-3 shadow-xl shadow-ink/15 ring-1 ring-slate-200/60 backdrop-blur-md sm:pl-4">
          <div className="flex min-w-0 items-center gap-2">
            {mode === 'edit' && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={onDelete}
                disabled={isSubmitting}
              >
                <Trash2 className="size-4" />
                Delete role
              </Button>
            ) : null}
            <p className="hidden truncate text-xs text-slate-500 sm:block">
              {mode === 'create'
                ? visiblePageCount === 0
                  ? 'You can save now and choose pages later.'
                  : `Opens ${visiblePageCount} page${visiblePageCount === 1 ? '' : 's'}.`
                : changes.length > 0
                  ? `${changes.length} page${changes.length === 1 ? '' : 's'} changed: ${changes
                      .slice(0, 3)
                      .map((change) => change.label)
                      .join(', ')}${changes.length > 3 ? '…' : ''}`
                  : rawChangeCount > 0
                    ? `${rawChangeCount} individual permission${rawChangeCount === 1 ? '' : 's'} changed.`
                    : 'No changes yet.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="soft"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="min-w-32"
              disabled={isSubmitting || !values.name.trim()}
              title={!values.name.trim() ? 'Give the role a name first' : undefined}
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {isSubmitting
                ? 'Saving...'
                : mode === 'create'
                  ? 'Create role'
                  : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

function AppChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition',
        active
          ? 'bg-brand-500 text-white'
          : 'bg-canvas text-slate-600 hover:bg-canvas-deep',
      )}
    >
      {label}
    </button>
  )
}
