import { useQuery } from '@tanstack/react-query'

import { fetchProgram } from '../api/programs-api'
import { programQueryKeys } from '../api/program-query-keys'

export function useProgramQuery(id: string) {
  return useQuery({
    queryKey: programQueryKeys.detail(id),
    queryFn: () => fetchProgram(id),
    enabled: Boolean(id),
  })
}
