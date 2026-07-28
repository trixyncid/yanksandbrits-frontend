import { useQuery } from '@tanstack/react-query'

import { fetchTutors } from '../api/tutors-api'
import {
  tutorQueryKeys,
  type TutorListFilters,
} from '../api/tutor-query-keys'

export function useTutorsQuery(filters: TutorListFilters = {}) {
  return useQuery({
    queryKey: tutorQueryKeys.list(filters),
    queryFn: () => fetchTutors(filters),
  })
}
