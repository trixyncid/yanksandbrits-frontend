import { useQuery } from '@tanstack/react-query'

import { fetchStaffPermission } from '../api/staff-permissions-api'
import { staffPermissionQueryKeys } from '../api/staff-permission-query-keys'

export function useStaffPermissionQuery(id: string) {
  return useQuery({
    queryKey: staffPermissionQueryKeys.detail(id),
    queryFn: () => fetchStaffPermission(id),
    enabled: Boolean(id),
  })
}
