import {
  deleteUser,
  deriveStaffPosition,
  fetchUsers,
  type UserListItem,
} from '../../users/api/users-api'
import type { StaffListItem } from '../types/staff'
import type { StaffListFilters } from './staff-query-keys'

export type StaffListResponse = {
  data: StaffListItem[]
  meta: {
    total: number
  }
}

function mapStaff(user: UserListItem): StaffListItem {
  return {
    id: user.id,
    pin: user.pin,
    fullName: user.fullName,
    email: user.email,
    gender: user.gender,
    position: deriveStaffPosition(user),
    isActive: user.isActive,
    isStudent: user.isStudent,
    studentId: user.studentId,
    paidLeaveLeft: user.paidLeaveLeft,
    lastLogin: user.lastLogin,
    dateJoined: user.dateJoined,
    branch: user.branchName ?? '—',
  }
}

export async function fetchStaff(
  filters: StaffListFilters = {},
): Promise<StaffListResponse> {
  const { data, meta } = await fetchUsers({
    search: filters.search,
    isActive: filters.isActive,
    branchId: filters.branchId,
  })

  let mapped = data.map(mapStaff)

  if (filters.position) {
    mapped = mapped.filter((item) => item.position === filters.position)
  }

  return {
    data: mapped,
    meta: {
      total: filters.position ? mapped.length : meta.total,
    },
  }
}

export async function deleteStaff(id: string): Promise<void> {
  await deleteUser(id)
}
