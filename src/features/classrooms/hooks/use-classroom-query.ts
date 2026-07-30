import { useQuery } from '@tanstack/react-query'

import { fetchClassroom } from '../api/classrooms-api'
import { classroomQueryKeys } from '../api/classroom-query-keys'

export function useClassroomQuery(id: string) {
  return useQuery({
    queryKey: classroomQueryKeys.detail(id),
    queryFn: () => fetchClassroom(id),
    enabled: Boolean(id),
  })
}
