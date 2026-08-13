import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import {
  Check,
  ChevronDown,
  KeyRound,
  Search,
  Shield,
  X,
} from 'lucide-react'

import { Button } from '../../../shared/components/ui/button'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { cn } from '../../../shared/lib/cn'
import { usePermissionsCatalogQuery } from '../hooks/use-permissions-catalog-query'
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
}

export function StaffPermissionForm({
  mode,
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

  const allPermissions = permissionsQuery.data ?? []
  const totalCount = allPermissions.length
  const selectedCount = values.permissionIds.length

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

  useEffect(() => {
    if (!permissionsQuery.isSuccess || hasInitializedExpand) {
      return
    }

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
  }, [
    allPermissions,
    hasInitializedExpand,
    permissionsQuery.isSuccess,
    selectedIds,
  ])

  useEffect(() => {
    if (!search.trim()) {
      return
    }
    setExpanded(new Set(groups.map((group) => group.key)))
  }, [groups, search])


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

  const progress =
    totalCount > 0 ? Math.round((selectedCount / totalCount) * 100) : 0

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
        <aside className="animate-in fade-in slide-in-from-left-2 space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-gradient-to-b from-[#F8FBFF] via-white to-white p-5 shadow-sm">
            <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-[#EDF4FF] text-[#4274B9]">
              <Shield className="size-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              {mode === 'create' ? 'Name this role' : 'Role details'}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              The name is what staff see. Then tick only the actions this role
              should be allowed to do.
            </p>

            <div className="mt-5 space-y-2">
              <Label htmlFor="name">Role name</Label>
              <Input
                id="name"
                value={values.name}
                onChange={(event) => onChange('name', event.target.value)}
                placeholder="e.g. Front Desk"
                className="bg-white"
                autoFocus={mode === 'create'}
              />
              <p className="text-xs text-slate-400">
                Shown on staff profiles and in the roles list.
              </p>
              <FieldError message={errors.name} />
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="code">Short code</Label>
              <Input
                id="code"
                value={values.code}
                onChange={(event) => onChange('code', event.target.value)}
                placeholder="e.g. front-desk"
                className="bg-white font-mono text-sm"
              />
              <p className="text-xs text-slate-400">
                Internal id used by the system. Use lowercase letters, numbers,
                and hyphens. Built-in roles cannot change this.
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
                className="bg-white"
              />
              <FieldError message={errors.description} />
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="canViewAllData">Whose records they can see</Label>
              <label
                htmlFor="canViewAllData"
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700"
              >
                <input
                  id="canViewAllData"
                  type="checkbox"
                  className="mt-0.5 size-4 rounded border-slate-300 text-[#4274B9] focus:ring-[#4274B9]/40"
                  checked={values.canViewAllData}
                  onChange={(event) =>
                    onChange('canViewAllData', event.target.checked)
                  }
                />
                <span>
                  <span className="block font-semibold text-slate-900">
                    See all records in the pages they can access
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Turn this off if they should only see records linked to
                    their own account (for example a tutor seeing only their
                    classes).
                  </span>
                </span>
              </label>
              <FieldError message={errors.canViewAllData} />
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-1 delay-75 rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
                  Selected
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
                  {selectedCount}
                </p>
              </div>
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#EDF4FF] text-[#2F5A94]">
                <KeyRound className="size-5" />
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#4274B9] transition-[width] duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {totalCount
                ? `${progress}% of available actions · ${totalCount} total`
                : 'Loading available actions…'}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={selectedCount === 0}
                onClick={() => onChange('permissionIds', [])}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X className="size-3.5" />
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setSelectionFilter('selected')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
              >
                <Check className="size-3.5" />
                Review selected
              </button>
            </div>
          </div>
        </aside>

        <section className="animate-in fade-in slide-in-from-bottom-2 delay-100 min-w-0 space-y-4">
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  What this role can do
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Tick an action to allow it. View opens the page; Add, Edit,
                  and Delete control whether they can change records.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={expandAllVisible}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                >
                  Expand all
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                >
                  Collapse
                </button>
              </div>
            </div>

            <div className="relative mt-5">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by page or action, e.g. students, payments…"
                aria-label="Search role actions"
                className="h-12 bg-[#F4F6FA] pl-11"
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
                        ? 'bg-[#4274B9] text-white shadow-sm shadow-[#4274B9]/25'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80',
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

            {errors.permissionIds ? (
              <div className="mt-4">
                <FieldError message={errors.permissionIds} />
              </div>
            ) : null}

            <div className="mt-5">
              {permissionsQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-16 animate-pulse rounded-2xl bg-slate-100"
                      style={{ animationDelay: `${index * 50}ms` }}
                    />
                  ))}
                </div>
              ) : null}

              {permissionsQuery.isError ? (
                <div className="rounded-2xl border border-rose-100 bg-rose-50/70 px-5 py-10 text-center">
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
                    onClick={() => void permissionsQuery.refetch()}
                  >
                    Retry
                  </Button>
                </div>
              ) : null}

              {permissionsQuery.isSuccess && groups.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-12 text-center">
                  <p className="text-sm font-semibold text-slate-800">
                    No matches
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try another search, switch filters, or show all modules.
                  </p>
                  <button
                    type="button"
                    className="mt-4 text-sm font-semibold text-[#4274B9] hover:underline"
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
                          'overflow-hidden rounded-2xl border transition',
                          groupSelectedCount > 0
                            ? 'border-[#BED2F2] bg-[#F8FBFF]/60'
                            : 'border-slate-200 bg-white',
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
                                'inline-flex size-8 shrink-0 items-center justify-center rounded-xl transition',
                                isOpen
                                  ? 'bg-[#4274B9] text-white'
                                  : 'bg-slate-100 text-slate-500',
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
                                <span className="truncate text-sm font-semibold text-slate-900">
                                  {group.label}
                                </span>
                                {groupSelectedCount > 0 ? (
                                  <span className="shrink-0 rounded-full bg-[#EDF4FF] px-2 py-0.5 text-[10px] font-semibold text-[#2F5A94]">
                                    {groupSelectedCount}/{groupIds.length}
                                  </span>
                                ) : null}
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-slate-500">
                                {group.description}
                              </span>
                            </span>
                          </button>

                          <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#BED2F2]">
                            <input
                              type="checkbox"
                              className="size-4 rounded border-slate-300 text-[#4274B9] focus:ring-[#4274B9]/40"
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
                          <div className="border-t border-slate-100 bg-white px-3 py-3 sm:px-4">
                            <div className="grid gap-2 sm:grid-cols-2">
                              {group.permissions.map((permission) => {
                                const checked = selectedIds.has(permission.id)
                                return (
                                  <label
                                    key={permission.id}
                                    className={cn(
                                      'group flex cursor-pointer items-start gap-3 rounded-2xl border px-3.5 py-3 transition',
                                      checked
                                        ? 'border-[#4274B9] bg-[#EDF4FF] shadow-sm shadow-[#4274B9]/10'
                                        : 'border-slate-200 bg-[#F4F6FA]/70 hover:border-[#BED2F2] hover:bg-white',
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        'mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md border transition',
                                        checked
                                          ? 'border-[#4274B9] bg-[#4274B9] text-white'
                                          : 'border-slate-300 bg-white text-transparent',
                                      )}
                                    >
                                      <Check className="size-3" />
                                    </span>
                                    <input
                                      type="checkbox"
                                      className="sr-only"
                                      checked={checked}
                                      onChange={() =>
                                        onTogglePermission(permission.id)
                                      }
                                    />
                                    <span className="min-w-0">
                                      <span className="block text-sm font-semibold text-slate-900">
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
        </section>
      </div>

      <div className="sticky bottom-0 z-10 -mx-1 border-t border-slate-200/80 bg-white/90 px-1 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {mode === 'edit' && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={onDelete}
                disabled={isSubmitting}
              >
                Delete role
              </Button>
            ) : (
              <p className="text-sm text-slate-500">
                {selectedCount === 0
                  ? 'You can save now and tick actions later.'
                  : `${selectedCount} action${selectedCount === 1 ? '' : 's'} allowed for this role.`}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !values.name.trim()}>
              {isSubmitting
                ? mode === 'create'
                  ? 'Saving...'
                  : 'Updating...'
                : mode === 'create'
                  ? 'Create role'
                  : 'Save Changes'}
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
          ? 'bg-slate-900 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80',
      )}
    >
      {label}
    </button>
  )
}
