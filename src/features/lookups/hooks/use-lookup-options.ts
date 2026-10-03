import { useQuery } from '@tanstack/react-query'

import {
  fetchInstitutionOptions,
  fetchOccupationOptions,
  fetchResourceOptions,
} from '../api/lookups-api'

export function useOccupationOptionsQuery() {
  return useQuery({
    queryKey: ['lookups', 'occupations'],
    queryFn: fetchOccupationOptions,
  })
}

export function useInstitutionOptionsQuery() {
  return useQuery({
    queryKey: ['lookups', 'institutions'],
    queryFn: fetchInstitutionOptions,
  })
}

export function useResourceOptionsQuery() {
  return useQuery({
    queryKey: ['lookups', 'resources'],
    queryFn: fetchResourceOptions,
  })
}
