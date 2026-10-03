import {
  hasAuthPermission,
  hasAuthRole,
  canViewMarketingPerformance,
  isTutorUser,
  type AuthUser,
} from '../types/auth'
import {
  PAGE_VIEW_PERMISSIONS,
  PERMISSION_MODULES,
  type PermissionModule,
  type PermissionModuleKey,
} from './permission-catalog'

export type RouteRequirement = {
  view?: string
  add?: string
  change?: string
  managerOnly?: boolean
}

type RoutePrefixRule = {
  prefix: string
  module?: PermissionModuleKey
  managerOnly?: boolean
  viewPermission?: string
}

const ROUTE_PREFIX_RULES: RoutePrefixRule[] = [
  { prefix: '/dashboard', viewPermission: PAGE_VIEW_PERMISSIONS.dashboard },
  {
    prefix: '/marketing-dashboard',
    viewPermission: PAGE_VIEW_PERMISSIONS.marketingDashboard,
  },
  { prefix: '/students', module: 'students' },
  { prefix: '/student-groups', module: 'studentGroups' },
  { prefix: '/student-payments', module: 'studentPayments' },
  {
    prefix: '/student-report',
    viewPermission: PAGE_VIEW_PERMISSIONS.studentReport,
  },
  { prefix: '/prospective-students', module: 'prospectiveStudents' },
  { prefix: '/prediction-tests', module: 'predictionTests' },
  { prefix: '/programs', module: 'programs' },
  { prefix: '/classrooms', module: 'classrooms' },
  { prefix: '/full-schedule', module: 'schedules' },
  {
    prefix: '/appointment-by-tutor',
    viewPermission: PAGE_VIEW_PERMISSIONS.appointmentByTutor,
  },
  { prefix: '/users', module: 'users' },
  { prefix: '/tutors', module: 'users' },
  { prefix: '/marketings', module: 'users' },
  { prefix: '/staff-permissions', managerOnly: true },
  { prefix: '/paid-leaves', module: 'paidLeaves' },
  { prefix: '/branches', module: 'branches' },
  { prefix: '/institutions', module: 'institutions' },
  { prefix: '/occupations', module: 'occupations' },
  { prefix: '/resources', module: 'resources' },
  { prefix: '/bookkeeping', module: 'bookkeeping' },
  { prefix: '/tutor-report', module: 'tutorSalary' },
  { prefix: '/tutor-salary-bonus', module: 'tutorSalaryBonus' },
  { prefix: '/marketing-report', module: 'marketingSalary' },
]

const PUBLIC_PATHS = new Set(['/profile', '/notifications', '/forbidden'])

function ruleForPath(pathname: string): RoutePrefixRule | null {
  const sorted = [...ROUTE_PREFIX_RULES].sort(
    (a, b) => b.prefix.length - a.prefix.length,
  )
  return sorted.find((rule) => pathname.startsWith(rule.prefix)) ?? null
}

function moduleForRule(rule: RoutePrefixRule): PermissionModule | null {
  if (!rule.module) {
    return null
  }
  return PERMISSION_MODULES[rule.module]
}

export function resolveRouteRequirement(pathname: string): RouteRequirement | null {
  if (PUBLIC_PATHS.has(pathname)) {
    return null
  }

  const rule = ruleForPath(pathname)
  if (!rule) {
    return null
  }

  if (rule.managerOnly) {
    return { managerOnly: true }
  }

  const module = moduleForRule(rule)
  if (!module) {
    if (rule.viewPermission) {
      return { view: rule.viewPermission }
    }
    return null
  }

  if (pathname.endsWith('/new')) {
    return { add: module.add }
  }

  if (pathname.includes('/edit')) {
    return { change: module.change }
  }

  return { view: module.view }
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

  if (requirement.add) {
    return hasAuthPermission(user, requirement.add)
  }

  if (requirement.change) {
    return hasAuthPermission(user, requirement.change)
  }

  if (requirement.view) {
    return hasAuthPermission(user, requirement.view)
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
