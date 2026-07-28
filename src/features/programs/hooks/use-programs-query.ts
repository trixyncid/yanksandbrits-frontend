import { useQuery } from '@tanstack/react-query'

import { fetchPrograms } from '../api/programs-api'
import {
  programQueryKeys,
  type ProgramListFilters,
} from '../api/program-query-keys'

export function useProgramsQuery(filters: ProgramListFilters = {}) {
  return useQuery({
    queryKey: programQueryKeys.list(filters),
    queryFn: () => fetchPrograms(filters),
  })
}
