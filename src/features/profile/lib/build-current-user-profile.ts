import type { AuthUser } from '../../auth/types/auth'
import { hasAuthRole } from '../../auth/types/auth'
import type { UserDetail } from '../../users/api/users-api'
import type { CurrentUserProfile } from '../types/profile'

function titleCase(value: string) {
  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

/** Roles / labels for profile chips (not Django permission codenames). */
export function getAuthPermissions(user: AuthUser): string[] {
  if (user.roles?.length) {
    const labels = user.roles
      .filter((role) => role.code !== 'student')
      .map((role) => role.name)
    if (user.is_superuser && !labels.includes('Superuser')) {
      return ['Superuser', ...labels]
    }
    return labels.length ? labels : user.is_superuser ? ['Superuser'] : []
  }

  const permissions: string[] = []
  if (user.is_superuser) permissions.push('Superuser')
  if (user.is_manager) permissions.push('Manager')
  if (user.is_marketing) permissions.push('Marketing')
  if (user.is_tutor) permissions.push('Tutor')
  if (user.is_student) permissions.push('Student')
  return permissions
}

export function getAuthPosition(user: AuthUser): string {
  if (user.is_superuser) return 'Superuser'
  if (hasAuthRole(user, 'manager') || user.is_manager) return 'Manager'
  if (hasAuthRole(user, 'tutor') || user.is_tutor) return 'Tutor'
  if (hasAuthRole(user, 'marketing') || user.is_marketing) return 'Marketing'
  if (hasAuthRole(user, 'student') || user.is_student) return 'Student'
  if (user.roles?.length) return user.roles[0]?.name ?? 'Staff'
  return 'Staff'
}

export function buildCurrentUserProfile(
  authUser: AuthUser,
  detail?: UserDetail | null,
): CurrentUserProfile {
  const permissions = detail
    ? [
        ...(detail.isSuperuser ? ['Superuser'] : []),
        ...(detail.roles?.length
          ? detail.roles
              .filter((role) => role.code !== 'student')
              .map((role) => role.name)
          : [
              ...(detail.isManager ? ['Manager'] : []),
              ...(detail.isMarketing ? ['Marketing'] : []),
              ...(detail.isTutor ? ['Tutor'] : []),
            ]),
      ]
    : getAuthPermissions(authUser)

  const position =
    detail?.position?.trim()
      ? titleCase(detail.position)
      : getAuthPosition(authUser)

  return {
    id: String(authUser.id),
    pin: detail?.pin?.trim() || '—',
    fullName: detail?.fullName?.trim() || authUser.full_name || authUser.email,
    email: detail?.email?.trim() || authUser.email,
    position,
    permissions,
    birthDate: detail?.birthDate ?? null,
    birthPlace: detail?.birthPlace?.trim() || '—',
    gender: detail?.gender ?? null,
    address: detail?.address?.trim() || '—',
    mobilePhone: detail?.phone?.trim() || '—',
    homePhone: detail?.homePhone?.trim() || '—',
    othersPhone: detail?.otherPhone?.trim() || '—',
    branch: detail?.branchName?.trim() || '—',
    staffType: detail?.staffType?.trim() || '—',
    dateJoined: detail?.dateJoined || null,
    lastLogin: detail?.lastLogin ?? null,
    paidLeaveLeft: detail?.paidLeaveLeft ?? 0,
  }
}
