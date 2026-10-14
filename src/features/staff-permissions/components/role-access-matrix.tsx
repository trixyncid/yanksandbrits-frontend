import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ChevronDown, Copy, Link2, Loader2 } from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { DropdownSelect } from '../../../shared/components/ui/dropdown-select'
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
  LEVELS_PAGE_ONLY,
  LEVELS_WITH_DATA,
  applyLevel,
  grantDataOnly,
  levelFor,
  missingNeeds,
  pageState,
  pagesSharingData,
  togglePart,
  type AccessLevel,
  type DataAction,
  type PermissionIndex,
} from '../lib/access-levels'

type RoleAccessMatrixProps = {
  index: PermissionIndex
  selected: Set<string>
  onChange: (next: Set<string>) => void
  /** The role being edited, left out of "Copy from role". */
  roleId?: string
}

const PART_LABELS: { part: 'open' | DataAction; label: string; hint: string }[] = [
  { part: 'open', label: 'Page', hint: 'Shows the page in the sidebar' },
  { part: 'view', label: 'Read', hint: 'Can read the records' },
  { part: 'add', label: 'Create', hint: 'Can add new records' },
  { part: 'change', label: 'Edit', hint: 'Can change records' },
  { part: 'delete', label: 'Delete', hint: 'Can delete records' },
]

export function RoleAccessMatrix({ index, selected, onChange, roleId }: RoleAccessMatrixProps) {
  const [customOpen, setCustomOpen] = useState<Set<string>>(new Set())

  function toggleCustom(key: string) {
    setCustomOpen((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function setLevel(page: PageDefinition, level: AccessLevel) {
    if (level === 'custom') {
      toggleCustom(page.key)
      return
    }
    onChange(applyLevel(page, level, selected, index))
  }

  return (
    <div className="space-y-5">
      <CopyFromRole roleId={roleId} onCopy={(ids) => onChange(new Set(ids))} />

      {PAGE_SECTIONS.map((section) => {
        const pages = PAGES.filter((page) => page.section === section)
        if (pages.length === 0) return null
        return (
          <div key={section}>
            <p className="px-1 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
              {section}
            </p>
            <div className="mt-2 space-y-2">
              {pages.map((page) => (
                <PageRow
                  key={page.key}
                  page={page}
                  index={index}
                  selected={selected}
                  customOpen={customOpen.has(page.key)}
                  onToggleCustom={() => toggleCustom(page.key)}
                  onSetLevel={(level) => setLevel(page, level)}
                  onChange={onChange}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PageRow({
  page,
  index,
  selected,
  customOpen,
  onToggleCustom,
  onSetLevel,
  onChange,
}: {
  page: PageDefinition
  index: PermissionIndex
  selected: Set<string>
  customOpen: boolean
  onToggleCustom: () => void
  onSetLevel: (level: AccessLevel) => void
  onChange: (next: Set<string>) => void
}) {
  const level = levelFor(page, selected, index)
  const levels = page.module ? LEVELS_WITH_DATA : LEVELS_PAGE_ONLY
  const missing = missingNeeds(page, selected, index, PAGES_BY_KEY)
  const state = pageState(page, selected, index)
  const siblings = pagesSharingData(page)
  // Pages on the same records always share read/create/edit/delete.
  const siblingsKeepingData = siblings.filter(
    (sibling) => pageState(sibling, selected, index).open,
  )
  const active = level !== 'hidden'

  return (
    <div
      className={cn(
        'rounded-2xl px-3.5 py-3 transition sm:px-4',
        level === 'hidden' ? 'bg-canvas' : level === 'data' ? 'bg-slate-100' : 'bg-brand-50',
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className={cn('text-sm font-semibold', active ? 'text-ink' : 'text-slate-600')}>
            {page.label}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{page.description}</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <div
            role="radiogroup"
            aria-label={`${page.label} access`}
            className="inline-flex rounded-full bg-white p-0.5 ring-1 ring-slate-200/70"
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
                  onClick={() => onSetLevel(option.level)}
                  className={cn(
                    'h-7 rounded-full px-2.5 text-xs font-semibold transition sm:px-3',
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
          {page.module ? (
            <button
              type="button"
              onClick={onToggleCustom}
              aria-expanded={customOpen}
              className={cn(
                'inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-semibold transition',
                level === 'custom'
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-white text-slate-500 ring-1 ring-slate-200/70 hover:text-ink',
              )}
            >
              Custom
              <ChevronDown
                className={cn('size-3.5 transition-transform', customOpen ? 'rotate-180' : '')}
              />
            </button>
          ) : null}
        </div>
      </div>

      {customOpen && page.module ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {PART_LABELS.map(({ part, label, hint }) => {
            const on = part === 'open' ? state.open : state.data[part]
            return (
              <label
                key={part}
                title={hint}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition',
                  on ? 'bg-ink text-white' : 'bg-white text-slate-600 hover:text-ink',
                )}
              >
                <input
                  type="checkbox"
                  className="size-3.5 rounded border-slate-300 text-brand-500 focus:ring-brand-500/40"
                  checked={on}
                  onChange={(event) =>
                    onChange(togglePart(page, part, event.target.checked, selected, index))
                  }
                />
                {label}
              </label>
            )
          })}
        </div>
      ) : null}

      {missing.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="size-3.5 shrink-0" />
          <span className="min-w-0 flex-1">
            Needs data from {missing.map((item) => item.label).join(', ')} for its
            dropdowns.
          </span>
          <button
            type="button"
            onClick={() => onChange(grantDataOnly(missing, selected, index))}
            className="rounded-full bg-amber-500 px-2.5 py-1 font-semibold text-white transition hover:bg-amber-600"
          >
            Add as data only
          </button>
        </div>
      ) : null}

      {siblingsKeepingData.length > 0 ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <Link2 className="size-3.5 shrink-0" />
          Same records as {siblingsKeepingData.map((item) => item.label).join(', ')}:
          what one page can read or change, the other can too.
        </p>
      ) : null}
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
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-canvas px-3.5 py-2.5">
      {copying ? (
        <Loader2 className="size-4 animate-spin text-slate-500" />
      ) : (
        <Copy className="size-4 text-slate-500" />
      )}
      <p className="min-w-0 flex-1 text-xs text-slate-600">
        Start from another role's access. This replaces the current choices.
      </p>
      <DropdownSelect
        variant="pill"
        value=""
        placeholder="Copy from role"
        ariaLabel="Copy access from role"
        disabled={copying || roles.length === 0}
        options={roles.map((role) => ({ value: role.id, label: role.name }))}
        onValueChange={(id) => void copy(id)}
        align="end"
      />
    </div>
  )
}
