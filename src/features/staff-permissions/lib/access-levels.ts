import { PAGES, type PageDefinition, type PageKey } from '../../auth/lib/page-catalog'
import type { PermissionOption } from '../types/staff-permission'
import {
  ACTION_LABEL,
  DATA_ACTIONS,
  mainRecords,
  pageRecords,
  relatedRecords,
  type DataAction,
  type RecordSet,
} from './page-records'
import { getPermissionModuleCopy } from './permission-labels'

export { ACTION_LABEL, DATA_ACTIONS, type DataAction, type RecordSet }

/**
 * Access levels shown on the Role page. Each level is a set of permissions on
 * the page and its own records (related settings are set in Details):
 * - hidden: no page, no data (also clears related settings)
 * - data:   no page, read the data (feeds dropdowns on other pages)
 * - view:   page + read
 * - edit:   page + read, create, edit
 * - full:   page + read, create, edit, delete
 * - open:   pages with no records of their own (dashboards, reports)
 * - custom: any other mix, edited in Details
 */
export type AccessLevel = 'hidden' | 'data' | 'view' | 'edit' | 'full' | 'open' | 'custom'

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

export const LEVEL_LABEL: Record<AccessLevel, string> = {
  hidden: 'Hidden',
  data: 'Data only',
  view: 'View',
  edit: 'Edit',
  full: 'Full',
  open: 'Open',
  custom: 'Custom',
}

/** "app_label.codename" -> permission id, from the catalog. */
export type PermissionIndex = Map<string, string>

export function buildPermissionIndex(catalog: PermissionOption[]): PermissionIndex {
  return new Map(catalog.map((item) => [`${item.appLabel}.${item.codename}`, item.id]))
}

/** Which actions the role has on a record set. */
export function recordState(
  records: RecordSet,
  selected: Set<string>,
  index: PermissionIndex,
): Record<DataAction, boolean> {
  return Object.fromEntries(
    DATA_ACTIONS.map((action) => {
      const id = index.get(records.permissions[action])
      return [action, Boolean(id && selected.has(id))]
    }),
  ) as Record<DataAction, boolean>
}

/** "Read, Edit" — or "No access". */
export function actionsLabel(state: Record<DataAction, boolean>): string {
  const on = DATA_ACTIONS.filter((action) => state[action])
  if (on.length === 0) return 'No access'
  if (on.length === DATA_ACTIONS.length) return 'Full'
  return on.map((action) => ACTION_LABEL[action]).join(', ')
}

export function toggleRecordAction(
  records: RecordSet,
  action: DataAction,
  on: boolean,
  selected: Set<string>,
  index: PermissionIndex,
): Set<string> {
  const next = new Set(selected)
  const id = index.get(records.permissions[action])
  if (!id) return next
  if (on) next.add(id)
  else next.delete(id)
  return next
}

/** What the role currently has on a page: the sidebar entry and its own records. */
export function pageState(page: PageDefinition, selected: Set<string>, index: PermissionIndex) {
  const openId = index.get(page.openPermission)
  const main = mainRecords(page)
  return {
    open: Boolean(openId && selected.has(openId)),
    data: main
      ? recordState(main, selected, index)
      : { view: false, add: false, change: false, delete: false },
  }
}

export function setPageOpen(
  page: PageDefinition,
  on: boolean,
  selected: Set<string>,
  index: PermissionIndex,
): Set<string> {
  const next = new Set(selected)
  const id = index.get(page.openPermission)
  if (!id) return next
  if (on) next.add(id)
  else next.delete(id)
  return next
}

export function levelFor(page: PageDefinition, selected: Set<string>, index: PermissionIndex): AccessLevel {
  const state = pageState(page, selected, index)
  if (!page.module) return state.open ? 'open' : 'hidden'
  const has = DATA_ACTIONS.filter((action) => state.data[action])
  const same = (actions: DataAction[]) =>
    actions.length === has.length && actions.every((action) => has.includes(action))
  if (!state.open && has.length === 0) return 'hidden'
  // Data an open sibling page uses belongs to that page, not this one.
  if (!state.open && pagesSharingData(page).some((sibling) => pageState(sibling, selected, index).open)) {
    return 'hidden'
  }
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

/**
 * Set a page to a level. Data shared with other pages is never removed while
 * one of those pages still needs it, so hiding Users doesn't break Tutor List.
 * Hidden also clears the page's related settings; other levels leave them be.
 */
export function applyLevel(
  page: PageDefinition,
  level: AccessLevel,
  selected: Set<string>,
  index: PermissionIndex,
): Set<string> {
  if (level === 'custom') return new Set(selected)
  const opens = level === 'open' || level === 'view' || level === 'edit' || level === 'full'
  let next = setPageOpen(page, opens, selected, index)

  const main = mainRecords(page)
  if (main) {
    const wanted = new Set(level === 'open' ? [] : LEVEL_ACTIONS[level])
    for (const sibling of pagesSharingData(page)) {
      const siblingState = pageState(sibling, selected, index)
      for (const action of DATA_ACTIONS) {
        // Keep data a sibling page relies on: its own level's actions.
        if (siblingState.open && siblingState.data[action]) wanted.add(action)
      }
    }
    for (const action of DATA_ACTIONS) {
      next = toggleRecordAction(main, action, wanted.has(action), next, index)
    }
  }

  if (level === 'hidden') {
    for (const records of relatedRecords(page)) {
      for (const action of DATA_ACTIONS) {
        next = toggleRecordAction(records, action, false, next, index)
      }
    }
  }
  return next
}

/** Related settings the role has any access to, for the row summary. */
export function grantedRelated(page: PageDefinition, selected: Set<string>, index: PermissionIndex) {
  return relatedRecords(page).flatMap((records) => {
    const state = recordState(records, selected, index)
    return DATA_ACTIONS.some((action) => state[action])
      ? [{ records, label: actionsLabel(state) }]
      : []
  })
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
  let next = new Set(selected)
  for (const page of pages) {
    const main = mainRecords(page)
    if (main) next = toggleRecordAction(main, 'view', true, next, index)
  }
  return next
}

/**
 * Catalog permissions no page accounts for (new models the page catalog
 * hasn't caught up with), grouped by model so they can still be granted.
 */
export function otherRecords(catalog: PermissionOption[]): RecordSet[] {
  const mapped = new Set<string>()
  for (const page of PAGES) {
    mapped.add(page.openPermission)
    for (const records of pageRecords(page)) {
      for (const action of DATA_ACTIONS) mapped.add(records.permissions[action])
    }
  }
  const byModel = new Map<string, RecordSet>()
  for (const item of catalog) {
    const name = `${item.appLabel}.${item.codename}`
    const action = item.codename.split('_')[0] as DataAction
    if (mapped.has(name) || !DATA_ACTIONS.includes(action)) continue
    const key = `${item.appLabel}.${item.model}`
    if (!byModel.has(key)) {
      const copy = getPermissionModuleCopy(item.model)
      byModel.set(key, {
        key,
        label: copy.label,
        description: copy.description,
        permissions: Object.fromEntries(
          DATA_ACTIONS.map((a) => [a, `${item.appLabel}.${a}_${item.model}`]),
        ) as Record<DataAction, string>,
      })
    }
  }
  return [...byModel.values()].sort((a, b) => a.label.localeCompare(b.label))
}

export type AccessChange = { label: string; from: string; to: string; removed: boolean }

/** Everything that differs between two permission sets, in page order. */
export function accessChanges(
  initial: Set<string>,
  current: Set<string>,
  index: PermissionIndex,
  others: RecordSet[],
): AccessChange[] {
  const recordChange = (label: string, records: RecordSet): AccessChange[] => {
    const from = actionsLabel(recordState(records, initial, index))
    const to = actionsLabel(recordState(records, current, index))
    return from === to ? [] : [{ label, from, to, removed: to === 'No access' }]
  }
  return [
    ...PAGES.flatMap((page) => {
      const from = levelFor(page, initial, index)
      const to = levelFor(page, current, index)
      const own: AccessChange[] =
        from === to
          ? []
          : [{ label: page.label, from: LEVEL_LABEL[from], to: LEVEL_LABEL[to], removed: to === 'hidden' }]
      return [
        ...own,
        ...relatedRecords(page).flatMap((records) =>
          recordChange(`${page.label} · ${records.label}`, records),
        ),
      ]
    }),
    ...others.flatMap((records) => recordChange(records.label, records)),
  ]
}
