import { useQuery } from '@tanstack/react-query'

import { fetchUser } from '../api/users-api'
import { userQueryKeys } from '../api/user-query-keys'

export function useUserQuery(id: string) {
  return useQuery({
    queryKey: userQueryKeys.detail(id),
    queryFn: () => fetchUser(id),
    enabled: Boolean(id),
  })
}
