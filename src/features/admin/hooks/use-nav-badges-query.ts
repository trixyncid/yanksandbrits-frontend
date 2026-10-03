import { useQuery, useQueryClient } from '@tanstack/react-query'

import { useCanViewNavBadges } from '../../auth/hooks/use-permissions'
import { fetchNavBadges } from '../api/nav-badges-api'

export const navBadgeQueryKeys = {
  all: ['nav-badges'] as const,
}

export function useNavBadgesQuery() {
  const canView = useCanViewNavBadges()

  return useQuery({
    queryKey: navBadgeQueryKeys.all,
    queryFn: fetchNavBadges,
    enabled: canView,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
}

export function useInvalidateNavBadges() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: navBadgeQueryKeys.all })
  }
}
