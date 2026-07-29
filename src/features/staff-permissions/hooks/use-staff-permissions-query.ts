import { useQuery } from '@tanstack/react-query'

import { fetchStaffPermissions } from '../api/staff-permissions-api'
import {
  staffPermissionQueryKeys,
  type StaffPermissionListFilters,
} from '../api/staff-permission-query-keys'

export function useStaffPermissionsQuery(
  filters: StaffPermissionListFilters = {},
) {
  return useQuery({
    queryKey: staffPermissionQueryKeys.list(filters),
    queryFn: () => fetchStaffPermissions(filters),
  })
}
