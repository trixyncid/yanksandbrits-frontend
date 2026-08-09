import { fetchAllPages } from '../../../shared/api/pagination'
import { httpClient } from '../../../shared/api/http-client'
import {
  deleteUser,
  fetchUsers,
  type UserListItem,
} from '../../users/api/users-api'
import type { TutorListItem } from '../types/tutor'
import type { TutorListFilters } from './tutor-query-keys'
import { adminPath } from '../../../shared/api/paths'

export type TutorListResponse = {
  data: TutorListItem[]
  meta: {
    total: number
  }
}

type TutorWorkingScheduleDto = {
  id: number
  tutor: number
}

function mapTutor(
  user: UserListItem,
  scheduleTutorIds: Set<string>,
): TutorListItem {
  return {
    id: user.id,
    pin: user.pin ?? '',
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    gender: user.gender,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    dateJoined: user.dateJoined,
    paidLeaveLeft: user.paidLeaveLeft,
    hasWorkingSchedule: scheduleTutorIds.has(user.id),
  }
}

async function loadScheduleTutorIds(): Promise<Set<string>> {
  try {
    const { items } = await fetchAllPages<TutorWorkingScheduleDto>({
      client: httpClient,
      path: adminPath('/tutor-working-schedules'),
    })
    return new Set(items.map((item) => String(item.tutor)))
  } catch {
    return new Set()
  }
}

export async function fetchTutors(
  filters: TutorListFilters = {},
): Promise<TutorListResponse> {
  const [{ data, meta }, scheduleTutorIds] = await Promise.all([
    fetchUsers({
      search: filters.search,
      isActive: filters.isActive,
      isTutor: true,
    }),
    loadScheduleTutorIds(),
  ])

  return {
    data: data.map((user) => mapTutor(user, scheduleTutorIds)),
    meta: { total: meta.total },
  }
}

export async function deleteTutor(id: string): Promise<void> {
  await deleteUser(id)
}
