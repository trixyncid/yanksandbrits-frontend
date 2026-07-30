import { useQuery } from '@tanstack/react-query'

import { fetchStaffUserOptions } from '../../users/api/users-api'

export function useCounsellorOptionsQuery() {
  return useQuery({
    queryKey: ['users', 'options', 'staff'],
    queryFn: () => fetchStaffUserOptions(),
  })
}

export function useTutorOptionsQuery() {
  return useQuery({
    queryKey: ['users', 'options', 'tutors'],
    queryFn: () => fetchStaffUserOptions({ isTutor: true }),
  })
}

export function useMarketingOptionsQuery() {
  return useQuery({
    queryKey: ['users', 'options', 'marketings'],
    queryFn: () => fetchStaffUserOptions({ isMarketing: true }),
  })
}
