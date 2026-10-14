import {
  hasAuthPermission,
  hasAuthRole,
  canViewMarketingPerformance,
  isTutorUser,
  type AuthUser,
} from '../types/auth'
import { PERMISSION_MODULES, type PermissionModuleKey } from './permission-catalog'
import { pageDataPermissions, pageForPath } from './page-catalog'

export type RouteRequirement = {
  view?: string
  add?: string
  change?: string
  managerOnly?: boolean
}

type RoutePrefixRule = {
  prefix: string
  managerOnly?: boolean
}

// Pages are looked up in the page catalog; only the Roles page is gated by
// role instead of a permission.
const ROUTE_PREFIX_RULES: RoutePrefixRule[] = [
  { prefix: '/staff-permissions', managerOnly: true },
]

const PUBLIC_PATHS = new Set(['/profile', '/notifications', '/forbidden'])

function ruleForPath(pathname: string): RoutePrefixRule | null {
  const sorted = [...ROUTE_PREFIX_RULES].sort(
    (a, b) => b.prefix.length - a.prefix.length,
  )
  return sorted.find((rule) => pathname.startsWith(rule.prefix)) ?? null
}

export function resolveRouteRequirement(pathname: string): RouteRequirement | null {
  if (PUBLIC_PATHS.has(pathname)) {
    return null
  }

  const rule = ruleForPath(pathname)
  if (rule?.managerOnly) {
    return { managerOnly: true }
  }

  // Opening a page is its own permission; create / edit screens also need
  // the matching data permission.
  const page = pageForPath(pathname)
  if (!page) {
    return null
  }
  const data = pageDataPermissions(page)
  if (data && pathname.endsWith('/new')) {
    return { view: page.openPermission, add: data.add }
  }
  if (data && pathname.includes('/edit')) {
    return { view: page.openPermission, change: data.change }
  }
  return { view: page.openPermission }
}

export function canAccessRoute(
  user:
    | Pick<
        AuthUser,
        'permissions' | 'is_superuser' | 'roles' | 'is_marketing' | 'is_tutor'
      >
    | null
    | undefined,
  pathname: string,
): boolean {
  if (!user) {
    return false
  }

  // Personal tutor dashboard — tutors only (superusers can preview).
  if (
    pathname === '/tutor-dashboard' ||
    pathname.startsWith('/tutor-dashboard/')
  ) {
    return Boolean(user.is_superuser) || isTutorUser(user)
  }

  // Personal marketing dashboard — Education Counsellor only (not CRO).
  if (
    pathname === '/marketing-dashboard' ||
    pathname.startsWith('/marketing-dashboard/')
  ) {
    return canViewMarketingPerformance(user)
  }

  if (user.is_superuser) {
    return true
  }

  if (
    pathname.startsWith('/student-groups') &&
    hasAuthRole(user, 'academic-leader') &&
    !hasAuthRole(user, 'systemadmin') &&
    !hasAuthRole(user, 'branch-manager') &&
    !hasAuthRole(user, 'manager')
  ) {
    return false
  }

  if (
    pathname.startsWith('/student-groups') &&
    (hasAuthRole(user, 'education-counsellor') ||
      hasAuthRole(user, 'marketing')) &&
    !hasAuthRole(user, 'academic-leader')
  ) {
    return true
  }

  const requirement = resolveRouteRequirement(pathname)
  if (!requirement) {
    return true
  }

  if (requirement.managerOnly) {
    return (
      hasAuthRole(user, 'branch-manager') ||
      hasAuthRole(user, 'manager') // legacy code
    )
  }

  if (requirement.view && !hasAuthPermission(user, requirement.view)) {
    return false
  }
  if (requirement.add && !hasAuthPermission(user, requirement.add)) {
    return false
  }
  if (requirement.change && !hasAuthPermission(user, requirement.change)) {
    return false
  }
  return true
}

export function canViewModule(
  user: Pick<AuthUser, 'permissions' | 'is_superuser' | 'roles'> | null | undefined,
  module: PermissionModuleKey,
): boolean {
  return hasAuthPermission(user, PERMISSION_MODULES[module].view)
}

export function canAddModule(
  user: Pick<AuthUser, 'permissions' | 'is_superuser' | 'roles'> | null | undefined,
  module: PermissionModuleKey,
): boolean {
  return hasAuthPermission(user, PERMISSION_MODULES[module].add)
}

export function canChangeModule(
  user: Pick<AuthUser, 'permissions' | 'is_superuser' | 'roles'> | null | undefined,
  module: PermissionModuleKey,
): boolean {
  return hasAuthPermission(user, PERMISSION_MODULES[module].change)
}

export function canDeleteModule(
  user: Pick<AuthUser, 'permissions' | 'is_superuser' | 'roles'> | null | undefined,
  module: PermissionModuleKey,
): boolean {
  return hasAuthPermission(user, PERMISSION_MODULES[module].delete)
}

export function getDefaultStaffPath(
  user: Pick<
    AuthUser,
    'permissions' | 'is_superuser' | 'roles' | 'is_marketing' | 'is_tutor'
  > | null | undefined,
): string {
  const candidates = [
    '/tutor-dashboard',
    '/marketing-dashboard',
    '/dashboard',
    '/prospective-students',
    '/prediction-tests',
    '/students',
    '/student-groups',
    '/student-payments',
    '/full-schedule',
    '/programs',
    '/classrooms',
    '/tutor-allocations',
    '/users',
    '/paid-leaves',
    '/branches',
    '/institutions',
    '/occupations',
    '/resources',
    '/bookkeeping',
    '/profile',
  ]

  const match = candidates.find((path) => {
    // Don't land system admins / superusers on personal performance homes.
    if (path === '/tutor-dashboard' && !isTutorUser(user)) return false
    if (path === '/marketing-dashboard' && !canViewMarketingPerformance(user)) {
      return false
    }
    return canAccessRoute(user, path)
  })
  return match ?? '/profile'
}
