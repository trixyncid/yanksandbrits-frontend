import type { PermissionModuleKey } from '../lib/permission-catalog'
import {
  canAddModule,
  canChangeModule,
  canDeleteModule,
  canViewModule,
} from '../lib/route-access'
import { useAuthStore } from '../store/auth-store'
import { hasAuthPermission, hasAuthRole } from '../types/auth'

export function useAuthUser() {
  return useAuthStore((state) => state.user)
}

export function useCan(permission: string) {
  const user = useAuthStore((state) => state.user)
  return hasAuthPermission(user, permission)
}

export function useModulePermissions(module: PermissionModuleKey) {
  const user = useAuthStore((state) => state.user)

  return {
    canView: canViewModule(user, module),
    canAdd: canAddModule(user, module),
    canChange: canChangeModule(user, module),
    canDelete: canDeleteModule(user, module),
  }
}

export function useIsManager() {
  const user = useAuthStore((state) => state.user)
  if (!user) return false
  return user.is_superuser || hasAuthRole(user, 'manager')
}

export function useIsMarketing() {
  const user = useAuthStore((state) => state.user)
  if (!user) return false
  return hasAuthRole(user, 'marketing') || user.is_marketing
}

export function useIsRestrictedMarketing() {
  const isManager = useIsManager()
  const isMarketing = useIsMarketing()
  return isMarketing && !isManager
}
