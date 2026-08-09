import { useQuery } from '@tanstack/react-query'

import { fetchAllPermissions } from '../api/staff-permissions-api'
import { staffPermissionQueryKeys } from '../api/staff-permission-query-keys'

export function usePermissionsCatalogQuery() {
  return useQuery({
    queryKey: staffPermissionQueryKeys.permissions(),
    queryFn: () => fetchAllPermissions(),
  })
}
