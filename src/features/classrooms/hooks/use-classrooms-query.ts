import { useQuery } from '@tanstack/react-query'

import { fetchClassrooms } from '../api/classrooms-api'
import {
  classroomQueryKeys,
  type ClassroomListFilters,
} from '../api/classroom-query-keys'

export function useClassroomsQuery(filters: ClassroomListFilters = {}) {
  return useQuery({
    queryKey: classroomQueryKeys.list(filters),
    queryFn: () => fetchClassrooms(filters),
  })
}
