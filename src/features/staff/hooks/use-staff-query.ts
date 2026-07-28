import { useQuery } from '@tanstack/react-query'

import { fetchStaff } from '../api/staff-api'
import {
  staffQueryKeys,
  type StaffListFilters,
} from '../api/staff-query-keys'

export function useStaffQuery(filters: StaffListFilters = {}) {
  return useQuery({
    queryKey: staffQueryKeys.list(filters),
    queryFn: () => fetchStaff(filters),
  })
}
