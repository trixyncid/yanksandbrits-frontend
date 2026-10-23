import { useMemo, useState, type FormEvent } from 'react'
import { LayoutGrid, Loader2, Shield, Trash2 } from 'lucide-react'

import { Button } from '../../../shared/components/ui/button'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { cn } from '../../../shared/lib/cn'
import { usePermissionsCatalogQuery } from '../hooks/use-permissions-catalog-query'
import { PAGES } from '../../auth/lib/page-catalog'
import { accessChanges, buildPermissionIndex, otherRecords } from '../lib/access-levels'
import { RoleAccessMatrix } from './role-access-matrix'
import { RoleAccessPreview } from './role-access-preview'
import type {
  StaffPermissionFormErrors,
  StaffPermissionFormValues,
} from '../types/staff-permission'

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-xs text-rose-500">{message}</p>
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
  onSubmit,
  onCancel,
  onDelete,
}: StaffPermissionFormProps) {
  const permissionsQuery = usePermissionsCatalogQuery()

  const selectedIds = useMemo(
    () => new Set(values.permissionIds),
    [values.permissionIds],
  )
  const allPermissions = useMemo(
    () => permissionsQuery.data ?? [],
    [permissionsQuery.data],
  )
  // Snapshot of what the role had when the form opened, for the change list.
  const [initialIds] = useState(() => new Set(values.permissionIds))

  const permissionIndex = useMemo(
    () => buildPermissionIndex(allPermissions),
    [allPermissions],
  )
  const others = useMemo(() => otherRecords(allPermissions), [allPermissions])
  const changes = useMemo(
    () => accessChanges(initialIds, selectedIds, permissionIndex, others),
    [initialIds, selectedIds, permissionIndex, others],
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

        <section className="animate-in fade-in slide-in-from-bottom-2 delay-100 min-w-0">
          <div className="rounded-[1.75rem] bg-white p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500">
                <LayoutGrid className="size-[1.1rem]" />
              </span>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-ink">Access</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Pick a level for each page. <strong className="font-semibold text-ink">Data only</strong>{' '}
                  keeps a page out of the sidebar but lets other pages use its records,
                  e.g. a tutor dropdown. Open <strong className="font-semibold text-ink">Details</strong>{' '}
                  for exact switches and settings inside a page, like pay rates.
                </p>
              </div>
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

              {permissionsQuery.isError ? (
                <div className="rounded-2xl bg-rose-50/70 px-5 py-10 text-center">
                  <p className="text-sm font-semibold text-rose-700">
                    Couldn’t load access options
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

              {permissionsQuery.isSuccess ? (
                <RoleAccessMatrix
                  index={permissionIndex}
                  others={others}
                  selected={selectedIds}
                  onChange={setSelected}
                  roleId={roleId}
                />
              ) : null}
            </div>
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
                  ? `${changes.length} change${changes.length === 1 ? '' : 's'}: ${changes
                      .slice(0, 3)
                      .map((change) => change.label)
                      .join(', ')}${changes.length > 3 ? '…' : ''}`
                  : rawChangeCount > 0
                    ? `${rawChangeCount} permission${rawChangeCount === 1 ? '' : 's'} changed.`
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
