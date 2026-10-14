import {
  PAGES,
  pageDataPermissions,
  type PageDefinition,
  type PageKey,
} from '../../auth/lib/page-catalog'
import type { PermissionOption } from '../types/staff-permission'

/**
 * Access levels shown on the Role page. Each level is a set of permissions:
 * - hidden: no page, no data
 * - data:   no page, read the data (feeds dropdowns on other pages)
 * - view:   page + read
 * - edit:   page + read, create, edit
 * - full:   page + read, create, edit, delete
 * - open:   pages with no records of their own (dashboards, reports)
 * - custom: any other mix, edited with the individual switches
 */
export type AccessLevel = 'hidden' | 'data' | 'view' | 'edit' | 'full' | 'open' | 'custom'
export type DataAction = 'view' | 'add' | 'change' | 'delete'

export const DATA_ACTIONS: DataAction[] = ['view', 'add', 'change', 'delete']

export const LEVELS_WITH_DATA: { level: AccessLevel; label: string; hint: string }[] = [
  { level: 'hidden', label: 'Hidden', hint: 'No page, no data' },
  { level: 'data', label: 'Data only', hint: 'No page, but other pages can use this data' },
  { level: 'view', label: 'View', hint: 'Opens the page, read only' },
  { level: 'edit', label: 'Edit', hint: 'Opens the page, can create and edit' },
  { level: 'full', label: 'Full', hint: 'Everything, including delete' },
]

export const LEVELS_PAGE_ONLY: { level: AccessLevel; label: string; hint: string }[] = [
  { level: 'hidden', label: 'Hidden', hint: 'Not shown' },
  { level: 'open', label: 'Open', hint: 'Shown in the sidebar' },
]

const LEVEL_ACTIONS: Record<'hidden' | 'data' | 'view' | 'edit' | 'full', DataAction[]> = {
  hidden: [],
  data: ['view'],
  view: ['view'],
  edit: ['view', 'add', 'change'],
  full: ['view', 'add', 'change', 'delete'],
}

/** "app_label.codename" -> permission id, from the catalog. */
export type PermissionIndex = Map<string, string>

export function buildPermissionIndex(catalog: PermissionOption[]): PermissionIndex {
  return new Map(catalog.map((item) => [`${item.appLabel}.${item.codename}`, item.id]))
}

/** Permission ids a page uses, by part. Missing ids are skipped. */
export function pagePermissionIds(page: PageDefinition, index: PermissionIndex) {
  const data = pageDataPermissions(page)
  return {
    open: index.get(page.openPermission),
    data: Object.fromEntries(
      DATA_ACTIONS.map((action) => [action, data ? index.get(data[action]) : undefined]),
    ) as Record<DataAction, string | undefined>,
  }
}

/** What the role currently has on a page, part by part. */
export function pageState(page: PageDefinition, selected: Set<string>, index: PermissionIndex) {
  const ids = pagePermissionIds(page, index)
  return {
    open: Boolean(ids.open && selected.has(ids.open)),
    data: Object.fromEntries(
      DATA_ACTIONS.map((action) => {
        const id = ids.data[action]
        return [action, Boolean(id && selected.has(id))]
      }),
    ) as Record<DataAction, boolean>,
  }
}

export function levelFor(page: PageDefinition, selected: Set<string>, index: PermissionIndex): AccessLevel {
  const state = pageState(page, selected, index)
  if (!page.module) return state.open ? 'open' : 'hidden'
  const has = DATA_ACTIONS.filter((action) => state.data[action])
  const same = (actions: DataAction[]) =>
    actions.length === has.length && actions.every((action) => has.includes(action))
  if (!state.open && has.length === 0) return 'hidden'
  if (!state.open && same(LEVEL_ACTIONS.data)) return 'data'
  if (state.open && same(LEVEL_ACTIONS.view)) return 'view'
  if (state.open && same(LEVEL_ACTIONS.edit)) return 'edit'
  if (state.open && same(LEVEL_ACTIONS.full)) return 'full'
  return 'custom'
}

/** Pages that read the same records (e.g. Users, Tutor List, Education Counsellors). */
export function pagesSharingData(page: PageDefinition): PageDefinition[] {
  if (!page.module) return []
  return PAGES.filter((other) => other.key !== page.key && other.module === page.module)
}

/** Data actions a page needs at a level ("custom" keeps what it has). */
function actionsForLevel(level: AccessLevel): DataAction[] {
  if (level === 'open' || level === 'custom') return []
  return LEVEL_ACTIONS[level]
}

/**
 * Set a page to a level. Data shared with other pages is never removed while
 * one of those pages still needs it, so hiding Users doesn't break Tutor List.
 */
export function applyLevel(
  page: PageDefinition,
  level: AccessLevel,
  selected: Set<string>,
  index: PermissionIndex,
): Set<string> {
  const next = new Set(selected)
  const ids = pagePermissionIds(page, index)
  const opens = level === 'open' || level === 'view' || level === 'edit' || level === 'full'
  if (ids.open) {
    if (opens) next.add(ids.open)
    else next.delete(ids.open)
  }
  if (!page.module) return next

  const wanted = new Set(actionsForLevel(level))
  for (const sibling of pagesSharingData(page)) {
    const siblingState = pageState(sibling, selected, index)
    for (const action of DATA_ACTIONS) {
      // Keep data a sibling page relies on: its own level's actions.
      if (siblingState.open && siblingState.data[action]) wanted.add(action)
    }
  }
  for (const action of DATA_ACTIONS) {
    const id = ids.data[action]
    if (!id) continue
    if (wanted.has(action)) next.add(id)
    else next.delete(id)
  }
  return next
}

/** Flip one part of a page (the "Custom" switches). */
export function togglePart(
  page: PageDefinition,
  part: 'open' | DataAction,
  on: boolean,
  selected: Set<string>,
  index: PermissionIndex,
): Set<string> {
  const next = new Set(selected)
  const ids = pagePermissionIds(page, index)
  const id = part === 'open' ? ids.open : ids.data[part]
  if (!id) return next
  if (on) next.add(id)
  else next.delete(id)
  return next
}

/** Pages this page reads data from that the role can't read yet. */
export function missingNeeds(
  page: PageDefinition,
  selected: Set<string>,
  index: PermissionIndex,
  pagesByKey: Record<PageKey, PageDefinition>,
): PageDefinition[] {
  const level = levelFor(page, selected, index)
  if (level === 'hidden' || level === 'data') return []
  return (page.needs ?? [])
    .map((key) => pagesByKey[key])
    .filter((needed) => {
      if (!needed?.module) return false
      return !pageState(needed, selected, index).data.view
    })
}

/** Grant read (data only) for pages, leaving any higher level alone. */
export function grantDataOnly(
  pages: PageDefinition[],
  selected: Set<string>,
  index: PermissionIndex,
): Set<string> {
  const next = new Set(selected)
  for (const page of pages) {
    const id = pagePermissionIds(page, index).data.view
    if (id) next.add(id)
  }
  return next
}

/** Every permission id the page catalog manages (the rest are "advanced"). */
export function managedPermissionIds(index: PermissionIndex): Set<string> {
  const ids = new Set<string>()
  for (const page of PAGES) {
    const pageIds = pagePermissionIds(page, index)
    if (pageIds.open) ids.add(pageIds.open)
    for (const action of DATA_ACTIONS) {
      const id = pageIds.data[action]
      if (id) ids.add(id)
    }
  }
  return ids
}

export const LEVEL_LABEL: Record<AccessLevel, string> = {
  hidden: 'Hidden',
  data: 'Data only',
  view: 'View',
  edit: 'Edit',
  full: 'Full',
  open: 'Open',
  custom: 'Custom',
}

export type AccessChange = { label: string; from: AccessLevel; to: AccessLevel }

/** Pages whose level differs between two permission sets. */
export function accessChanges(
  initial: Set<string>,
  current: Set<string>,
  index: PermissionIndex,
): AccessChange[] {
  return PAGES.flatMap((page) => {
    const from = levelFor(page, initial, index)
    const to = levelFor(page, current, index)
    return from === to ? [] : [{ label: page.label, from, to }]
  })
}
