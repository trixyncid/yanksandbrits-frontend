/**
 * Path helpers for the multi-portal API under VITE_API_BASE_URL (/api/v1).
 *
 * Shared auth lives at /auth/*. Portal surfaces:
 * - Admin CRM: /admin/*
 * - Student portal: /student-portal/* (separate app)
 * - Tutor portal: /tutor-portal/* (separate app)
 */

export const AUTH_PATHS = {
  login: '/auth/login',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  me: '/auth/me',
  changePassword: '/auth/change-password',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
} as const

export const ADMIN_PREFIX = '/admin' as const
export const STUDENT_PORTAL_PREFIX = '/student-portal' as const
export const TUTOR_PORTAL_PREFIX = '/tutor-portal' as const

function joinPrefix(prefix: string, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${prefix}${normalized}`
}

/** Staff CRM resource path, e.g. adminPath('/students') → '/admin/students' */
export function adminPath(path: string): string {
  return joinPrefix(ADMIN_PREFIX, path)
}

export function studentPortalPath(path: string): string {
  return joinPrefix(STUDENT_PORTAL_PREFIX, path)
}

export function tutorPortalPath(path: string): string {
  return joinPrefix(TUTOR_PORTAL_PREFIX, path)
}
