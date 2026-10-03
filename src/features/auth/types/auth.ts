export type AuthRole = {
  id: number
  code: string
  name: string
}

export type AuthUser = {
  id: number
  email: string
  full_name: string
  branch_id: number | null
  is_superuser: boolean
  student_id: number | null
  /** Assigned Django groups (RBAC roles). Source of truth for role checks. */
  roles: AuthRole[]
  /**
   * Effective Django permission codenames (`app_label.codename`).
   * Superusers receive `['*']`.
   */
  permissions?: string[]
  /** Derived from `roles[].code` — prefer `hasAuthRole` for new code. */
  is_tutor: boolean
  is_marketing: boolean
  is_manager: boolean
  is_student: boolean
}

export type LoginResponse = {
  user: AuthUser
}

export type AuthSession = {
  user: AuthUser
  rememberMe: boolean
}

export function hasAuthRole(
  user: Pick<AuthUser, 'roles' | 'is_superuser'> | null | undefined,
  code: string,
): boolean {
  if (!user) return false
  return (user.roles ?? []).some((role) => role.code === code)
}

/** Education Counsellor or Branch Manager (Marketing List family). */
export function isMarketingFamilyUser(
  user: Pick<AuthUser, 'roles' | 'is_marketing'> | null | undefined,
): boolean {
  if (!user) return false
  return (
    hasAuthRole(user, 'education-counsellor') ||
    hasAuthRole(user, 'branch-manager') ||
    // Legacy codes from older sessions / cached payloads
    hasAuthRole(user, 'marketing') ||
    hasAuthRole(user, 'manager') ||
    Boolean(user.is_marketing)
  )
}

/**
 * Personal "My Performance" (marketing dashboard).
 * Education Counsellor only — CRO does not get this home.
 */
export function canViewMarketingPerformance(
  user: Pick<AuthUser, 'roles'> | null | undefined,
): boolean {
  if (!user) return false
  return (
    hasAuthRole(user, 'education-counsellor') ||
    // Legacy code from older sessions / cached payloads
    hasAuthRole(user, 'marketing')
  )
}

/** Tutor role users who get the personal performance home. */
export function isTutorUser(
  user: Pick<AuthUser, 'roles' | 'is_tutor'> | null | undefined,
): boolean {
  if (!user) return false
  return hasAuthRole(user, 'tutor') || Boolean(user.is_tutor)
}

export function hasAuthPermission(
  user: Pick<AuthUser, 'permissions' | 'is_superuser'> | null | undefined,
  permission: string,
): boolean {
  if (!user) return false
  if (user.is_superuser) return true
  const perms = user.permissions ?? []
  if (perms.includes('*')) return true
  return perms.includes(permission)
}

export function hasAuthAnyPermission(
  user: Pick<AuthUser, 'permissions' | 'is_superuser'> | null | undefined,
  permissions: readonly string[],
): boolean {
  return permissions.some((permission) => hasAuthPermission(user, permission))
}
