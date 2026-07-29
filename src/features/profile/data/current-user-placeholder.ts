import type { CurrentUserProfile } from '../types/profile'

export const currentUserPlaceholder: CurrentUserProfile = {
  id: 'user-1',
  pin: 'STF-001',
  fullName: 'Admin YNB',
  email: 'admin@ynb.com',
  position: 'Superuser',
  permissions: ['Superuser', 'Manager'],
  birthDate: '1990-05-12',
  birthPlace: 'Jakarta',
  gender: 'male',
  address: 'Jl. Sudirman No. 45, Jakarta Pusat',
  mobilePhone: '081234567890',
  homePhone: '021-555-0101',
  othersPhone: '-',
  branch: 'Main Branch',
  staffType: 'Full Time',
  dateJoined: '2022-01-10T09:00:00',
  lastLogin: '2026-04-20T08:15:00',
  paidLeaveLeft: 12,
}

export function getUserInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
