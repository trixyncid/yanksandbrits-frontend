import {
  deleteUser,
  fetchUsers,
  type UserListItem,
} from '../../users/api/users-api'
import type { MarketingListItem } from '../types/marketing'
import type { MarketingListFilters } from './marketing-query-keys'

export type MarketingListResponse = {
  data: MarketingListItem[]
  meta: {
    total: number
  }
}

function mapMarketing(user: UserListItem): MarketingListItem {
  return {
    id: user.id,
    pin: user.pin,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    gender: user.gender,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    dateJoined: user.dateJoined,
    paidLeaveLeft: user.paidLeaveLeft,
    hasSalary: user.hasSalary,
    branch: user.branchName ?? '—',
  }
}

export async function fetchMarketings(
  filters: MarketingListFilters = {},
): Promise<MarketingListResponse> {
  const { data, meta } = await fetchUsers({
    search: filters.search,
    isActive: filters.isActive,
    isMarketing: true,
    branchId: filters.branchId,
  })

  return {
    data: data.map(mapMarketing),
    meta: { total: meta.total },
  }
}

export async function deleteMarketing(id: string): Promise<void> {
  await deleteUser(id)
}
