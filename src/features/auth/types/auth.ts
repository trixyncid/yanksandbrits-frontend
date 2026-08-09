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
