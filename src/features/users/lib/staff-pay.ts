import type { UserDetail } from '../api/users-api'

/** Roles paid through their own records (tutor schedule, counsellor salary). */
const OWN_PAY_ROLES = new Set(['tutor', 'education-counsellor', 'branch-manager', 'student'])

/**
 * Staff paid a fixed base salary: Finance, CRO, Academic Leader, Digital
 * Marketing and any other role, except accounts that are only System Admin.
 */
export function usesStaffSalary(user: Pick<UserDetail, 'roles'>) {
  const codes = user.roles.map((role) => role.code)
  if (codes.some((code) => OWN_PAY_ROLES.has(code))) return false
  return codes.some((code) => code !== 'systemadmin')
}

/** The owner / developer account: System Admin with no other role. */
export function isSystemAdminOnly(user: Pick<UserDetail, 'roles' | 'isSuperuser'>) {
  const codes = user.roles.map((role) => role.code)
  if (codes.length === 0) return user.isSuperuser
  return codes.every((code) => code === 'systemadmin')
}
