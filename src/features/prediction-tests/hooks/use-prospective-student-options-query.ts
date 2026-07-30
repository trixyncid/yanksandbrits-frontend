import { useQuery } from '@tanstack/react-query'

import { fetchProspectiveStudentOptions } from '../api/prediction-tests-api'

export function useProspectiveStudentOptionsQuery() {
  return useQuery({
    queryKey: ['prospective-students', 'options'],
    queryFn: () => fetchProspectiveStudentOptions(),
  })
}
