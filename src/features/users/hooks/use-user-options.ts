import { useQuery } from '@tanstack/react-query'

import {
  fetchEducationCounsellorOptions,
  fetchStaffUserOptions,
  fetchTutorOptions,
  type StaffTypeCode,
} from '../../users/api/users-api'

export function useCounsellorOptionsQuery() {
  return useQuery({
    queryKey: ['users', 'options', 'staff'],
    queryFn: () => fetchStaffUserOptions(),
  })
}

export function useTutorOptionsQuery(filters: {
  staffType?: StaffTypeCode | null
  enabled?: boolean
} = {}) {
  const staffType = filters.staffType ?? null
  return useQuery({
    queryKey: ['users', 'options', 'tutors', staffType],
    queryFn: () => fetchTutorOptions({ staffType }),
    enabled: filters.enabled ?? true,
  })
}

/** Every active education counsellor, not limited to the caller's branch. */
export function useEducationCounsellorOptionsQuery({
  enabled = true,
}: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['users', 'options', 'education-counsellors'],
    queryFn: fetchEducationCounsellorOptions,
    enabled,
  })
}

export function useMarketingOptionsQuery() {
  return useQuery({
    queryKey: ['users', 'options', 'marketings'],
    queryFn: () => fetchStaffUserOptions({ isMarketing: true }),
  })
}
