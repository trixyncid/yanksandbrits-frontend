import {
  adminNavigation,
  isNavigationGroup,
  type NavigationItem,
} from '../../admin/config/navigation'
import { canAccessRoute } from '../lib/route-access'
import type { AuthUser } from '../types/auth'

export function filterNavigationForUser(
  user: Pick<AuthUser, 'permissions' | 'is_superuser' | 'roles'> | null | undefined,
  items: NavigationItem[] = adminNavigation,
): NavigationItem[] {
  if (!user) {
    return []
  }

  return items.flatMap((item) => {
    if (isNavigationGroup(item)) {
      const children = item.children.filter(
        (child) => child.to && canAccessRoute(user, child.to),
      )

      if (children.length === 0) {
        return []
      }

      return [{ ...item, children }]
    }

    if (!item.to || canAccessRoute(user, item.to)) {
      return [item]
    }

    return []
  })
}

export function getFirstNavigationPath(
  user: Pick<AuthUser, 'permissions' | 'is_superuser' | 'roles'> | null | undefined,
): string | null {
  for (const item of filterNavigationForUser(user)) {
    if (isNavigationGroup(item)) {
      const first = item.children.find((child) => child.to)
      if (first?.to) {
        return first.to
      }
      continue
    }

    if (item.to) {
      return item.to
    }
  }

  return null
}
