import {
  adminNavigation,
  isNavigationGroup,
  type NavigationItem,
} from '../../admin/config/navigation'
import { canAccessRoute } from '../lib/route-access'
import {
  canViewMarketingPerformance,
  isTutorUser,
  type AuthUser,
} from '../types/auth'

type NavUser = Pick<
  AuthUser,
  'permissions' | 'is_superuser' | 'roles' | 'is_marketing' | 'is_tutor'
>

export function filterNavigationForUser(
  user: NavUser | null | undefined,
  items: NavigationItem[] = adminNavigation,
): NavigationItem[] {
  if (!user) {
    return []
  }

  const filtered = items.flatMap((item) => {
    if (isNavigationGroup(item)) {
      const children = item.children.filter(
        (child) => child.to && canAccessRoute(user, child.to),
      )

      if (children.length === 0) {
        return []
      }

      // Sparse role menus: avoid an accordion with only one link.
      if (children.length === 1) {
        return [children[0]]
      }

      return [{ ...item, children }]
    }

    // Personal homes stay tutor/marketing-only — hide from system admins
    // and other staff even when route access allows a preview.
    if (item.id === 'tutor-dashboard' && !isTutorUser(user)) {
      return []
    }
    if (item.id === 'marketing-dashboard' && !canViewMarketingPerformance(user)) {
      return []
    }

    if (!item.to || canAccessRoute(user, item.to)) {
      return [item]
    }

    return []
  })

  // Personal home: pin My Performance at the top for tutors / counsellors.
  const pinId = isTutorUser(user)
    ? 'tutor-dashboard'
    : canViewMarketingPerformance(user)
      ? 'marketing-dashboard'
      : null

  if (!pinId) {
    return filtered
  }

  const performanceIndex = filtered.findIndex(
    (item) => !isNavigationGroup(item) && item.id === pinId,
  )
  if (performanceIndex <= 0) {
    return filtered
  }

  const next = [...filtered]
  const [performance] = next.splice(performanceIndex, 1)
  next.unshift(performance)
  return next
}

export function getFirstNavigationPath(
  user: NavUser | null | undefined,
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
