import {
  isNavigationGroup,
  type NavigationItem,
  type NavigationLeafItem,
} from '../config/navigation'

export type SearchEntry = {
  item: NavigationLeafItem & { to: NonNullable<NavigationLeafItem['to']> }
  section: string
}

/** Every page the user can open, with the menu section it lives under. */
export function searchablePages(navigation: NavigationItem[]): SearchEntry[] {
  const entries: SearchEntry[] = []
  for (const item of navigation) {
    if (isNavigationGroup(item)) {
      for (const child of item.children) {
        if (child.to) entries.push({ item: { ...child, to: child.to }, section: item.label })
      }
    } else if (item.to) {
      entries.push({ item: { ...item, to: item.to }, section: 'Overview' })
    }
  }
  return entries
}

export function isMacPlatform() {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
}
