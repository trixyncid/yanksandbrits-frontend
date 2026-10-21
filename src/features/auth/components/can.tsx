import type { ReactNode } from 'react'

import {
  canAddModule,
  canChangeModule,
  canDeleteModule,
  canViewModule,
} from '../lib/route-access'
import { useAuthStore } from '../store/auth-store'
import { canManageRoles, hasAuthPermission } from '../types/auth'
import type { PermissionModuleKey } from '../lib/permission-catalog'

type CanProps = {
  children: ReactNode
  permission?: string
  anyOf?: readonly string[]
  /** Role management (the Roles page): superusers, branch managers and finance. */
  managerOnly?: boolean
  module?: PermissionModuleKey
  action?: 'view' | 'add' | 'change' | 'delete'
  fallback?: ReactNode
}

export function Can({
  children,
  permission,
  anyOf,
  managerOnly = false,
  module,
  action = 'view',
  fallback = null,
}: CanProps) {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return fallback
  }

  if (managerOnly) {
    return canManageRoles(user) ? children : fallback
  }

  if (module) {
    const allowed =
      action === 'add'
        ? canAddModule(user, module)
        : action === 'change'
          ? canChangeModule(user, module)
          : action === 'delete'
            ? canDeleteModule(user, module)
            : canViewModule(user, module)
    return allowed ? children : fallback
  }

  if (anyOf?.length) {
    return anyOf.some((item) => hasAuthPermission(user, item)) ? children : fallback
  }

  if (permission) {
    return hasAuthPermission(user, permission) ? children : fallback
  }

  return children
}
