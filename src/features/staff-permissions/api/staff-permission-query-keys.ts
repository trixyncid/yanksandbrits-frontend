export type StaffPermissionListFilters = {
  search?: string
}

export const staffPermissionQueryKeys = {
  all: ['staff-permissions'] as const,
  lists: () => [...staffPermissionQueryKeys.all, 'list'] as const,
  list: (filters: StaffPermissionListFilters = {}) =>
    [...staffPermissionQueryKeys.lists(), filters] as const,
  details: () => [...staffPermissionQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...staffPermissionQueryKeys.details(), id] as const,
  permissions: () =>
    [...staffPermissionQueryKeys.all, 'permissions'] as const,
}
